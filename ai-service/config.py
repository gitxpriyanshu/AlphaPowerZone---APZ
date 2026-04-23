from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    GROQ_API_KEY: str
    AI_SERVICE_API_KEY: str
    GROQ_MODEL: str = "llama-3.1-70b-versatile"
    PORT: int = 8000
    
    model_config = SettingsConfigDict(env_file=".env")

@lru_cache()
def get_settings():
    return Settings()
