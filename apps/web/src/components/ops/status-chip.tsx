import type { ProvinceState, Severity } from "@/types/operational";
import { cn } from "@/lib/utils";

const toneMap: Record<ProvinceState | Severity, string> = {
  ESTABLE: "border-emerald-400/30 bg-emerald-400/12 text-emerald-200",
  ATENCION: "border-riskMedium/30 bg-riskMedium/12 text-riskMedium",
  CRITICO: "border-riskCritical/30 bg-riskCritical/12 text-riskCritical",
  LOW: "border-riskLow/30 bg-riskLow/12 text-riskLow",
  MEDIUM: "border-riskMedium/30 bg-riskMedium/12 text-riskMedium",
  HIGH: "border-riskHigh/30 bg-riskHigh/12 text-riskHigh",
  CRITICAL: "border-riskCritical/30 bg-riskCritical/12 text-riskCritical"
};

export function StatusChip({
  value,
  label,
  className
}: {
  value: ProvinceState | Severity;
  label?: string;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]", toneMap[value], className)}>
      {label ?? value}
    </span>
  );
}

