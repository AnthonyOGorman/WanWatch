import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { prisma } from "@/lib/db";

export async function POST() {
  const { unauthorized } = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const reqRow = await prisma.pollRequest.create({ data: {} });
  return NextResponse.json({ ok: true, id: reqRow.id });
}

