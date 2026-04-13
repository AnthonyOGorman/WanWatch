import { getIronSession, type IronSession, type SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type WanWatchSessionData = {
  isLoggedIn?: boolean;
};

const sessionOptions: SessionOptions = {
  cookieName: "wanwatch_session",
  // Must not throw during `next build` when env vars may be missing.
  password: process.env.COOKIE_SECRET ?? "BUILD_TIME_PLACEHOLDER_SECRET_CHANGE_ME",
  cookieOptions: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production"
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
