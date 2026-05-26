"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Feature, Polygon } from "geojson";
import type { Layer } from "@deck.gl/core";
import maplibregl, { type LngLatLike, type Map as MapLibreMap, type StyleSpecification } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { LineLayer, PathLayer, PolygonLayer, ScatterplotLayer, TextLayer } from "@deck.gl/layers";
import { layers as buildBasemapLayers, namedFlavor } from "@protomaps/basemaps";
import { Protocol } from "pmtiles";
import { NarrativeEventPreview } from "@/components/ops/narrative-event-preview";
import { LoadingShimmerMap } from "@/components/ops/loading-shimmer-map";
import { cn } from "@/lib/utils";
import type { EnvironmentalField, NarrativeScene, NaturalEventEntity } from "@/types/operational";

const INITIAL_CENTER: LngLatLike = [-65.3, -24.2];
const PMTILES_URL = process.env.NEXT_PUBLIC_PROTOMAPS_PM_TILES_URL;
const TERRAIN_PMTILES_URL = process.env.NEXT_PUBLIC_PROTOMAPS_TERRAIN_PM_TILES_URL;
let protocolRegistered = false;
const JUJUY_OUTLINE: Feature<Polygon> = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [[
      [-66.22, -24.65],
      [-65.82, -24.58],
      [-65.25, -24.47],
      [-64.91, -24.22],
      [-64.71, -23.86],
      [-64.63, -23.44],
      [-64.77, -22.95],
      [-65.18, -22.16],
      [-65.73, -22.04],
      [-66.08, -22.24],
      [-66.21, -22.71],
      [-66.25, -23.38],
      [-66.22, -24.65]
    ]]
  },
  properties: {
    name: "Jujuy"
  }
};
const JUJUY_RELIEF_PATHS: [number, number][][] = [
  [
    [-66.03, -24.44],
    [-65.82, -24.18],
    [-65.61, -23.92],
    [-65.33, -23.58],
    [-65.08, -23.24]
  ],
  [
    [-65.98, -23.96],
    [-65.71, -23.74],
    [-65.42, -23.48],
    [-65.19, -23.16],
    [-64.98, -22.84]
  ],
  [
    [-65.92, -23.28],
    [-65.58, -23.03],
    [-65.24, -22.74],
    [-64.95, -22.46]
  ]
];
const JUJUY_RIVER_REFERENCE_PATHS: [number, number][][] = [
  [
    [-65.82, -23.85],
    [-65.61, -23.73],
    [-65.34, -23.59],
    [-65.07, -23.38],
    [-64.83, -23.12]
  ],
  [
    [-65.66, -24.28],
    [-65.45, -24.07],
    [-65.27, -23.84],
    [-65.12, -23.56],
    [-64.96, -23.28]
  ]
];
const REFERENCE_LABELS = [
  { label: "Jujuy", position: [-65.3, -23.95] as [number, number], size: 22, color: [232, 242, 255, 220] as [number, number, number, number] },
  { label: "Yala", position: [-65.48, -24.11] as [number, number], size: 14, color: [160, 230, 255, 210] as [number, number, number, number] },
  { label: "Yungas", position: [-64.86, -24.26] as [number, number], size: 14, color: [255, 197, 143, 210] as [number, number, number, number] },
  { label: "Volcan", position: [-65.38, -23.9] as [number, number], size: 14, color: [191, 219, 254, 210] as [number, number, number, number] }
];
const GRID_PATHS: [number, number][][] = [
  [[-66.2, -24.5], [-64.6, -24.5]],
  [[-66.2, -24.0], [-64.6, -24.0]],
  [[-66.2, -23.5], [-64.6, -23.5]],
  [[-65.9, -24.7], [-65.9, -22.8]],
  [[-65.4, -24.7], [-65.4, -22.8]],
  [[-64.9, -24.7], [-64.9, -22.8]]
];

interface EventPoint {
  id: string;
  position: [number, number];
  severity: number;
  kind: string;
}

interface VectorPoint {
  source: [number, number];
  target: [number, number];
  intensity: number;
}

interface RiverPath {
  path: [number, number][];
  severity: number;
}

interface FieldPolygon {
  polygon: [number, number][];
  severity: number;
}

interface LabelPoint {
  label: string;
  position: [number, number];
  size: number;
  color: [number, number, number, number];
}

interface ReferencePath {
  path: [number, number][];
}

interface ProjectedMarker {
  entity: NaturalEventEntity;
  x: number;
  y: number;
}

