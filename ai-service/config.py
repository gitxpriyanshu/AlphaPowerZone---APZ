from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    OPENROUTER_API_KEY: str = ""
    AI_SERVICE_API_KEY: str
    GROQ_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_FALLBACK_MODEL: str = "llama-3.1-8b-instant"
    PORT: int = 8000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    return Settings()
