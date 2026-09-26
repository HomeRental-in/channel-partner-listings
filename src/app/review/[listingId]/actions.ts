"use server";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { createSession, verifyReviewToken } from "@/lib/auth";
import { listingUrl } from "@/lib/site";
import { applyListingInput, applyPhotosInput, claimProfile, publishListing } from "@/lib/listings";
import { SignupInput, type ActionResult, type ListingInput, type PhotosInput } from "@/components/editor/schema";

/** Review page actions — authorised by the signed review token, not a session. */
async function authorised(listingId: string, token: string) {
  if (!(await verifyReviewToken(token, listingId))) throw new Error("This review link is invalid or has expired");
  const l = await db.listing.findUnique({ where: { id: listingId }, include: { user: true } });
  if (!l) throw new Error("Listing not found");
  return l;
}
function fail(err: unknown): ActionResult<never> {
  if (err instanceof ZodError) return { ok: false, error: "Some fields are invalid: " + err.issues.slice(0, 3).map((i) => i.path.join(".") || "form").join(", ") };
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong" };
}

export async function reviewSave(listingId: string, token: string, details: ListingInput, photos: PhotosInput): Promise<ActionResult<{ quality: { score: number; hints: string[] } }>> {
  try {
    await authorised(listingId, token);
    await applyPhotosInput(listingId, photos);
    const quality = await applyListingInput(listingId, details);
    return { ok: true, data: { quality } };
  } catch (err) {
    return fail(err);
  }
}

/**
 * Publish from the review page. Completes signup (name + username) when the owner has none,
 * starts a session for the owner (we are in a Server Action, so the cookie can be set), sets LIVE.
 */
export async function reviewPublish(listingId: string, token: string, signup?: SignupInput): Promise<ActionResult<{ url: string }>> {
  try {
    const l = await authorised(listingId, token);
    let username = l.user.username;
    if (!username || !l.user.name) {
      if (!signup) return { ok: false, error: "Please add your name and username to publish" };
      const parsed = SignupInput.parse(signup);
      const updated = await claimProfile(l.userId, { ...parsed, username: username ?? parsed.username });
      username = updated.username;
    }
    await createSession(l.userId);
    await publishListing(listingId);
    return { ok: true, data: { url: listingUrl(username, l.slug) } };
  } catch (err) {
    return fail(err);
  }
}
