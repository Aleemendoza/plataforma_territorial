from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter

from app.config import settings

from common_py.schemas import RasterLayer
from common_py.schemas import RasterLayerType

router = APIRouter(tags=["satellite"])


def _build_satellite_layers() -> list[RasterLayer]:
    if not settings.satellite_wms_base_url:
        return []

    generated_at = datetime.now(timezone.utc)
    base_url = settings.satellite_wms_base_url.strip()
    return [
        RasterLayer(
            id=uuid4(),
            layer_type=RasterLayerType.TRUE_COLOR,
            generated_at=generated_at,
            asset_path=(
                f"{base_url}&LAYERS={settings.satellite_true_color_layer}"
                "&FORMAT=image/png&TRANSPARENT=false"
            ),
            preview_path=(
                f"{base_url}&LAYERS={settings.satellite_true_color_layer}"
                "&FORMAT=image/png&TRANSPARENT=false"
            ),
        ),
        RasterLayer(
            id=uuid4(),
            layer_type=RasterLayerType.NDVI,
            generated_at=generated_at,
            asset_path=(
                f"{base_url}&LAYERS={settings.satellite_ndvi_layer}"
                "&FORMAT=image/png&TRANSPARENT=true"
            ),
            preview_path=(
                f"{base_url}&LAYERS={settings.satellite_ndvi_layer}"
                "&FORMAT=image/png&TRANSPARENT=true"
            ),
        ),
    ]


@router.get("/satellite/latest", response_model=list[RasterLayer])
async def latest_satellite_layers() -> list[RasterLayer]:
    return _build_satellite_layers()


@router.get("/satellite/history", response_model=list[RasterLayer])
async def satellite_history() -> list[RasterLayer]:
    return _build_satellite_layers()
