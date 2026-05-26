const factors = [
  { label: "Lluvia acumulada", value: "84 mm", tone: "text-water" },
  { label: "Pendiente media", value: "27%", tone: "text-riskHigh" },
  { label: "Humedad superficial", value: "0.71", tone: "text-cyan-200" },
  { label: "Perdida vegetacion", value: "12%", tone: "text-riskMedium" }
];

export function DetailPanel() {
  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-4 shadow-panel backdrop-blur">
      <div className="mb-4">
        <p className="font-display text-lg font-semibold">Detalle de incidente</p>
        <p className="text-sm text-slate-400">Yala · cuenca norte · actualizacion en vivo</p>
      </div>
      <div className="rounded-2xl border border-riskHigh/20 bg-riskHigh/10 p-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm text-slate-200">Score de riesgo</span>
          <span className="font-display text-3xl font-semibold text-riskHigh">0.82</span>
        </div>
        <p className="text-sm text-slate-300">
          Alta probabilidad de escorrentia rapida por lluvias intensas y pendiente pronunciada.
        </p>
      </div>
      <div className="mt-4 space-y-3">
        {factors.map((factor) => (
          <div key={factor.label} className="flex items-center justify-between rounded-2xl bg-white/5 px-3 py-3">
            <span className="text-sm text-slate-300">{factor.label}</span>
            <span className={`font-medium ${factor.tone}`}>{factor.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

