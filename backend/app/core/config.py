from functools import lru_cache
from typing import List

from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = "GenShield Backend"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://genshield:change-me@localhost:5432/genshield"
    jwt_secret_key: str = "change-this-development-secret"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    llm_provider: str = "mock"
    openai_api_key: str = ""
    openai_model: str = "gpt-4o-mini"
    embedding_model: str = "all-MiniLM-L6-v2"
    similarity_warn_threshold: float = 0.45
    similarity_block_threshold: float = 0.78
    risk_warn_threshold: int = 45
    risk_block_threshold: int = 85
    cors_origins_raw: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    log_generated_response: bool = False

    @computed_field  # type: ignore[misc]
    @property
    def cors_origins(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
