import asyncio
import httpx
from openai import AsyncOpenAI, RateLimitError
import json
from config import get_settings
from utils.prompt_builder import build_fitness_prompt

settings = get_settings()

# ── Provider Clients ──
# Groq: 14,400 requests/day free — primary provider
# OpenRouter: 50 requests/day free — fallback only

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

# ── Model lists per provider ──
GROQ_MODELS = [
    "llama-3.3-70b-versatile",       # Best quality, 30 RPM free
    "llama-3.1-8b-instant",          # Fast, 30 RPM free
    "gemma2-9b-it",                  # Good quality, 30 RPM free
]

OPENROUTER_MODELS = [
    settings.OPENROUTER_MODEL,
    "meta-llama/llama-3.3-70b-instruct:free",
    "deepseek/deepseek-r1-distill-llama-70b:free",
    "google/gemma-2-9b-it:free",
    "openrouter/free",
]

SYSTEM_PROMPT = (
    "You are an expert Fitness Coach. You provide structured, "
    "scientific, and personalized fitness advice in JSON format. "
    "Your output must be a single valid JSON object. Be concise "
    "but complete."
)


def _is_daily_quota_exhausted(error: RateLimitError) -> bool:
    """Check if the 429 is a fatal daily quota exhaustion (not retryable)."""
    error_str = str(error).lower()
    if "free-models-per-day" in error_str:
        return True
    try:
        if hasattr(error, "body") and isinstance(error.body, dict):
            msg = error.body.get("error", {}).get("message", "")
            if "free-models-per-day" in msg.lower():
                return True
    except Exception:
        pass
    return False


def _parse_json_response(content: str) -> dict | None:
    """Try to parse JSON from model response, with fallback extraction."""
    try:
        return json.loads(content)
    except json.JSONDecodeError:
        pass
    # Attempt to extract JSON from noisy response
    try:
        start = content.find("{")
        end = content.rfind("}") + 1
        if start >= 0 and end > start:
            return json.loads(content[start:end])
    except Exception:
        pass
    return None


async def _try_provider(
    client: AsyncOpenAI,
    models: list[str],
    prompt: str,
    provider_name: str,
) -> dict:
    """Try all models for a given provider. Returns parsed dict or raises."""
    last_error = None

    for model in models:
        for attempt in range(2):
            try:
                print(f"[AI/{provider_name}] Trying {model} (attempt {attempt + 1}/2)...")
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
                    print(f"[AI/{provider_name}] Empty response from {model}")
                    last_error = ValueError("Empty response")
                    continue

                result = _parse_json_response(content)
                if result:
                    print(f"[AI/{provider_name}] ✅ Success with {model}!")
                    return result

                last_error = ValueError("Failed to parse JSON from response")
                print(f"[AI/{provider_name}] JSON parse failed for {model}")
                break  # Don't retry same model on parse failure

            except RateLimitError as e:
                last_error = e

                # Groq-specific: immediately fail over to OpenRouter to prevent gateway timeouts
                if provider_name == "Groq":
                    print("[AI/Groq] ❌ Rate limit hit on Groq. Failing over to OpenRouter immediately.")
                    raise e

                # OpenRouter-specific: daily quota exhaustion
                if provider_name == "OpenRouter" and _is_daily_quota_exhausted(e):
                    print(f"[AI/{provider_name}] ❌ Daily free quota exhausted")
                    raise  # Let the caller handle this

                retry_after = 5 if provider_name == "Groq" else 12
                try:
                    if hasattr(e, "response") and e.response is not None:
                        ra = e.response.headers.get("Retry-After") or e.response.headers.get("retry-after")
                        if ra:
                            retry_after = max(int(float(ra)), retry_after)
                except Exception:
                    pass

                print(f"[AI/{provider_name}] Rate limited for {model}. Waiting {retry_after}s...")
                await asyncio.sleep(retry_after)

            except Exception as e:
                last_error = e
                error_str = str(e)
                print(f"[AI/{provider_name}] Error with {model}: {error_str}")

                if "404" in error_str or "No endpoints found" in error_str:
                    print(f"[AI/{provider_name}] Model {model} not available, skipping")
                    break

                await asyncio.sleep(2)

    raise RuntimeError(f"All {provider_name} models failed. Last: {last_error}")


async def generate_fitness_plan(user_data, metrics) -> dict:
    prompt = build_fitness_prompt(user_data, metrics)

    # ── Strategy: Groq first (generous free tier), OpenRouter fallback ──

    # 1. Try Groq (14,400 req/day free)
    if groq_client:
        try:
            return await _try_provider(groq_client, GROQ_MODELS, prompt, "Groq")
        except Exception as e:
            print(f"[AI] Groq provider failed: {e}")
            print("[AI] Falling back to OpenRouter...")

    # 2. Fall back to OpenRouter (50 req/day free)
    try:
        return await _try_provider(openrouter_client, OPENROUTER_MODELS, prompt, "OpenRouter")
    except RateLimitError as e:
        if _is_daily_quota_exhausted(e):
            if groq_client:
                raise RuntimeError(
                    "Both Groq and OpenRouter failed. OpenRouter daily quota exhausted. "
                    "Check your Groq API key or wait until tomorrow."
                )
            raise RuntimeError(
                "Daily free-model quota exhausted on OpenRouter (50 requests/day). "
                "To fix this: get a FREE Groq API key at https://console.groq.com "
                "and add GROQ_API_KEY to your ai-service/.env file. "
                "Groq gives you 14,400 free requests per day."
            )
        raise
    except Exception as e:
        if not groq_client:
            raise RuntimeError(
                f"OpenRouter failed: {e}. "
                "TIP: Get a FREE Groq API key at https://console.groq.com "
                "and add GROQ_API_KEY to your ai-service/.env file for "
                "14,400 free requests/day (288x more than OpenRouter)."
            )
        raise

