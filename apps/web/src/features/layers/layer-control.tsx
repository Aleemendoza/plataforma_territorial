const layers = [
  { name: "NDVI", color: "bg-emerald-400", enabled: true },
  { name: "NDWI", color: "bg-cyan-400", enabled: true },
  { name: "NBR", color: "bg-orange-400", enabled: false },
  { name: "FIRMS", color: "bg-red-400", enabled: true },
  { name: "Pendiente", color: "bg-violet-400", enabled: false }
];

export function LayerControl() {
  return (
    <section className="mt-6">
      <div className="mb-3">
        <p className="font-display text-lg font-semibold">Capas operacionales</p>
        <p className="text-sm text-slate-400">Filtros tacticos y overlays del mapa</p>
      </div>
      <div className="space-y-2">
        {layers.map((layer) => (
          <div
            key={layer.name}
            className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/5 px-3 py-3"
          >
            <div className="flex items-center gap-3">
              <span className={`h-2.5 w-2.5 rounded-full ${layer.color}`} />
              <span className="text-sm text-slate-100">{layer.name}</span>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs ${
                layer.enabled ? "bg-emerald-400/10 text-emerald-300" : "bg-white/8 text-slate-500"
              }`}
            >
              {layer.enabled ? "Activo" : "Off"}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

