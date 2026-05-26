"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import type { Alert, NaturalEventEntity } from "@/types/operational";

export function CriticalAlertModal({
  alert,
  onClose
}: {
  alert: Alert | NaturalEventEntity;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/72 backdrop-blur-sm">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-6">
        <div className="w-full rounded-[2rem] border border-riskCritical/30 bg-panel p-6 shadow-panel">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-riskCritical/30 bg-riskCritical/15 p-3">
                <ShieldAlert className="h-6 w-6 text-riskCritical" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-riskCritical">alerta critica</p>
                <h2 className="font-display text-2xl font-semibold text-white">{alert.title}</h2>
              </div>
            </div>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-3 py-2 text-sm text-slate-300">
              Cerrar
            </button>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
            <div className="rounded-3xl border border-white/8 bg-slate-950/70 p-4">
              <div className="mb-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-sm text-slate-300">
                  <AlertTriangle className="h-4 w-4 text-riskCritical" />
                  {alert.location_name}
                </span>
                <span className="text-xs uppercase tracking-[0.2em] text-slate-500">ahora</span>
              </div>
              <div className="h-56 rounded-2xl bg-[radial-gradient(circle_at_50%_42%,rgba(240,68,82,0.26),transparent_18%),radial-gradient(circle_at_48%_46%,rgba(39,179,255,0.22),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(0,0,0,0.2))]" />
            </div>
            <div>
              <p className="text-sm text-slate-300">{alert.long_message}</p>
              <ul className="mt-4 space-y-2">
                {alert.recommended_actions.map((action) => (
                  <li key={action} className="rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-sm text-slate-200">
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href={`/incident/${alert.id}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900">
              Abrir modo incidente
              <ArrowRight className="h-4 w-4" />
            </Link>
            <button type="button" onClick={onClose} className="rounded-full border border-white/10 px-4 py-2 text-sm text-slate-300">
              Marcar revisado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
