import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ContextDrawer } from "@/components/ops/context-drawer";
import { IncidentSummaryCard } from "@/components/ops/incident-summary-card";
import { LiveMapStage } from "@/components/ops/live-map-stage";
import { TimelineScrubber } from "@/components/ops/timeline-scrubber";
import { TopStatusBar } from "@/components/ops/top-status-bar";
import type { NaturalEventEntity, OperationalDataset } from "@/types/operational";

export function IncidentModeView({
  incidentId,
  initialData,
  incidentEvent
}: {
  incidentId: string;
  initialData: OperationalDataset;
  incidentEvent: NaturalEventEntity | null;
}) {
  const { status: operationalStatus, narrativeEvents, narrativeScenes } = initialData;
  const event = incidentEvent ?? narrativeEvents.find((item) => item.id === incidentId) ?? narrativeEvents[0];
  if (!event) {
    return null;
  }
  const scene =
    narrativeScenes.find((item) => item.focus_event_ids.includes(event.id)) ??
    narrativeScenes[narrativeScenes.length - 1] ??
    narrativeScenes[0];
  const scenes = narrativeScenes.filter((item) => item.focus_event_ids.includes(event.id));
  if (!scene) {
    return null;
  }
  const timelineScenes = scenes.length > 0 ? scenes : [scene];

  return (
    <main className="min-h-screen bg-graphite px-3 py-3 text-white lg:px-4">
      <TopStatusBar status={{ ...operationalStatus, province_state: "CRITICO" }} topAlerts={[event]} />
      <div className="mx-auto mt-3 grid max-w-[1800px] gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            <ArrowLeft className="h-4 w-4" />
            Volver a vista situacional
          </Link>
          <IncidentSummaryCard event={event} />
          <div className="grid min-h-[calc(100vh-320px)] grid-rows-[minmax(0,1fr)_96px] gap-3">
            <LiveMapStage
              scene={scene}
              highlightedEventId={event.id}
              selectedEventId={event.id}
              activeFieldIds={["wind", "rainfall", "river_state", "flood_risk"]}
              crisisMode
            />
            <TimelineScrubber
              scenes={timelineScenes}
              selectedIndex={Math.max(timelineScenes.length - 1, 0)}
              onChange={() => undefined}
            />
          </div>
        </section>
        <ContextDrawer event={event} onClose={() => undefined} />
      </div>
    </main>
  );
}
