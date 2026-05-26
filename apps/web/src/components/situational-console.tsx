"use client";

import { useMemo, useState } from "react";
import { Layers3, X } from "lucide-react";
import { AlertSlidePriority } from "@/components/ops/alert-slide-priority";
import { AlertStack } from "@/components/ops/alert-stack";
import { ContextDrawer } from "@/components/ops/context-drawer";
import { CriticalAlertModal } from "@/components/ops/critical-alert-modal";
import { LiveMapStage } from "@/components/ops/live-map-stage";
import { MobileActionDock } from "@/components/ops/mobile-action-dock";
import { OperationalSidebar } from "@/components/ops/operational-sidebar";
import { TimelineScrubber } from "@/components/ops/timeline-scrubber";
import { TopStatusBar } from "@/components/ops/top-status-bar";
import type { NaturalEventEntity, OperationalDataset, SheetPanel } from "@/types/operational";

function matchesFilters(event: NaturalEventEntity, activeFilters: string[]) {
  if (activeFilters.length === 0) return true;
  return activeFilters.some((filter) => {
    if (filter === "flood_risk") {
      return event.kind === "hydric_risk" || event.kind === "river_surge" || event.type.includes("river");
    }
    if (filter === "wildfire") {
      return event.kind === "wildfire" || event.type.includes("wildfire");
    }
    if (filter === "deforestation") {
      return event.type.includes("deforestation");
    }
    return event.type.includes(filter) || event.kind.includes(filter);
  });
}

