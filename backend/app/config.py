"""Application configuration from environment variables."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from .env file."""

    # App
    APP_NAME: str = "1C24.PRO"
    APP_URL: str = "http://localhost:8000"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/1c24pro"

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # JWT
    JWT_SECRET: str = "dev-secret-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # OTP
    OTP_LENGTH: int = 6
    OTP_TTL_SECONDS: int = 300
    OTP_COOLDOWN_SECONDS: int = 60
    OTP_MAX_ATTEMPTS: int = 5

    # DaData
    DADATA_API_KEY: str = ""
    DADATA_SECRET_KEY: str = ""

    # SMS.ru
    SMSRU_API_KEY: str = ""

    # SMTP
    SMTP_HOST: str = "smtp.yandex.ru"
    SMTP_PORT: int = 465
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""

    # YooKassa
    YOOKASSA_SHOP_ID: str = ""
    YOOKASSA_SECRET_KEY: str = ""

    # Telegram
    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_ADMIN_CHAT_ID: str = ""

    # Admin
    ADMIN_PHONE: str = "+79278440306"

    # CORS
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173", "https://1c24.pro"]

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


settings = Settings()

# Fail fast if JWT_SECRET is default in production
if settings.ENVIRONMENT == "production" and settings.JWT_SECRET in (
    "dev-secret-change-in-production",
    "dev_jwt_secret_change_in_production_min_32_chars_long_1c24pro",
):
    raise RuntimeError("CRITICAL: JWT_SECRET must be changed in production! Set it in .env")
