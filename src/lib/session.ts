import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type WanLoggerSessionData = {
  isLoggedIn?: boolean;
};

const sessionOptions: SessionOptions = {
  cookieName: "wanlogger_session",
  // Must not throw during `next build` when env vars may be missing.
  password: process.env.COOKIE_SECRET ?? "BUILD_TIME_PLACEHOLDER_SECRET_CHANGE_ME",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
  }
};

export async function getSession(): Promise<IronSession<WanLoggerSessionData>> {
  const cookieStore = await cookies();
  return getIronSession<WanLoggerSessionData>(cookieStore, sessionOptions);
}

export async function requireSession() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return null;
  }
  return session;
}
