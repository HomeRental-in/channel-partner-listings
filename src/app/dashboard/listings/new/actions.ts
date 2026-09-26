"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { extractListing } from "@/lib/ai";
import { absoluteUrl, readStored } from "@/lib/storage";
import { createListingFromExtraction } from "@/lib/listings";
import { PhotoInputSchema, type ActionResult } from "@/components/editor/schema";

const Input = z.object({
  text: z.string().trim().max(8000),
  photos: z.array(PhotoInputSchema).max(20),
  videoUrl: z.string().max(1000).nullable().optional(),
});
export type NewListingInput = z.infer<typeof Input>;

/**
 * Web intake: runs AI extraction over the text + uploaded photos, creates the DRAFT and redirects to the editor.
 * Local uploads are sent as base64 buffers (the API cannot fetch localhost); remote URLs are sent as-is.
 */
export async function createFromWeb(raw: NewListingInput): Promise<ActionResult<never>> {
  const user = await requireUser();
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Please check the form and try again" };
  const { text, photos, videoUrl } = parsed.data;
  if (!text && photos.length === 0) return { ok: false, error: "Add a few photos or describe the property first" };

  const imageUrls: string[] = [];
  const imageBuffers: { data: Buffer; mediaType: "image/webp" }[] = [];
  for (const p of photos.slice(0, 8)) {
    if (p.url.startsWith("/uploads/")) {
      try {
        imageBuffers.push({ data: await readStored(p.url), mediaType: "image/webp" });
      } catch {}
    } else imageUrls.push(absoluteUrl(p.url));
  }

  let listingId: string;
  try {
    const extracted = await extractListing({ text, imageUrls, imageBuffers });
    const listing = await createListingFromExtraction(user.id, extracted, photos, text, "WEB", { videoUrl: videoUrl ?? null });
    listingId = listing.id;
  } catch (err) {
    console.error("web intake failed", err);
    return { ok: false, error: "AI could not read the details. Please try again in a moment." };
  }
  redirect(`/dashboard/listings/${listingId}?step=details`);
}
