import { cookies } from "next/headers";
import { z } from "zod";
import {
  SessionDataSchema,
  UserSchema,
  type SessionData,
  type User,
} from "@/features/auth/types/auth.types";

const SESSION_COOKIE_NAME = "admin_session";
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export function createSession(user: User): string {
  const validatedUser = UserSchema.parse(user);
  const now = Date.now();

  const sessionData: SessionData = {
    userId: validatedUser.id,
    username: validatedUser.username,
    createdAt: now,
    expiresAt: now + SESSION_DURATION,
  };

  const token = Buffer.from(JSON.stringify(sessionData)).toString("base64");
  return token;
}

export function validateSession(token: string): SessionData | null {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const parsed = JSON.parse(decoded);
    const sessionData = SessionDataSchema.parse(parsed);

    if (Date.now() > sessionData.expiresAt) {
      return null;
    }

    return sessionData;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  return validateSession(sessionCookie.value);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    username: session.username,
  };
}
