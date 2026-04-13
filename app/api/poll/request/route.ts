import { NextResponse, type NextRequest } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { unauthorized } = await requireApiAuth(req);
  if (unauthorized) return unauthorized;

  const reqRow = await prisma.pollRequest.create({ data: {} });
  return NextResponse.json({ ok: true, id: reqRow.id });
}

