export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ProvinceState = "ESTABLE" | "ATENCION" | "CRITICO";
export type ConnectivityState = "live" | "degraded" | "offline";
export type AlertStatus = "new" | "acknowledged" | "resolved";
export type LayerGroup = "Riesgo" | "Ambiente" | "Infraestructura";
export type NaturalEventKind = "wildfire" | "rainfall" | "wind" | "river_surge" | "hydric_risk";
export type EnvironmentalFieldKind =
  | "fire_spread"
  | "rainfall_accumulation"
  | "wind_corridor"
  | "river_level"
  | "hydric_risk";
export type EnvironmentalTrend = "rising" | "stable" | "falling";
export type DataConfidence = "observed" | "modeled" | "mixed";
export type NarrativeTone = "monitoring" | "escalation" | "critical" | "recovery";

export type Coordinate = [number, number];

export interface GeoPosition {
  lat: number;
  lng: number;
}

export interface PointGeometry {
  type: "Point";
  coordinates: Coordinate;
}

export interface LineStringGeometry {
  type: "LineString";
  coordinates: Coordinate[];
}

export interface PolygonGeometry {
  type: "Polygon";
  coordinates: Coordinate[][];
}

export type FeatureGeometry = PointGeometry | LineStringGeometry | PolygonGeometry;

export interface OperationalStatus {
  province_state: ProvinceState;
  active_alert_count: number;
  wildfire_count: number;
  hydric_risk_level: Severity;
  last_updated_at: string;
  connectivity_state: ConnectivityState;
  headline: string;
}

export interface ImpactSummary {
  population: string;
  infrastructure: string;
  routes: string;
}

export interface EventMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  trend?: EnvironmentalTrend;
  emphasis?: "primary" | "secondary";
}

export interface EventPreviewMetric {
  label: string;
  value: string;
  tone?: "critical" | "warning" | "info";
}

export interface ConditionSummaryItem {
  label: string;
  value: string;
}

export interface NarrativeMotionVector {
  dx: number;
  dy: number;
  intensity: number;
  direction_label: string;
}

export interface NarrativeVisualState {
  size: "minimal" | "prominent" | "dominant";
  glow: "low" | "medium" | "high";
  pulse: boolean;
  opacity: number;
  cluster_priority: number;
}

export interface EventPreview {
  event_id: string;
  kind: NaturalEventKind;
  severity: Severity;
  status: AlertStatus;
  kicker: string;
  title: string;
  subtitle?: string;
  summary: string;
  location_name: string;
  region: string;
  updated_at: string;
  primary_metric: EventPreviewMetric;
  chips: string[];
  direction_label?: string;
}

export interface NaturalEventEntity {
  id: string;
  kind: NaturalEventKind;
  type: string;
  severity: Severity;
  status: AlertStatus;
  title: string;
  short_message: string;
  long_message: string;
  narrative_label: string;
  location_name: string;
  region: string;
  geometry: FeatureGeometry;
  centroid: GeoPosition;
  created_at: string;
  started_at: string;
  updated_at: string;
  sources: string[];
  confidence: DataConfidence;
  recommended_actions: string[];
  impact_summary: ImpactSummary;
  factors: string[];
  metrics: EventMetric[];
  linked_field_ids: string[];
  preview: EventPreview;
  motion_vector: NarrativeMotionVector;
  visual_state: NarrativeVisualState;
  narrative_summary: string;
  before_after_assets: { before: string; after: string };
}

export interface EnvironmentalFieldRange {
  min: number;
  max: number;
  focus: number;
}

export interface EnvironmentalField {
  id: string;
  kind: EnvironmentalFieldKind;
  severity: Severity;
  label: string;
  layer_id: string;
  geometry: FeatureGeometry;
  centroid: GeoPosition;
  observed_at: string;
  trend: EnvironmentalTrend;
  unit: string;
  value_range: EnvironmentalFieldRange;
  summary: string;
  sources: string[];
  confidence: DataConfidence;
  related_event_ids: string[];
  legend: LayerLegendStop[];
}

export interface Alert {
  id: string;
  type: string;
  severity: Severity;
  title: string;
  short_message: string;
  long_message: string;
  location_name: string;
  geometry: PointGeometry;
  centroid: GeoPosition;
  created_at: string;
  status: AlertStatus;
  recommended_actions: string[];
  impact_summary: ImpactSummary;
  factors: string[];
  region: string;
}

export interface LayerLegendStop {
  label: string;
  color: string;
}

export interface LayerDefinition {
  id: string;
  group: LayerGroup;
  label: string;
  technical_name: string;
  visible_by_default: boolean;
  available_time_ranges: string[];
  legend: LayerLegendStop[];
}

export interface TimelineScene {
  timestamp: string;
  available_layers: string[];
  freshness: string;
  comparison_supported: boolean;
  headlines?: string[];
  narrative_summary?: string;
}

export interface NarrativeSceneCamera {
  center: Coordinate;
  zoom: number;
  pitch: number;
  bearing: number;
}

export interface NarrativeScene extends TimelineScene {
  id: string;
  title: string;
  synopsis: string;
  conditions_summary: ConditionSummaryItem[];
  tone: NarrativeTone;
  focus_region: string;
  focus_event_ids: string[];
  environmental_field_ids: string[];
  events: NaturalEventEntity[];
  fields: EnvironmentalField[];
  event_previews: EventPreview[];
  camera: NarrativeSceneCamera;
}

export interface IncidentDetail {
  alert: Alert;
  before_after_assets: { before: string; after: string };
  mini_timeline: TimelineScene[];
}

export type SheetPanel = "map" | "alerts" | "layers" | "timeline";

export interface OperationalDataset {
  status: OperationalStatus;
  layers: LayerDefinition[];
  narrativeEvents: NaturalEventEntity[];
  narrativeScenes: NarrativeScene[];
}
