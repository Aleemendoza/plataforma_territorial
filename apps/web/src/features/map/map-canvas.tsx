const hotspots = [
  { name: "Palpala", risk: "CRITICAL", position: "24.26S / 65.21W" },
  { name: "Yala", risk: "HIGH", position: "24.10S / 65.49W" },
  { name: "Perico", risk: "MEDIUM", position: "24.39S / 65.11W" }
];

export function MapCanvas() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950 shadow-panel">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(39,179,255,0.18),transparent_26%),radial-gradient(circle_at_70%_65%,rgba(240,68,82,0.16),transparent_24%),linear-gradient(180deg,rgba(8,11,16,0.35),rgba(8,11,16,0.9))]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute left-[20%] top-[18%] h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute bottom-[20%] right-[24%] h-40 w-40 rounded-full bg-red-500/10 blur-3xl" />
      <div className="relative z-10 flex h-full flex-col justify-between p-4 lg:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Operacion en vivo</p>
            <h1 className="font-display text-2xl font-semibold lg:text-3xl">
              Monitoreo territorial en tiempo real
            </h1>
          </div>
          <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm text-emerald-200">
            Estado provincial estable con focos activos
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {hotspots.map((spot) => (
            <div key={spot.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 backdrop-blur">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-display text-lg">{spot.name}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-xs text-slate-200">
                  {spot.risk}
                </span>
              </div>
              <p className="text-sm text-slate-400">{spot.position}</p>
              <div className="mt-3 h-2 rounded-full bg-white/10">
                <div
                  className={`h-2 rounded-full ${
                    spot.risk === "CRITICAL"
                      ? "w-full bg-riskCritical"
                      : spot.risk === "HIGH"
                        ? "w-4/5 bg-riskHigh"
                        : "w-3/5 bg-riskMedium"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

