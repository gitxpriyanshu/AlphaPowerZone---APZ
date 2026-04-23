import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import fitness
from config import get_settings

settings = get_settings()

app = FastAPI(
    title="AlphaPowerZone AI Fitness Service",
    description="Intelligent fitness profile analysis and personalized plan generation.",
    version="1.0.0"
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

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=settings.PORT, reload=True)
