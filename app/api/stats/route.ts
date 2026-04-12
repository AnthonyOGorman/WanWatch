import { NextResponse } from "next/server";
import { requireApiAuth } from "@/lib/apiAuth";
import { getDashboardStats } from "@/lib/stats";

export const dynamic = "force-dynamic";

export async function GET() {
  const { unauthorized } = await requireApiAuth();
  if (unauthorized) return unauthorized;

  const stats = await getDashboardStats();
  return NextResponse.json(stats);
}
