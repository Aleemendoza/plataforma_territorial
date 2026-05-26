"use client";

import { AlertTriangle, Clock3, Layers3, Map } from "lucide-react";
import type { SheetPanel } from "@/types/operational";
import { cn } from "@/lib/utils";

const items: Array<{ id: SheetPanel; label: string; icon: typeof Map }> = [
  { id: "map", label: "Mapa", icon: Map },
  { id: "alerts", label: "Alertas", icon: AlertTriangle },
  { id: "layers", label: "Capas", icon: Layers3 },
  { id: "timeline", label: "Timeline", icon: Clock3 }
];

export function MobileActionDock({
  active,
  onChange
}: {
  active: SheetPanel;
  onChange: (panel: SheetPanel) => void;
}) {
  return (
    <nav className="glass-panel fixed bottom-3 left-3 right-3 z-40 rounded-[28px] p-2 lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-xs transition",
              active === id ? "bg-cyan-300/12 text-cyan-100" : "text-slate-400"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}

