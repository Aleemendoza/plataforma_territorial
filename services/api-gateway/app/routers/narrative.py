from fastapi import APIRouter, HTTPException, Query, WebSocket, WebSocketDisconnect

from app.services import LiveDataSnapshotService
from common_py.schemas import (
    AlertSeverity,
    AlertStatus,
    EnvironmentalField,
    EnvironmentalRenderType,
    EnvironmentalFieldType,
    EventEnvelope,
    NarrativeEventType,
    NarrativeScene,
    NarrativeStatus,
    NaturalEventCategory,
    NaturalEventEntity,
)

router = APIRouter(tags=["narrative"])


def _get_event_or_404(event_id: str, events: list[NaturalEventEntity]) -> NaturalEventEntity:
    event = next((item for item in events if item.id == event_id), None)
    if event is None:
        raise HTTPException(status_code=404, detail=f"Narrative event '{event_id}' not found")
    return event


def _get_scene_or_404(scene_id: str, scenes: list[NarrativeScene]) -> NarrativeScene:
    scene = next((item for item in scenes if item.id == scene_id), None)
    if scene is None:
        raise HTTPException(status_code=404, detail=f"Narrative scene '{scene_id}' not found")
    return scene


@router.get("/narrative/status", response_model=NarrativeStatus)
async def get_narrative_status() -> NarrativeStatus:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return snapshot.narrative_status


@router.get("/narrative/events", response_model=list[NaturalEventEntity])
async def list_narrative_events(
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    category: NaturalEventCategory | None = None,
    event_type: NarrativeEventType | None = None,
    region: str | None = Query(default=None),
) -> list[NaturalEventEntity]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    events = snapshot.events
    if severity:
        events = [event for event in events if event.severity == severity]
    if status:
        events = [event for event in events if event.status == status]
    if category:
        events = [event for event in events if event.category == category]
    if event_type:
        events = [event for event in events if event.event_type == event_type]
    if region:
        region_normalized = region.strip().casefold()
        events = [event for event in events if event.region.casefold() == region_normalized]
    return events


@router.get("/narrative/events/{event_id}", response_model=NaturalEventEntity)
async def get_narrative_event(event_id: str) -> NaturalEventEntity:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return _get_event_or_404(event_id, snapshot.events)


@router.get("/narrative/fields", response_model=list[EnvironmentalField])
async def list_environmental_fields(
    event_id: str | None = Query(default=None),
    kind: EnvironmentalFieldType | None = Query(default=None),
    field_type: EnvironmentalRenderType | None = Query(default=None),
    region: str | None = Query(default=None),
) -> list[EnvironmentalField]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    fields = snapshot.fields
    if event_id:
        fields = [field for field in fields if event_id in field.related_event_ids]
    if kind:
        fields = [field for field in fields if field.kind == kind]
    if field_type:
        fields = [field for field in fields if field.field_type == field_type]
    if region:
        region_normalized = region.strip().casefold()
        fields = [field for field in fields if field.region.casefold() == region_normalized]
    return fields


@router.get("/narrative/scenes", response_model=list[NarrativeScene])
async def list_narrative_scenes(
    event_id: str | None = Query(default=None),
    live_only: bool = Query(default=False),
) -> list[NarrativeScene]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    scenes = snapshot.scenes
    if event_id:
        _get_event_or_404(event_id, snapshot.events)
        scenes = [scene for scene in scenes if event_id in scene.event_ids]
    if live_only:
        scenes = [scene for scene in scenes if scene.is_live]
    return scenes


@router.get("/narrative/scenes/{scene_id}", response_model=NarrativeScene)
async def get_narrative_scene(scene_id: str) -> NarrativeScene:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return _get_scene_or_404(scene_id, snapshot.scenes)


@router.websocket("/ws/narrative")
async def narrative_stream(websocket: WebSocket) -> None:
    await websocket.accept()

    bootstrap_events = await LiveDataSnapshotService.build_websocket_bootstrap()

    for event in bootstrap_events:
        await websocket.send_json(event.model_dump(mode="json"))

    try:
        while True:
            message = await websocket.receive_text()
            snapshot = await LiveDataSnapshotService.get_snapshot()
            response = EventEnvelope(
                event_name="field.updated",
                emitted_at=snapshot.narrative_status.last_updated_at,
                payload={
                    "message": message,
                    "pipeline_state": snapshot.narrative_status.pipeline_state,
                    "active_event_count": snapshot.narrative_status.active_event_count,
                    "tracked_field_count": snapshot.narrative_status.tracked_field_count,
                },
            )
            await websocket.send_json(response.model_dump(mode="json"))
    except WebSocketDisconnect:
        return
