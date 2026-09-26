import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, verifyReviewToken } from "@/lib/auth";
import { rewriteDescription } from "@/lib/ai";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/ai/rewrite — body `{ details: {...} }` (the editor's current structured fields).
 * Auth: session, or review token via `?t=&listingId=`. Returns { description, highlights }.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    const t = req.nextUrl.searchParams.get("t");
    const listingId = req.nextUrl.searchParams.get("listingId");
    if (!(t && listingId && (await verifyReviewToken(t, listingId)))) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
  let body: { details?: Record<string, unknown> };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Expected JSON" }, { status: 400 });
  }
  const details = body.details && typeof body.details === "object" ? body.details : null;
  if (!details) return NextResponse.json({ error: "Missing details" }, { status: 400 });
  // Strip bulky / irrelevant keys before sending to the model.
  const { documents, brokerCardOverride, theme, ...rest } = details as Record<string, unknown>;
  void documents; void brokerCardOverride; void theme;
  try {
    const out = await rewriteDescription(rest);
    return NextResponse.json(out);
  } catch (err) {
    console.error("rewrite failed", err);
    return NextResponse.json({ error: "AI rewrite failed. Please try again." }, { status: 502 });
  }
}
