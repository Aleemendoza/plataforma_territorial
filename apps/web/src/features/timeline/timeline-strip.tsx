const marks = ["72h", "48h", "24h", "12h", "Ahora"];

export function TimelineStrip() {
  return (
    <section className="rounded-[28px] border border-white/10 bg-panel/80 p-4 shadow-panel backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="font-display text-lg font-semibold">Timeline territorial</p>
          <p className="text-sm text-slate-400">Comparacion de escenas y cambios recientes</p>
        </div>
        <span className="text-xs uppercase tracking-[0.2em] text-cyan-300">scrub temporal</span>
      </div>
      <div className="relative mt-6">
        <div className="h-1 rounded-full bg-white/10" />
        <div className="absolute left-[74%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-4 border-cyan-300 bg-cyan-200 shadow-[0_0_18px_rgba(39,179,255,0.65)]" />
        <div className="mt-3 flex justify-between text-xs uppercase tracking-[0.18em] text-slate-500">
          {marks.map((mark) => (
            <span key={mark}>{mark}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

