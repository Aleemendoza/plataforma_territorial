"use client";

import { Flame, Layers3, Waves, Trees } from "lucide-react";
import { ControlChip } from "@/components/ops/control-chip";
import { LayerGroupAccordion } from "@/components/ops/layer-group-accordion";
import { MetricBadge } from "@/components/ops/metric-badge";
import { StatusChip } from "@/components/ops/status-chip";
import { cn } from "@/lib/utils";
import type { LayerDefinition, OperationalStatus } from "@/types/operational";

const quickFilters = [
  { id: "wildfire", label: "Incendios", icon: Flame },
  { id: "flood_risk", label: "Riesgo hidrico", icon: Waves },
  { id: "deforestation", label: "Desmontes", icon: Trees }
];

export function OperationalSidebar({
  status,
  layers,
  activeFilters,
  activeLayerIds,
  onToggleFilter,
  onToggleLayer,
  className,
  compact = false
}: {
  status: OperationalStatus;
  layers: LayerDefinition[];
  activeFilters: string[];
  activeLayerIds: string[];
  onToggleFilter: (id: string) => void;
  onToggleLayer: (id: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const groups = ["Riesgo", "Ambiente", "Infraestructura"] as const;

  return (
    <aside className={cn("glass-panel rounded-[28px] p-4", className)}>
      {!compact ? (
        <div className="mb-4">
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Estado provincial</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold text-white">{status.headline}</h2>
          </div>
          <div className="mt-3">
            <StatusChip value={status.province_state} label={`Provincia ${status.province_state}`} />
          </div>
        </div>
      ) : (
        <div className="mb-4 flex items-center justify-between gap-2">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Capas y filtros</p>
            <p className="mt-1 text-sm text-slate-300">Activa incendios, viento y riesgo segun la vista que necesites.</p>
          </div>
          <StatusChip value={status.province_state} />
        </div>
      )}
      <div className={cn("grid gap-3", compact ? "grid-cols-3" : "status-grid")}>
        <MetricBadge label="Alertas activas" value={String(status.active_alert_count)} tone="critical" />
        <MetricBadge label="Incendios" value={String(status.wildfire_count)} />
        <MetricBadge label="Riesgo hidrico" value={status.hydric_risk_level} tone="water" />
      </div>
      <section className={cn(compact ? "mt-4" : "mt-6")}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Filtros rapidos</h3>
          <Layers3 className="h-4 w-4 text-slate-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {quickFilters.map(({ id, label, icon: Icon }) => (
            <ControlChip key={id} active={activeFilters.includes(id)} onClick={() => onToggleFilter(id)}>
              <span className="inline-flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {label}
              </span>
            </ControlChip>
          ))}
        </div>
      </section>
      <section className={cn(compact ? "mt-4 space-y-4" : "mt-6 space-y-5")}>
        {groups.map((group) => (
          <LayerGroupAccordion
            key={group}
            title={group}
            layers={layers.filter((layer) => layer.group === group)}
            activeLayerIds={activeLayerIds}
            onToggle={onToggleLayer}
          />
        ))}
      </section>
    </aside>
  );
}
