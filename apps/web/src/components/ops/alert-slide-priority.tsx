"use client";

import { ArrowRight, Check, X } from "lucide-react";
import type { Alert, NaturalEventEntity } from "@/types/operational";
import { SeverityPill } from "@/components/ops/severity-pill";

export function AlertSlidePriority({
  alert,
  onDismiss,
  onOpen
}: {
  alert: Alert | NaturalEventEntity;
  onDismiss: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="glass-panel fixed right-3 top-20 z-40 w-[min(380px,calc(100vw-24px))] rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-lg font-semibold text-white">{alert.title}</p>
          <p className="mt-1 text-sm text-slate-400">{alert.location_name}</p>
        </div>
        <SeverityPill alert={alert} compact />
      </div>
      <p className="mt-3 text-sm text-slate-300">{alert.short_message}</p>
      <div className="mt-4 flex items-center gap-2">
        <button type="button" onClick={onOpen} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
          Abrir detalle
          <ArrowRight className="h-4 w-4" />
        </button>
        <button type="button" onClick={onDismiss} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
          <Check className="h-4 w-4" />
          Revisado
        </button>
        <button type="button" onClick={onDismiss} className="rounded-full border border-white/10 p-2 text-slate-400">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
