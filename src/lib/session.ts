import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type WanWatchSessionData = {
  isLoggedIn?: boolean;
};

function parseCookieSecureEnv(raw: string | undefined): boolean {
  if (!raw) return process.env.NODE_ENV === "production";
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

const sessionOptions: SessionOptions = {
  cookieName: "wanwatch_session",
  // Must not throw during `next build` when env vars may be missing.
  password: process.env.COOKIE_SECRET ?? "BUILD_TIME_PLACEHOLDER_SECRET_CHANGE_ME",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: parseCookieSecureEnv(process.env.COOKIE_SECURE)
  }
};

export async function getSession(): Promise<IronSession<WanWatchSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<WanWatchSessionData>(cookieStore, sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}
