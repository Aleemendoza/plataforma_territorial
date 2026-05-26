import type {
  Alert,
  EnvironmentalField,
  EventPreview,
  LayerDefinition,
  NaturalEventEntity,
  NarrativeScene,
  OperationalDataset,
  OperationalStatus
} from "@/types/operational";

const NOW = "2026-05-26T14:30:00.000Z";

const status: OperationalStatus = {
  province_state: "ATENCION",
  active_alert_count: 3,
  wildfire_count: 1,
  hydric_risk_level: "HIGH",
  last_updated_at: NOW,
  connectivity_state: "live",
  headline: "Demo operativa lista para mostrar riesgo hidrico, focos termicos y vigilancia preventiva."
};

const layers: LayerDefinition[] = [
  {
    id: "flood-risk",
    group: "Riesgo",
    label: "Riesgo hidrico",
    technical_name: "hydric-risk",
    visible_by_default: true,
    available_time_ranges: ["24h", "72h"],
    legend: [{ label: "critico", color: "#27B3FF" }]
  },
  {
    id: "ndwi",
    group: "Ambiente",
    label: "Agua superficial",
    technical_name: "ndwi",
    visible_by_default: true,
    available_time_ranges: ["72h", "30d"],
    legend: [{ label: "alto", color: "#38BDF8" }]
  },
  {
    id: "firms",
    group: "Ambiente",
    label: "Focos termicos",
    technical_name: "firms",
    visible_by_default: true,
    available_time_ranges: ["24h", "7d"],
    legend: [{ label: "activo", color: "#F04452" }]
  },
  {
    id: "wind-corridors",
    group: "Ambiente",
    label: "Viento",
    technical_name: "wind-corridors",
    visible_by_default: true,
    available_time_ranges: ["live", "24h"],
    legend: [{ label: "direccion dominante", color: "#F59E0B" }]
  },
  {
    id: "routes",
    group: "Infraestructura",
    label: "Rutas sensibles",
    technical_name: "critical-routes",
    visible_by_default: true,
    available_time_ranges: ["live"],
    legend: [{ label: "seguimiento", color: "#F59E0B" }]
  }
];

const floodPreview: EventPreview = {
  event_id: "event-flood-yala-20260526",
  kind: "hydric_risk",
  severity: "CRITICAL",
  status: "new",
  kicker: "Ultimas 6h",
  title: "Crecida rapida en Yala",
  subtitle: "Escorrentia sostenida en cuenca norte",
  summary: "El rio gana altura y compromete accesos secundarios.",
  location_name: "Yala",
  region: "Cuenca norte",
  updated_at: NOW,
  primary_metric: {
    label: "Rio",
    value: "3.8 m",
    tone: "critical"
  },
  chips: ["lluvia intensa", "suelo saturado", "ruta en vigilancia"],
  direction_label: "Cauce en ascenso"
};

const wildfirePreview: EventPreview = {
  event_id: "event-wildfire-yungas-20260526",
  kind: "wildfire",
  severity: "HIGH",
  status: "new",
  kicker: "Ultimas 12h",
  title: "Persistencia termica en Yungas",
  subtitle: "Cluster FIRMS con continuidad espacial",
  summary: "Focos acotados, pero con vegetacion continua y viento moderado.",
  location_name: "Yungas sur",
  region: "Valle montano",
  updated_at: NOW,
  primary_metric: {
    label: "Focos",
    value: "7",
    tone: "warning"
  },
  chips: ["baja humedad", "viento NE", "prealerta brigadas"],
  direction_label: "Actividad termica persistente"
};

const landslidePreview: EventPreview = {
  event_id: "event-landslide-volcan-20260526",
  kind: "rainfall",
  severity: "MEDIUM",
  status: "new",
  kicker: "Ultimas 24h",
  title: "Laderas sensibles en Volcan",
  subtitle: "Monitoreo preventivo sobre taludes",
  summary: "La humedad de ladera se mantiene por encima del umbral esperado.",
  location_name: "Volcan",
  region: "Quebrada",
  updated_at: NOW,
  primary_metric: {
    label: "Humedad",
    value: "0.71",
    tone: "info"
  },
  chips: ["taludes", "banquinas", "lluvia acumulada"],
  direction_label: "Presion hidrica en ladera"
};

