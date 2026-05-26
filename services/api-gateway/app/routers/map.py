from fastapi import APIRouter, Query

from app.services import LiveDataSnapshotService

router = APIRouter(tags=["map"])


@router.get("/map/context")
async def get_map_context(
    lat: float = Query(),
    lng: float = Query(),
    zoom: float = Query(),
) -> dict:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    nearest_event = min(
        snapshot.events,
        key=lambda event: ((event.centroid.lat - lat) ** 2) + ((event.centroid.lng - lng) ** 2),
        default=None,
    )
    return {
        "lat": lat,
        "lng": lng,
        "zoom": zoom,
        "summary": (
            nearest_event.narrative_summary
            if nearest_event is not None
            else "Sin eventos prioritarios cerca del punto consultado."
        ),
        "recommended_layers": nearest_event.linked_field_ids if nearest_event is not None else ["rainfall", "wind"],
    }
