import { cn } from "@/lib/utils";

export function MetricBadge({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "water" | "critical";
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border px-3 py-3",
        tone === "water"
          ? "border-cyan-300/15 bg-cyan-300/7"
          : tone === "critical"
            ? "border-riskCritical/20 bg-riskCritical/8"
            : "border-white/8 bg-white/5"
      )}
    >
      <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
      <p className="mt-1 font-display text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

