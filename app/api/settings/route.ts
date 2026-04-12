import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { ensureSettingsRow } from "@/lib/settings";
import { prisma } from "@/lib/db";
import { settingsInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const { unauthorized } = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const settings = await ensureSettingsRow();
  return NextResponse.json({
    pollIntervalMinutes: Math.round(settings.pollIntervalSeconds / 60),
    retentionDays: settings.retentionDays,
    enabled: settings.enabled,
    ipProvider: settings.ipProvider
  });
}

export async function PUT(req: NextRequest) {
  const { unauthorized } = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const raw = (await req.json().catch(() => null)) as unknown;
  const parsed = settingsInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings", details: parsed.error.flatten() }, { status: 400 });
  }

  await ensureSettingsRow();
  const next = parsed.data;
  const updated = await prisma.settings.update({
    where: { id: 1 },
    data: {
      pollIntervalSeconds: next.pollIntervalMinutes * 60,
      retentionDays: next.retentionDays,
      enabled: next.enabled,
      ipProvider: next.ipProvider
    }
  });

  return NextResponse.json({
    pollIntervalMinutes: Math.round(updated.pollIntervalSeconds / 60),
    retentionDays: updated.retentionDays,
    enabled: updated.enabled,
    ipProvider: updated.ipProvider
  });
}
