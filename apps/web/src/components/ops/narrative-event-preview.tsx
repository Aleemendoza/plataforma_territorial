"use client";

import { ArrowUpRight, Flame, Waves, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EventPreview } from "@/types/operational";

const iconByType: Record<string, typeof Flame> = {
  wildfire: Flame,
  hydric_risk: Waves,
  river_surge: Waves,
  rainfall: Waves,
  wind: Wind
};

export function NarrativeEventPreview({
  eventType,
  preview,
  className
}: {
  eventType: string;
  preview: EventPreview;
  className?: string;
}) {
  const Icon = iconByType[eventType] ?? ArrowUpRight;

  return (
    <div className={cn("rounded-2xl border border-white/10 bg-slate-950/78 p-3 shadow-panel backdrop-blur", className)}>
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2">
          <Icon className="h-4 w-4 text-cyan-200" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">{preview.title}</p>
          <p className="text-xs text-slate-400">{preview.subtitle}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-white/8 bg-white/5 px-2 py-2 text-slate-300">
          <p className="uppercase tracking-[0.16em] text-slate-500">Ultimas 6h</p>
          <p className="mt-1 font-medium text-white">{preview.summary}</p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/5 px-2 py-2 text-slate-300">
          <p className="uppercase tracking-[0.16em] text-slate-500">Clave</p>
          <p className="mt-1 font-medium text-white">{preview.primary_metric.value}</p>
        </div>
      </div>
      {preview.direction_label ? (
        <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-cyan-200">{preview.direction_label}</p>
      ) : null}
    </div>
  );
}
