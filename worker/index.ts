import { prisma } from "../src/lib/db";
import { ensureSettingsRow } from "../src/lib/settings";
import { fetchWanIpv4, type WanIpProvider } from "../src/lib/wanIp";
import { mkdir } from "node:fs/promises";
import { randomUUID } from "node:crypto";

async function ensureDataDir() {
  await mkdir("data", { recursive: true }).catch(() => null);
}

async function pollOnce(reason: "interval" | "manual") {
  const settings = await ensureSettingsRow();
  const provider = settings.ipProvider as WanIpProvider;

  console.log(`[worker] poll start (${reason}) provider=${provider}`);
  const result = await fetchWanIpv4(provider, { timeoutMs: 5000 });
  if (result.ok) console.log(`[worker] poll ok ip=${result.ip} ms=${result.responseMs}`);
  else console.log(`[worker] poll err ms=${result.responseMs ?? "?"} error=${result.error}`);

  await prisma.wanIpLog.create({
    data: {
      ip: result.ok ? result.ip : null,
      provider,
      ok: result.ok,
      responseMs: result.responseMs,
      error: result.ok ? null : `${reason}: ${result.error}`
    }
  });
}

async function cleanupRetention() {
  const settings = await ensureSettingsRow();
  const cutoff = new Date(Date.now() - settings.retentionDays * 24 * 60 * 60 * 1000);
  await prisma.wanIpLog.deleteMany({ where: { ts: { lt: cutoff } } });
}

async function handlePollRequests(workerId: string, maxToHandle: number) {
  for (let i = 0; i < maxToHandle; i++) {
    const req = await prisma.pollRequest.findFirst({ where: { handledAt: null }, orderBy: { id: "asc" } });
    if (!req) return;

    // Atomically claim the row; if another worker already claimed it, count will be 0 — skip.
    const handledAt = new Date();
    const { count } = await prisma.pollRequest.updateMany({
      where: { id: req.id, handledAt: null },
      data: { handledAt, handledBy: workerId }
    });
    if (count === 0) continue;

    console.log(`[worker] handling poll request id=${req.id}`);
    await pollOnce("manual");
  }
}

async function sleepWithEarlyWake(totalMs: number) {
  const stepMs = 5000;
  const end = Date.now() + totalMs;
  while (Date.now() < end) {
    const req = await prisma.pollRequest.findFirst({ where: { handledAt: null }, select: { id: true } });
    if (req) {
      console.log(`[worker] wake early for poll request id=${req.id}`);
      return;
    }
    const remaining = end - Date.now();
    await new Promise((r) => setTimeout(r, Math.min(stepMs, remaining)));
  }
}

async function main() {
  await ensureDataDir();
  const workerId = randomUUID();
  console.log(`[worker] starting id=${workerId} cwd=${process.cwd()} DATABASE_URL=${process.env.DATABASE_URL ?? "(unset)"}`);

  // Warm connection + ensure defaults.
  await ensureSettingsRow();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const settings = await ensureSettingsRow();
    if (settings.enabled) {
      await pollOnce("interval");
    }
    await handlePollRequests(workerId, 25);
    await cleanupRetention();

    const intervalMs = Math.max(60_000, settings.pollIntervalSeconds * 1000);
    await sleepWithEarlyWake(intervalMs);
  }
}

main()
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect().catch(() => null);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect().catch(() => null);
  });
