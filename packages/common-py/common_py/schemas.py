from datetime import datetime
from enum import StrEnum
from uuid import UUID

from pydantic import BaseModel, Field


class AlertSeverity(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AlertType(StrEnum):
    FLOOD_RISK = "flood_risk"
    LANDSLIDE_RISK = "landslide_risk"
    WILDFIRE = "wildfire"
    DEFORESTATION = "deforestation"
    ILLEGAL_DUMP = "illegal_dump"


class RasterLayerType(StrEnum):
    NDVI = "ndvi"
    NDWI = "ndwi"
    NBR = "nbr"
    RAINFALL = "rainfall"
    FIRMS = "firms"


class RiskLevel(StrEnum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ProvinceState(StrEnum):
    STABLE = "ESTABLE"
    ATTENTION = "ATENCION"
    CRITICAL = "CRITICO"


class ConnectivityState(StrEnum):
    LIVE = "live"
    DEGRADED = "degraded"
    OFFLINE = "offline"


class AlertStatus(StrEnum):
    NEW = "new"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"


class LayerGroup(StrEnum):
    RISK = "Riesgo"
    ENVIRONMENT = "Ambiente"
    INFRASTRUCTURE = "Infraestructura"


class NaturalEventCategory(StrEnum):
    FLOOD = "flood"
    WILDFIRE = "wildfire"
    LANDSLIDE = "landslide"
    STORM = "storm"
    HEAT = "heat"


class EnvironmentalFieldType(StrEnum):
    RAINFALL_ANOMALY = "rainfall_anomaly"
    RAINFALL_ACCUMULATION = "rainfall_accumulation"
    SOIL_MOISTURE = "soil_moisture"
    VEGETATION_STRESS = "vegetation_stress"
    THERMAL_ACTIVITY = "thermal_activity"
    RIVER_STAGE = "river_stage"
    RIVER_LEVEL = "river_level"
    WIND_CORRIDOR = "wind_corridor"
    HYDRIC_RISK = "hydric_risk"
    FIRE_SPREAD = "fire_spread"


class NarrativeSceneKind(StrEnum):
    OVERVIEW = "overview"
    FIELD_FOCUS = "field_focus"
    EVENT_FOCUS = "event_focus"
    RESPONSE = "response"


class NarrativeTone(StrEnum):
    MONITORING = "monitoring"
    ESCALATION = "escalation"
    CRITICAL = "critical"
    RECOVERY = "recovery"


class EnvironmentalTrend(StrEnum):
    RISING = "rising"
    STABLE = "stable"
    FALLING = "falling"


class DataConfidence(StrEnum):
    OBSERVED = "observed"
    MODELED = "modeled"
    MIXED = "mixed"


class NarrativeEventType(StrEnum):
    WILDFIRE = "wildfire"
    FLOOD_RISK = "flood_risk"
    RIVER_RISK = "river_risk"
    RAINFALL = "rainfall"
    WIND = "wind"


class EnvironmentalRenderType(StrEnum):
    FIRE = "fire"
    RAIN = "rain"
    WIND = "wind"
    RIVER_STATE = "river_state"
    FLOOD_RISK = "flood_risk"


class AlertItem(BaseModel):
    id: UUID | str
    type: AlertType
    severity: AlertSeverity
    title: str
    short_message: str
    long_message: str
    location_name: str
    geometry: dict
    centroid: dict
    created_at: datetime
    status: AlertStatus
    recommended_actions: list[str]
    impact_summary: dict[str, str]
    factors: list[str]
    region: str


class RasterLayer(BaseModel):
    id: UUID
    layer_type: RasterLayerType
    generated_at: datetime
    asset_path: str
    preview_path: str


class RiskZone(BaseModel):
    id: UUID
    risk_level: RiskLevel
    score: float = Field(ge=0, le=1)
    centroid_latitude: float
    centroid_longitude: float


class OperationalStatus(BaseModel):
    province_state: ProvinceState
    active_alert_count: int
    wildfire_count: int
    hydric_risk_level: AlertSeverity
    last_updated_at: datetime
    connectivity_state: ConnectivityState
    headline: str


class LayerDefinition(BaseModel):
    id: str
    group: LayerGroup
    label: str
    technical_name: str
    visible_by_default: bool
    available_time_ranges: list[str]
    legend: list[dict[str, str]]


class TimelineScene(BaseModel):
    timestamp: datetime
    available_layers: list[str]
    freshness: str
    comparison_supported: bool


class IncidentDetail(BaseModel):
    alert: AlertItem
    before_after_assets: dict[str, str]
    mini_timeline: list[TimelineScene]


class EventEnvelope(BaseModel):
    event_name: str
    event_version: str = "1.0"
    emitted_at: datetime
    payload: dict


class GeoPosition(BaseModel):
    lat: float
    lng: float


class EventPreviewMetric(BaseModel):
    label: str
    value: str
    tone: str | None = None


class EventMetric(BaseModel):
    id: str
    label: str
    value: str
    unit: str | None = None
    trend: EnvironmentalTrend | None = None
    emphasis: str | None = None


class EnvironmentalFieldRange(BaseModel):
    min: float
    max: float
    focus: float


class EnvironmentalVectorSample(BaseModel):
    lat: float
    lng: float
    dx: float
    dy: float
    intensity: float = Field(ge=0, le=1)


class EnvironmentalRiverPath(BaseModel):
    coordinates: list[tuple[float, float]]
    severity: AlertSeverity


class BeforeAfterAssets(BaseModel):
    before: str
    after: str


class NarrativeVisualState(BaseModel):
    pulse: bool = False
    highlighted: bool = False


class ConditionsSummaryItem(BaseModel):
    label: str
    value: str


class NarrativeSceneCamera(BaseModel):
    center: tuple[float, float]
    zoom: float
    pitch: float
    bearing: float


class EventPreview(BaseModel):
    id: str
    event_id: str
    title: str
    subtitle: str = ""
    category: NaturalEventCategory = NaturalEventCategory.FLOOD
    kind: NaturalEventCategory = NaturalEventCategory.FLOOD
    event_type: NarrativeEventType = NarrativeEventType.FLOOD_RISK
    severity: AlertSeverity
    status: AlertStatus
    kicker: str = "Ultimas 6h"
    location_name: str
    region: str
    summary: str
    observed_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    primary_scene_id: str = ""
    field_ids: list[str] = Field(default_factory=list)
    centroid: GeoPosition
    primary_metric: EventPreviewMetric = Field(default_factory=lambda: EventPreviewMetric(label="Clave", value="n/d"))
    primaryMetric: str = "n/d"
    change: str = "n/d"
    direction: str | None = None
    chips: list[str] = Field(default_factory=list)


class EnvironmentalField(BaseModel):
    id: str
    kind: EnvironmentalFieldType
    field_type: EnvironmentalRenderType = EnvironmentalRenderType.RAIN
    title: str = ""
    label: str = ""
    metric_name: str = ""
    unit: str = ""
    current_value: float = 0
    change_24h: float = 0
    observed_at: datetime
    severity: AlertSeverity
    source: str = ""
    sources: list[str] = Field(default_factory=list)
    region: str = ""
    layer_id: str = ""
    geometry: dict
    centroid: GeoPosition
    location: GeoPosition | None = None
    trend: EnvironmentalTrend = EnvironmentalTrend.STABLE
    value_range: EnvironmentalFieldRange = Field(default_factory=lambda: EnvironmentalFieldRange(min=0, max=1, focus=0))
    summary: str = ""
    confidence: DataConfidence = DataConfidence.MIXED
    related_event_ids: list[str] = Field(default_factory=list)
    legend: list[dict[str, str]] = Field(default_factory=list)
    samples: list[EnvironmentalVectorSample] = Field(default_factory=list)
    paths: list[EnvironmentalRiverPath] = Field(default_factory=list)


class NaturalEventEntity(BaseModel):
    id: str
    title: str
    category: NaturalEventCategory = NaturalEventCategory.FLOOD
    kind: NaturalEventCategory = NaturalEventCategory.FLOOD
    event_type: NarrativeEventType = NarrativeEventType.FLOOD_RISK
    severity: AlertSeverity
    status: AlertStatus
    summary: str = ""
    short_message: str = ""
    description: str = ""
    long_message: str = ""
    narrative_label: str = ""
    narrative_summary: str = ""
    location_name: str
    region: str
    observed_at: datetime
    started_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    geometry: dict
    centroid: GeoPosition
    location: GeoPosition | None = None
    confidence_score: float = Field(default=0.8, ge=0, le=1)
    confidence: DataConfidence = DataConfidence.MIXED
    source_signals: list[str] = Field(default_factory=list)
    sources: list[str] = Field(default_factory=list)
    recommended_actions: list[str] = Field(default_factory=list)
    impact_summary: dict[str, str] = Field(default_factory=dict)
    drivers: list[str] = Field(default_factory=list)
    factors: list[str] = Field(default_factory=list)
    metrics: list[EventMetric] = Field(default_factory=list)
    related_field_ids: list[str] = Field(default_factory=list)
    linked_field_ids: list[str] = Field(default_factory=list)
    related_scene_ids: list[str] = Field(default_factory=list)
    related_fields: list[EnvironmentalField] = Field(default_factory=list)
    before_after_assets: BeforeAfterAssets = Field(default_factory=lambda: BeforeAfterAssets(before="", after=""))
    preview: EventPreview | None = None
    visual_state: NarrativeVisualState = Field(default_factory=NarrativeVisualState)


class NarrativeScene(BaseModel):
    timestamp: datetime
    available_layers: list[str]
    freshness: str
    comparison_supported: bool
    id: str
    title: str
    summary: str = ""
    synopsis: str = ""
    narrative_summary: str = ""
    kind: NarrativeSceneKind = NarrativeSceneKind.OVERVIEW
    tone: NarrativeTone = NarrativeTone.MONITORING
    focus_region: str = ""
    captured_at: datetime = Field(default_factory=datetime.utcnow)
    is_live: bool = False
    event_ids: list[str] = Field(default_factory=list)
    field_ids: list[str] = Field(default_factory=list)
    focus_event_ids: list[str] = Field(default_factory=list)
    environmental_field_ids: list[str] = Field(default_factory=list)
    layer_ids: list[str] = Field(default_factory=list)
    focus_geometry: dict = Field(default_factory=dict)
    viewport: dict[str, float] = Field(default_factory=dict)
    camera: NarrativeSceneCamera = Field(default_factory=lambda: NarrativeSceneCamera(center=(0.0, 0.0), zoom=0, pitch=0, bearing=0))
    conditions_summary: list[ConditionsSummaryItem] = Field(default_factory=list)
    headlines: list[str] = Field(default_factory=list)
    event_previews: list[EventPreview] = Field(default_factory=list)
    events: list[NaturalEventEntity] = Field(default_factory=list)
    fields: list[EnvironmentalField] = Field(default_factory=list)


class NarrativeStatus(BaseModel):
    pipeline_state: ConnectivityState
    active_event_count: int
    tracked_field_count: int
    live_scene_count: int
    last_updated_at: datetime
    headline: str
    active_event_ids: list[str]
