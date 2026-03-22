from datetime import datetime, timedelta


def _parse_iso(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def ensure_end_iso(start_iso: str, end_iso: str | None) -> str:
    if end_iso:
        return end_iso

    try:
        start = _parse_iso(start_iso)
    except ValueError as exc:
        raise ValueError("Invalid startISO provided") from exc

    end = start + timedelta(minutes=30)
    return end.isoformat()


def assert_valid_iso(value: str, field_name: str) -> None:
    try:
        _parse_iso(value)
    except ValueError as exc:
        raise ValueError(f"Invalid {field_name}. Expected ISO-8601 datetime string.") from exc
