import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";

export async function requireApiAuth() {
  const session = await requireSession();
  if (!session) {
    return { session: null, unauthorized: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { session, unauthorized: null };
}

