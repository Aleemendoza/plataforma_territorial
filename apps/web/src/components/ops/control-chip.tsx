import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ControlChip({
  active,
  children,
  onClick
}: {
  active?: boolean;
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-2 text-sm transition duration-200",
        active
          ? "border-cyan-300/35 bg-cyan-300/12 text-cyan-100"
          : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/8"
      )}
    >
      {children}
    </button>
  );
}
