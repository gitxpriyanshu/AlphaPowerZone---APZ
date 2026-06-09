from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from models.schemas import FitnessInput, AnalysisResponse, HealthMetrics
from services import fitness_calculator, ai_generator, supplement_mapper
from config import get_settings
from pydantic import ValidationError

router = APIRouter(prefix="/fitness", tags=["Fitness AI"])
settings = get_settings()


def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.AI_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return x_api_key


@router.post("/analyze")
async def analyze_fitness(data: FitnessInput, api_key: str = Depends(verify_api_key)):
    # 1. Check normalized cache first (avoids API call entirely)
    cache_key = ai_generator.get_cache_key(data.dict())
    if cache_key in ai_generator.fitness_cache:
        print(f"[Router] Cache HIT for key {cache_key[:8]}...")
        return ai_generator.fitness_cache[cache_key]

    print(f"[Router] Cache MISS for key {cache_key[:8]}... calling AI")

    # 2. Calculate physical metrics
    try:
        metrics = fitness_calculator.get_metrics(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error calculating metrics: {str(e)}")

    # 3. Generate AI plan (may raise HTTPException 503 internally)
    try:
        plan_dict = await ai_generator.generate_fitness_plan(data, metrics)
    except HTTPException:
        raise  # Re-raise 503 from ai_generator directly
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"AI service temporarily unavailable: {str(e)}")

    # 4. Map supplements for marketing
    try:
        featured_categories = supplement_mapper.map_supplements_to_apz(plan_dict)
        plan_dict["apz_featured_categories"] = featured_categories
    except Exception:
        plan_dict["apz_featured_categories"] = []

    # 5. Build response — gracefully handle schema mismatches from AI models
    try:
        response = AnalysisResponse(metrics=metrics, plan=plan_dict)
        result = response.model_dump()
    except ValidationError as ve:
        print(f"[Router] Pydantic validation warning (returning raw AI data): {ve}")
        metrics_obj = metrics if isinstance(metrics, dict) else metrics.model_dump()
        result = {"metrics": metrics_obj, "plan": plan_dict}
    
    # 6. Store in normalized cache
    ai_generator.fitness_cache[cache_key] = result
    
    return result


@router.get("/health")
async def health_check():
    """Health endpoint with rate-limit status for observability."""
    import time
    now = time.time()
    groq_rpm = len([t for t in ai_generator.groq_minute_requests if t > now - 60])
    groq_rpd = len([t for t in ai_generator.groq_daily_requests if t > now - 86400])
    or_rpm = len([t for t in ai_generator.openrouter_minute_requests if t > now - 60])
    return {
        "status": "healthy",
        "service": "APZ Fitness AI Intelligence",
        "groq_rpm_used": groq_rpm,
        "groq_rpm_limit": ai_generator.GROQ_RPM_LIMIT,
        "groq_rpd_used": groq_rpd,
        "groq_rpd_limit": ai_generator.GROQ_RPD_LIMIT,
        "openrouter_rpm_used": or_rpm,
        "openrouter_rpm_limit": ai_generator.OPENROUTER_RPM_LIMIT,
        "cache_size": len(ai_generator.fitness_cache),
        "cache_max": 500,
        "groq_model": ai_generator.GROQ_MODEL,
        "openrouter_model": ai_generator.OPENROUTER_MODEL,
    }
