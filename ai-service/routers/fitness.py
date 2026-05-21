from fastapi import APIRouter, HTTPException, Header, Depends
from fastapi.responses import JSONResponse
from models.schemas import FitnessInput, AnalysisResponse, HealthMetrics
from services import fitness_calculator, ai_generator, supplement_mapper
from config import get_settings
import hashlib
import json
from cachetools import TTLCache
from pydantic import ValidationError

router = APIRouter(prefix="/fitness", tags=["Fitness AI"])
settings = get_settings()

# In-memory cache: max 100 items, TTL 1 hour
cache = TTLCache(maxsize=100, ttl=3600)

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.AI_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return x_api_key

@router.post("/analyze")
async def analyze_fitness(data: FitnessInput, api_key: str = Depends(verify_api_key)):
    # 1. Create a unique cache key based on input data
    input_hash = hashlib.md5(json.dumps(data.dict(), sort_keys=True).encode()).hexdigest()
    
    if input_hash in cache:
        return cache[input_hash]

    # 2. Calculate physical metrics
    try:
        metrics = fitness_calculator.get_metrics(data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error calculating metrics: {str(e)}")

    # 3. Generate AI plan
    try:
        plan_dict = await ai_generator.generate_fitness_plan(data, metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation Error: {str(e)}")

    # 4. Map supplements for marketing
    try:
        featured_categories = supplement_mapper.map_supplements_to_apz(plan_dict)
        plan_dict["apz_featured_categories"] = featured_categories
    except Exception:
        plan_dict["apz_featured_categories"] = []

    # 5. Build response — gracefully handle schema mismatches from free AI models
    try:
        response = AnalysisResponse(metrics=metrics, plan=plan_dict)
        result = response.model_dump()
    except ValidationError as ve:
        print(f"[Router] Pydantic validation warning (returning raw AI data): {ve}")
        # The AI returned valid JSON but it doesn't perfectly match our strict schema.
        # Return the raw data directly so the frontend still gets a usable response.
        metrics_obj = metrics if isinstance(metrics, dict) else metrics.model_dump()
        result = {"metrics": metrics_obj, "plan": plan_dict}
    
    # 6. Cache result
    cache[input_hash] = result
    
    return result

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "APZ Fitness AI Intelligence"}
