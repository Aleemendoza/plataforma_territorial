import { Bell } from "lucide-react";
import type { Alert, NaturalEventEntity } from "@/types/operational";

export function AlertToastPassive({ alert }: { alert: Alert | NaturalEventEntity }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 shadow-panel backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="rounded-xl border border-cyan-300/20 bg-cyan-300/10 p-2">
          <Bell className="h-4 w-4 text-cyan-200" />
        </div>
        <div>
          <p className="text-sm font-medium text-white">{alert.title}</p>
          <p className="text-xs text-slate-400">{alert.location_name}</p>
        </div>
      </div>
    </div>
  );
}
