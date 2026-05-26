"use client";

import Link from "next/link";
import { ArrowRight, CircleGauge, Route, Users, Wind, Waves } from "lucide-react";
import { MiniMapPreview } from "@/components/ops/mini-map-preview";
import { SeverityPill } from "@/components/ops/severity-pill";
import type { NaturalEventEntity } from "@/types/operational";

export function ContextDrawer({
  event,
  onClose,
  mobile = false
}: {
  event: NaturalEventEntity;
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <aside className={`glass-panel ${mobile ? "rounded-t-[2rem] border-b-0 p-4" : "rounded-[28px] p-4"}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-xl font-semibold text-white">{event.title}</p>
          <p className="text-sm text-slate-400">{event.location_name}</p>
        </div>
        <SeverityPill alert={event} />
      </div>
      <p className="text-sm text-slate-300">{event.long_message}</p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-300">
          <Users className="mb-2 h-4 w-4 text-cyan-300" />
          {event.impact_summary.population}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-300">
          <Route className="mb-2 h-4 w-4 text-cyan-300" />
          {event.impact_summary.routes}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-300">
          <CircleGauge className="mb-2 h-4 w-4 text-cyan-300" />
          {event.impact_summary.infrastructure}
        </div>
      </div>
      <div className="mt-4">
        <MiniMapPreview before={event.before_after_assets.before} after={event.before_after_assets.after} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-300">
          <Wind className="mb-2 h-4 w-4 text-cyan-300" />
          {event.preview.direction_label ?? event.motion_vector.direction_label}
        </div>
        <div className="rounded-2xl border border-white/8 bg-white/5 p-3 text-xs text-slate-300">
          <Waves className="mb-2 h-4 w-4 text-cyan-300" />
          {event.preview.primary_metric.value}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Factores</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {event.factors.map((factor) => (
            <span key={factor} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
              {factor}
            </span>
          ))}
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/7 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Narrativa</p>
        <p className="mt-2 text-sm text-slate-200">{event.narrative_summary}</p>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/incident/${event.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
          Modo incidente
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
          Cerrar
        </button>
      </div>
    </aside>
  );
}
