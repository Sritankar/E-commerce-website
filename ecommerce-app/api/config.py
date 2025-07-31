from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    # API Settings
    app_name: str = "E-Commerce API"
    app_version: str = "1.0.0"
    debug: bool = False
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    reload: bool = True
    
    # Database
    database_url: str = "sqlite:///./ecommerce.db"
    test_database_url: str = "sqlite:///./test.db"
    
    # Security
    secret_key: str = "your-secret-key-change-this"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # File paths
    csv_path: str = "data/products.csv"
    upload_path: str = "uploads/"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    
    # Logging
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    # External services
    redis_url: Optional[str] = "redis://localhost:6379"
    
    # Pagination
    default_page_size: int = 20
    max_page_size: int = 100
    
    class Config:
        env_file = ".env"
        case_sensitive = False
        extra = "ignore"  # Ignore extra fields from .env

settings = Settings()
