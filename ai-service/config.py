from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str
    AI_SERVICE_API_KEY: str
    OPENROUTER_MODEL: str = "meta-llama/llama-3.3-70b-instruct:free"
    GROQ_API_KEY: str | None = None
    PORT: int = 8000
    
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()

