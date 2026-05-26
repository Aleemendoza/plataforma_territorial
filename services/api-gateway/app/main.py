from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket

from app.config import settings
from app.routers import alerts, layers, map, narrative, risk, satellite, status, timeline
from app.services import LiveDataSnapshotService


@asynccontextmanager
async def lifespan(_: FastAPI):
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.include_router(alerts.router, prefix=settings.api_prefix)
app.include_router(status.router, prefix=settings.api_prefix)
app.include_router(layers.router, prefix=settings.api_prefix)
app.include_router(timeline.router, prefix=settings.api_prefix)
app.include_router(map.router, prefix=settings.api_prefix)
app.include_router(narrative.router, prefix=settings.api_prefix)
app.include_router(risk.router, prefix=settings.api_prefix)
app.include_router(satellite.router, prefix=settings.api_prefix)


@app.get("/health")
async def healthcheck() -> dict[str, str]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return {"status": "ok", "timestamp": snapshot.narrative_status.last_updated_at.isoformat()}


@app.websocket(f"{settings.api_prefix}/ws/alerts")
async def alerts_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    snapshot = await LiveDataSnapshotService.get_snapshot()
    payload = snapshot.alerts[0].model_dump(mode="json") if snapshot.alerts else {
        "id": "alerts-empty",
        "severity": "LOW",
        "title": "Sin alertas operativas",
    }
    await websocket.send_json(
        {
            "event_name": "alert.updated",
            "event_version": "1.0",
            "emitted_at": snapshot.narrative_status.last_updated_at.isoformat(),
            "payload": payload,
        }
    )


@app.websocket(f"{settings.api_prefix}/ws/status")
async def status_stream(websocket: WebSocket) -> None:
    await websocket.accept()
    snapshot = await LiveDataSnapshotService.get_snapshot()
    await websocket.send_json(
        {
            "event_name": "status.updated",
            "event_version": "1.0",
            "emitted_at": snapshot.narrative_status.last_updated_at.isoformat(),
            "payload": snapshot.status.model_dump(mode="json"),
        }
    )
