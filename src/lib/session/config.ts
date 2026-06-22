import { SessionOptions } from "iron-session";

export interface SessionData {
  isAuthenticated: boolean;
  userId?: string;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET!,
  cookieName: "heartbeat-session",
  ttl: 60 * 60 * 24 * 30, // 30 days
  cookieOptions: {
    secure: false, // Explicitly false for local testing (we can revert later if needed)
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};
