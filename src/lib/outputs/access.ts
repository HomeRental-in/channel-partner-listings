import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const PUBLIC_STATUSES = ["LIVE", "SOLD", "RENTED"] as const;

/**
 * Access rule for listing outputs (brochure, story image/video): public when the listing is LIVE/SOLD/RENTED,
 * otherwise only the owner may fetch it. Returns the minimal listing row (for cache keys) or a reason.
 */
export async function resolveOutputAccess(id: string) {
  const row = await db.listing.findUnique({ where: { id }, select: { id: true, userId: true, status: true, updatedAt: true, slug: true } });
  if (!row) return { ok: false as const, status: 404 as const, reason: "Listing not found" };
  const isPublic = (PUBLIC_STATUSES as readonly string[]).includes(row.status);
  let isOwner = false;
  if (!isPublic) {
    const user = await getCurrentUser();
    isOwner = !!user && user.id === row.userId;
    if (!isOwner) return { ok: false as const, status: 403 as const, reason: "This listing is not public yet" };
  } else {
    const user = await getCurrentUser().catch(() => null);
    isOwner = !!user && user.id === row.userId;
  }
  return { ok: true as const, listing: row, isOwner };
}
