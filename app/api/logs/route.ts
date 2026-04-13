import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";
import { parseDateParam } from "@/lib/dateUtils";
import { access, stat } from "node:fs/promises";
import path from "node:path";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { unauthorized } = await requireApiAuth(req);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(req.url);
  const debug = searchParams.get("debug") === "1";
  const from = parseDateParam(searchParams.get("from"));
  const to = parseDateParam(searchParams.get("to"));
  const okParam = searchParams.get("ok");
  const ok = okParam === null ? null : okParam === "true";
  const cursorId = Number(searchParams.get("cursor") ?? "0") || null;

  const limitRaw = Number(searchParams.get("limit") ?? "100");
  const limit = Math.min(500, Math.max(1, Number.isFinite(limitRaw) ? limitRaw : 100));

  const where = {
    ...(from || to ? { ts: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    ...(ok === null ? {} : { ok })
  } as const;

  const rows = await prisma.wanIpLog.findMany({
    where,
    orderBy: { id: "desc" },
    take: limit + 1,
    ...(cursorId ? { cursor: { id: cursorId }, skip: 1 } : {})
  });

  const hasMore = rows.length > limit;
  const page = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? page[page.length - 1]!.id : null;

  const base = {
    items: page.map((r) => ({
      id: r.id,
      ts: r.ts.toISOString(),
      ip: r.ip,
      provider: r.provider,
      ok: r.ok,
      responseMs: r.responseMs,
      error: r.error
    })),
    nextCursor
  };

  if (!debug) return NextResponse.json(base);

  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "debug not available in production" }, { status: 403 });
  }

  const databaseUrl = process.env.DATABASE_URL ?? "(unset)";
  const cwd = process.cwd();
  const sqlitePath = (() => {
    if (!databaseUrl.startsWith("file:")) return null;
    const raw = databaseUrl.slice("file:".length);
    if (raw.startsWith("/")) return raw;
    return path.join(cwd, raw);
  })();

  const file = sqlitePath ?? path.join(cwd, "data", "wanlogger.db");
  let fileExists = false;
  let fileSize = 0;
  try {
    await access(file);
    const s = await stat(file);
    fileExists = true;
    fileSize = s.size;
  } catch {
    // ignore
  }

  const count = await prisma.wanIpLog.count();
  return NextResponse.json({ ...base, debug: { cwd, databaseUrl, sqlitePath: file, fileExists, fileSize, count } });
}