interface WindArrowPoint {
  position: [number, number];
  angle: number;
}

function severityValue(severity: string) {
  if (severity === "CRITICAL") return 4;
  if (severity === "HIGH") return 3;
  if (severity === "MEDIUM") return 2;
  return 1;
}

function asCoordinates(field: EnvironmentalField) {
  if (field.geometry.type === "LineString") return field.geometry.coordinates;
  if (field.geometry.type === "Polygon") return field.geometry.coordinates[0] ?? [];
  return [field.geometry.coordinates];
}

function eventPointsFromScene(scene: NarrativeScene): EventPoint[] {
  return scene.events.map((entity) => ({
    id: entity.id,
    position: [entity.centroid.lng, entity.centroid.lat],
    severity: severityValue(entity.severity),
    kind: entity.kind
  }));
}

function vectorsFromScene(scene: NarrativeScene): VectorPoint[] {
  return scene.fields
    .filter((field) => field.kind === "wind_corridor" || field.kind === "rainfall_accumulation")
    .map((field) => {
      const [start, end] = asCoordinates(field);
      if (!start || !end) {
        const c = field.centroid;
        return {
          source: [c.lng, c.lat] as [number, number],
          target: [c.lng + 0.1, c.lat] as [number, number],
          intensity: field.value_range.focus / Math.max(field.value_range.max, 1)
        };
      }

      return {
        source: start as [number, number],
        target: end as [number, number],
        intensity: field.value_range.focus / Math.max(field.value_range.max, 1)
      };
    });
}

function riversFromScene(scene: NarrativeScene): RiverPath[] {
  return scene.fields
    .filter((field) => field.kind === "river_level")
    .map((field) => ({
      path: asCoordinates(field) as [number, number][],
      severity: severityValue(field.severity)
    }));
}

function polygonsFromScene(scene: NarrativeScene, kinds: EnvironmentalField["kind"][]): FieldPolygon[] {
  return scene.fields.reduce<FieldPolygon[]>((items, field) => {
    if (!kinds.includes(field.kind) || field.geometry.type !== "Polygon") {
      return items;
    }

    const polygon = field.geometry.coordinates[0] ?? [];
    if (polygon.length === 0) {
      return items;
    }

    items.push({
      polygon,
      severity: severityValue(field.severity)
    });

    return items;
  }, []);
}

function markerEmoji(kind: string) {
  if (kind === "wildfire") return "🔥";
  if (kind === "hydric_risk" || kind === "river_surge") return "🌊";
  if (kind === "rainfall") return "🌧";
  if (kind === "wind") return "🌀";
  return "⬤";
}

function markerClasses(kind: string, severity: string) {
  const severityClass =
    severity === "CRITICAL"
      ? "shadow-[0_0_34px_rgba(240,68,82,0.55)] scale-110"
      : severity === "HIGH"
        ? "shadow-[0_0_24px_rgba(240,138,36,0.45)]"
        : "shadow-[0_0_16px_rgba(39,179,255,0.35)]";

  const typeClass =
    kind === "wildfire"
      ? "border-orange-300/25 bg-orange-400/18"
      : kind === "hydric_risk" || kind === "river_surge"
        ? "border-cyan-300/25 bg-cyan-400/18"
        : kind === "rainfall"
          ? "border-sky-300/20 bg-sky-400/12"
          : "border-slate-300/20 bg-slate-100/10";

  return `${severityClass} ${typeClass}`;
}

function angleFromVector(source: [number, number], target: [number, number]) {
  const radians = Math.atan2(target[1] - source[1], target[0] - source[0]);
  return (radians * 180) / Math.PI;
}

function createProtomapsStyle(): StyleSpecification | null {
  if (!PMTILES_URL) {
    return null;
  }

  const style: StyleSpecification = {
    version: 8,
    glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector",
        url: `pmtiles://${PMTILES_URL}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      },
      ...(TERRAIN_PMTILES_URL
        ? {
            terrain: {
              type: "raster-dem",
              url: `pmtiles://${TERRAIN_PMTILES_URL}`,
              encoding: "terrarium",
            }
          }
        : {})
    },
    layers: buildBasemapLayers("protomaps", namedFlavor("light"), { lang: "es" }),
  };

  return style;
}

function createFallbackRasterStyle(): StyleSpecification {
  return {
    version: 8,
    sources: {
      osm: {
        type: "raster",
        tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
        tileSize: 256,
        attribution: "© OpenStreetMap contributors"
      }
    },
    layers: [
      {
        id: "osm",
        type: "raster",
        source: "osm"
      }
    ]
  };
}