const events: NaturalEventEntity[] = [
  {
    id: floodPreview.event_id,
    kind: floodPreview.kind,
    type: "river_risk",
    severity: floodPreview.severity,
    status: floodPreview.status,
    title: floodPreview.title,
    short_message: "Escorrentia intensa con riesgo de corte preventivo.",
    long_message:
      "La combinacion de lluvia acumulada, cauce en ascenso y saturacion del suelo eleva la prioridad operativa en Yala.",
    narrative_label: "Frente hidrico principal",
    location_name: floodPreview.location_name,
    region: "Yala",
    geometry: {
      type: "Point",
      coordinates: [-65.48, -24.11]
    },
    centroid: { lat: -24.11, lng: -65.48 },
    created_at: NOW,
    started_at: "2026-05-26T10:15:00.000Z",
    updated_at: NOW,
    sources: ["red-hidrometrica", "estimacion satelital"],
    confidence: "observed",
    recommended_actions: ["Activar monitoreo local", "Verificar rutas secundarias", "Preparar aviso preventivo"],
    impact_summary: {
      population: "3.2k personas expuestas",
      infrastructure: "2 escuelas y 1 centro de salud cercanos",
      routes: "Ruta provincial 4 en vigilancia"
    },
    factors: ["lluvia intensa", "saturacion del suelo", "pendiente critica"],
    metrics: [
      { id: "river-stage", label: "Nivel del rio", value: "3.8", unit: "m", trend: "rising", emphasis: "primary" },
      { id: "rainfall-24h", label: "Lluvia 24h", value: "148", unit: "mm", trend: "rising", emphasis: "secondary" }
    ],
    linked_field_ids: ["field-river-yala-stage", "field-rain-yala-anomaly"],
    preview: floodPreview,
    motion_vector: { dx: 0.04, dy: 0.06, intensity: 0.88, direction_label: "Cauce en ascenso" },
    visual_state: { size: "dominant", glow: "high", pulse: true, opacity: 1, cluster_priority: 10 },
    narrative_summary: "El agua ocupa espacio operativo y concentra la prioridad provincial en Yala.",
    before_after_assets: { before: "Escena -48h", after: "Observacion actual" }
  },
  {
    id: wildfirePreview.event_id,
    kind: wildfirePreview.kind,
    type: "wildfire",
    severity: wildfirePreview.severity,
    status: wildfirePreview.status,
    title: wildfirePreview.title,
    short_message: "Foco termico activo con continuidad espacial.",
    long_message: "Las detecciones FIRMS se mantienen sobre la misma area y justifican seguimiento operativo.",
    narrative_label: "Frente termico persistente",
    location_name: wildfirePreview.location_name,
    region: "Yungas",
    geometry: {
      type: "Point",
      coordinates: [-64.85, -24.27]
    },
    centroid: { lat: -24.27, lng: -64.85 },
    created_at: NOW,
    started_at: "2026-05-26T08:10:00.000Z",
    updated_at: NOW,
    sources: ["firms", "sentinel-2"],
    confidence: "observed",
    recommended_actions: ["Cruzar con brigadas disponibles", "Revisar direccion del viento"],
    impact_summary: {
      population: "Baja exposicion poblacional",
      infrastructure: "Area boscosa con senderos y tendido menor",
      routes: "Acceso rural en vigilancia"
    },
    factors: ["anomalia termica", "humedad baja", "vegetacion continua"],
    metrics: [
      { id: "thermal-hotspots", label: "Detecciones", value: "7", unit: "hotspots", trend: "rising", emphasis: "primary" },
      { id: "wind-speed", label: "Viento", value: "18", unit: "km/h", trend: "stable", emphasis: "secondary" }
    ],
    linked_field_ids: ["field-thermal-yungas-cluster", "field-wind-yungas-corridor"],
    preview: wildfirePreview,
    motion_vector: { dx: 0.18, dy: 0.02, intensity: 0.72, direction_label: "Actividad termica persistente" },
    visual_state: { size: "prominent", glow: "medium", pulse: false, opacity: 0.9, cluster_priority: 8 },
    narrative_summary: "El foco sigue acotado, pero la persistencia y el viento justifican prealerta.",
    before_after_assets: { before: "Escena -24h", after: "Observacion actual" }
  },
  {
    id: landslidePreview.event_id,
    kind: landslidePreview.kind,
    type: "rainfall",
    severity: landslidePreview.severity,
    status: landslidePreview.status,
    title: landslidePreview.title,
    short_message: "Taludes con humedad sostenida y drenajes sensibles.",
    long_message: "No hay incidente consumado, pero el patron preventivo exige mantener observacion sobre laderas y banquinas.",
    narrative_label: "Vigilancia preventiva de ladera",
    location_name: landslidePreview.location_name,
    region: "Volcan",
    geometry: {
      type: "Point",
      coordinates: [-65.38, -23.9]
    },
    centroid: { lat: -23.9, lng: -65.38 },
    created_at: NOW,
    started_at: "2026-05-25T22:00:00.000Z",
    updated_at: NOW,
    sources: ["smap-l3", "gpm-imerg"],
    confidence: "mixed",
    recommended_actions: ["Monitorear banquinas", "Revisar drenajes laterales"],
    impact_summary: {
      population: "Afectacion puntual en corredores viales",
      infrastructure: "Taludes y banquinas sensibles",
      routes: "Ruta 9 bajo observacion"
    },
    factors: ["humedad superficial", "lluvia acumulada", "pendientes"],
    metrics: [
      { id: "soil-moisture", label: "Humedad", value: "0.71", trend: "rising", emphasis: "primary" },
      { id: "rainfall-volcan", label: "Lluvia 24h", value: "82", unit: "mm", trend: "stable", emphasis: "secondary" }
    ],
    linked_field_ids: ["field-soil-volcan-moisture", "field-rain-volcan-vector"],
    preview: landslidePreview,
    motion_vector: { dx: 0.02, dy: 0.05, intensity: 0.58, direction_label: "Presion hidrica en ladera" },
    visual_state: { size: "prominent", glow: "low", pulse: false, opacity: 0.82, cluster_priority: 6 },
    narrative_summary: "Volcan sigue en modo preventivo: la amenaza no materializo, pero el umbral esta cerca.",
    before_after_assets: { before: "Escena -24h", after: "Escena actual" }
  }
];

