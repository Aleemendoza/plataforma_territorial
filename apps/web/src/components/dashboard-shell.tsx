import { AlertTriangle, Flame, Layers2, Radar, Waves } from "lucide-react";
import { AlertFeed } from "@/features/alerts/alert-feed";
import { LayerControl } from "@/features/layers/layer-control";
import { MapCanvas } from "@/features/map/map-canvas";
import { DetailPanel } from "@/features/risk/detail-panel";
import { TimelineStrip } from "@/features/timeline/timeline-strip";

const kpi = [
  { label: "Alertas activas", value: "12", icon: AlertTriangle },
  { label: "Focos termicos", value: "3", icon: Flame },
  { label: "Riesgo hidrico", value: "ALTO", icon: Waves },
  { label: "Capas online", value: "9", icon: Layers2 }
];

export function DashboardShell() {
  return (
    <main className="min-h-screen bg-graphite px-3 py-3 text-white lg:px-4">
      <div className="mx-auto grid min-h-[calc(100vh-1.5rem)] max-w-[1800px] grid-cols-1 gap-3 lg:grid-cols-[320px_minmax(0,1fr)_360px]">
        <aside className="rounded-3xl border border-white/10 bg-panel/80 p-4 shadow-panel backdrop-blur">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-2">
              <Radar className="h-5 w-5 text-cyan-300" />
            </div>
            <div>
              <p className="font-display text-lg font-semibold">Jujuy Alerta Territorial</p>
              <p className="text-sm text-slate-400">Centro operativo provincial</p>
            </div>
          </div>
          <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {kpi.map(({ label, value, icon: Icon }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-cyan-300/20 hover:bg-white/8"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-slate-400">{label}</span>
                  <Icon className="h-4 w-4 text-cyan-300" />
                </div>
                <p className="font-display text-2xl font-semibold tracking-tight">{value}</p>
              </div>
            ))}
          </section>
          <LayerControl />
        </aside>

        <section className="grid min-h-[70vh] grid-rows-[minmax(0,1fr)_88px] gap-3">
          <MapCanvas />
          <TimelineStrip />
        </section>

        <aside className="grid gap-3">
          <AlertFeed />
          <DetailPanel />
        </aside>
      </div>
    </main>
  );
}