function createMapStyle(): StyleSpecification {
  return createProtomapsStyle() ?? createFallbackRasterStyle();
}

export function LiveMapStage({
  scene,
  selectedEventId,
  highlightedEventId,
  activeFieldIds,
  crisisMode,
  cinematicMode = false
}: {
  scene: NarrativeScene;
  selectedEventId: string | null;
  highlightedEventId: string | null;
  activeFieldIds: string[];
  crisisMode: boolean;
  cinematicMode?: boolean;
}) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [projectedMarkers, setProjectedMarkers] = useState<ProjectedMarker[]>([]);

  const points = useMemo(() => eventPointsFromScene(scene), [scene]);
  const vectors = useMemo(() => vectorsFromScene(scene), [scene]);
  const riverPaths = useMemo(() => riversFromScene(scene), [scene]);
  const wildfirePolygons = useMemo(() => polygonsFromScene(scene, ["fire_spread"]), [scene]);
  const hydricPolygons = useMemo(() => polygonsFromScene(scene, ["hydric_risk", "rainfall_accumulation"]), [scene]);
  const selectedEvent = scene.events.find((event) => event.id === selectedEventId) ?? null;
  const highlightedEvent = scene.events.find((event) => event.id === highlightedEventId) ?? null;
  const activeEvent = selectedEvent ?? highlightedEvent ?? scene.events[0] ?? null;
  const emphasizedEventId = selectedEvent?.id ?? highlightedEvent?.id ?? null;
  const reliefPaths = useMemo<ReferencePath[]>(
    () => JUJUY_RELIEF_PATHS.map((path) => ({ path })),
    []
  );
  const riverReferencePaths = useMemo<ReferencePath[]>(
    () => JUJUY_RIVER_REFERENCE_PATHS.map((path) => ({ path })),
    []
  );
  const gridPaths = useMemo<ReferencePath[]>(() => GRID_PATHS.map((path) => ({ path })), []);
  const labelPoints = useMemo<LabelPoint[]>(() => REFERENCE_LABELS, []);
  const windArrowPoints = useMemo<WindArrowPoint[]>(
    () =>
      vectors.map((vector) => ({
        position: vector.target,
        angle: angleFromVector(vector.source, vector.target)
      })),
    [vectors]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isReady) return;

    const syncMarkers = () => {
      setProjectedMarkers(
        scene.events.map((entity) => {
          const point = map.project([entity.centroid.lng, entity.centroid.lat]);
          return { entity, x: point.x, y: point.y };
        })
      );
    };

    syncMarkers();
    map.on("move", syncMarkers);
    map.on("zoom", syncMarkers);
    map.on("resize", syncMarkers);

    return () => {
      map.off("move", syncMarkers);
      map.off("zoom", syncMarkers);
      map.off("resize", syncMarkers);
    };
  }, [isReady, scene]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    if (!protocolRegistered) {
      const protocol = new Protocol();
      maplibregl.addProtocol("pmtiles", protocol.tile);
      protocolRegistered = true;
    }

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: createMapStyle(),
      center: INITIAL_CENTER,
      zoom: 8.1,
      attributionControl: false,
      pitch: 28,
      bearing: -8
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    map.on("load", () => {
      map.addSource("jujuy-outline", {
        type: "geojson",
        data: JUJUY_OUTLINE
      });
      map.addLayer({
        id: "jujuy-fill",
        type: "fill",
        source: "jujuy-outline",
        paint: {
          "fill-color": "#0f172a",
          "fill-opacity": 0.04
        }
      });
      map.addLayer({
        id: "jujuy-focus-glow",
        type: "line",
        source: "jujuy-outline",
        paint: {
          "line-color": "#38bdf8",
          "line-opacity": 0.1,
          "line-width": 12,
          "line-blur": 6
        }
      });
      map.addLayer({
        id: "jujuy-outline-line",
        type: "line",
        source: "jujuy-outline",
        paint: {
          "line-color": "#a5f3fc",
          "line-opacity": 0.95,
          "line-width": 3
        }
      });
      if (PMTILES_URL && TERRAIN_PMTILES_URL) {
        map.setTerrain({ source: "terrain", exaggeration: 1.12 });
      }
      overlayRef.current = new MapboxOverlay({ interleaved: true });
      map.addControl(overlayRef.current);
      setIsReady(true);
    });

    mapRef.current = map;
    return () => {
      overlayRef.current?.finalize();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const container = mapContainerRef.current;
    if (!map || !container) return;

    const resizeMap = () => {
      map.resize();
    };

    resizeMap();
    const animationFrame = window.requestAnimationFrame(resizeMap);
    const timeoutId = window.setTimeout(resizeMap, 250);
    const observer = new ResizeObserver(() => {
      resizeMap();
    });

    observer.observe(container);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [isReady]);

  useEffect(() => {
    if (!overlayRef.current) return;

    const deckLayers: Layer[] = [];
    const activeLayerSet = new Set(activeFieldIds);
    const showHydric = activeLayerSet.has("flood-risk") || activeLayerSet.has("ndwi") || activeLayerSet.has("flood_risk");
    const showWildfires = activeLayerSet.has("firms");
    const showWind = activeLayerSet.has("wind-corridors") || activeLayerSet.has("wind");

    deckLayers.push(
      new PolygonLayer({
        id: "jujuy-polygon-reference",
        data: [{ polygon: JUJUY_OUTLINE.geometry.coordinates[0] }],
        getPolygon: (d: { polygon: [number, number][] }) => d.polygon,
        stroked: false,
        filled: true,
        getFillColor: crisisMode ? [20, 28, 44, 120] : [15, 23, 42, 92]
      }),
      new PathLayer<ReferencePath>({
        id: "jujuy-grid-reference",
        data: gridPaths,
        getPath: (d) => d.path,
        getColor: [71, 85, 105, 58],
        widthMinPixels: 1,
        getWidth: 1
      }),
      new PathLayer<ReferencePath>({
        id: "jujuy-relief-reference",
        data: reliefPaths,
        getPath: (d) => d.path,
        getColor: [148, 163, 184, 118],
        widthMinPixels: 1,
        getWidth: 3
      }),
      new PathLayer<ReferencePath>({
        id: "jujuy-river-reference",
        data: riverReferencePaths,
        getPath: (d) => d.path,
        getColor: [56, 189, 248, 170],
        widthMinPixels: 2,
        getWidth: 4
      }),
      new ScatterplotLayer<LabelPoint>({
        id: "reference-nodes",
        data: labelPoints,
        getPosition: (d) => d.position,
        getRadius: 2500,
        radiusUnits: "meters",
        stroked: true,
        lineWidthMinPixels: 1,
        getLineColor: [255, 255, 255, 150],
        filled: true,
        getFillColor: [15, 23, 42, 210]
      }),
      new TextLayer<LabelPoint>({
        id: "reference-labels",
        data: labelPoints,
        getPosition: (d) => d.position,
        getText: (d) => d.label,
        getColor: (d) => d.color,
        getSize: (d) => d.size,
        getPixelOffset: [0, -18],
        getTextAnchor: "middle",
        getAlignmentBaseline: "bottom",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
        characterSet: "auto"
      })
    );

    if (showHydric && hydricPolygons.length > 0) {
      deckLayers.push(
        new PolygonLayer<FieldPolygon>({
          id: "hydric-polygons",
          data: hydricPolygons,
          getPolygon: (d) => d.polygon,
          stroked: true,
          filled: true,
          getLineColor: [56, 189, 248, 220],
          getFillColor: (d) => (d.severity >= 4 ? [39, 179, 255, 90] : [56, 189, 248, 60]),
          lineWidthMinPixels: 2
        })
      );
    }

    if (showWildfires && wildfirePolygons.length > 0) {
      deckLayers.push(
        new PolygonLayer<FieldPolygon>({
          id: "wildfire-polygons",
          data: wildfirePolygons,
          getPolygon: (d) => d.polygon,
          stroked: true,
          filled: true,
          getLineColor: [240, 68, 82, 230],
          getFillColor: (d) => (d.severity >= 3 ? [240, 68, 82, 88] : [249, 115, 22, 70]),
          lineWidthMinPixels: 2
        })
      );
      deckLayers.push(
        new ScatterplotLayer<EventPoint>({
          id: "wildfire-hotspots",
          data: points.filter((d) => d.kind === "wildfire"),
          getPosition: (d) => d.position,
          getRadius: 7000,
          radiusUnits: "meters",
          stroked: true,
          lineWidthMinPixels: 2,
          getLineColor: [255, 255, 255, 220],
          filled: true,
          opacity: 0.9,
          getFillColor: [240, 68, 82, 220]
        })
      );
    }

    if (showHydric) {
      deckLayers.push(
        new ScatterplotLayer<EventPoint>({
          id: "rain-cells",
          data: points.filter((d) => d.kind === "rainfall" || d.kind === "hydric_risk"),
          getPosition: (d) => d.position,
          getRadius: (d) => (d.kind === "hydric_risk" ? 10000 : 6500),
          radiusUnits: "meters",
          stroked: false,
          filled: true,
          opacity: 0.18,
          getFillColor: [39, 179, 255, 120]
        })
      );
    }

    if (showWind || showHydric) {
      deckLayers.push(
        new LineLayer<VectorPoint>({
          id: "wind-streams",
          data: vectors,
          getSourcePosition: (d) => d.source,
          getTargetPosition: (d) => d.target,
          getColor: (d) =>
            d.intensity > 0.8
              ? [240, 68, 82, 180]
              : d.intensity > 0.55
                ? [240, 138, 36, 170]
                : [148, 163, 184, 145],
          getWidth: (d) => (d.intensity > 0.8 ? 4 : d.intensity > 0.55 ? 3 : 2),
          widthUnits: "pixels"
        }),
        new TextLayer<WindArrowPoint>({
          id: "wind-arrows",
          data: windArrowPoints,
          getPosition: (d) => d.position,
          getText: () => "➜",
          getColor: [251, 191, 36, 220],
          getSize: 20,
          getAngle: (d) => d.angle,
          getTextAnchor: "middle",
          getAlignmentBaseline: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          characterSet: "auto"
        })
      );
    }

    if (showHydric) {
      deckLayers.push(
        new PathLayer<RiverPath>({
          id: "river-paths",
          data: riverPaths,
          getPath: (d) => d.path,
          getColor: (d) =>
            d.severity >= 4 ? [39, 179, 255, 255] : d.severity >= 3 ? [39, 179, 255, 220] : [59, 130, 246, 170],
          widthMinPixels: 4,
          getWidth: (d) => (d.severity >= 4 ? 10 : d.severity >= 3 ? 7 : 5)
        })
      );
    }

    overlayRef.current.setProps({ layers: deckLayers });
  }, [
    activeFieldIds,
    crisisMode,
    gridPaths,
    hydricPolygons,
    labelPoints,
    points,
    reliefPaths,
    riverPaths,
    riverReferencePaths,
    vectors,
    wildfirePolygons,
    windArrowPoints
  ]);

  useEffect(() => {
    if (!mapRef.current || !activeEvent) return;

    mapRef.current.easeTo({
      center: [activeEvent.centroid.lng, activeEvent.centroid.lat],
      zoom: selectedEvent ? 10.6 : 9.2,
      duration: 650
    });
  }, [activeEvent, selectedEvent]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.easeTo({
      center: scene.camera.center,
      zoom: scene.camera.zoom,
      pitch: scene.camera.pitch,
      bearing: scene.camera.bearing,
      duration: cinematicMode ? 2200 : 1200
    });
  }, [scene, cinematicMode]);

  return (
    <section
      className={cn(
        "relative h-full min-h-[640px] overflow-hidden rounded-[30px] border border-white/10 bg-slate-950 shadow-panel",
        crisisMode && "border-riskCritical/30 shadow-[0_0_0_1px_rgba(240,68,82,0.08),0_30px_90px_rgba(0,0,0,0.48)]",
        cinematicMode && "ring-1 ring-cyan-300/20"
      )}
    >
      {!isReady && <LoadingShimmerMap />}
      <div ref={mapContainerRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,13,0.02),rgba(6,8,13,0.08)_32%,rgba(6,8,13,0.18))]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(39,179,255,0.05),transparent_28%),radial-gradient(circle_at_50%_55%,rgba(56,189,248,0.03),transparent_52%)]" />

      <div className="absolute inset-0 z-[5]">
        {projectedMarkers.map(({ entity, x, y }) => {
          const isEmphasized = entity.id === emphasizedEventId;

          return (
            <div
              key={entity.id}
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: x, top: y }}
            >
              <div
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border text-2xl backdrop-blur-sm transition duration-300",
                  markerClasses(entity.kind, entity.severity),
                  entity.visual_state.pulse ? "animate-pulse" : "",
                  entity.kind === "wildfire"
                    ? "before:absolute before:h-14 before:w-14 before:rounded-full before:bg-orange-400/10 before:blur-xl"
                    : "",
                  isEmphasized ? "z-10 scale-125" : ""
                )}
              >
                <span className="relative">{markerEmoji(entity.kind)}</span>
              </div>
              {isEmphasized ? <NarrativeEventPreview eventType={entity.kind} preview={entity.preview} className="mt-3 w-48" /> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}