const fields: EnvironmentalField[] = [
  {
    id: "field-river-yala-stage",
    kind: "river_level",
    severity: "CRITICAL",
    label: "Rio Yala",
    layer_id: "flood-risk",
    geometry: {
      type: "LineString",
      coordinates: [
        [-65.53, -24.09],
        [-65.48, -24.11],
        [-65.42, -24.14]
      ]
    },
    centroid: { lat: -24.11, lng: -65.48 },
    observed_at: NOW,
    trend: "rising",
    unit: "m",
    value_range: { min: 2.1, max: 4.3, focus: 3.8 },
    summary: "El nivel del rio supera la banda de vigilancia y acelera en las ultimas horas.",
    sources: ["red-hidrometrica", "hidrologia-provincial"],
    confidence: "observed",
    related_event_ids: [floodPreview.event_id],
    legend: [{ label: "critico", color: "#27B3FF" }]
  },
  {
    id: "field-rain-yala-anomaly",
    kind: "rainfall_accumulation",
    severity: "HIGH",
    label: "Lluvia acumulada Yala",
    layer_id: "ndwi",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-65.57, -24.18],
        [-65.39, -24.18],
        [-65.39, -24.02],
        [-65.57, -24.02],
        [-65.57, -24.18]
      ]]
    },
    centroid: { lat: -24.11, lng: -65.48 },
    observed_at: NOW,
    trend: "rising",
    unit: "mm",
    value_range: { min: 68, max: 160, focus: 148 },
    summary: "La lluvia de 24 horas se mantiene sobre el percentil operativo esperado.",
    sources: ["chirps-daily", "gpm-imerg"],
    confidence: "mixed",
    related_event_ids: [floodPreview.event_id],
    legend: [{ label: "alto", color: "#38BDF8" }]
  },
  {
    id: "field-thermal-yungas-cluster",
    kind: "fire_spread",
    severity: "HIGH",
    label: "Cluster termico Yungas",
    layer_id: "firms",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-64.93, -24.33],
        [-64.76, -24.33],
        [-64.76, -24.21],
        [-64.93, -24.21],
        [-64.93, -24.33]
      ]]
    },
    centroid: { lat: -24.27, lng: -64.85 },
    observed_at: NOW,
    trend: "rising",
    unit: "detections",
    value_range: { min: 1, max: 8, focus: 7 },
    summary: "Persisten detecciones termicas con continuidad espacial y baja humedad relativa.",
    sources: ["firms", "sentinel-2-thermal"],
    confidence: "observed",
    related_event_ids: [wildfirePreview.event_id],
    legend: [{ label: "activo", color: "#F04452" }]
  },
  {
    id: "field-wind-yungas-corridor",
    kind: "wind_corridor",
    severity: "MEDIUM",
    label: "Viento dominante",
    layer_id: "wind-corridors",
    geometry: {
      type: "LineString",
      coordinates: [
        [-64.95, -24.3],
        [-64.78, -24.22]
      ]
    },
    centroid: { lat: -24.26, lng: -64.86 },
    observed_at: NOW,
    trend: "stable",
    unit: "km/h",
    value_range: { min: 8, max: 25, focus: 18 },
    summary: "El flujo de viento mantiene direccion consistente sobre el corredor termico.",
    sources: ["modelo-meteorologico"],
    confidence: "modeled",
    related_event_ids: [wildfirePreview.event_id],
    legend: [{ label: "moderado", color: "#F59E0B" }]
  },
  {
    id: "field-soil-volcan-moisture",
    kind: "hydric_risk",
    severity: "MEDIUM",
    label: "Humedad de ladera",
    layer_id: "flood-risk",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [-65.46, -23.96],
        [-65.3, -23.96],
        [-65.3, -23.84],
        [-65.46, -23.84],
        [-65.46, -23.96]
      ]]
    },
    centroid: { lat: -23.9, lng: -65.38 },
    observed_at: NOW,
    trend: "rising",
    unit: "fraction",
    value_range: { min: 0.32, max: 0.79, focus: 0.71 },
    summary: "La humedad superficial sobre abanicos aluviales se mantiene sobre la banda de vigilancia.",
    sources: ["smap-l3"],
    confidence: "mixed",
    related_event_ids: [landslidePreview.event_id],
    legend: [{ label: "vigilancia", color: "#60A5FA" }]
  },
  {
    id: "field-rain-volcan-vector",
    kind: "rainfall_accumulation",
    severity: "MEDIUM",
    label: "Escorrentia de ladera",
    layer_id: "ndwi",
    geometry: {
      type: "LineString",
      coordinates: [
        [-65.44, -23.94],
        [-65.34, -23.86]
      ]
    },
    centroid: { lat: -23.9, lng: -65.39 },
    observed_at: NOW,
    trend: "stable",
    unit: "mm",
    value_range: { min: 30, max: 100, focus: 82 },
    summary: "La pendiente sigue descargando agua sobre banquinas y drenajes sensibles.",
    sources: ["gpm-imerg"],
    confidence: "mixed",
    related_event_ids: [landslidePreview.event_id],
    legend: [{ label: "moderado", color: "#60A5FA" }]
  }
];

