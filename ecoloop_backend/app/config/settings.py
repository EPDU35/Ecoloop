"""
Configuration centrale de l'application.

RÈGLE DE SÉCURITÉ : aucune valeur sensible n'a de défaut utilisable en production.
Si SECRET_KEY ou DATABASE_URL sont absents, l'application refuse de démarrer.
"""
from functools import lru_cache
from typing import List

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # --- Application ---
    app_name: str = "EcoLoop API"
    environment: str = Field(default="development")
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # --- Sécurité ---
    secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    password_min_length: int = 10
    max_login_attempts: int = 5
    login_lockout_minutes: int = 15

    # --- Base de données ---
    database_url: str
    db_pool_size: int = 10
    db_max_overflow: int = 5

    # --- Redis ---
    redis_url: str = "redis://localhost:6379/0"

    # --- CORS / hosts ---
    cors_origins: str = ""
    allowed_hosts: str = "localhost,127.0.0.1"

    # --- Cloudinary ---
    cloudinary_cloud_name: str = ""
    cloudinary_api_key: str = ""
    cloudinary_api_secret: str = ""

    # --- Webhook prestataire de paiement (mobile money) ---
    payment_webhook_secret: str = ""

    # --- Rate limiting ---
    rate_limit_default: str = "100/minute"
    rate_limit_auth: str = "5/minute"

    @field_validator("secret_key")
    @classmethod
    def secret_key_must_be_strong(cls, v: str) -> str:
        if not v or len(v) < 32:
            raise ValueError(
                "SECRET_KEY manquant ou trop court (>= 32 caractères). "
                "Générez-en un avec: python -c \"import secrets; print(secrets.token_urlsafe(64))\""
            )
        if v.strip().upper().startswith("CHANGE_ME"):
            raise ValueError("SECRET_KEY doit être remplacé par une vraie valeur secrète.")
        return v

    @field_validator("environment")
    @classmethod
    def environment_must_be_valid(cls, v: str) -> str:
        allowed = {"development", "staging", "production"}
        if v not in allowed:
            raise ValueError(f"ENVIRONMENT doit être l'un de {allowed}")
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def allowed_hosts_list(self) -> List[str]:
        return [h.strip() for h in self.allowed_hosts.split(",") if h.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> "Settings":
    """Instance unique (cache) des settings, chargée une seule fois au démarrage."""
    return Settings()


settings = get_settings()
