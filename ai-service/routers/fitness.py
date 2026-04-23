from fastapi import APIRouter, HTTPException, Header, Depends
from models.schemas import FitnessInput, AnalysisResponse
from services import fitness_calculator, ai_generator, supplement_mapper
from config import get_settings
import hashlib
import json
from cachetools import TTLCache

router = APIRouter(prefix="/fitness", tags=["Fitness AI"])
settings = get_settings()

# In-memory cache: max 100 items, TTL 1 hour
cache = TTLCache(maxsize=100, ttl=3600)

def verify_api_key(x_api_key: str = Header(None)):
    if not x_api_key or x_api_key != settings.AI_SERVICE_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid or missing API Key")
    return x_api_key

@router.post("/analyze", response_model=AnalysisResponse)
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

    # 3. Generate AI plan using Claude
    try:
        plan_dict = await ai_generator.generate_fitness_plan(data, metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation Error: {str(e)}")

    # 4. Map supplements for marketing
    featured_categories = supplement_mapper.map_supplements_to_apz(plan_dict)
    
    # Store featured info in plan dict (optional, based on UI needs)
    plan_dict["apz_featured_categories"] = featured_categories

    response = AnalysisResponse(metrics=metrics, plan=plan_dict)
    
    # 5. Cache result
    cache[input_hash] = response
    
    return response

@router.get("/health")
async def health_check():
    return {"status": "healthy", "service": "APZ Fitness AI Intelligence"}
