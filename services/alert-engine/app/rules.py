from datetime import datetime, timezone

from common_py.schemas import AlertSeverity


def build_alert_payload(
    severity: AlertSeverity,
    title: str,
    latitude: float,
    longitude: float,
) -> dict:
    return {
        "type": "alert.created",
        "severity": severity,
        "title": title,
        "location": {"lat": latitude, "lng": longitude},
        "emitted_at": datetime.now(timezone.utc).isoformat(),
    }

