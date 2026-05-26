const alerts = [
  {
    title: "Crecida rapida detectada",
    location: "Arroyo Burrumayo",
    severity: "CRITICAL",
    time: "Hace 3 min"
  },
  {
    title: "Anomalia termica persistente",
    location: "Yungas sur",
    severity: "HIGH",
    time: "Hace 12 min"
  },
  {
    title: "Posible cambio de cobertura",
    location: "Perico este",
    severity: "MEDIUM",
    time: "Hace 26 min"
  }
];

const severityClass: Record<string, string> = {
  CRITICAL: "border-riskCritical/30 bg-riskCritical/10 text-riskCritical",
  HIGH: "border-riskHigh/30 bg-riskHigh/10 text-riskHigh",
  MEDIUM: "border-riskMedium/30 bg-riskMedium/10 text-riskMedium"
};

export function AlertFeed() {
  return (
    <section className="rounded-3xl border border-white/10 bg-panel/80 p-4 shadow-panel backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold">Alertas activas</p>
          <p className="text-sm text-slate-400">Eventos priorizados por severidad</p>
        </div>
        <span className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-xs text-cyan-200">
          websocket
        </span>
      </div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <article
            key={alert.title}
            className="rounded-2xl border border-white/8 bg-white/5 p-4 transition hover:border-cyan-300/20"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <p className="font-medium text-white">{alert.title}</p>
                <p className="text-sm text-slate-400">{alert.location}</p>
              </div>
              <span className={`rounded-full border px-2 py-1 text-xs ${severityClass[alert.severity]}`}>
                {alert.severity}
              </span>
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{alert.time}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

