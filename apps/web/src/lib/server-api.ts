import "server-only";

import type {
  Alert,
  DataConfidence,
  EnvironmentalField,
  EnvironmentalFieldKind,
  EnvironmentalTrend,
  EventMetric,
  EventPreview,
  LayerDefinition,
  NaturalEventEntity,
  NaturalEventKind,
  NarrativeScene,
  NarrativeTone,
  OperationalDataset,
  OperationalStatus,
  Severity
} from "@/types/operational";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

type RawRecord = Record<string, unknown>;

function mapEventKind(eventType: string): NaturalEventKind {
  if (eventType === "wildfire") return "wildfire";
  if (eventType === "rainfall") return "rainfall";
  if (eventType === "wind") return "wind";
  if (eventType === "river_risk") return "river_surge";
  return "hydric_risk";
}

function mapFieldKind(kind: string): EnvironmentalFieldKind {
  if (kind === "wind_corridor") return "wind_corridor";
  if (kind === "river_stage" || kind === "river_level") return "river_level";
  if (kind === "hydric_risk") return "hydric_risk";
  if (kind === "fire_spread" || kind === "thermal_activity") return "fire_spread";
  return "rainfall_accumulation";
}

function mapConfidence(value: unknown): DataConfidence {
  if (value === "observed" || value === "modeled" || value === "mixed") return value;
  return "mixed";
}

function mapTrend(value: unknown): EnvironmentalTrend {
  if (value === "rising" || value === "falling" || value === "stable") return value;
  return "stable";
}

