from typing import Any

from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse

from src.config import get_settings
from src.lib.date_utils import assert_valid_iso, ensure_end_iso
from src.lib.google_calendar import create_calendar_event

router = APIRouter()


def build_result(tool_call_id: str | None, result: dict[str, Any]) -> dict[str, Any]:
    return {"toolCallId": tool_call_id, "result": result}


def get_tool_calls(message: dict[str, Any] | None) -> list[dict[str, Any]]:
    if not message:
        return []
    return message.get("toolCalls") or message.get("toolCallList") or []


def parse_arguments(raw_args: Any) -> dict[str, Any]:
    if not raw_args:
        return {}
    if isinstance(raw_args, str):
        import json

        try:
            return json.loads(raw_args)
        except Exception as exc:
            raise ValueError("Tool arguments are not valid JSON") from exc
    return raw_args


@router.post("/webhook")
async def webhook(request: Request) -> JSONResponse:
    try:
        body = await request.json()
        message = body.get("message")

        if not message or message.get("type") != "tool-calls":
            return JSONResponse({"received": True, "note": "No tool call payload found"})

        settings = get_settings()
        tool_calls = get_tool_calls(message)
        results: list[dict[str, Any]] = []

        for tool_call in tool_calls:
            function = tool_call.get("function") or {}
            tool_name = function.get("name") or tool_call.get("name")
            args = parse_arguments(function.get("arguments", tool_call.get("arguments")))

            if tool_name != "create_calendar_event":
                results.append(
                    build_result(
                        tool_call.get("id"),
                        {"success": False, "error": f"Unsupported tool: {tool_name}"},
                    )
                )
                continue

            name = args.get("name") or "Guest"
            meeting_title = args.get("meetingTitle") or f"Meeting with {name}"
            start_iso = args.get("startISO")
            end_iso = ensure_end_iso(args.get("startISO"), args.get("endISO"))
            timezone = args.get("timezone") or settings.default_timezone

            assert_valid_iso(start_iso, "startISO")
            assert_valid_iso(end_iso, "endISO")

            event = create_calendar_event(
                name=name,
                meeting_title=meeting_title,
                start_iso=start_iso,
                end_iso=end_iso,
                timezone=timezone,
            )

            results.append(
                build_result(
                    tool_call.get("id"),
                    {
                        "success": True,
                        "message": "Calendar event created successfully.",
                        "event": event,
                    },
                )
            )

        return JSONResponse(status_code=200, content={"results": results})
    except Exception as exc:
        print("Vapi webhook error:", exc)

        try:
            body = await request.json()
        except Exception:
            body = {}

        tool_calls = get_tool_calls((body or {}).get("message") or {})
        results = [
            build_result(
                tool_call.get("id"),
                {"success": False, "error": str(exc) or "Unknown server error"},
            )
            for tool_call in tool_calls
        ]

        return JSONResponse(status_code=200, content={"results": results})
