from __future__ import annotations

import asyncio
import csv
import io
import math
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import Any

import httpx

from app.config import settings
from common_py.schemas import (
    AlertItem,
    AlertSeverity,
    AlertStatus,
    AlertType,
    BeforeAfterAssets,
    ConditionsSummaryItem,
    ConnectivityState,
    DataConfidence,
    EnvironmentalField,
    EnvironmentalFieldRange,
    EnvironmentalFieldType,
    EnvironmentalRenderType,
    EnvironmentalTrend,
    EventEnvelope,
    EventMetric,
    EventPreview,
    EventPreviewMetric,
    GeoPosition,
    IncidentDetail,
    LayerDefinition,
    LayerGroup,
    NarrativeEventType,
    NarrativeScene,
    NarrativeSceneCamera,
    NarrativeSceneKind,
    NarrativeStatus,
    NarrativeTone,
    NaturalEventCategory,
    NaturalEventEntity,
    OperationalStatus,
    ProvinceState,
    TimelineScene,
)


JUJUY_BBOX = (-66.25, -24.75, -64.55, -21.75)


@dataclass(frozen=True)
class MonitoringLocation:
    id: str
    name: str
    region: str
    latitude: float
    longitude: float
    river_name: str | None = None


@dataclass(frozen=True)
class WeatherPoint:
    location: MonitoringLocation
    current_time: datetime
    current_temperature_c: float
    current_relative_humidity: float
    current_precipitation_mm: float
    current_wind_speed_kmh: float
    current_wind_direction_deg: float
    current_soil_moisture: float
    precipitation_24h_mm: float
    wind_peak_24h_kmh: float
    hourly_times: list[datetime]
    hourly_precipitation_mm: list[float]
    hourly_wind_speed_kmh: list[float]


@dataclass(frozen=True)
class FloodPoint:
    location: MonitoringLocation
    observed_at: datetime
    current_discharge_m3s: float
    max_discharge_window_m3s: float


@dataclass(frozen=True)
class FirmsDetection:
    latitude: float
    longitude: float
    brightness: float
    confidence: float
    frp: float
    observed_at: datetime
    source: str


@dataclass(frozen=True)
class LiveDataSnapshot:
    status: OperationalStatus
    layers: list[LayerDefinition]
    timeline: list[TimelineScene]
    alerts: list[AlertItem]
    incidents: dict[str, IncidentDetail]
    fields: list[EnvironmentalField]
    events: list[NaturalEventEntity]
    scenes: list[NarrativeScene]
    narrative_status: NarrativeStatus


class ProviderDataError(RuntimeError):
    pass


MONITORED_LOCATIONS = [
    MonitoringLocation(
        id="yala",
        name="Yala",
        region="Yala",
        latitude=-24.1156,
        longitude=-65.4719,
        river_name="Rio Yala",
    ),
    MonitoringLocation(
        id="volcan",
        name="Volcan",
        region="Volcan",
        latitude=-23.9138,
        longitude=-65.4639,
        river_name="Rio Grande",
    ),
    MonitoringLocation(
        id="humahuaca",
        name="Humahuaca",
        region="Humahuaca",
        latitude=-23.2046,
        longitude=-65.3496,
        river_name="Rio Grande",
    ),
    MonitoringLocation(
        id="san-salvador",
        name="San Salvador de Jujuy",
        region="Capital",
        latitude=-24.1858,
        longitude=-65.2995,
        river_name="Rio Xibi Xibi",
    ),
]


def point(lat: float, lng: float) -> GeoPosition:
    return GeoPosition(lat=lat, lng=lng)


