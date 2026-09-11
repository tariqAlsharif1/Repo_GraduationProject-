"""
Centralized application settings.

All configuration is read from environment variables (via a local .env file
in development). Nothing sensitive is hard-coded here.
"""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://username:123456@localhost:5432/smart_expense_db"
    frontend_origin: str = "http://localhost:5173"

    ml_model_path: str = "app/ml/expense_model.joblib"
    ml_vectorizer_path: str = "app/ml/vectorizer.joblib"
    ml_confidence_threshold: float = 0.55

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