function severityScore(severity: Severity): number {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function deriveVisualState(severity: Severity) {
  if (severity === "CRITICAL") {
    return { size: "dominant", glow: "high", pulse: true, opacity: 1, cluster_priority: 10 } as const;
  }
  if (severity === "HIGH") {
    return { size: "prominent", glow: "medium", pulse: false, opacity: 0.9, cluster_priority: 8 } as const;
  }
  if (severity === "MEDIUM") {
    return { size: "prominent", glow: "low", pulse: false, opacity: 0.82, cluster_priority: 6 } as const;
  }
  return { size: "minimal", glow: "low", pulse: false, opacity: 0.72, cluster_priority: 4 } as const;
}

function deriveMotionVector(eventType: string, geometry: RawRecord, preview: EventPreview) {
  if (geometry.type === "LineString" && Array.isArray(geometry.coordinates) && geometry.coordinates.length >= 2) {
    const start = geometry.coordinates[0] as [number, number];
    const end = geometry.coordinates[geometry.coordinates.length - 1] as [number, number];
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    return {
      dx,
      dy,
      intensity: Math.min(1, Math.max(Math.abs(dx), Math.abs(dy)) * 3.5),
      direction_label: preview.direction_label ?? fallbackDirectionLabel(eventType)
    };
  }

  return {
    dx: eventType === "wind" ? 0.18 : 0.05,
    dy: eventType === "wildfire" ? -0.06 : 0.08,
    intensity: eventType === "wildfire" ? 0.84 : 0.64,
    direction_label: preview.direction_label ?? fallbackDirectionLabel(eventType)
  };
}

function fallbackDirectionLabel(eventType: string): string {
  if (eventType === "wildfire") return "Actividad termica observada";
  if (eventType === "wind") return "Flujo de viento visible";
  if (eventType === "rainfall") return "Lluvia alimentando escorrentia";
  if (eventType === "river_risk") return "Cauce en ascenso";
  return "Agua hacia zonas bajas";
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function transformMetric(raw: RawRecord): EventMetric {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    label: String(raw.label ?? "Dato"),
    value: String(raw.value ?? "n/d"),
    unit: typeof raw.unit === "string" ? raw.unit : undefined,
    trend: mapTrend(raw.trend),
    emphasis: raw.emphasis === "primary" ? "primary" : "secondary"
  };
}

function transformPreview(raw: RawRecord, kind: NaturalEventKind): EventPreview {
  const severity = String(raw.severity ?? "LOW") as Severity;
  const primaryMetricRaw = (raw.primary_metric as RawRecord | undefined) ?? {};

  return {
    event_id: String(raw.event_id ?? ""),
    kind,
    severity,
    status: String(raw.status ?? "new") as "new" | "acknowledged" | "resolved",
    kicker: String(raw.kicker ?? "Ultimas 6h"),
    title: String(raw.title ?? ""),
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : undefined,
    summary: String(raw.summary ?? ""),
    location_name: String(raw.location_name ?? ""),
    region: String(raw.region ?? ""),
    updated_at: String(raw.updated_at ?? raw.observed_at ?? new Date().toISOString()),
    primary_metric: {
      label: String(primaryMetricRaw.label ?? "Clave"),
      value: String(primaryMetricRaw.value ?? "n/d"),
      tone:
        primaryMetricRaw.tone === "critical" || primaryMetricRaw.tone === "warning" || primaryMetricRaw.tone === "info"
          ? primaryMetricRaw.tone
          : undefined
    },
    chips: asStringArray(raw.chips),
    direction_label:
      typeof raw.direction === "string"
        ? raw.direction
        : typeof raw.direction_label === "string"
          ? raw.direction_label
          : undefined
  };
}

function transformEvent(raw: RawRecord): NaturalEventEntity {
  const eventType = String(raw.event_type ?? "flood_risk");
  const kind = mapEventKind(eventType);
  const centroid = raw.centroid as { lat: number; lng: number };
  const preview = transformPreview((raw.preview as RawRecord | undefined) ?? {}, kind);
  const severity = String(raw.severity ?? "LOW") as Severity;

  return {
    id: String(raw.id ?? ""),
    kind,
    type: eventType,
    severity,
    status: String(raw.status ?? "new") as "new" | "acknowledged" | "resolved",
    title: String(raw.title ?? ""),
    short_message: String(raw.short_message ?? raw.summary ?? ""),
    long_message: String(raw.long_message ?? raw.description ?? raw.summary ?? ""),
    narrative_label: String(raw.narrative_label ?? raw.title ?? ""),
    location_name: String(raw.location_name ?? ""),
    region: String(raw.region ?? ""),
    geometry: raw.geometry as NaturalEventEntity["geometry"],
    centroid,
    created_at: String(raw.observed_at ?? raw.updated_at ?? new Date().toISOString()),
    started_at: String(raw.started_at ?? raw.observed_at ?? new Date().toISOString()),
    updated_at: String(raw.updated_at ?? raw.observed_at ?? new Date().toISOString()),
    sources: asStringArray(raw.sources),
    confidence: mapConfidence(raw.confidence),
    recommended_actions: asStringArray(raw.recommended_actions),
    impact_summary: (raw.impact_summary as NaturalEventEntity["impact_summary"]) ?? {
      population: "Sin dato",
      infrastructure: "Sin dato",
      routes: "Sin dato"
    },
    factors: asStringArray(raw.factors),
    metrics: Array.isArray(raw.metrics) ? raw.metrics.map((item) => transformMetric(item as RawRecord)) : [],
    linked_field_ids:
      Array.isArray(raw.linked_field_ids) && raw.linked_field_ids.length > 0
        ? asStringArray(raw.linked_field_ids)
        : asStringArray(raw.related_field_ids),
    preview,
    motion_vector: deriveMotionVector(eventType, raw.geometry as RawRecord, preview),
    visual_state: deriveVisualState(severity),
    narrative_summary: String(raw.narrative_summary ?? raw.summary ?? ""),
    before_after_assets: (raw.before_after_assets as { before: string; after: string }) ?? {
      before: "Ventana -24h",
      after: "Observacion actual"
    }
  };
}

function transformField(raw: RawRecord): EnvironmentalField {
  return {
    id: String(raw.id ?? ""),
    kind: mapFieldKind(String(raw.kind ?? "")),
    severity: String(raw.severity ?? "LOW") as Severity,
    label: String(raw.label ?? raw.title ?? ""),
    layer_id: String(raw.layer_id ?? ""),
    geometry: raw.geometry as EnvironmentalField["geometry"],
    centroid: raw.centroid as EnvironmentalField["centroid"],
    observed_at: String(raw.observed_at ?? new Date().toISOString()),
    trend: mapTrend(raw.trend),
    unit: String(raw.unit ?? ""),
    value_range: (raw.value_range as EnvironmentalField["value_range"]) ?? { min: 0, max: 1, focus: 0 },
    summary: String(raw.summary ?? ""),
    sources: asStringArray(raw.sources),
    confidence: mapConfidence(raw.confidence),
    related_event_ids: asStringArray(raw.related_event_ids),
    legend: Array.isArray(raw.legend) ? (raw.legend as EnvironmentalField["legend"]) : []
  };
}

function transformScene(raw: RawRecord): NarrativeScene {
  return {
    id: String(raw.id ?? ""),
    title: String(raw.title ?? ""),
    synopsis: String(raw.synopsis ?? raw.summary ?? ""),
    timestamp: String(raw.timestamp ?? new Date().toISOString()),
    available_layers: asStringArray(raw.available_layers),
    freshness: String(raw.freshness ?? "live"),
    comparison_supported: Boolean(raw.comparison_supported),
    conditions_summary: Array.isArray(raw.conditions_summary)
      ? (raw.conditions_summary as NarrativeScene["conditions_summary"])
      : [],
    tone: (raw.tone as NarrativeTone) ?? "monitoring",
    focus_region: String(raw.focus_region ?? ""),
    focus_event_ids: asStringArray(raw.focus_event_ids),
    environmental_field_ids:
      Array.isArray(raw.environmental_field_ids) && raw.environmental_field_ids.length > 0
        ? asStringArray(raw.environmental_field_ids)
        : asStringArray(raw.field_ids),
    events: Array.isArray(raw.events) ? raw.events.map((item) => transformEvent(item as RawRecord)) : [],
    fields: Array.isArray(raw.fields) ? raw.fields.map((item) => transformField(item as RawRecord)) : [],
    event_previews: Array.isArray(raw.event_previews)
      ? raw.event_previews.map((item) =>
          transformPreview(item as RawRecord, mapEventKind(String((item as RawRecord).event_type ?? "flood_risk")))
        )
      : [],
    camera: raw.camera as NarrativeScene["camera"],
    headlines: Array.isArray(raw.headlines) ? (raw.headlines as string[]) : [],
    narrative_summary: typeof raw.narrative_summary === "string" ? raw.narrative_summary : undefined
  };
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`API request failed for ${path}: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function fetchOperationalDataset(): Promise<OperationalDataset> {
  const [status, layers, rawScenes] = await Promise.all([
    fetchJson<OperationalStatus>("/status"),
    fetchJson<LayerDefinition[]>("/layers"),
    fetchJson<RawRecord[]>("/narrative/scenes"),
  ]);

  const narrativeScenes = rawScenes.map((scene) => transformScene(scene));
  const eventMap = new Map<string, NaturalEventEntity>();

  for (const scene of narrativeScenes) {
    for (const event of scene.events) {
      eventMap.set(event.id, event);
    }
  }

  const narrativeEvents = Array.from(eventMap.values()).sort(
    (left, right) => severityScore(right.severity) - severityScore(left.severity)
  );

  return {
    status,
    layers,
    narrativeEvents,
    narrativeScenes
  };
}

export async function fetchIncidentEvent(incidentId: string): Promise<NaturalEventEntity | null> {
  try {
    const raw = await fetchJson<RawRecord>(`/narrative/events/${incidentId}`);
    return transformEvent(raw);
  } catch {
    return null;
  }
}

export async function fetchAlertsFeed(): Promise<Alert[]> {
  const alerts = await fetchJson<Alert[]>("/alerts");
  return alerts;
}
