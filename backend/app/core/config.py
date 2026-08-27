import os
from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "CollegeRAG"
    API_V1_STR: str = "/api"
    ENVIRONMENT: str = "development"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Security
    SECRET_KEY: str = "collegerag_super_secret_jwt_key_2026_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./collegerag.db"

    # Qdrant Vector DB
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION_NAME: str = "college_knowledge_base"
    QDRANT_STORAGE_PATH: str = "./qdrant_storage"

    # Google Gemini
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "models/text-embedding-004"

    # RAG Settings
    SIMILARITY_THRESHOLD: float = 0.30
    TOP_K_RETRIEVAL: int = 5
    CHUNK_SIZE: int = 600
    CHUNK_OVERLAP: int = 80
    MAX_HISTORY_MESSAGES: int = 6

    # Uploads
    UPLOAD_DIR: str = "./uploads"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )


settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.QDRANT_STORAGE_PATH, exist_ok=True)
