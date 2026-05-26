from fastapi import APIRouter, Query

from app.services import LiveDataSnapshotService
from common_py.schemas import TimelineScene

router = APIRouter(tags=["timeline"])


@router.get("/timeline", response_model=list[TimelineScene])
async def get_timeline(
    layer: str | None = Query(default=None),
    from_ts: str | None = Query(default=None, alias="from"),
    to_ts: str | None = Query(default=None, alias="to"),
) -> list[TimelineScene]:
    del from_ts, to_ts
    snapshot = await LiveDataSnapshotService.get_snapshot()
    if not layer:
        return snapshot.timeline
    return [scene for scene in snapshot.timeline if layer in scene.available_layers]
