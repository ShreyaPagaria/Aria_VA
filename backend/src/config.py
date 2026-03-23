from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    port: int = 3000
    base_url: str | None = None
    app_base_url: str = "http://localhost:5173"
    default_timezone: str = "America/New_York"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str | None = None
    google_refresh_token: str = ""
    google_calendar_id: str = "primary"
    vapi_api_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    @property
    def resolved_base_url(self) -> str:
        return self.base_url or f"http://localhost:{self.port}"

    @property
    def resolved_google_redirect_uri(self) -> str:
        return self.google_redirect_uri or "http://localhost:3000/auth/google/callback"


def assert_google_config(settings: Settings) -> None:
    missing: list[str] = []

    if not settings.google_client_id:
        missing.append("GOOGLE_CLIENT_ID")
    if not settings.google_client_secret:
        missing.append("GOOGLE_CLIENT_SECRET")
    if not settings.resolved_google_redirect_uri:
        missing.append("GOOGLE_REDIRECT_URI")

    if missing:
        raise RuntimeError(f"Missing required Google config: {', '.join(missing)}")


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
