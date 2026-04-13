import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { parseDateParam } from "@/lib/dateUtils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { unauthorized } = await requireApiAuth(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const okParam = searchParams.get("ok");
  const ok = okParam === null ? null : okParam === "true";

  const fromD = parseDateParam(from);
  const toD = parseDateParam(to);

  if ((from && !fromD) || (to && !toD)) {
    return NextResponse.json({ error: "Invalid date parameter" }, { status: 400 });
  }

  const rows = await prisma.wanIpLog.findMany({
    where: {
      ...(fromD || toD ? { ts: { ...(fromD ? { gte: fromD } : {}), ...(toD ? { lte: toD } : {}) } } : {}),
      ...(ok === null ? {} : { ok })
    },
    orderBy: { id: "desc" }
  });

  const body = JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      ts: r.ts.toISOString(),
      ip: r.ip,
      provider: r.provider,
      ok: r.ok,
      responseMs: r.responseMs,
      error: r.error,
      isp: r.isp,
      country: r.country
    })),
    null,
    2
  );

  return new NextResponse(body, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="wanlogger-logs.json"'
    }
  });
}
