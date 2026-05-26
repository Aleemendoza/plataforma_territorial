export function MiniMapPreview({ before, after }: { before: string; after: string }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {[before, after].map((label, index) => (
        <div key={label} className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70">
          <div className="h-24 bg-[radial-gradient(circle_at_30%_30%,rgba(39,179,255,0.16),transparent_24%),radial-gradient(circle_at_70%_60%,rgba(240,68,82,0.14),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
          <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-400">
            <span>{label}</span>
            <span>{index === 0 ? "-48h" : "Ahora"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

