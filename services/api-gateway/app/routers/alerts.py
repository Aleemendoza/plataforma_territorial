from fastapi import APIRouter, HTTPException, Query

from app.services import LiveDataSnapshotService
from common_py.schemas import AlertItem, AlertSeverity, AlertStatus, IncidentDetail

router = APIRouter(tags=["alerts"])


@router.get("/alerts", response_model=list[AlertItem])
async def list_alerts(
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    bbox: str | None = Query(default=None),
    type: str | None = Query(default=None),
) -> list[AlertItem]:
    del bbox
    snapshot = await LiveDataSnapshotService.get_snapshot()
    filtered = snapshot.alerts
    if severity:
        filtered = [alert for alert in filtered if alert.severity == severity]
    if status:
        filtered = [alert for alert in filtered if alert.status == status]
    if type:
        filtered = [alert for alert in filtered if alert.type == type]
    return filtered


@router.get("/alerts/{alert_id}", response_model=IncidentDetail)
async def get_alert(alert_id: str) -> IncidentDetail:
    snapshot = await LiveDataSnapshotService.get_snapshot()
    incident = snapshot.incidents.get(alert_id)
    if incident is None:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")
    return incident
