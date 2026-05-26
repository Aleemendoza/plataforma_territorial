from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Jujuy Alerta Territorial API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    app_timezone: str = "America/Argentina/Jujuy"
    postgres_db: str = "jujuy_alerta"
    postgres_user: str = "postgres"
    postgres_password: str = "postgres"
    postgres_port: int = 5432
    postgres_host: str = "postgres"
    open_meteo_base_url: str = "https://api.open-meteo.com"
    open_meteo_flood_base_url: str = "https://flood-api.open-meteo.com"
    firms_base_url: str = "https://firms.modaps.eosdis.nasa.gov"
    firms_map_key: str | None = None
    narrative_cache_ttl_seconds: int = 900

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
