import { NextRequest, NextResponse } from "next/server";
import { createSession, findOrCreateUserByPhone, normalizePhone, verifyOtp } from "@/lib/auth";

export const dynamic = "force-dynamic";

function safeNext(next: unknown): string {
  const s = typeof next === "string" ? next : "";
  // Only allow same-origin relative paths.
  return s.startsWith("/") && !s.startsWith("//") ? s : "/dashboard";
}

/** POST { phone, code, next? } → verifies the OTP, creates a session and returns { redirect }. */
export async function POST(req: NextRequest) {
  let body: { phone?: string; code?: string; next?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const phone = normalizePhone(String(body.phone ?? ""));
  const code = String(body.code ?? "").replace(/\D/g, "");
  if (!phone || code.length !== 6) return NextResponse.json({ ok: false, error: "Enter the 6-digit code." }, { status: 400 });

  const ok = await verifyOtp(phone, code);
  if (!ok) return NextResponse.json({ ok: false, error: "That code is wrong or has expired." }, { status: 401 });

  const user = await findOrCreateUserByPhone(phone);
  await createSession(user.id);
  return NextResponse.json({ ok: true, redirect: safeNext(body.next), isNew: !user.name });
}
