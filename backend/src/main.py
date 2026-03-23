from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import get_settings
from src.routes.google_auth import router as google_auth_router
from src.routes.health import router as health_router
from src.routes.vapi_webhook import router as vapi_webhook_router

settings = get_settings()

app = FastAPI(title="voice-scheduling-agent-backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.app_base_url,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix="/health")
app.include_router(google_auth_router, prefix="/auth")
app.include_router(vapi_webhook_router, prefix="/vapi")


@app.get("/")
def root() -> dict[str, object]:
    return {"ok": True, "message": "Voice Scheduling Agent backend is running."}
