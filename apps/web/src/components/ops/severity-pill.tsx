import { AlertTriangle, Flame, Trees, Waves } from "lucide-react";
import type { Alert, NaturalEventEntity } from "@/types/operational";
import { cn } from "@/lib/utils";

const severityTone = {
  LOW: "border-riskLow/25 bg-riskLow/12 text-riskLow",
  MEDIUM: "border-riskMedium/25 bg-riskMedium/12 text-riskMedium",
  HIGH: "border-riskHigh/25 bg-riskHigh/12 text-riskHigh",
  CRITICAL: "border-riskCritical/25 bg-riskCritical/12 text-riskCritical"
};

function iconForType(type: string) {
  if (type.includes("wildfire")) return Flame;
  if (type.includes("flood")) return Waves;
  if (type.includes("deforestation")) return Trees;
  return AlertTriangle;
}

export function SeverityPill({ alert, compact = false }: { alert: Alert | NaturalEventEntity; compact?: boolean }) {
  const Icon = iconForType(alert.type);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
        severityTone[alert.severity],
        compact && "px-2 py-0.5 text-[10px]"
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      {alert.severity}
    </span>
  );
}
