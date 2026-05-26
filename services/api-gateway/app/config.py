from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Jujuy Alerta Territorial API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    api_cors_origins: str = "*"
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
    satellite_wms_base_url: str | None = None
    satellite_true_color_layer: str = "TRUE_COLOR"
    satellite_ndvi_layer: str = "NDVI"
    narrative_cache_ttl_seconds: int = 900

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        raw = self.api_cors_origins.strip()
        if not raw or raw == "*":
            return ["*"]
        return [origin.strip() for origin in raw.split(",") if origin.strip()]


settings = Settings()
