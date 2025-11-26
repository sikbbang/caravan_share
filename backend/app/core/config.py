from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite+aiosqlite:///./caravan.db"
    SECRET_KEY: str = "a_very_secret_key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["http://localhost", "http://localhost:8080", "http://127.0.0.1:5500"]

    # Google OAuth
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str

    # Admin User for Seeding
    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "adminpassword"
    ADMIN_NAME: str = "Admin User"

    class Config:
        env_file = ".env"

settings = Settings()
