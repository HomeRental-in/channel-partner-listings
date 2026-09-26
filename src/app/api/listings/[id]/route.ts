import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { applyListingInput, toListingInput } from "@/lib/listings";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/listings/[id] — the owner's listing in editor (`ListingInput`) shape plus photos/status. */
export async function GET(_req: NextRequest, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  const l = await db.listing.findFirst({ where: { id, userId: user.id }, include: { documents: true, photos: { orderBy: { order: "asc" } } } });
  if (!l) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ id: l.id, slug: l.slug, status: l.status, qualityScore: l.qualityScore, videoUrl: l.videoUrl, photos: l.photos, ...toListingInput(l) });
}

/** PATCH /api/listings/[id] — body is a full `ListingInput` (client-side saves / autosave). */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  const { id } = await ctx.params;
  const owned = await db.listing.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!owned) return NextResponse.json({ error: "Not found" }, { status: 404 });
  try {
    const quality = await applyListingInput(id, await req.json());
    return NextResponse.json({ ok: true, quality });
  } catch (err) {
    if (err instanceof ZodError) return NextResponse.json({ error: "Invalid data", issues: err.issues }, { status: 400 });
    console.error("PATCH listing failed", err);
    return NextResponse.json({ error: "Could not save" }, { status: 500 });
  }
}
