import Link from "next/link";
import { Home, ShieldCheck, Waves } from "lucide-react";
import { EmptyOperationalState } from "@/components/ops/empty-operational-state";
import { LiveMapStage } from "@/components/ops/live-map-stage";
import { SeverityPill } from "@/components/ops/severity-pill";
import type { OperationalDataset } from "@/types/operational";

export function PublicRiskView({
  initialData
}: {
  initialData: OperationalDataset;
}) {
  const { status: operationalStatus, narrativeEvents, narrativeScenes } = initialData;
  const citizenAlerts = narrativeEvents.filter((alert) => alert.severity !== "MEDIUM");
  const currentScene = narrativeScenes[narrativeScenes.length - 1] ?? narrativeScenes[0];
  if (!currentScene) {
    return null;
  }

  return (
    <main className="min-h-screen bg-graphite px-3 py-3 text-white lg:px-4">
      <div className="mx-auto max-w-[1500px] space-y-3">
        <header className="glass-panel rounded-[28px] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Vista publica</p>
              <h1 className="font-display text-2xl font-semibold text-white">Riesgos cercanos y estado territorial</h1>
              <p className="mt-1 text-sm text-slate-400">{operationalStatus.headline}</p>
            </div>
            <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
              <Home className="h-4 w-4" />
              Vista operativa
            </Link>
          </div>
        </header>
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid min-h-[70vh] grid-rows-[minmax(0,1fr)_auto] gap-3">
            <LiveMapStage
              scene={currentScene}
              highlightedEventId={citizenAlerts[0]?.id ?? null}
              selectedEventId={citizenAlerts[0]?.id ?? null}
              activeFieldIds={["rainfall", "river_state", "flood_risk"]}
              crisisMode={false}
            />
            <div className="glass-panel rounded-[28px] p-4 text-sm text-slate-300">
              La vista publica prioriza mensajes claros, rutas afectadas y zonas en vigilancia sin exponer capas tecnicas.
            </div>
          </div>
          <aside className="glass-panel rounded-[28px] p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-2">
                <ShieldCheck className="h-5 w-5 text-cyan-200" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold text-white">Alertas cercanas</p>
                <p className="text-sm text-slate-400">Informacion simple y accionable</p>
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {citizenAlerts.length === 0 ? (
                <EmptyOperationalState
                  title="Sin riesgos cercanos"
                  description="No hay alertas publicas activas alrededor de las zonas monitoreadas."
                />
              ) : (
                citizenAlerts.map((alert) => (
                  <div key={alert.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium text-white">{alert.title}</p>
                        <p className="text-sm text-slate-400">{alert.location_name}</p>
                      </div>
                      <SeverityPill alert={alert} compact />
                    </div>
                    <p className="mt-3 text-sm text-slate-300">{alert.short_message}</p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs text-cyan-100">
                      <Waves className="h-3.5 w-3.5" />
                      Revisa rutas y zonas bajas cercanas
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
