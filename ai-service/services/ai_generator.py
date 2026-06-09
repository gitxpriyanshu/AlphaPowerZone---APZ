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
# These deques track timestamps of requests we've sent so we can
# pre-emptively avoid hitting the upstream API's hard limits.

groq_minute_requests: deque = deque()      # timestamps within last 60s
groq_daily_requests: deque = deque()       # timestamps within last 24h
openrouter_minute_requests: deque = deque()

# Conservative limits (well under the actual API limits to leave headroom)
GROQ_RPM_LIMIT = 25          # actual: 30 RPM
GROQ_RPD_LIMIT = 13000       # actual: 14,400 RPD for 8B model
OPENROUTER_RPM_LIMIT = 18    # actual: 20 RPM


def _clean_deque(d: deque, window_seconds: float) -> None:
    """Remove entries older than `window_seconds` from the front of the deque."""
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


def can_use_openrouter() -> bool:
    _clean_deque(openrouter_minute_requests, 60)
    return len(openrouter_minute_requests) < OPENROUTER_RPM_LIMIT


def record_openrouter_request() -> None:
    openrouter_minute_requests.append(time.time())


# ══════════════════════════════════════════════════════════════
# RESPONSE CACHE — normalized inputs, 6-hour TTL, 500 slots
# ══════════════════════════════════════════════════════════════
# Rounding continuous values means two nearly-identical users
# (e.g., 173 cm vs 175 cm) share the same cached plan.

fitness_cache: TTLCache = TTLCache(maxsize=500, ttl=21600)  # 6 hours


def get_cache_key(fitness_input: dict) -> str:
    """Normalize and hash input for cache lookup."""
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

_groq_key = getattr(settings, "GROQ_API_KEY", None) or ""
_openrouter_key = settings.OPENROUTER_API_KEY

groq_client = None
if _groq_key:
    groq_http = httpx.AsyncClient(timeout=httpx.Timeout(30.0, connect=10.0))
    groq_client = AsyncOpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=_groq_key,
        http_client=groq_http,
    )

openrouter_http = httpx.AsyncClient(timeout=httpx.Timeout(60.0, connect=10.0))
openrouter_client = AsyncOpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=_openrouter_key,
    http_client=openrouter_http,
)

# Model configured via env (single model per provider — no shotgun retries)
GROQ_MODEL = settings.GROQ_MODEL              # default: llama-3.1-8b-instant
OPENROUTER_MODEL = settings.OPENROUTER_MODEL   # default: deepseek/deepseek-v3

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
    """Try to parse JSON from model response, with fallback extraction."""
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
) -> dict:
    """Make one API call to a single model. Returns parsed dict or raises."""
    print(f"[AI/{provider_name}] Calling {model}...")
    completion = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
        max_tokens=4000,
        top_p=1,
        stream=False,
        response_format={"type": "json_object"},
        timeout=25.0,
    )
    content = completion.choices[0].message.content
    if not content:
        raise ValueError(f"Empty response from {provider_name}/{model}")

    result = _parse_json_response(content)
    if result:
        print(f"[AI/{provider_name}] ✅ Success with {model}!")
        return result

    raise ValueError(f"Failed to parse JSON from {provider_name}/{model}")


async def _call_groq(prompt: str) -> dict:
    """Call Groq with the configured model."""
    return await _call_single_provider(groq_client, GROQ_MODEL, prompt, "Groq")


async def _call_openrouter(prompt: str) -> dict:
    """Call OpenRouter with the configured model."""
    return await _call_single_provider(openrouter_client, OPENROUTER_MODEL, prompt, "OpenRouter")


# ══════════════════════════════════════════════════════════════
# MAIN ENTRY POINT — SMART FALLBACK WITH PRE-FLIGHT RATE CHECK
# ══════════════════════════════════════════════════════════════

async def generate_fitness_plan(user_data, metrics) -> dict:
    """
    Generate a fitness plan using Groq (primary) → OpenRouter (fallback).
    
    Pre-checks in-memory rate counters BEFORE calling the API so we
    never waste a request that would definitely 429.
    Returns 503 (not 429) when both providers are exhausted so the
    frontend can show a friendly "try again in 60 seconds" message.
    """
    prompt = build_fitness_prompt(user_data, metrics)

    # ── 1. Try Groq first (fast, 14,400 RPD with 8B model) ──
    if groq_client and can_use_groq():
        try:
            record_groq_request()
            return await _call_groq(prompt)
        except RateLimitError as e:
            # Undo the recorded request since it was rejected
            if groq_minute_requests:
                groq_minute_requests.pop()
            if groq_daily_requests:
                groq_daily_requests.pop()
            print(f"[AI] Groq 429 despite pre-check: {e}")
            print("[AI] Falling back to OpenRouter...")
        except Exception as e:
            print(f"[AI] Groq failed: {e}")
            print("[AI] Falling back to OpenRouter...")
    elif groq_client:
        print("[AI] Groq rate limit pre-check: at capacity. Skipping to OpenRouter.")
    else:
        print("[AI] Groq not configured. Using OpenRouter.")

    # ── 2. Fallback to OpenRouter ──
    if can_use_openrouter():
        try:
            record_openrouter_request()
            return await _call_openrouter(prompt)
        except RateLimitError as e:
            if openrouter_minute_requests:
                openrouter_minute_requests.pop()
            print(f"[AI] OpenRouter 429: {e}")
        except Exception as e:
            print(f"[AI] OpenRouter failed: {e}")
            raise HTTPException(
                status_code=503,
                detail="AI service encountered an error. Please try again in a moment."
            )
    else:
        print("[AI] OpenRouter rate limit pre-check: at capacity.")

    # ── 3. Both providers exhausted ──
    raise HTTPException(
        status_code=503,
        detail="Our AI is processing many requests right now. Please wait 60 seconds and try again."
    )
