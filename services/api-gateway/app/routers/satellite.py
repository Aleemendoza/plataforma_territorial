from fastapi import APIRouter

from common_py.schemas import RasterLayer

router = APIRouter(tags=["satellite"])


@router.get("/satellite/latest", response_model=list[RasterLayer])
async def latest_satellite_layers() -> list[RasterLayer]:
    return []


@router.get("/satellite/history", response_model=list[RasterLayer])
async def satellite_history() -> list[RasterLayer]:
    return []