export function SituationalConsole({
  initialData
}: {
  initialData: OperationalDataset;
}) {
  const { status: operationalStatus, layers, narrativeEvents, narrativeScenes } = initialData;

  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [highlightedEventId, setHighlightedEventId] = useState<string | null>(null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeFieldIds, setActiveFieldIds] = useState<string[]>(
    layers.filter((layer) => layer.visible_by_default).map((layer) => layer.id)
  );
  const [mobilePanel, setMobilePanel] = useState<SheetPanel>("map");
  const [timelineIndex, setTimelineIndex] = useState(narrativeScenes.length - 1);
  const [showPriority, setShowPriority] = useState(false);
  const [showCritical, setShowCritical] = useState(false);
  const [cinematicMode, setCinematicMode] = useState(false);
  const [desktopFiltersOpen, setDesktopFiltersOpen] = useState(false);

  const visibleEvents = useMemo(
    () => narrativeEvents.filter((event) => matchesFilters(event, activeFilters)),
    [activeFilters, narrativeEvents]
  );

  const selectedEvent = visibleEvents.find((event) => event.id === selectedEventId) ?? null;
  const highlightedEvent = visibleEvents.find((event) => event.id === highlightedEventId) ?? null;
  const currentScene = narrativeScenes[timelineIndex] ?? narrativeScenes[0];
  const crisisMode = Boolean(
    selectedEvent?.severity === "CRITICAL" ||
      visibleEvents.filter((event) => event.severity === "HIGH" && event.region === selectedEvent?.region).length > 1
  );

  const priorityEvent = visibleEvents.find((event) => event.severity === "HIGH");
  const criticalEvent = visibleEvents.find((event) => event.severity === "CRITICAL");

  function toggleFilter(id: string) {
    setActiveFilters((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  function toggleLayer(id: string) {
    setActiveFieldIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }

  return (
    <main className="min-h-screen bg-graphite px-3 pb-32 pt-3 text-white lg:px-4 lg:pb-4">
      <TopStatusBar status={operationalStatus} topAlerts={visibleEvents} />
      <div className="mx-auto mt-3 flex max-w-[1800px] items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => setDesktopFiltersOpen((current) => !current)}
          className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.18em] text-slate-200 lg:inline-flex"
        >
          <Layers3 className="h-4 w-4" />
          Capas y filtros
        </button>
        <button
          type="button"
          onClick={() => setCinematicMode((current) => !current)}
          className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-cyan-100"
        >
          {cinematicMode ? "Salir modo cinematico" : "Modo cinematico"}
        </button>
      </div>
      <div className="mx-auto mt-3 grid max-w-[1800px] grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="relative grid min-h-[calc(100vh-152px)] grid-rows-[minmax(0,1fr)_96px] gap-3">
          {desktopFiltersOpen ? (
            <div className="absolute left-4 top-4 z-20 hidden w-[320px] lg:block">
              <div className="glass-panel rounded-[28px] border border-white/10 p-4 shadow-panel">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Capas y filtros</p>
                    <p className="mt-1 text-sm text-slate-300">Controla incendios, viento y riesgo sobre el mapa.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDesktopFiltersOpen(false)}
                    className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <OperationalSidebar
                  status={operationalStatus}
                  layers={layers}
                  activeFilters={activeFilters}
                  activeLayerIds={activeFieldIds}
                  onToggleFilter={toggleFilter}
                  onToggleLayer={toggleLayer}
                  compact
                  className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
                />
              </div>
            </div>
          ) : null}
          <LiveMapStage
            scene={currentScene}
            highlightedEventId={highlightedEvent?.id ?? null}
            selectedEventId={selectedEvent?.id ?? null}
            activeFieldIds={activeFieldIds}
            crisisMode={crisisMode}
            cinematicMode={cinematicMode}
            onSelectEvent={(eventId) => setSelectedEventId((current) => (current === eventId ? null : eventId))}
          />
          {selectedEvent ? (
            <div className="absolute bottom-28 right-4 z-20 hidden w-[360px] lg:block">
              <ContextDrawer event={selectedEvent} onClose={() => setSelectedEventId(null)} compact />
            </div>
          ) : null}
          <TimelineScrubber
            scenes={narrativeScenes}
            selectedIndex={timelineIndex}
            onChange={setTimelineIndex}
          />
        </section>

        <aside className="hidden gap-3 lg:grid">
          <AlertStack
            alerts={visibleEvents}
            selectedAlertId={selectedEvent?.id}
            onSelect={(alert) => setSelectedEventId((current) => (current === alert.id ? null : alert.id))}
            onHover={(alert) => setHighlightedEventId(alert?.id ?? null)}
          />
        </aside>
      </div>

      <div className="fixed inset-x-3 bottom-24 z-30 lg:hidden">
        {mobilePanel === "alerts" && (
          <div className="max-h-[52vh] overflow-y-auto rounded-[28px]">
            <AlertStack
              alerts={visibleEvents}
              selectedAlertId={selectedEvent?.id}
              onSelect={(alert) => {
                setSelectedEventId(alert.id);
                setMobilePanel("map");
              }}
              onHover={(alert) => setHighlightedEventId(alert?.id ?? null)}
            />
          </div>
        )}
        {mobilePanel === "layers" && (
          <div className="glass-panel max-h-[52vh] overflow-y-auto rounded-[28px] p-4">
            <OperationalSidebar
              status={operationalStatus}
              layers={layers}
              activeFilters={activeFilters}
              activeLayerIds={activeFieldIds}
              onToggleFilter={toggleFilter}
              onToggleLayer={toggleLayer}
              compact
              className="border-0 bg-transparent p-0 shadow-none backdrop-blur-none"
            />
          </div>
        )}
        {mobilePanel === "timeline" && (
          <div className="glass-panel rounded-[28px] p-3">
            <TimelineScrubber scenes={narrativeScenes} selectedIndex={timelineIndex} onChange={setTimelineIndex} />
          </div>
        )}
        {mobilePanel === "map" && selectedEvent && (
          <div className="max-h-[48vh] overflow-y-auto rounded-[28px]">
            <ContextDrawer event={selectedEvent} onClose={() => setSelectedEventId(null)} mobile />
          </div>
        )}
      </div>

      {priorityEvent && showPriority && (
        <AlertSlidePriority
          alert={priorityEvent}
          onDismiss={() => setShowPriority(false)}
          onOpen={() => {
            setSelectedEventId(priorityEvent.id);
            setShowPriority(false);
          }}
        />
      )}
      {criticalEvent && showCritical && (
        <CriticalAlertModal alert={criticalEvent} onClose={() => setShowCritical(false)} />
      )}

      <MobileActionDock active={mobilePanel} onChange={setMobilePanel} />
    </main>
  );
}
