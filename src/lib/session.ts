import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";
import { getValidatedEnv } from "@/lib/env";

export type WanWatchSessionData = {
  isLoggedIn?: boolean;
};

function parseCookieSecureEnv(raw: string | undefined): boolean {
  if (!raw) return process.env.NODE_ENV === "production";
  const normalized = raw.trim().toLowerCase();
  return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
}

function getSessionOptions(): SessionOptions {
  const password =
    process.env.SKIP_ENV_VALIDATION === "1"
      ? (process.env.COOKIE_SECRET ?? "BUILD_TIME_PLACEHOLDER_SECRET_CHANGE_ME")
      : getValidatedEnv().COOKIE_SECRET;

  return {
    cookieName: "wanwatch_session",
    password,
    cookieOptions: {
      httpOnly: true,
      sameSite: "strict",
      secure: parseCookieSecureEnv(process.env.COOKIE_SECURE)
    }
  };
}

export async function getSession(): Promise<IronSession<WanWatchSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<WanWatchSessionData>(cookieStore, getSessionOptions());
}

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}
