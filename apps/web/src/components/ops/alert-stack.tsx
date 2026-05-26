"use client";

import { EmptyOperationalState } from "@/components/ops/empty-operational-state";
import { AlertCard } from "@/components/ops/alert-card";
import type { Alert, NaturalEventEntity } from "@/types/operational";

export function AlertStack({
  alerts,
  selectedAlertId,
  onSelect,
  onHover
}: {
  alerts: Array<Alert | NaturalEventEntity>;
  selectedAlertId?: string | null;
  onSelect: (alert: Alert | NaturalEventEntity) => void;
  onHover: (alert: Alert | NaturalEventEntity | null) => void;
}) {
  return (
    <section className="glass-panel rounded-[28px] p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold text-white">Alertas activas</p>
          <p className="text-sm text-slate-400">Cola operativa priorizada</p>
        </div>
        <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-2 py-1 text-[11px] uppercase tracking-[0.16em] text-cyan-200">
          live
        </span>
      </div>
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <EmptyOperationalState
            title="Sin alertas activas"
            description="La provincia se mantiene estable y no hay eventos nuevos en observacion."
          />
        ) : (
          alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              selected={selectedAlertId === alert.id}
              onSelect={onSelect}
              onHover={onHover}
            />
          ))
        )}
      </div>
    </section>
  );
}
