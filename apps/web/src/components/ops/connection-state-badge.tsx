import { Wifi, WifiOff } from "lucide-react";
import type { ConnectivityState } from "@/types/operational";

export function ConnectionStateBadge({ state }: { state: ConnectivityState }) {
  const Icon = state === "offline" ? WifiOff : Wifi;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
      <Icon className="h-3.5 w-3.5" />
      {state === "live" ? "Conectado" : state === "degraded" ? "Conexion inestable" : "Sin conexion"}
    </span>
  );
}

