from typing import Any

from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build

from src.config import assert_google_config, get_settings

CALENDAR_SCOPE = "https://www.googleapis.com/auth/calendar.events"


def get_oauth_client() -> Credentials:
    settings = get_settings()
    assert_google_config(settings)

    return Credentials(
        token=None,
        refresh_token=settings.google_refresh_token or None,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=[CALENDAR_SCOPE],
    )


def get_google_auth_url() -> str:
    settings = get_settings()
    assert_google_config(settings)

    from urllib.parse import urlencode

    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.resolved_google_redirect_uri,
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
        "scope": CALENDAR_SCOPE,
    }
    return f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"


def exchange_code_for_tokens(code: str) -> dict[str, Any]:
    settings = get_settings()
    assert_google_config(settings)

    import httpx

    response = httpx.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.resolved_google_redirect_uri,
            "grant_type": "authorization_code",
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()


def create_calendar_event(
    *,
    name: str,
    meeting_title: str,
    start_iso: str,
    end_iso: str,
    timezone: str | None,
) -> dict[str, Any]:
    settings = get_settings()

    if not settings.google_refresh_token:
        raise RuntimeError(
            "GOOGLE_REFRESH_TOKEN is not configured. Run the OAuth flow first."
        )

    auth = get_oauth_client()
    calendar = build("calendar", "v3", credentials=auth, cache_discovery=False)

    summary = (meeting_title or "").strip() or f"Meeting with {name}"

    event = {
        "summary": summary,
        "description": f"Scheduled by Voice Scheduling Agent for {name}",
        "start": {
            "dateTime": start_iso,
            "timeZone": timezone or settings.default_timezone,
        },
        "end": {
            "dateTime": end_iso,
            "timeZone": timezone or settings.default_timezone,
        },
    }

    response = (
        calendar.events()
        .insert(calendarId=settings.google_calendar_id, body=event)
        .execute()
    )

    return {
        "id": response.get("id"),
        "htmlLink": response.get("htmlLink"),
        "status": response.get("status"),
        "summary": response.get("summary"),
        "start": response.get("start"),
        "end": response.get("end"),
    }
