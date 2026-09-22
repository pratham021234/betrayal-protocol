import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "Betrayal Protocol Backend"
    ENVIRONMENT: str = "development"
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.vercel.app",
        "*"
    ]
    
    # Gemini API
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    
    # Supabase (Optional - in-memory fallback if not provided)
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_ROLE_KEY: str = ""
    
    # Game Balance Defaults
    DEFAULT_ROUND_DURATION_SEC: int = 15
    MAX_ROUNDS: int = 10
    BASE_ROUND_POT: int = 100
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
