from fastapi import APIRouter

from app.services import LiveDataSnapshotService
from common_py.schemas import OperationalStatus

router = APIRouter(tags=["status"])


@router.get("/status", response_model=OperationalStatus)
async def get_status() -> OperationalStatus:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    return snapshot.status
