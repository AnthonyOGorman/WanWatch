import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/session";
import { verifyAdminPassword } from "@/lib/auth";
import { rateLimitLogin } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  if (!process.env.ADMIN_PASSWORD || !process.env.COOKIE_SECRET) {
    return NextResponse.json(
      { error: "Server not configured (missing ADMIN_PASSWORD / COOKIE_SECRET)" },
      { status: 500 }
    );
  }

  const ipKey =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip")?.trim() ||
    "unknown";

  const limit = rateLimitLogin(`login:${ipKey}`);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many attempts. Try again soon." },
      { status: 429, headers: { "retry-after": String(Math.ceil((limit.retryAfterMs ?? 0) / 1000)) } }
    );
  }

  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = body?.password ?? "";
  if (!password) return NextResponse.json({ error: "Missing password" }, { status: 400 });

  if (!verifyAdminPassword(password)) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const session = await getSession();
  session.isLoggedIn = true;
  await session.save();
  return NextResponse.json({ ok: true });
}
