import asyncio
import time
import hashlib
import json
from collections import deque

import httpx
from openai import AsyncOpenAI, RateLimitError
from fastapi import HTTPException
from config import get_settings
from utils.prompt_builder import build_fitness_prompt
from cachetools import TTLCache

settings = get_settings()

# ══════════════════════════════════════════════════════════════
# IN-MEMORY RATE TRACKING (sliding window per provider)
# ══════════════════════════════════════════════════════════════
groq_minute_requests: deque = deque()
groq_daily_requests: deque = deque()

GROQ_RPM_LIMIT = 25
GROQ_RPD_LIMIT = 13000


def _clean_deque(d: deque, window_seconds: float) -> None:
    cutoff = time.time() - window_seconds
    while d and d[0] < cutoff:
        d.popleft()


def can_use_groq() -> bool:
    _clean_deque(groq_minute_requests, 60)
    _clean_deque(groq_daily_requests, 86400)
    return (
        len(groq_minute_requests) < GROQ_RPM_LIMIT
        and len(groq_daily_requests) < GROQ_RPD_LIMIT
    )


def record_groq_request() -> None:
    now = time.time()
    groq_minute_requests.append(now)
    groq_daily_requests.append(now)


# ══════════════════════════════════════════════════════════════
# RESPONSE CACHE — normalized inputs, 6-hour TTL, 500 slots
# ══════════════════════════════════════════════════════════════
fitness_cache: TTLCache = TTLCache(maxsize=500, ttl=21600)


def get_cache_key(fitness_input: dict) -> str:
    normalized = {
        "height": round(fitness_input.get("height_cm", 0) / 5) * 5,
        "weight": round(fitness_input.get("weight_kg", 0) / 5) * 5,
        "age": round(fitness_input.get("age", 0) / 5) * 5,
        "gender": fitness_input.get("gender"),
        "goal": fitness_input.get("goal"),
        "workout_days": fitness_input.get("workout_days_per_week"),
        "diet_type": fitness_input.get("diet_type"),
        "experience": fitness_input.get("fitness_experience"),
        "activity_level": fitness_input.get("activity_level"),
        "preferred_workout_type": fitness_input.get("preferred_workout_type"),
    }
    return hashlib.md5(json.dumps(normalized, sort_keys=True).encode()).hexdigest()


# ══════════════════════════════════════════════════════════════
# PROVIDER CLIENTS
# ══════════════════════════════════════════════════════════════
_groq_key = settings.GROQ_API_KEY

groq_http = httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0))
groq_client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=_groq_key,
    http_client=groq_http,
)

GROQ_MODEL = settings.GROQ_MODEL
GROQ_FALLBACK_MODEL = settings.GROQ_FALLBACK_MODEL

SYSTEM_PROMPT = (
    "You are an expert Fitness Coach. You provide structured, "
    "scientific, and personalized fitness advice in JSON format. "
    "Your output must be a single valid JSON object. Be concise "
    "but complete."
)


# ══════════════════════════════════════════════════════════════
# LOW-LEVEL PROVIDER CALLS
# ══════════════════════════════════════════════════════════════
def _parse_json_response(content: str) -> dict | None:
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
    except Exception:
        pass
    return None


async def _call_single_provider(
    client: AsyncOpenAI,
    model: str,
    prompt: str,
    provider_name: str,
    use_json_format: bool = False,
) -> dict:
    print(f"[AI/{provider_name}] Calling {model}...")
    completion_kwargs = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.7,
        "max_tokens": 4000,
        "top_p": 1,
        "stream": False,
        "timeout": 25.0,
    }
    if use_json_format:
        completion_kwargs["response_format"] = {"type": "json_object"}

    completion = await client.chat.completions.create(**completion_kwargs)
    content = completion.choices[0].message.content
    if not content:
        raise ValueError(f"Empty response from {provider_name}/{model}")

    result = _parse_json_response(content)
    if result:
        print(f"[AI/{provider_name}] Success with {model}!")
        return result

    raise ValueError(f"Failed to parse JSON from {provider_name}/{model}")


async def _call_groq(prompt: str) -> dict:
    return await _call_single_provider(groq_client, GROQ_MODEL, prompt, "Groq", use_json_format=True)


async def _call_groq_fallback(prompt: str) -> dict:
    return await _call_single_provider(groq_client, GROQ_FALLBACK_MODEL, prompt, "Groq-Fallback", use_json_format=True)


# ══════════════════════════════════════════════════════════════
# MAIN ENTRY POINT
# ══════════════════════════════════════════════════════════════
async def generate_fitness_plan(user_data, metrics) -> dict:
    prompt = build_fitness_prompt(user_data, metrics)

    # 1. Try Groq primary
    if can_use_groq():
        try:
            record_groq_request()
            return await _call_groq(prompt)
        except RateLimitError as e:
            if groq_minute_requests:
                groq_minute_requests.pop()
            if groq_daily_requests:
                groq_daily_requests.pop()
            print(f"[AI] Groq RPM hit: {e}. Waiting 5s then retrying...")
            await asyncio.sleep(5)
        except Exception as e:
            print(f"[AI] Groq primary error: {e}")
            raise HTTPException(
                status_code=503,
                detail="AI service encountered an error. Please try again."
            )
    else:
        print("[AI] Groq RPM pre-check: at capacity. Waiting 5s...")
        await asyncio.sleep(5)

    # 2. One retry after wait
    if can_use_groq():
        try:
            record_groq_request()
            return await _call_groq_fallback(prompt)
        except RateLimitError as e:
            if groq_minute_requests:
                groq_minute_requests.pop()
            if groq_daily_requests:
                groq_daily_requests.pop()
            print(f"[AI] Groq still rate limited after wait: {e}")
        except Exception as e:
            print(f"[AI] Groq fallback error: {e}")
            raise HTTPException(
                status_code=503,
                detail="AI service encountered an error. Please try again."
            )

    # 3. Genuinely exhausted
    raise HTTPException(
        status_code=503,
        detail="Our AI is busy right now. Please wait 60 seconds and try again."
    )
