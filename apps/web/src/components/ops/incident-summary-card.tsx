import { MetricBadge } from "@/components/ops/metric-badge";
import { SeverityPill } from "@/components/ops/severity-pill";
import type { NaturalEventEntity } from "@/types/operational";

export function IncidentSummaryCard({ event }: { event: NaturalEventEntity }) {
  return (
    <section className="glass-panel rounded-[28px] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-riskCritical">Modo incidente</p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-white">{event.title}</h1>
          <p className="mt-1 text-sm text-slate-400">{event.location_name}</p>
        </div>
        <SeverityPill alert={event} />
      </div>
      <p className="mt-4 max-w-3xl text-sm text-slate-300">{event.long_message}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {event.metrics.map((metric) => (
          <span key={metric.label} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            {metric.label}: {metric.value}
          </span>
        ))}
      </div>
      <div className="status-grid mt-5 grid gap-3">
        <MetricBadge label="Poblacion expuesta" value={event.impact_summary.population} tone="critical" />
        <MetricBadge label="Infraestructura" value={event.impact_summary.infrastructure} />
        <MetricBadge label="Rutas" value={event.impact_summary.routes} tone="water" />
      </div>
    </section>
  );
}
