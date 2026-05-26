"use client";

import { Clock3, MapPinned } from "lucide-react";
import { SeverityPill } from "@/components/ops/severity-pill";
import { cn, formatUtcTime } from "@/lib/utils";
import type { Alert, NaturalEventEntity } from "@/types/operational";

export function AlertCard({
  alert,
  selected,
  onSelect,
  onHover
}: {
  alert: Alert | NaturalEventEntity;
  selected?: boolean;
  onSelect?: (alert: Alert | NaturalEventEntity) => void;
  onHover?: (alert: Alert | NaturalEventEntity | null) => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={() => onHover?.(alert)}
      onMouseLeave={() => onHover?.(null)}
      onFocus={() => onHover?.(alert)}
      onBlur={() => onHover?.(null)}
      onClick={() => onSelect?.(alert)}
      className={cn(
        "w-full rounded-2xl border p-4 text-left transition duration-200",
        selected
          ? "border-cyan-300/30 bg-cyan-300/10"
          : "border-white/8 bg-white/5 hover:border-white/15 hover:bg-white/8"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-white">{alert.title}</p>
          <p className="mt-1 text-sm text-slate-400">{alert.short_message}</p>
        </div>
        <SeverityPill alert={alert} compact />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.16em] text-slate-500">
        <span className="inline-flex items-center gap-1"><MapPinned className="h-3.5 w-3.5" />{alert.location_name}</span>
        <span className="inline-flex items-center gap-1" suppressHydrationWarning><Clock3 className="h-3.5 w-3.5" />{formatUtcTime(alert.created_at)}</span>
      </div>
    </button>
  );
}
