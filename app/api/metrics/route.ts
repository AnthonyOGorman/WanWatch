import { prisma } from "@/lib/db";
import { ensureSettingsRow } from "@/lib/settings";
import { percentile } from "@/lib/mathUtils";

export const dynamic = "force-dynamic";

function prom(name: string, help: string, type: string, lines: string[]) {
  return [`# HELP ${name} ${help}`, `# TYPE ${name} ${type}`, ...lines, ""].join("\n");
}

export async function GET() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [settings, lastLog, totals, recent] = await Promise.all([
    ensureSettingsRow(),
    prisma.wanIpLog.findFirst({ orderBy: { id: "desc" }, select: { ts: true } }),
    prisma.wanIpLog.groupBy({ by: ["ok"], _count: { _all: true } }),
    prisma.wanIpLog.findMany({
      where: { ts: { gte: since24h }, ok: true, responseMs: { not: null } },
      select: { responseMs: true, ip: true },
      orderBy: { id: "asc" }
    })
  ]);

  const okCount = totals.find((t) => t.ok)?._count._all ?? 0;
  const errCount = totals.find((t) => !t.ok)?._count._all ?? 0;

  // IP changes in last 24h
  let ipChanges = 0;
  let lastIp: string | null = null;
  for (const r of recent) {
    if (r.ip && lastIp !== null && r.ip !== lastIp) ipChanges++;
    if (r.ip) lastIp = r.ip;
  }

  const latencies = recent
    .map((r) => r.responseMs!)
    .filter((v) => typeof v === "number")
    .sort((a, b) => a - b);

  const p50 = percentile(latencies, 0.5);
  const p95 = percentile(latencies, 0.95);

  const lastPollAgeSeconds = lastLog
    ? Math.floor((Date.now() - lastLog.ts.getTime()) / 1000)
    : null;

  const workerAlive =
    lastPollAgeSeconds !== null && lastPollAgeSeconds < settings.pollIntervalSeconds * 2 + 60;

  const out = [
    prom(
      "wanlogger_polls_total",
      "Total number of polls since start",
      "counter",
      [
        `wanlogger_polls_total{result="ok"} ${okCount}`,
        `wanlogger_polls_total{result="error"} ${errCount}`
      ]
    ),
    prom(
      "wanlogger_ip_changes_total",
      "Number of IP changes detected in the last 24 hours",
      "gauge",
      [`wanlogger_ip_changes_total ${ipChanges}`]
    ),
    prom(
      "wanlogger_last_poll_age_seconds",
      "Seconds since the last poll attempt",
      "gauge",
      [`wanlogger_last_poll_age_seconds ${lastPollAgeSeconds ?? "NaN"}`]
    ),
    prom(
      "wanlogger_worker_alive",
      "1 if the worker polled recently, 0 otherwise",
      "gauge",
      [`wanlogger_worker_alive ${workerAlive ? 1 : 0}`]
    ),
    prom(
      "wanlogger_response_ms",
      "Poll response time percentiles over the last 24 hours",
      "gauge",
      [
        `wanlogger_response_ms{quantile="0.5"} ${p50 ?? "NaN"}`,
        `wanlogger_response_ms{quantile="0.95"} ${p95 ?? "NaN"}`
      ]
    )
  ].join("\n");

  return new Response(out, {
    headers: { "content-type": "text/plain; version=0.0.4; charset=utf-8" }
  });
}
