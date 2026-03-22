from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, RedirectResponse

from src.lib.google_calendar import exchange_code_for_tokens, get_google_auth_url

router = APIRouter()


@router.get("/google")
def google_auth_redirect() -> RedirectResponse:
    url = get_google_auth_url()
    return RedirectResponse(url=url, status_code=307)


@router.get("/google/callback", response_class=HTMLResponse)
def google_auth_callback(code: str | None = Query(default=None)) -> HTMLResponse:
    try:
        if not code or not isinstance(code, str):
            raise HTTPException(status_code=400, detail="Missing OAuth code")

        tokens = exchange_code_for_tokens(code)
        refresh_token = tokens.get("refresh_token") or "No refresh token returned. Try again with prompt=consent."

        return HTMLResponse(
            content=f"""
              <html>
                <body style=\"font-family: Arial, sans-serif; padding: 32px;\">
                  <h2>Google Calendar connected</h2>
                  <p>Copy this refresh token into your backend environment as <code>GOOGLE_REFRESH_TOKEN</code>.</p>
                  <pre style=\"white-space: pre-wrap; word-break: break-word; background: #f5f5f5; padding: 16px; border-radius: 8px;\">{refresh_token}</pre>
                </body>
              </html>
            """
        )
    except HTTPException:
        raise
    except Exception as exc:
        print("Google OAuth callback error:", exc)
        raise HTTPException(status_code=500, detail="Failed to complete Google OAuth flow") from exc
