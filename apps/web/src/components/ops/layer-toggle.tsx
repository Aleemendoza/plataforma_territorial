import { cn } from "@/lib/utils";
import type { LayerDefinition } from "@/types/operational";

export function LayerToggle({
  layer,
  active,
  onToggle
}: {
  layer: LayerDefinition;
  active: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(layer.id)}
      aria-pressed={active}
      className="flex w-full items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-left transition duration-200 hover:border-white/15 hover:bg-white/7"
    >
      <span>
        <span className="block text-sm font-medium text-slate-100">{layer.label}</span>
        <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">{layer.technical_name}</span>
      </span>
      <span
        className={cn(
          "inline-flex h-6 w-11 items-center rounded-full border p-0.5 transition duration-200",
          active ? "border-cyan-300/30 bg-cyan-400/14" : "border-white/10 bg-white/6"
        )}
      >
        <span
          className={cn(
            "h-4.5 w-4.5 rounded-full transition duration-200",
            active ? "translate-x-5 bg-cyan-300" : "translate-x-0 bg-slate-500"
          )}
        />
      </span>
    </button>
  );
}

