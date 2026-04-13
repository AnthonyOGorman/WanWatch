import { prisma } from "@/lib/db";
import { percentile } from "@/lib/mathUtils";

type Bucket = {
  startMs: number;
  ok: number;
  err: number;
  latencies: number[];
};

function floorToHourMs(ms: number) {
  const d = new Date(ms);
  d.setMinutes(0, 0, 0);
  return d.getTime();
}

function floorToDayMs(ms: number) {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}


export async function getDashboardStats() {
  const now = Date.now();

  const hourBuckets = buildBuckets(now - 24 * 60 * 60 * 1000, now, 60 * 60 * 1000, floorToHourMs);
  const dayBuckets = buildBuckets(now - 30 * 24 * 60 * 60 * 1000, now, 24 * 60 * 60 * 1000, floorToDayMs);

  const from = new Date(Math.min(hourBuckets[0]!.startMs, dayBuckets[0]!.startMs));
  const logs = await prisma.wanIpLog.findMany({
    where: { ts: { gte: from } },
    orderBy: { id: "asc" },
    select: { ts: true, ok: true, responseMs: true, ip: true }
  });

  for (const l of logs) {
    const ms = l.ts.getTime();
    addToBuckets(hourBuckets, ms, l.ok, l.responseMs);
    addToBuckets(dayBuckets, ms, l.ok, l.responseMs);
  }

  const changes = await getRecentIpChanges(10);

  return {
    hourly: bucketsToSeries(hourBuckets),
    daily: bucketsToSeries(dayBuckets),
    changesPerDay: await getIpChangesPerDay(30),
    lastChanges: changes
  };
}

function buildBuckets(fromMs: number, toMs: number, stepMs: number, floorFn: (ms: number) => number) {
  const buckets: Bucket[] = [];
  const start = floorFn(fromMs);
  for (let t = start; t <= toMs; t += stepMs) {
    buckets.push({ startMs: t, ok: 0, err: 0, latencies: [] });
  }
  return buckets;
}

function addToBuckets(buckets: Bucket[], ms: number, ok: boolean, responseMs: number | null) {
  for (let i = buckets.length - 1; i >= 0; i--) {
    const b = buckets[i]!;
    const nextStart = i + 1 < buckets.length ? buckets[i + 1]!.startMs : Number.POSITIVE_INFINITY;
    if (ms >= b.startMs && ms < nextStart) {
      if (ok) b.ok += 1;
      else b.err += 1;
      if (ok && typeof responseMs === "number") b.latencies.push(responseMs);
      break;
    }
  }
}

function bucketsToSeries(buckets: Bucket[]) {
  return buckets.map((b) => {
    const lat = [...b.latencies].sort((a, c) => a - c);
    return {
      bucketStart: new Date(b.startMs).toISOString(),
      ok: b.ok,
      err: b.err,
      p50: percentile(lat, 0.5),
      p95: percentile(lat, 0.95)
    };
  });
}

async function getRecentIpChanges(limit: number) {
  const rows = await prisma.wanIpLog.findMany({
    where: { ok: true, ip: { not: null } },
    orderBy: { id: "desc" },
    take: 1000,
    select: { ts: true, ip: true }
  });

  const changes: Array<{ ts: string; fromIp: string; toIp: string }> = [];
  let lastIp: string | null = null;
  for (const row of rows) {
    const ip = row.ip!;
    if (lastIp === null) {
      lastIp = ip;
      continue;
    }
    if (ip !== lastIp) {
      changes.push({ ts: row.ts.toISOString(), fromIp: ip, toIp: lastIp });
      if (changes.length >= limit) break;
      lastIp = ip;
    }
  }
  return changes;
}

async function getIpChangesPerDay(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const rows = await prisma.wanIpLog.findMany({
    where: { ok: true, ip: { not: null }, ts: { gte: since } },
    orderBy: { id: "asc" },
    select: { ts: true, ip: true }
  });

  const byDay = new Map<string, number>();
  let lastIp: string | null = null;
  for (const row of rows) {
    const ip = row.ip!;
    if (lastIp === null) {
      lastIp = ip;
      continue;
    }
    if (ip !== lastIp) {
      const dayKey = new Date(floorToDayMs(row.ts.getTime())).toISOString().slice(0, 10);
      byDay.set(dayKey, (byDay.get(dayKey) ?? 0) + 1);
      lastIp = ip;
    }
  }

  const out: Array<{ day: string; changes: number }> = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(floorToDayMs(Date.now() - i * 24 * 60 * 60 * 1000));
    const key = d.toISOString().slice(0, 10);
    out.push({ day: key, changes: byDay.get(key) ?? 0 });
  }
  return out;
}

