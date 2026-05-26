from fastapi import APIRouter

from app.services import LiveDataSnapshotService
from common_py.schemas import LayerDefinition

router = APIRouter(tags=["layers"])


@router.get("/layers", response_model=list[LayerDefinition])
async def list_layers() -> list[LayerDefinition]:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return snapshot.layers