const scenes: NarrativeScene[] = [
  {
    id: "scene-yala-overview-live",
    title: "Panoramica hidrica de Yala",
    synopsis: "Escena live para seguir escorrentia, lluvia acumulada y accesos comprometidos.",
    timestamp: NOW,
    available_layers: ["ndwi", "flood-risk", "routes"],
    freshness: "live",
    comparison_supported: true,
    conditions_summary: [
      { label: "Lluvia", value: "148 mm / 24h" },
      { label: "Rio", value: "3.8 m y subiendo" },
      { label: "Rutas", value: "2 accesos sensibles" },
      { label: "Confianza", value: "observada" }
    ],
    tone: "critical",
    focus_region: "Yala",
    focus_event_ids: [floodPreview.event_id],
    environmental_field_ids: ["field-river-yala-stage", "field-rain-yala-anomaly"],
    events: [events[0]],
    fields: [fields[0], fields[1]],
    event_previews: [floodPreview],
    camera: { center: [-65.48, -24.11], zoom: 11.2, pitch: 42, bearing: 14 },
    headlines: ["Cauce en ascenso", "Escorrentia sostenida", "Aviso preventivo"],
    narrative_summary:
      "La escena muestra como el agua ocupa espacio operativo: el rio gana altura y la lluvia sigue cargando la cuenca."
  },
  {
    id: "scene-yungas-thermal-response",
    title: "Seguimiento de focos en Yungas sur",
    synopsis: "Cruza persistencia FIRMS con cobertura vegetal continua y accesos rurales.",
    timestamp: NOW,
    available_layers: ["firms", "wind-corridors", "routes"],
    freshness: "live",
    comparison_supported: true,
    conditions_summary: [
      { label: "Focos", value: "7 detecciones" },
      { label: "Viento", value: "18 km/h NE" },
      { label: "Humedad", value: "baja" },
      { label: "Accesos", value: "rurales vigilados" }
    ],
    tone: "escalation",
    focus_region: "Yungas",
    focus_event_ids: [wildfirePreview.event_id],
    environmental_field_ids: ["field-thermal-yungas-cluster", "field-wind-yungas-corridor"],
    events: [events[1]],
    fields: [fields[2], fields[3]],
    event_previews: [wildfirePreview],
    camera: { center: [-64.85, -24.27], zoom: 10.6, pitch: 38, bearing: -18 },
    headlines: ["Persistencia termica", "Cobertura continua", "Brigadas en prealerta"],
    narrative_summary:
      "La narrativa de fuego se sostiene por continuidad: pocos focos, misma zona y viento moderado."
  },
  {
    id: "scene-volcan-slope-watch",
    title: "Laderas inestables en Volcan",
    synopsis: "Monitorea humedad superficial y lluvia sobre pendientes con infraestructura lineal expuesta.",
    timestamp: "2026-05-25T18:00:00.000Z",
    available_layers: ["flood-risk", "routes"],
    freshness: "reciente",
    comparison_supported: true,
    conditions_summary: [
      { label: "Humedad", value: "0.71" },
      { label: "Lluvia", value: "82 mm / 24h" },
      { label: "Taludes", value: "sensibles" },
      { label: "Confianza", value: "mixta" }
    ],
    tone: "monitoring",
    focus_region: "Volcan",
    focus_event_ids: [landslidePreview.event_id],
    environmental_field_ids: ["field-soil-volcan-moisture", "field-rain-volcan-vector"],
    events: [events[2]],
    fields: [fields[4], fields[5]],
    event_previews: [landslidePreview],
    camera: { center: [-65.38, -23.9], zoom: 11, pitch: 32, bearing: 8 },
    headlines: ["Vigilancia preventiva", "Banquinas expuestas", "Drenajes en revision"],
    narrative_summary:
      "El relato territorial en Volcan no es de impacto ya materializado, sino de umbral cercano."
  },
  {
    id: "scene-provincial-priority-board",
    title: "Tablero provincial de prioridades",
    synopsis: "Agrupa eventos activos para coordinacion operativa y lectura territorial comun.",
    timestamp: NOW,
    available_layers: ["ndwi", "flood-risk", "firms", "wind-corridors", "routes"],
    freshness: "live",
    comparison_supported: true,
    conditions_summary: [
      { label: "Eventos", value: "3 activos" },
      { label: "Campos", value: "6 seguidos" },
      { label: "Live", value: "3 escenas" },
      { label: "Cobertura", value: "provincial" }
    ],
    tone: "escalation",
    focus_region: "Jujuy",
    focus_event_ids: events.map((event) => event.id),
    environmental_field_ids: fields.map((field) => field.id),
    events,
    fields,
    event_previews: [floodPreview, wildfirePreview, landslidePreview],
    camera: { center: [-65.3, -24.13], zoom: 8.2, pitch: 26, bearing: 0 },
    headlines: ["Priorizacion provincial", "Coordinacion multi-riesgo", "Narrativa unificada"],
    narrative_summary:
      "La provincia se ordena en tres relatos operativos simultaneos: agua en Yala, fuego en Yungas y vigilancia preventiva en Volcan."
  }
];

export const demoOperationalDataset: OperationalDataset = {
  status,
  layers,
  narrativeEvents: events,
  narrativeScenes: scenes
};

export const demoAlerts: Alert[] = events.map((event) => ({
  id: event.id,
  type: event.type,
  severity: event.severity,
  title: event.title,
  short_message: event.short_message,
  long_message: event.long_message,
  location_name: event.location_name,
  geometry: {
    type: "Point",
    coordinates: event.geometry.type === "Point" ? event.geometry.coordinates : [event.centroid.lng, event.centroid.lat]
  },
  centroid: event.centroid,
  created_at: event.created_at,
  status: event.status,
  recommended_actions: event.recommended_actions,
  impact_summary: event.impact_summary,
  factors: event.factors,
  region: event.region
}));

export function getDemoIncidentEvent(incidentId: string): NaturalEventEntity | null {
  return demoOperationalDataset.narrativeEvents.find((event) => event.id === incidentId) ?? null;
}
