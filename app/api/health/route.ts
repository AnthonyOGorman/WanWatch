import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureSettingsRow } from "@/lib/settings";

export const dynamic = "force-dynamic";

export async function GET() {
  const [settings, lastLog] = await Promise.all([
    ensureSettingsRow(),
    prisma.wanIpLog.findFirst({ orderBy: { id: "desc" }, select: { ts: true, ok: true } })
  ]);

  const lastPollAt = lastLog?.ts ?? null;
  const lastPollAgeSeconds = lastPollAt ? Math.floor((Date.now() - lastPollAt.getTime()) / 1000) : null;
  const workerAlive =
    lastPollAgeSeconds !== null && lastPollAgeSeconds < settings.pollIntervalSeconds * 2 + 60;

  return NextResponse.json({
    ok: true,
    lastPollAt: lastPollAt?.toISOString() ?? null,
    lastPollAgeSeconds,
    workerAlive
  });
}
