import { cookies } from "next/headers";
import { nanoid } from "nanoid";
import { db } from "./db";
import type { User } from "@prisma/client";

export const SESSION_COOKIE = "cd_session";
const SESSION_DAYS = 90;

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^\d]/g, "");
  if (digits.length === 10) return "+91" + digits; // default country India
  if (digits.length === 12 && digits.startsWith("91")) return "+" + digits;
  if (digits.length >= 11 && digits.length <= 15) return "+" + digits;
  return null;
}

/** Issue an OTP for a phone. In dev with DEV_OTP set, the code is fixed. Returns the code for the sender. */
export async function issueOtp(phone: string): Promise<string> {
  const code = process.env.DEV_OTP || String(Math.floor(100000 + Math.random() * 900000));
  await db.authOtp.create({ data: { phone, code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) } });
  return code;
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = await db.authOtp.findFirst({
    where: { phone, code, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  if (!otp) return false;
  await db.authOtp.update({ where: { id: otp.id }, data: { usedAt: new Date() } });
  return true;
}

export async function findOrCreateUserByPhone(phone: string): Promise<User> {
  return db.user.upsert({ where: { phone }, update: {}, create: { phone, whatsappNumber: phone } });
}

/** Create a DB session and set the cookie. Only call from a Route Handler or Server Action. */
export async function createSession(userId: string) {
  const token = nanoid(40);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86400 * 1000);
  await db.session.create({ data: { token, userId, expiresAt } });
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    path: "/",
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await db.session.deleteMany({ where: { token } });
  jar.delete(SESSION_COOKIE);
}

/** Current user or null. Safe in Server Components. */
export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await db.session.findUnique({ where: { token }, include: { user: true } });
  if (!session || session.expiresAt < new Date()) return null;
  return session.user;
}

/** Throws a redirect to /login when unauthenticated. Use in dashboard pages, actions and API routes. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    const { redirect } = await import("next/navigation");
    redirect("/login");
  }
  return user!;
}

/** Signed one-time review tokens for /review/<listingId>?t=... (no login needed). */
export async function signReviewToken(listingId: string): Promise<string> {
  const { SignJWT } = await import("jose");
  const secret = new TextEncoder().encode(process.env.APP_SECRET ?? "dev-secret");
  return new SignJWT({ lid: listingId }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(secret);
}
export async function verifyReviewToken(token: string, listingId: string): Promise<boolean> {
  try {
    const { jwtVerify } = await import("jose");
    const secret = new TextEncoder().encode(process.env.APP_SECRET ?? "dev-secret");
    const { payload } = await jwtVerify(token, secret);
    return payload.lid === listingId;
  } catch {
    return false;
  }
}
