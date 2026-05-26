"use client";

import { useId } from "react";
import { formatUtcDayMonthShort } from "@/lib/utils";
import type { TimelineScene } from "@/types/operational";

export function TimelineScrubber({
  scenes,
  selectedIndex,
  onChange
}: {
  scenes: TimelineScene[];
  selectedIndex: number;
  onChange: (value: number) => void;
}) {
  const inputId = useId();
  const current = scenes[selectedIndex];

  return (
    <section className="glass-panel rounded-[28px] p-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="font-display text-lg font-semibold text-white">Timeline natural</p>
          <p className="text-sm text-slate-400">Rebobina propagacion, lluvia y crecimiento del agua</p>
        </div>
        <div className="text-right text-xs uppercase tracking-[0.18em] text-slate-500">
          <p suppressHydrationWarning>{formatUtcDayMonthShort(current.timestamp)}</p>
          <p>{current.freshness}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {current.headlines?.map((headline) => (
          <span key={headline} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-slate-300">
            {headline}
          </span>
        ))}
      </div>
      <div className="mt-5">
        <label htmlFor={inputId} className="sr-only">
          Timeline territorial
        </label>
        <input
          id={inputId}
          type="range"
          min={0}
          max={scenes.length - 1}
          value={selectedIndex}
          onChange={(event) => onChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-white/10"
        />
        <div className="mt-3 flex justify-between text-[11px] uppercase tracking-[0.18em] text-slate-500">
          {scenes.map((scene, index) => (
            <span key={scene.timestamp} className={index === selectedIndex ? "text-cyan-200" : undefined} suppressHydrationWarning>
              {formatUtcDayMonthShort(scene.timestamp)}
            </span>
          ))}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          {current.narrative_summary ??
            "La escena temporal integra condiciones naturales y eventos prioritarios del territorio."}
        </p>
      </div>
    </section>
  );
}
