import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  if (/[",\n]/.test(s)) return `"${s.replaceAll('"', '""')}"`;
  return s;
}

export async function GET(req: NextRequest) {
  const { unauthorized } = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const okParam = searchParams.get("ok");
  const ok = okParam === null ? null : okParam === "true";

  function parseDateParam(value: string | null) {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d;
  }

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

  const header = ["ts", "ip", "ok", "responseMs", "provider", "error"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push(
      [
        csvCell(r.ts.toISOString()),
        csvCell(r.ip ?? ""),
        csvCell(r.ok),
        csvCell(r.responseMs ?? ""),
        csvCell(r.provider),
        csvCell(r.error ?? "")
      ].join(",")
    );
  }

  return new NextResponse(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="wanlogger-logs.csv"'
    }
  });
}
