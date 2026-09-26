import { NextRequest, NextResponse } from "next/server";
import { issueOtp, normalizePhone } from "@/lib/auth";
import { getProvider } from "@/lib/whatsapp/provider";
import { BRAND } from "@/lib/site";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

/** POST { phone } → sends an OTP via the WhatsApp provider. */
export async function POST(req: NextRequest) {
  let body: { phone?: string } = {};
  try {
    body = await req.json();
  } catch {}
  const phone = normalizePhone(String(body.phone ?? ""));
  if (!phone) return NextResponse.json({ ok: false, error: "Enter a valid mobile number." }, { status: 400 });

  // Light rate-limit: max 5 codes per phone per 10 minutes.
  const recent = await db.authOtp.count({ where: { phone, createdAt: { gt: new Date(Date.now() - 10 * 60 * 1000) } } });
  if (recent >= 5) return NextResponse.json({ ok: false, error: "Too many attempts. Try again in a few minutes." }, { status: 429 });

  const code = await issueOtp(phone);
  try {
    await getProvider().sendText(phone, `${code} is your ${BRAND} login code. It expires in 10 minutes.`);
  } catch (e) {
    console.error("[auth/otp] send failed", e);
    if (!process.env.DEV_OTP) return NextResponse.json({ ok: false, error: "Could not send the code. Please try again." }, { status: 502 });
  }
  return NextResponse.json({ ok: true, phone, devHint: process.env.DEV_OTP ? `Dev OTP: ${process.env.DEV_OTP}` : null });
}
