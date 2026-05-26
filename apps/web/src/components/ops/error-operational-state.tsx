export function ErrorOperationalState({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-riskCritical/20 bg-riskCritical/8 p-5">
      <p className="font-display text-lg font-semibold text-riskCritical">{title}</p>
      <p className="mt-2 text-sm text-slate-300">{description}</p>
    </div>
  );
}

