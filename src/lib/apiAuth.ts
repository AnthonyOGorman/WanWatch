import { NextResponse, type NextRequest } from "next/server";
import { requireSession } from "@/lib/session";
import { getValidatedEnv } from "@/lib/env";

export async function requireApiAuth(req?: NextRequest) {
  // Bearer token (API key) auth — checked before session so scripts don't need cookies.
  const apiKey = getValidatedEnv().API_KEY;
  if (apiKey && req) {
    const auth = req.headers.get("authorization") ?? "";
    if (auth.startsWith("Bearer ") && auth.slice(7) === apiKey) {
      return { session: null, unauthorized: null };
    }
  }

  const session = await requireSession();
  if (!session) {
    return { session: null, unauthorized: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { session, unauthorized: null };
}
