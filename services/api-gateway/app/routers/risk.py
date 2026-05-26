from uuid import NAMESPACE_URL, uuid5

from fastapi import APIRouter

from app.services import LiveDataSnapshotService
from common_py.schemas import RiskLevel, RiskZone

router = APIRouter(tags=["risk"])


@router.get("/risk-map")
async def get_risk_map() -> dict[str, str]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return {
        "tilejson": "",
        "updated_at": snapshot.narrative_status.last_updated_at.isoformat(),
        "source": "derived-open-meteo-flood-open-meteo-forecast",
    }


@router.get("/risk-zones", response_model=list[RiskZone])
async def get_risk_zones() -> list[RiskZone]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    zones: list[RiskZone] = []
    for event in snapshot.events:
        if event.event_type.value not in {"flood_risk", "river_risk"}:
            continue
        score = 0.25 if event.severity == "LOW" else 0.5 if event.severity == "MEDIUM" else 0.75 if event.severity == "HIGH" else 0.95
        level = RiskLevel(event.severity.value)
        zones.append(
            RiskZone(
                id=uuid5(NAMESPACE_URL, event.id),
                risk_level=level,
                score=score,
                centroid_latitude=event.centroid.lat,
                centroid_longitude=event.centroid.lng,
            )
        )
    return zones
