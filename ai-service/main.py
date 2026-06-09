import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import fitness
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="AlphaPowerZone AI Fitness Service",
    description="Intelligent fitness profile analysis and personalized plan generation.",
    version="2.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict to Node.js backend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(fitness.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to APZ AI Fitness Intelligence API",
        "docs": "/docs"
    }

@app.get("/health")
async def global_health():
    """Top-level health check with rate-limit observability."""
    import time
    from services import ai_generator
    now = time.time()
    groq_rpm = len([t for t in ai_generator.groq_minute_requests if t > now - 60])
    groq_rpd = len([t for t in ai_generator.groq_daily_requests if t > now - 86400])
    return {
        "status": "ok",
        "groq_rpm_used": groq_rpm,
        "groq_rpm_limit": ai_generator.GROQ_RPM_LIMIT,
        "groq_rpd_used": groq_rpd,
        "groq_rpd_limit": ai_generator.GROQ_RPD_LIMIT,
        "cache_size": len(ai_generator.fitness_cache),
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
