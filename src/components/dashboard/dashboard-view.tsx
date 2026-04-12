"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SuccessErrorChart } from "@/components/charts/success-error";
import { LatencyChart } from "@/components/charts/latency";
import { IpChangesChart } from "@/components/charts/ip-changes";
import { RunNowButton } from "@/components/dashboard/run-now-button";

type Settings = {
  pollIntervalMinutes: number;
  retentionDays: number;
  enabled: boolean;
  ipProvider: string;
};

type LogItem = {
  ts: string;
  ip: string | null;
  ok: boolean;
  error: string | null;
};

type Stats = {
  hourly: Array<{ bucketStart: string; ok: number; err: number; p50: number | null; p95: number | null }>;
  changesPerDay: Array<{ day: string; changes: number }>;
  lastChanges: Array<{ ts: string; fromIp: string; toIp: string }>;
};

export function DashboardView() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [latest, setLatest] = useState<LogItem | null>(null);
  const [latestOk, setLatestOk] = useState<LogItem | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    setError(null);
    const [sRes, stRes, lRes, lokRes] = await Promise.all([
      fetch("/api/settings", { cache: "no-store" }),
      fetch("/api/stats", { cache: "no-store" }),
      fetch("/api/logs?limit=1", { cache: "no-store" }),
      fetch("/api/logs?limit=1&ok=true", { cache: "no-store" })
    ]);

    if (!sRes.ok) throw new Error(`Settings failed (${sRes.status})`);
    if (!stRes.ok) throw new Error(`Stats failed (${stRes.status})`);
    if (!lRes.ok) throw new Error(`Logs failed (${lRes.status})`);
    if (!lokRes.ok) throw new Error(`Logs(ok) failed (${lokRes.status})`);

    const s = (await sRes.json()) as Settings;
    const st = (await stRes.json()) as Stats;
    const l = (await lRes.json()) as { items: LogItem[] };
    const lok = (await lokRes.json()) as { items: LogItem[] };

    setSettings(s);
    setStats(st);
    setLatest(l.items[0] ?? null);
    setLatestOk(lok.items[0] ?? null);
  }

  useEffect(() => {
    refresh().catch((e) => setError(e instanceof Error ? e.message : "Failed to load dashboard"));
    const t = setInterval(() => {
      refresh().catch(() => null);
    }, 15_000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const intervalLabel = useMemo(() => (settings ? `${settings.pollIntervalMinutes}m` : "—"), [settings]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-text">Dashboard</h1>
          <div className="mt-1 text-sm text-muted">WAN IPv4 polling + history.</div>
        </div>
        <div className="flex items-center gap-2">
          <RunNowButton onRequested={() => refresh().catch(() => null)} />
          <button
            className="h-10 rounded-md border border-border bg-white/10 px-4 text-sm text-text hover:bg-white/15"
            onClick={() => refresh().catch((e) => setError(String(e)))}
          >
            Refresh
          </button>
        </div>
      </div>

      {error ? <div className="rounded-md border border-border bg-black/20 p-3 text-sm text-bad">{error}</div> : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Current IP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{latestOk?.ip ?? "—"}</div>
            <div className="mt-1 text-sm text-muted">
              {latestOk ? `Last ok: ${new Date(latestOk.ts).toLocaleString()}` : "No successful polls yet"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{latest ? (latest.ok ? "OK" : "Error") : "—"}</div>
            <div className="mt-1 text-sm text-muted">
              {latest
                ? `${new Date(latest.ts).toLocaleString()}${latest.error ? ` • ${latest.error}` : ""}`
                : "No polls yet"}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Interval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{intervalLabel}</div>
            <div className="mt-1 text-sm text-muted">Provider: {settings?.ipProvider ?? "—"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{settings ? (settings.enabled ? "Enabled" : "Disabled") : "—"}</div>
            <div className="mt-1 text-sm text-muted">Retention: {settings?.retentionDays ?? "—"} days</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Success vs Error (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <SuccessErrorChart data={stats?.hourly ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Response Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <LatencyChart data={stats?.hourly ?? []} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>IP Changes (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <IpChangesChart data={stats?.changesPerDay ?? []} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Last 10 Changes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              {!stats || stats.lastChanges.length === 0 ? (
                <div className="text-muted">No changes recorded.</div>
              ) : (
                stats.lastChanges.map((c) => (
                  <div key={`${c.ts}-${c.fromIp}-${c.toIp}`} className="rounded-md border border-border bg-black/15 p-3">
                    <div className="text-muted">{new Date(c.ts).toLocaleString()}</div>
                    <div className="mt-1 font-medium text-text">
                      {c.fromIp} → {c.toIp}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
