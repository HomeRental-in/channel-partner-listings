import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { addProjectToMyListings } from "@/lib/projects";

export const dynamic = "force-dynamic";

/** POST /api/projects/[id]/add-to-listings — copy the template into a new DRAFT listing; returns { listingId, redirect }. */
export async function POST(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const { id } = await ctx.params;
  try {
    const listingId = await addProjectToMyListings(user.id, id);
    return NextResponse.json({ listingId, redirect: `/dashboard/listings/${listingId}?step=photos` }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Could not add the project" }, { status: 404 });
  }
}
