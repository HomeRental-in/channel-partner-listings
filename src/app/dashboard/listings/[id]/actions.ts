"use server";
import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { listingUrl } from "@/lib/site";
import { applyListingInput, applyPhotosInput, claimProfile, publishListing } from "@/lib/listings";
import { SignupInput, type ActionResult, type ListingInput, type PhotosInput } from "@/components/editor/schema";

async function owned(id: string) {
  const user = await requireUser();
  const l = await db.listing.findFirst({ where: { id, userId: user.id }, select: { id: true, slug: true, status: true } });
  if (!l) throw new Error("Listing not found");
  return { user, l };
}

function fail(err: unknown): ActionResult<never> {
  if (err instanceof ZodError) return { ok: false, error: "Some fields are invalid: " + err.issues.slice(0, 3).map((i) => i.path.join(".") || "form").join(", ") };
  return { ok: false, error: err instanceof Error ? err.message : "Something went wrong" };
}

/** Details step save. Validates with zod; ownership enforced via `where: { id, userId }`. */
export async function updateListing(id: string, data: ListingInput): Promise<ActionResult<{ quality: { score: number; hints: string[] } }>> {
  try {
    await owned(id);
    const quality = await applyListingInput(id, data);
    revalidatePath(`/dashboard/listings/${id}`);
    return { ok: true, data: { quality } };
  } catch (err) {
    return fail(err);
  }
}

/** Photos step save (order, cover, room tags, video). */
export async function savePhotos(id: string, data: PhotosInput): Promise<ActionResult<{ quality: { score: number; hints: string[] } }>> {
  try {
    await owned(id);
    const quality = await applyPhotosInput(id, data);
    revalidatePath(`/dashboard/listings/${id}`);
    return { ok: true, data: { quality } };
  } catch (err) {
    return fail(err);
  }
}

/** Live / Sold / Rented toggle. */
export async function setListingStatus(id: string, status: "LIVE" | "SOLD" | "RENTED"): Promise<ActionResult> {
  try {
    const { l } = await owned(id);
    if (status === "LIVE" && l.status === "DRAFT") await publishListing(id);
    else await db.listing.update({ where: { id }, data: { status } });
    revalidatePath(`/dashboard/listings/${id}`);
    revalidatePath("/dashboard/listings");
    return { ok: true, data: undefined };
  } catch (err) {
    return fail(err);
  }
}

/** Publish from the Done step. When the user has no username yet, `signup` must carry name + username. */
export async function publishFromDashboard(id: string, signup?: SignupInput): Promise<ActionResult<{ url: string }>> {
  try {
    const { user, l } = await owned(id);
    let username = user.username;
    if (!username) {
      if (!signup) return { ok: false, error: "Please choose a name and username first" };
      const parsed = SignupInput.parse(signup);
      const updated = await claimProfile(user.id, parsed);
      username = updated.username;
    }
    await publishListing(id);
    revalidatePath(`/dashboard/listings/${id}`);
    revalidatePath("/dashboard/listings");
    return { ok: true, data: { url: listingUrl(username, l.slug) } };
  } catch (err) {
    return fail(err);
  }
}