def iso_to_datetime(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def round_safe(value: float, digits: int = 1) -> float:
    return round(float(value), digits)


def severity_from_rain(precipitation_24h_mm: float, soil_moisture: float, discharge_m3s: float) -> AlertSeverity:
    if precipitation_24h_mm >= 70 or discharge_m3s >= 120 or soil_moisture >= 0.42:
        return AlertSeverity.CRITICAL
    if precipitation_24h_mm >= 40 or discharge_m3s >= 80 or soil_moisture >= 0.32:
        return AlertSeverity.HIGH
    if precipitation_24h_mm >= 20 or soil_moisture >= 0.24:
        return AlertSeverity.MEDIUM
    return AlertSeverity.LOW


def severity_from_wind(wind_kmh: float) -> AlertSeverity:
    if wind_kmh >= 55:
        return AlertSeverity.CRITICAL
    if wind_kmh >= 35:
        return AlertSeverity.HIGH
    if wind_kmh >= 20:
        return AlertSeverity.MEDIUM
    return AlertSeverity.LOW


def severity_from_firms(count: int, max_frp: float, mean_confidence: float) -> AlertSeverity:
    if count >= 4 or max_frp >= 40 or mean_confidence >= 85:
        return AlertSeverity.CRITICAL
    if count >= 2 or max_frp >= 20 or mean_confidence >= 60:
        return AlertSeverity.HIGH
    return AlertSeverity.MEDIUM


def province_state_from_events(events: list[NaturalEventEntity]) -> ProvinceState:
    severities = {event.severity for event in events}
    if AlertSeverity.CRITICAL in severities:
        return ProvinceState.CRITICAL
    if AlertSeverity.HIGH in severities or AlertSeverity.MEDIUM in severities:
        return ProvinceState.ATTENTION
    return ProvinceState.STABLE


def bbox_polygon(center_lat: float, center_lng: float, lat_radius: float = 0.085, lng_radius: float = 0.11) -> dict[str, Any]:
    return {
        "type": "Polygon",
        "coordinates": [[
            [center_lng - lng_radius, center_lat - lat_radius],
            [center_lng + lng_radius, center_lat - lat_radius],
            [center_lng + lng_radius, center_lat + lat_radius],
            [center_lng - lng_radius, center_lat + lat_radius],
            [center_lng - lng_radius, center_lat - lat_radius],
        ]],
    }


def line_from_bearing(lat: float, lng: float, bearing_deg: float, distance_deg: float = 0.22) -> dict[str, Any]:
    angle_rad = math.radians(90 - bearing_deg)
    dx = math.cos(angle_rad) * distance_deg
    dy = math.sin(angle_rad) * distance_deg * 0.65
    return {
        "type": "LineString",
        "coordinates": [
            [lng - (dx * 0.55), lat - (dy * 0.55)],
            [lng + dx, lat + dy],
        ],
    }


def trend_from_values(previous_value: float, current_value: float, tolerance: float = 0.01) -> EnvironmentalTrend:
    if current_value > previous_value + tolerance:
        return EnvironmentalTrend.RISING
    if current_value < previous_value - tolerance:
        return EnvironmentalTrend.FALLING
    return EnvironmentalTrend.STABLE


def event_category_from_type(event_type: NarrativeEventType) -> NaturalEventCategory:
    if event_type == NarrativeEventType.WILDFIRE:
        return NaturalEventCategory.WILDFIRE
    if event_type in {NarrativeEventType.RAINFALL, NarrativeEventType.WIND}:
        return NaturalEventCategory.STORM
    return NaturalEventCategory.FLOOD


def score_value(severity: AlertSeverity) -> int:
    if severity == AlertSeverity.CRITICAL:
        return 4
    if severity == AlertSeverity.HIGH:
        return 3
    if severity == AlertSeverity.MEDIUM:
        return 2
    return 1


def subtitle_for_event(event_type: NarrativeEventType, location_name: str) -> str:
    if event_type == NarrativeEventType.WILDFIRE:
        return f"FIRMS - {location_name}"
    if event_type == NarrativeEventType.WIND:
        return f"Corredor de viento - {location_name}"
    if event_type == NarrativeEventType.RAINFALL:
        return f"Lluvia observada - {location_name}"
    if event_type == NarrativeEventType.RIVER_RISK:
        return f"Cauce monitoreado - {location_name}"
    return f"Riesgo hidrico - {location_name}"


def current_utc() -> datetime:
    return datetime.now(timezone.utc)


class LiveDataSnapshotService:
    _lock = asyncio.Lock()
    _snapshot: LiveDataSnapshot | None = None
    _expires_at: datetime = datetime.min.replace(tzinfo=timezone.utc)

    @classmethod
    async def get_snapshot(cls) -> LiveDataSnapshot:
        now = current_utc()
        if cls._snapshot and now < cls._expires_at:
            return cls._snapshot

        async with cls._lock:
            now = current_utc()
            if cls._snapshot and now < cls._expires_at:
                return cls._snapshot

            snapshot = await cls._build_snapshot()
            cls._snapshot = snapshot
            cls._expires_at = now + timedelta(seconds=settings.narrative_cache_ttl_seconds)
            return snapshot

    @classmethod
    async def build_websocket_bootstrap(cls) -> list[EventEnvelope]:
        snapshot = await cls.get_snapshot()
        emitted_at = current_utc()
        events: list[EventEnvelope] = [
            EventEnvelope(
                event_name="status.updated",
                emitted_at=emitted_at,
                payload=snapshot.narrative_status.model_dump(mode="json"),
            )
        ]
        if snapshot.events:
            events.append(
                EventEnvelope(
                    event_name="natural_event.updated",
                    emitted_at=emitted_at,
                    payload=snapshot.events[0].model_dump(mode="json"),
                )
            )
        if snapshot.scenes:
            events.append(
                EventEnvelope(
                    event_name="scene.generated",
                    emitted_at=emitted_at,
                    payload=snapshot.scenes[-1].model_dump(mode="json"),
                )
            )
        return events

    @classmethod
    async def _build_snapshot(cls) -> LiveDataSnapshot:
        connectivity = ConnectivityState.LIVE
        firms_error = False

        async with httpx.AsyncClient(timeout=25.0) as client:
            weather_points = await cls._fetch_weather_points(client)
            flood_points = await cls._fetch_flood_points(client)
            try:
                firms_detections = await cls._fetch_firms_detections(client)
            except ProviderDataError:
                firms_detections = []
                firms_error = True

        if firms_error or not settings.firms_map_key:
            connectivity = ConnectivityState.DEGRADED

        events = cls._build_events(weather_points, flood_points, firms_detections)
        fields = cls._build_fields(weather_points, flood_points, firms_detections)
        scenes = cls._build_scenes(weather_points, flood_points, events, fields)
        layers = cls._build_layers(fields)
        alerts = cls._build_alerts(events)
        incidents = cls._build_incidents(alerts, scenes)
        status = cls._build_status(events, weather_points, connectivity)
        narrative_status = cls._build_narrative_status(events, fields, scenes, connectivity)
        timeline = [
            TimelineScene(
                timestamp=scene.timestamp,
                available_layers=scene.available_layers,
                freshness=scene.freshness,
                comparison_supported=scene.comparison_supported,
            )
            for scene in scenes
        ]

        return LiveDataSnapshot(
            status=status,
            layers=layers,
            timeline=timeline,
            alerts=alerts,
            incidents=incidents,
            fields=fields,
            events=events,
            scenes=scenes,
            narrative_status=narrative_status,
        )

    @classmethod
    async def _fetch_weather_points(cls, client: httpx.AsyncClient) -> list[WeatherPoint]:
        results = await asyncio.gather(
            *(cls._fetch_weather_for_location(client, location) for location in MONITORED_LOCATIONS),
            return_exceptions=True,
        )
        points = [result for result in results if isinstance(result, WeatherPoint)]
        if not points:
            raise ProviderDataError("Open-Meteo forecast returned no valid monitoring points")
        return points

    @classmethod
    async def _fetch_flood_points(cls, client: httpx.AsyncClient) -> list[FloodPoint]:
        results = await asyncio.gather(
            *(cls._fetch_flood_for_location(client, location) for location in MONITORED_LOCATIONS),
            return_exceptions=True,
        )
        points = [result for result in results if isinstance(result, FloodPoint)]
        if not points:
            raise ProviderDataError("Open-Meteo flood returned no valid monitoring points")
        return points

    @classmethod
    async def _fetch_weather_for_location(
        cls,
        client: httpx.AsyncClient,
        location: MonitoringLocation,
    ) -> WeatherPoint:
        response = await client.get(
            f"{settings.open_meteo_base_url}/v1/forecast",
            params={
                "latitude": location.latitude,
                "longitude": location.longitude,
                "timezone": settings.app_timezone,
                "past_hours": 24,
                "forecast_hours": 12,
                "wind_speed_unit": "kmh",
                "current": ",".join(
                    [
                        "temperature_2m",
                        "relative_humidity_2m",
                        "precipitation",
                        "wind_speed_10m",
                        "wind_direction_10m",
                        "soil_moisture_0_to_1cm",
                    ]
                ),
                "hourly": ",".join(
                    [
                        "precipitation",
                        "wind_speed_10m",
                        "wind_direction_10m",
                        "soil_moisture_0_to_1cm",
                    ]
                ),
            },
        )
        response.raise_for_status()
        payload = response.json()
        current = payload["current"]
        hourly = payload["hourly"]

        current_time = iso_to_datetime(current["time"])
        hourly_times = [iso_to_datetime(item) for item in hourly["time"]]
        hourly_precipitation = [float(item or 0) for item in hourly["precipitation"]]
        hourly_wind_speed = [float(item or 0) for item in hourly["wind_speed_10m"]]
        current_soil_moisture = float(current.get("soil_moisture_0_to_1cm") or 0)
        previous_soil_moisture = float(hourly.get("soil_moisture_0_to_1cm", [current_soil_moisture])[0] or 0)
        del previous_soil_moisture

        return WeatherPoint(
            location=location,
            current_time=current_time.astimezone(timezone.utc),
            current_temperature_c=float(current["temperature_2m"]),
            current_relative_humidity=float(current["relative_humidity_2m"]),
            current_precipitation_mm=float(current["precipitation"]),
            current_wind_speed_kmh=float(current["wind_speed_10m"]),
            current_wind_direction_deg=float(current["wind_direction_10m"]),
            current_soil_moisture=current_soil_moisture,
            precipitation_24h_mm=sum(hourly_precipitation[-24:]),
            wind_peak_24h_kmh=max(hourly_wind_speed[-24:] or [float(current["wind_speed_10m"])]),
            hourly_times=[time.astimezone(timezone.utc) for time in hourly_times],
            hourly_precipitation_mm=hourly_precipitation,
            hourly_wind_speed_kmh=hourly_wind_speed,
        )

    @classmethod
    async def _fetch_flood_for_location(
        cls,
        client: httpx.AsyncClient,
        location: MonitoringLocation,
    ) -> FloodPoint:
        response = await client.get(
            f"{settings.open_meteo_flood_base_url}/v1/flood",
            params={
                "latitude": location.latitude,
                "longitude": location.longitude,
                "timezone": settings.app_timezone,
                "daily": "river_discharge",
                "past_days": 2,
                "forecast_days": 3,
            },
        )
        response.raise_for_status()
        payload = response.json()
        daily = payload["daily"]
        discharges = [float(item or 0) for item in daily.get("river_discharge", [])]
        timestamps = [iso_to_datetime(item) for item in daily.get("time", [])]
        if not discharges or not timestamps:
            raise ProviderDataError(f"No flood samples for {location.name}")

        return FloodPoint(
            location=location,
            observed_at=timestamps[-1].astimezone(timezone.utc),
            current_discharge_m3s=discharges[-1],
            max_discharge_window_m3s=max(discharges),
        )

    @classmethod
    async def _fetch_firms_detections(cls, client: httpx.AsyncClient) -> list[FirmsDetection]:
        if not settings.firms_map_key:
            raise ProviderDataError("FIRMS_MAP_KEY is required for live wildfire detections")

        detections: list[FirmsDetection] = []
        bbox = ",".join(str(value) for value in JUJUY_BBOX)
        sources = ["VIIRS_SNPP_NRT", "VIIRS_NOAA21_NRT"]

        for source in sources:
            response = await client.get(
                f"{settings.firms_base_url}/api/area/csv/{settings.firms_map_key}/{source}/{bbox}/1"
            )
            response.raise_for_status()
            text = response.text.strip()
            if not text:
                continue
            reader = csv.DictReader(io.StringIO(text))
            for row in reader:
                observed_at = datetime.strptime(
                    f"{row['acq_date']} {row['acq_time'].zfill(4)}",
                    "%Y-%m-%d %H%M",
                ).replace(tzinfo=timezone.utc)
                confidence_raw = row.get("confidence") or "0"
                try:
                    confidence = float(confidence_raw)
                except ValueError:
                    confidence = 80.0 if confidence_raw.lower() == "h" else 50.0 if confidence_raw.lower() == "n" else 20.0
                brightness_key = "bright_ti4" if row.get("bright_ti4") else "brightness"
                detections.append(
                    FirmsDetection(
                        latitude=float(row["latitude"]),
                        longitude=float(row["longitude"]),
                        brightness=float(row.get(brightness_key) or 0),
                        confidence=confidence,
                        frp=float(row.get("frp") or 0),
                        observed_at=observed_at,
                        source=source,
                    )
                )
        return detections

    @classmethod
    def _build_fields(
        cls,
        weather_points: list[WeatherPoint],
        flood_points: list[FloodPoint],
        firms_detections: list[FirmsDetection],
    ) -> list[EnvironmentalField]:
        fields: list[EnvironmentalField] = []
        flood_by_location = {item.location.id: item for item in flood_points}

        for weather in weather_points:
            severity = severity_from_rain(
                weather.precipitation_24h_mm,
                weather.current_soil_moisture,
                flood_by_location[weather.location.id].current_discharge_m3s,
            )
            previous_precipitation = sum(weather.hourly_precipitation_mm[-18:-6] or [0.0])
            current_precipitation = sum(weather.hourly_precipitation_mm[-6:] or [0.0])
            rain_trend = trend_from_values(previous_precipitation, current_precipitation, tolerance=3.0)
            wind_trend = trend_from_values(
                weather.hourly_wind_speed_kmh[-2] if len(weather.hourly_wind_speed_kmh) >= 2 else weather.current_wind_speed_kmh,
                weather.current_wind_speed_kmh,
                tolerance=1.5,
            )
            river = flood_by_location[weather.location.id]

            fields.append(
                EnvironmentalField(
                    id=f"field-rain-{weather.location.id}",
                    kind=EnvironmentalFieldType.RAINFALL_ACCUMULATION,
                    field_type=EnvironmentalRenderType.RAIN,
                    title=f"Lluvia acumulada en {weather.location.name}",
                    label="Lluvia viva",
                    metric_name="rainfall_24h",
                    unit="mm",
                    current_value=round_safe(weather.precipitation_24h_mm),
                    change_24h=round_safe(current_precipitation - previous_precipitation),
                    observed_at=weather.current_time,
                    severity=severity,
                    source="Open-Meteo",
                    sources=["Open-Meteo forecast"],
                    region=weather.location.region,
                    layer_id="rainfall",
                    geometry=bbox_polygon(weather.location.latitude, weather.location.longitude),
                    centroid=point(weather.location.latitude, weather.location.longitude),
                    location=point(weather.location.latitude, weather.location.longitude),
                    trend=rain_trend,
                    value_range=EnvironmentalFieldRange(
                        min=0,
                        max=max(round_safe(weather.precipitation_24h_mm), 1.0),
                        focus=round_safe(weather.current_precipitation_mm),
                    ),
                    summary=f"{round_safe(weather.precipitation_24h_mm)} mm acumulados en 24h.",
                    confidence=DataConfidence.OBSERVED,
                    related_event_ids=[],
                    legend=[{"label": "lluvia", "color": "#27B3FF"}],
                )
            )
            fields.append(
                EnvironmentalField(
                    id=f"field-wind-{weather.location.id}",
                    kind=EnvironmentalFieldType.WIND_CORRIDOR,
                    field_type=EnvironmentalRenderType.WIND,
                    title=f"Viento visible en {weather.location.name}",
                    label="Viento visible",
                    metric_name="wind_speed_10m",
                    unit="km/h",
                    current_value=round_safe(weather.current_wind_speed_kmh),
                    change_24h=round_safe(weather.current_wind_speed_kmh - weather.hourly_wind_speed_kmh[0]),
                    observed_at=weather.current_time,
                    severity=severity_from_wind(weather.current_wind_speed_kmh),
                    source="Open-Meteo",
                    sources=["Open-Meteo forecast"],
                    region=weather.location.region,
                    layer_id="wind",
                    geometry=line_from_bearing(
                        weather.location.latitude,
                        weather.location.longitude,
                        weather.current_wind_direction_deg,
                    ),
                    centroid=point(weather.location.latitude, weather.location.longitude),
                    location=point(weather.location.latitude, weather.location.longitude),
                    trend=wind_trend,
                    value_range=EnvironmentalFieldRange(
                        min=0,
                        max=max(round_safe(weather.wind_peak_24h_kmh), 1.0),
                        focus=round_safe(weather.current_wind_speed_kmh),
                    ),
                    summary=f"Viento de {round_safe(weather.current_wind_speed_kmh)} km/h con direccion {round_safe(weather.current_wind_direction_deg)}°.",
                    confidence=DataConfidence.OBSERVED,
                    related_event_ids=[],
                    legend=[{"label": "viento", "color": "#F08A24"}],
                )
            )
            fields.append(
                EnvironmentalField(
                    id=f"field-river-{weather.location.id}",
                    kind=EnvironmentalFieldType.RIVER_LEVEL,
                    field_type=EnvironmentalRenderType.RIVER_STATE,
                    title=f"{weather.location.river_name or 'Cauce'} en {weather.location.name}",
                    label="Rios reactivos",
                    metric_name="river_discharge",
                    unit="m3/s",
                    current_value=round_safe(river.current_discharge_m3s),
                    change_24h=round_safe(river.current_discharge_m3s - river.max_discharge_window_m3s),
                    observed_at=river.observed_at,
                    severity=severity,
                    source="Open-Meteo Flood",
                    sources=["Open-Meteo flood"],
                    region=weather.location.region,
                    layer_id="river_state",
                    geometry=line_from_bearing(weather.location.latitude, weather.location.longitude, 160, distance_deg=0.14),
                    centroid=point(weather.location.latitude, weather.location.longitude),
                    location=point(weather.location.latitude, weather.location.longitude),
                    trend=EnvironmentalTrend.RISING if river.current_discharge_m3s >= (river.max_discharge_window_m3s * 0.7) else EnvironmentalTrend.STABLE,
                    value_range=EnvironmentalFieldRange(
                        min=0,
                        max=max(round_safe(river.max_discharge_window_m3s), 1.0),
                        focus=round_safe(river.current_discharge_m3s),
                    ),
                    summary=f"{weather.location.river_name or 'Cauce'} con descarga actual de {round_safe(river.current_discharge_m3s)} m3/s.",
                    confidence=DataConfidence.MODELED,
                    related_event_ids=[],
                    legend=[{"label": "cauce", "color": "#27B3FF"}],
                )
            )
            fields.append(
                EnvironmentalField(
                    id=f"field-hydric-{weather.location.id}",
                    kind=EnvironmentalFieldType.HYDRIC_RISK,
                    field_type=EnvironmentalRenderType.FLOOD_RISK,
                    title=f"Riesgo hidrico en {weather.location.name}",
                    label="Riesgo hidrico",
                    metric_name="hydric_risk_score",
                    unit="score",
                    current_value=round_safe(
                        min(1.0, (weather.precipitation_24h_mm / 100.0) + weather.current_soil_moisture + (river.current_discharge_m3s / 200.0)),
                        2,
                    ),
                    change_24h=round_safe(current_precipitation - previous_precipitation, 2),
                    observed_at=weather.current_time,
                    severity=severity,
                    source="Open-Meteo derived",
                    sources=["Open-Meteo forecast", "Open-Meteo flood"],
                    region=weather.location.region,
                    layer_id="flood_risk",
                    geometry=bbox_polygon(weather.location.latitude, weather.location.longitude, 0.06, 0.085),
                    centroid=point(weather.location.latitude, weather.location.longitude),
                    location=point(weather.location.latitude, weather.location.longitude),
                    trend=rain_trend,
                    value_range=EnvironmentalFieldRange(min=0, max=1, focus=min(1.0, weather.current_soil_moisture)),
                    summary=f"Riesgo combinado por lluvia, humedad del suelo y descarga hidrica en {weather.location.name}.",
                    confidence=DataConfidence.MIXED,
                    related_event_ids=[],
                    legend=[{"label": "riesgo", "color": "#F04452"}],
                )
            )

        if firms_detections:
            centroid_lat = sum(item.latitude for item in firms_detections) / len(firms_detections)
            centroid_lng = sum(item.longitude for item in firms_detections) / len(firms_detections)
            fields.append(
                EnvironmentalField(
                    id="field-fire-spread-jujuy",
                    kind=EnvironmentalFieldType.FIRE_SPREAD,
                    field_type=EnvironmentalRenderType.FIRE,
                    title="Actividad termica FIRMS en Jujuy",
                    label="Focos termicos",
                    metric_name="fire_detections",
                    unit="detections",
                    current_value=float(len(firms_detections)),
                    change_24h=float(len(firms_detections)),
                    observed_at=max(item.observed_at for item in firms_detections),
                    severity=severity_from_firms(
                        len(firms_detections),
                        max(item.frp for item in firms_detections),
                        sum(item.confidence for item in firms_detections) / len(firms_detections),
                    ),
                    source="NASA FIRMS",
                    sources=["NASA FIRMS"],
                    region="Jujuy",
                    layer_id="fire_spread",
                    geometry=bbox_polygon(centroid_lat, centroid_lng, 0.09, 0.12),
                    centroid=point(centroid_lat, centroid_lng),
                    location=point(centroid_lat, centroid_lng),
                    trend=EnvironmentalTrend.RISING,
                    value_range=EnvironmentalFieldRange(
                        min=0,
                        max=max(float(len(firms_detections)), 1.0),
                        focus=float(len(firms_detections)),
                    ),
                    summary=f"{len(firms_detections)} detecciones termicas FIRMS en la ventana de 24 horas.",
                    confidence=DataConfidence.OBSERVED,
                    related_event_ids=[],
                    legend=[{"label": "fuego", "color": "#F04452"}],
                )
            )

        return fields

    @classmethod
    def _build_events(
        cls,
        weather_points: list[WeatherPoint],
        flood_points: list[FloodPoint],
        firms_detections: list[FirmsDetection],
    ) -> list[NaturalEventEntity]:
        events: list[NaturalEventEntity] = []
        flood_by_location = {item.location.id: item for item in flood_points}

        for weather in weather_points:
            flood = flood_by_location[weather.location.id]
            hydric_severity = severity_from_rain(
                weather.precipitation_24h_mm,
                weather.current_soil_moisture,
                flood.current_discharge_m3s,
            )
            if hydric_severity != AlertSeverity.LOW:
                events.append(
                    cls._build_natural_event(
                        event_id=f"event-flood-{weather.location.id}",
                        event_type=NarrativeEventType.FLOOD_RISK,
                        severity=hydric_severity,
                        location=weather.location,
                        observed_at=max(weather.current_time, flood.observed_at),
                        title="Riesgo hidrico",
                        short_message="Agua y lluvia presionan la cuenca local.",
                        long_message=(
                            f"{round_safe(weather.precipitation_24h_mm)} mm acumulados en 24h, humedad superficial de "
                            f"{round_safe(weather.current_soil_moisture * 100)}% y descarga de "
                            f"{round_safe(flood.current_discharge_m3s)} m3/s sobre {weather.location.name}."
                        ),
                        narrative_summary=(
                            f"El territorio muestra ascenso hidrico en {weather.location.name}: lluvia, suelo cargado y "
                            f"cauce activo se alinean en la misma lectura operativa."
                        ),
                        geometry=bbox_polygon(weather.location.latitude, weather.location.longitude, 0.065, 0.09),
                        primary_metric=EventPreviewMetric(
                            label="Lluvia 24h",
                            value=f"{round_safe(weather.precipitation_24h_mm)} mm",
                            tone="critical" if hydric_severity == AlertSeverity.CRITICAL else "warning",
                        ),
                        factors=[
                            f"lluvia 24h {round_safe(weather.precipitation_24h_mm)} mm",
                            f"humedad del suelo {round_safe(weather.current_soil_moisture * 100)}%",
                            f"descarga {round_safe(flood.current_discharge_m3s)} m3/s",
                        ],
                        metrics=[
                            EventMetric(id="rain-24h", label="Lluvia 24h", value=str(round_safe(weather.precipitation_24h_mm)), unit="mm", emphasis="primary"),
                            EventMetric(id="soil-moisture", label="Suelo", value=str(round_safe(weather.current_soil_moisture * 100)), unit="%", emphasis="secondary"),
                            EventMetric(id="river-discharge", label="Descarga", value=str(round_safe(flood.current_discharge_m3s)), unit="m3/s", emphasis="secondary"),
                        ],
                        sources=["Open-Meteo forecast", "Open-Meteo flood"],
                        related_field_ids=[
                            f"field-rain-{weather.location.id}",
                            f"field-river-{weather.location.id}",
                            f"field-hydric-{weather.location.id}",
                        ],
                        impact_summary={
                            "population": f"{weather.location.name} y zonas bajas en vigilancia",
                            "infrastructure": f"{weather.location.river_name or 'Cauce'} y drenajes cercanos",
                            "routes": "Cruces, banquinas y accesos secundarios a revisar",
                        },
                        recommended_actions=[
                            "Cruzar lluvia y descarga con estado vial",
                            "Monitorear cauce y pasos bajos",
                            "Actualizar aviso preventivo local",
                        ],
                    )
                )

            wind_severity = severity_from_wind(weather.current_wind_speed_kmh)
            if wind_severity in {AlertSeverity.HIGH, AlertSeverity.CRITICAL}:
                events.append(
                    cls._build_natural_event(
                        event_id=f"event-wind-{weather.location.id}",
                        event_type=NarrativeEventType.WIND,
                        severity=wind_severity,
                        location=weather.location,
                        observed_at=weather.current_time,
                        title="Viento dominante",
                        short_message="Corredor de viento acelerado.",
                        long_message=(
                            f"Viento actual de {round_safe(weather.current_wind_speed_kmh)} km/h con pico diario de "
                            f"{round_safe(weather.wind_peak_24h_kmh)} km/h en {weather.location.name}."
                        ),
                        narrative_summary=(
                            f"El viento visible organiza la lectura del territorio en {weather.location.name} y condiciona "
                            "propagacion de lluvia, humo o polvo."
                        ),
                        geometry=line_from_bearing(
                            weather.location.latitude,
                            weather.location.longitude,
                            weather.current_wind_direction_deg,
                            distance_deg=0.24,
                        ),
                        primary_metric=EventPreviewMetric(
                            label="Viento",
                            value=f"{round_safe(weather.current_wind_speed_kmh)} km/h",
                            tone="warning",
                        ),
                        factors=[
                            f"direccion {round_safe(weather.current_wind_direction_deg)}°",
                            f"pico 24h {round_safe(weather.wind_peak_24h_kmh)} km/h",
                        ],
                        metrics=[
                            EventMetric(id="wind", label="Viento", value=str(round_safe(weather.current_wind_speed_kmh)), unit="km/h", emphasis="primary"),
                            EventMetric(id="gust", label="Pico 24h", value=str(round_safe(weather.wind_peak_24h_kmh)), unit="km/h", emphasis="secondary"),
                        ],
                        sources=["Open-Meteo forecast"],
                        related_field_ids=[f"field-wind-{weather.location.id}"],
                        impact_summary={
                            "population": "Afectacion indirecta por rafagas y polvo",
                            "infrastructure": "Corredores expuestos y lineas aereas",
                            "routes": "Visibilidad y control de vehiculos livianos",
                        },
                        recommended_actions=[
                            "Revisar correlacion con incendios y polvo",
                            "Mantener observacion sobre rafagas",
                        ],
                    )
                )

            if weather.current_precipitation_mm >= 3 or weather.precipitation_24h_mm >= 25:
                rain_severity = AlertSeverity.HIGH if weather.current_precipitation_mm >= 8 or weather.precipitation_24h_mm >= 60 else AlertSeverity.MEDIUM
                events.append(
                    cls._build_natural_event(
                        event_id=f"event-rain-{weather.location.id}",
                        event_type=NarrativeEventType.RAINFALL,
                        severity=rain_severity,
                        location=weather.location,
                        observed_at=weather.current_time,
                        title="Lluvia intensa" if rain_severity == AlertSeverity.HIGH else "Lluvia activa",
                        short_message="Celda de lluvia observada en la zona.",
                        long_message=(
                            f"Precipitacion actual de {round_safe(weather.current_precipitation_mm)} mm y acumulado diario de "
                            f"{round_safe(weather.precipitation_24h_mm)} mm en {weather.location.name}."
                        ),
                        narrative_summary=(
                            f"La lluvia visible en {weather.location.name} alimenta escorrentia y condiciona la lectura hidrica del territorio."
                        ),
                        geometry=bbox_polygon(weather.location.latitude, weather.location.longitude, 0.07, 0.09),
                        primary_metric=EventPreviewMetric(
                            label="Precipitacion",
                            value=f"{round_safe(weather.current_precipitation_mm)} mm",
                            tone="warning" if rain_severity == AlertSeverity.HIGH else "info",
                        ),
                        factors=[
                            f"lluvia actual {round_safe(weather.current_precipitation_mm)} mm",
                            f"acumulado 24h {round_safe(weather.precipitation_24h_mm)} mm",
                        ],
                        metrics=[
                            EventMetric(id="rain-now", label="Ahora", value=str(round_safe(weather.current_precipitation_mm)), unit="mm", emphasis="primary"),
                            EventMetric(id="rain-24h", label="24h", value=str(round_safe(weather.precipitation_24h_mm)), unit="mm", emphasis="secondary"),
                        ],
                        sources=["Open-Meteo forecast"],
                        related_field_ids=[f"field-rain-{weather.location.id}", f"field-hydric-{weather.location.id}"],
                        impact_summary={
                            "population": "Barrios y cuencas a monitorear",
                            "infrastructure": "Drenajes y badenes",
                            "routes": "Escorrentia puntual posible",
                        },
                        recommended_actions=["Cruzar intensidad con riesgo hidrico", "Seguir evolucion horaria"],
                    )
                )

        if firms_detections:
            detections_by_cluster: dict[str, list[FirmsDetection]] = {}
            for detection in firms_detections:
                cluster_key = f"{round(detection.latitude, 1)}:{round(detection.longitude, 1)}"
                detections_by_cluster.setdefault(cluster_key, []).append(detection)

            for cluster_index, cluster in enumerate(detections_by_cluster.values(), start=1):
                centroid_lat = sum(item.latitude for item in cluster) / len(cluster)
                centroid_lng = sum(item.longitude for item in cluster) / len(cluster)
                nearest_location = min(
                    MONITORED_LOCATIONS,
                    key=lambda location: ((location.latitude - centroid_lat) ** 2) + ((location.longitude - centroid_lng) ** 2),
                )
                mean_confidence = sum(item.confidence for item in cluster) / len(cluster)
                max_frp = max(item.frp for item in cluster)
                severity = severity_from_firms(len(cluster), max_frp, mean_confidence)
                observed_at = max(item.observed_at for item in cluster)

                events.append(
                    cls._build_natural_event(
                        event_id=f"event-fire-{cluster_index}",
                        event_type=NarrativeEventType.WILDFIRE,
                        severity=severity,
                        location=nearest_location,
                        observed_at=observed_at,
                        title="Incendio activo",
                        short_message="Detecciones termicas FIRMS en la provincia.",
                        long_message=(
                            f"FIRMS reporta {len(cluster)} detecciones con FRP maximo de {round_safe(max_frp)} y confianza media de "
                            f"{round_safe(mean_confidence)} en el entorno de {nearest_location.name}."
                        ),
                        narrative_summary=(
                            "La señal termica satelital confirma actividad de fuego observada y permite priorizar seguimiento operativo."
                        ),
                        geometry=bbox_polygon(centroid_lat, centroid_lng, 0.05, 0.07),
                        primary_metric=EventPreviewMetric(
                            label="FIRMS",
                            value=f"{len(cluster)} detecciones",
                            tone="critical" if severity == AlertSeverity.CRITICAL else "warning",
                        ),
                        factors=[
                            f"FRP max {round_safe(max_frp)}",
                            f"confianza media {round_safe(mean_confidence)}",
                        ],
                        metrics=[
                            EventMetric(id="detections", label="Detecciones", value=str(len(cluster)), emphasis="primary"),
                            EventMetric(id="frp", label="FRP max", value=str(round_safe(max_frp)), emphasis="secondary"),
                        ],
                        sources=["NASA FIRMS"],
                        related_field_ids=["field-fire-spread-jujuy"],
                        impact_summary={
                            "population": f"Entorno de {nearest_location.name} en seguimiento",
                            "infrastructure": "Cobertura vegetal y accesos rurales cercanos",
                            "routes": "Accesos secundarios bajo observacion",
                        },
                        recommended_actions=[
                            "Cruzar focos con brigadas disponibles",
                            "Monitorear viento de superficie",
                        ],
                    )
                )

        events.sort(key=lambda event: (score_value(event.severity), event.observed_at), reverse=True)
        return events

    @classmethod
    def _build_natural_event(
        cls,
        *,
        event_id: str,
        event_type: NarrativeEventType,
        severity: AlertSeverity,
        location: MonitoringLocation,
        observed_at: datetime,
        title: str,
        short_message: str,
        long_message: str,
        narrative_summary: str,
        geometry: dict[str, Any],
        primary_metric: EventPreviewMetric,
        factors: list[str],
        metrics: list[EventMetric],
        sources: list[str],
        related_field_ids: list[str],
        impact_summary: dict[str, str],
        recommended_actions: list[str],
    ) -> NaturalEventEntity:
        category = event_category_from_type(event_type)
        preview = EventPreview(
            id=f"preview-{event_id}",
            event_id=event_id,
            title=title,
            subtitle=subtitle_for_event(event_type, location.name),
            category=category,
            kind=category,
            event_type=event_type,
            severity=severity,
            status=AlertStatus.NEW,
            location_name=location.name,
            region=location.region,
            summary=short_message,
            observed_at=observed_at,
            updated_at=observed_at,
            primary_scene_id="",
            field_ids=related_field_ids,
            centroid=point(location.latitude, location.longitude),
            primary_metric=primary_metric,
            chips=["live", location.region.lower()],
            direction=foco_direction_label(event_type),
        )
        return NaturalEventEntity(
            id=event_id,
            title=title,
            category=category,
            kind=category,
            event_type=event_type,
            severity=severity,
            status=AlertStatus.NEW,
            summary=short_message,
            short_message=short_message,
            description=long_message,
            long_message=long_message,
            narrative_label=title,
            narrative_summary=narrative_summary,
            location_name=location.name,
            region=location.region,
            observed_at=observed_at,
            started_at=observed_at,
            updated_at=observed_at,
            geometry=geometry,
            centroid=point(location.latitude, location.longitude),
            location=point(location.latitude, location.longitude),
            confidence_score=0.86 if "NASA FIRMS" in sources else 0.8,
            confidence=DataConfidence.OBSERVED if "Open-Meteo" in " ".join(sources) or "NASA FIRMS" in sources else DataConfidence.MIXED,
            source_signals=sources,
            sources=sources,
            recommended_actions=recommended_actions,
            impact_summary=impact_summary,
            drivers=factors,
            factors=factors,
            metrics=metrics,
            related_field_ids=related_field_ids,
            linked_field_ids=related_field_ids,
            related_scene_ids=[],
            related_fields=[],
            before_after_assets=BeforeAfterAssets(before="Ventana -24h", after="Observacion actual"),
            preview=preview,
        )

    @classmethod
    def _build_layers(cls, fields: list[EnvironmentalField]) -> list[LayerDefinition]:
        layer_legend: dict[str, list[dict[str, str]]] = {}
        for field in fields:
            layer_legend.setdefault(field.layer_id, field.legend or [])

        return [
            LayerDefinition(
                id="wind",
                group=LayerGroup.RISK,
                label="Viento visible",
                technical_name="wind_corridor",
                visible_by_default=True,
                available_time_ranges=["6h", "24h"],
                legend=layer_legend.get("wind", [{"label": "viento", "color": "#F08A24"}]),
            ),
            LayerDefinition(
                id="rainfall",
                group=LayerGroup.RISK,
                label="Lluvia viva",
                technical_name="rainfall_accumulation",
                visible_by_default=True,
                available_time_ranges=["6h", "24h"],
                legend=layer_legend.get("rainfall", [{"label": "lluvia", "color": "#27B3FF"}]),
            ),
            LayerDefinition(
                id="river_state",
                group=LayerGroup.RISK,
                label="Rios reactivos",
                technical_name="river_level",
                visible_by_default=True,
                available_time_ranges=["24h", "72h"],
                legend=layer_legend.get("river_state", [{"label": "cauce", "color": "#27B3FF"}]),
            ),
            LayerDefinition(
                id="flood_risk",
                group=LayerGroup.RISK,
                label="Riesgo hidrico",
                technical_name="hydric_risk",
                visible_by_default=True,
                available_time_ranges=["24h", "72h"],
                legend=layer_legend.get("flood_risk", [{"label": "riesgo", "color": "#F04452"}]),
            ),
            LayerDefinition(
                id="fire_spread",
                group=LayerGroup.ENVIRONMENT,
                label="Focos termicos",
                technical_name="fire_spread",
                visible_by_default=True,
                available_time_ranges=["24h"],
                legend=layer_legend.get("fire_spread", [{"label": "fuego", "color": "#F04452"}]),
            ),
        ]

    @classmethod
    def _build_status(
        cls,
        events: list[NaturalEventEntity],
        weather_points: list[WeatherPoint],
        connectivity: ConnectivityState,
    ) -> OperationalStatus:
        top_weather = max(weather_points, key=lambda item: item.precipitation_24h_mm + item.current_wind_speed_kmh)
        headline = (
            f"Provincia monitoreada con lluvia 24h de {round_safe(top_weather.precipitation_24h_mm)} mm en {top_weather.location.name}, "
            f"viento de {round_safe(top_weather.current_wind_speed_kmh)} km/h y {sum(1 for event in events if event.event_type == NarrativeEventType.WILDFIRE)} focos activos FIRMS."
        )
        hydric_events = [event for event in events if event.event_type == NarrativeEventType.FLOOD_RISK]
        hydric_risk_level = hydric_events[0].severity if hydric_events else AlertSeverity.LOW

        return OperationalStatus(
            province_state=province_state_from_events(events),
            active_alert_count=len([event for event in events if event.severity in {AlertSeverity.HIGH, AlertSeverity.CRITICAL}]),
            wildfire_count=len([event for event in events if event.event_type == NarrativeEventType.WILDFIRE]),
            hydric_risk_level=hydric_risk_level,
            last_updated_at=current_utc(),
            connectivity_state=connectivity,
            headline=headline,
        )

    @classmethod
    def _build_narrative_status(
        cls,
        events: list[NaturalEventEntity],
        fields: list[EnvironmentalField],
        scenes: list[NarrativeScene],
        connectivity: ConnectivityState,
    ) -> NarrativeStatus:
        return NarrativeStatus(
            pipeline_state=connectivity,
            active_event_count=len(events),
            tracked_field_count=len(fields),
            live_scene_count=len([scene for scene in scenes if scene.is_live]),
            last_updated_at=current_utc(),
            headline="Narrativa territorial armada con Open-Meteo y FIRMS en tiempo real.",
            active_event_ids=[event.id for event in events],
        )

    @classmethod
    def _build_scenes(
        cls,
        weather_points: list[WeatherPoint],
        flood_points: list[FloodPoint],
        events: list[NaturalEventEntity],
        fields: list[EnvironmentalField],
    ) -> list[NarrativeScene]:
        anchor = max(weather_points, key=lambda item: item.precipitation_24h_mm + item.current_wind_speed_kmh)
        flood = next(item for item in flood_points if item.location.id == anchor.location.id)
        top_event_ids = [event.id for event in events[:3]]
        field_ids = [field.id for field in fields]
        available_layers = ["wind", "rainfall", "river_state", "flood_risk", "fire_spread"]
        now = current_utc()

        scenes: list[NarrativeScene] = []
        scene_offsets = [
            (12, "validado", NarrativeTone.MONITORING, "Provincia en vigilancia"),
            (6, "reciente", NarrativeTone.ESCALATION, "Aceleracion de condiciones"),
            (0, "live", NarrativeTone.CRITICAL, "Provincia respirando en tiempo real"),
        ]

        for hours_back, freshness, tone, title in scene_offsets:
            scene_time = now - timedelta(hours=hours_back)
            scenes.append(
                NarrativeScene(
                    timestamp=scene_time,
                    available_layers=available_layers,
                    freshness=freshness,
                    comparison_supported=True,
                    id=f"scene-{hours_back:02d}h",
                    title=title,
                    summary=f"Lectura provincial construida con clima, hidrologia y actividad termica observada a {hours_back}h.",
                    synopsis=f"{anchor.location.name} concentra la mayor senal hidrometeorologica de la ventana.",
                    narrative_summary=(
                        f"{anchor.location.name} muestra {round_safe(anchor.precipitation_24h_mm)} mm en 24h, "
                        f"viento de {round_safe(anchor.current_wind_speed_kmh)} km/h y descarga de {round_safe(flood.current_discharge_m3s)} m3/s."
                    ),
                    kind=NarrativeSceneKind.RESPONSE if hours_back == 0 else NarrativeSceneKind.OVERVIEW,
                    tone=tone,
                    focus_region=anchor.location.region,
                    captured_at=scene_time,
                    is_live=hours_back == 0,
                    event_ids=[event.id for event in events],
                    field_ids=field_ids,
                    focus_event_ids=top_event_ids,
                    environmental_field_ids=field_ids,
                    layer_ids=available_layers,
                    focus_geometry=bbox_polygon(anchor.location.latitude, anchor.location.longitude, 0.07, 0.1),
                    viewport={"lat": anchor.location.latitude, "lng": anchor.location.longitude, "zoom": 8.8 if hours_back == 0 else 8.2},
                    camera=NarrativeSceneCamera(
                        center=(anchor.location.longitude, anchor.location.latitude),
                        zoom=8.9 if hours_back == 0 else 8.1 if hours_back == 6 else 7.8,
                        pitch=42.0 if hours_back == 0 else 34.0 if hours_back == 6 else 26.0,
                        bearing=-12.0 if hours_back == 0 else -6.0 if hours_back == 6 else 0.0,
                    ),
                    conditions_summary=[
                        ConditionsSummaryItem(label="Viento", value=f"{round_safe(anchor.current_wind_speed_kmh)} km/h"),
                        ConditionsSummaryItem(label="Lluvia", value=f"{round_safe(anchor.precipitation_24h_mm)} mm / 24h"),
                        ConditionsSummaryItem(label="Rio", value=f"{round_safe(flood.current_discharge_m3s)} m3/s"),
                        ConditionsSummaryItem(label="Eventos", value=str(len(events))),
                    ],
                    headlines=[
                        f"Lluvia {round_safe(anchor.precipitation_24h_mm)} mm",
                        f"Viento {round_safe(anchor.current_wind_speed_kmh)} km/h",
                        f"Eventos {len(events)}",
                    ],
                    event_previews=[event.preview for event in events if event.preview],
                    events=events,
                    fields=fields,
                )
            )

        return scenes

    @classmethod
    def _build_alerts(cls, events: list[NaturalEventEntity]) -> list[AlertItem]:
        alerts: list[AlertItem] = []
        for event in events:
            alert_type = cls._alert_type_for_event(event.event_type)
            if alert_type is None:
                continue
            alerts.append(
                AlertItem(
                    id=event.id,
                    type=alert_type,
                    severity=event.severity,
                    title=event.title,
                    short_message=event.short_message,
                    long_message=event.long_message,
                    location_name=event.location_name,
                    geometry=event.geometry,
                    centroid=event.centroid.model_dump(mode="json"),
                    created_at=event.observed_at,
                    status=event.status,
                    recommended_actions=event.recommended_actions,
                    impact_summary=event.impact_summary,
                    factors=event.factors,
                    region=event.region,
                )
            )
        return alerts

    @classmethod
    def _build_incidents(cls, alerts: list[AlertItem], scenes: list[NarrativeScene]) -> dict[str, IncidentDetail]:
        timeline = [
            TimelineScene(
                timestamp=scene.timestamp,
                available_layers=scene.available_layers,
                freshness=scene.freshness,
                comparison_supported=scene.comparison_supported,
            )
            for scene in scenes
        ]
        return {
            alert.id: IncidentDetail(
                alert=alert,
                before_after_assets={"before": "Ventana -24h", "after": "Observacion actual"},
                mini_timeline=timeline,
            )
            for alert in alerts
        }

    @classmethod
    def _alert_type_for_event(cls, event_type: NarrativeEventType) -> AlertType | None:
        if event_type == NarrativeEventType.WILDFIRE:
            return AlertType.WILDFIRE
        if event_type in {NarrativeEventType.FLOOD_RISK, NarrativeEventType.RIVER_RISK, NarrativeEventType.RAINFALL}:
            return AlertType.FLOOD_RISK
        if event_type == NarrativeEventType.WIND:
            return AlertType.LANDSLIDE_RISK
        return None


def foco_direction_label(event_type: NarrativeEventType) -> str:
    if event_type == NarrativeEventType.WILDFIRE:
        return "Actividad termica observada"
    if event_type == NarrativeEventType.WIND:
        return "Flujo de viento visible"
    if event_type == NarrativeEventType.RAINFALL:
        return "Lluvia alimentando escorrentia"
    if event_type == NarrativeEventType.RIVER_RISK:
        return "Cauce en ascenso"
    return "Agua hacia zonas bajas"
