"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AlertStack } from "@/components/ops/alert-stack";
import { ContextDrawer } from "@/components/ops/context-drawer";
import { TopStatusBar } from "@/components/ops/top-status-bar";
import type { OperationalDataset } from "@/types/operational";

export function AlertsQueueView({
  initialData
}: {
  initialData: OperationalDataset;
}) {
  const { status: operationalStatus, narrativeEvents } = initialData;
  const selected = narrativeEvents[0];
  if (!selected) {
    return null;
  }
  return (
    <main className="min-h-screen bg-graphite px-3 py-3 text-white lg:px-4">
      <TopStatusBar status={operationalStatus} topAlerts={narrativeEvents} />
      <div className="mx-auto mt-3 max-w-[1600px]">
        <Link href="/" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
          <ArrowLeft className="h-4 w-4" />
          Volver a vista situacional
        </Link>
        <div className="mt-3 grid gap-3 lg:grid-cols-[420px_minmax(0,1fr)]">
          <AlertStack
            alerts={narrativeEvents}
            selectedAlertId={selected.id}
            onSelect={() => undefined}
            onHover={() => undefined}
          />
          <ContextDrawer event={selected} onClose={() => undefined} />
        </div>
      </div>
    </main>
  );
}
