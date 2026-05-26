"use client";

import Link from "next/link";
import { Bell, Radar, UserCircle2 } from "lucide-react";
import { ConnectionStateBadge } from "@/components/ops/connection-state-badge";
import { LiveIndicator } from "@/components/ops/live-indicator";
import { StatusChip } from "@/components/ops/status-chip";
import { formatUtcTime } from "@/lib/utils";
import type { Alert, NaturalEventEntity, OperationalStatus } from "@/types/operational";

export function TopStatusBar({
  status,
  topAlerts
}: {
  status: OperationalStatus;
  topAlerts: Array<Alert | NaturalEventEntity>;
}) {
  return (
    <header className="glass-panel sticky top-3 z-30 mx-auto flex max-w-[1800px] items-center justify-between gap-3 rounded-[28px] px-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-2xl border border-cyan-300/25 bg-cyan-300/10 p-2">
          <Radar className="h-5 w-5 text-cyan-200" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <p className="truncate font-display text-lg font-semibold text-white">Jujuy Alerta Territorial</p>
            <StatusChip value={status.province_state} />
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator state={status.connectivity_state} />
            <span className="text-xs text-slate-500" suppressHydrationWarning>
              {formatUtcTime(status.last_updated_at)}
            </span>
          </div>
        </div>
      </div>
      <div className="hidden min-w-0 flex-1 items-center justify-center gap-2 lg:flex">
        {topAlerts.slice(0, 3).map((alert) => (
          <span key={alert.id} className="truncate rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-300">
            {alert.title}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <ConnectionStateBadge state={status.connectivity_state} />
        <Link href="/alerts" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300">
          <Bell className="h-4 w-4" />
        </Link>
        <button type="button" className="rounded-full border border-white/10 bg-white/5 p-2 text-slate-300">
          <UserCircle2 className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
