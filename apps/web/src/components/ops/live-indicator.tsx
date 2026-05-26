import type { ConnectivityState } from "@/types/operational";
import { cn } from "@/lib/utils";

const tone = {
  live: "bg-emerald-400",
  degraded: "bg-riskHigh",
  offline: "bg-riskCritical"
};

export function LiveIndicator({ state }: { state: ConnectivityState }) {
  return (
    <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
      <span className={cn("h-2.5 w-2.5 rounded-full shadow-[0_0_14px_currentColor]", tone[state])} />
      {state === "live" ? "en vivo" : state === "degraded" ? "degradado" : "offline"}
    </span>
  );
}

