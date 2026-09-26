"use server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { uniqueSlug } from "@/lib/format";
import type { ActionResult } from "@/app/dashboard/actions";

const Input = z.object({
  title: z.string().trim().min(2, "Give the collection a title.").max(80, "Title is too long."),
  description: z.string().trim().max(300, "Description is too long.").optional().nullable(),
  listingIds: z.array(z.string()).max(50, "Up to 50 listings per collection."),
});
export type CollectionInput = z.infer<typeof Input>;

/** Keep only listings the user owns, in the order given. */
async function ownedIds(userId: string, ids: string[]) {
  const rows = await db.listing.findMany({ where: { id: { in: ids }, userId }, select: { id: true } });
  const set = new Set(rows.map((r) => r.id));
  return ids.filter((id) => set.has(id));
}

export async function createCollection(raw: CollectionInput): Promise<ActionResult<{ id: string; slug: string }>> {
  const user = await requireUser();
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const ids = await ownedIds(user.id, parsed.data.listingIds);
  const c = await db.collection.create({
    data: {
      userId: user.id,
      slug: uniqueSlug(parsed.data.title),
      title: parsed.data.title,
      description: parsed.data.description || null,
      listings: { create: ids.map((listingId, order) => ({ listingId, order })) },
    },
  });
  revalidatePath("/dashboard/collections");
  return { ok: true, data: { id: c.id, slug: c.slug } };
}

export async function updateCollection(id: string, raw: CollectionInput): Promise<ActionResult> {
  const user = await requireUser();
  const parsed = Input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  const existing = await db.collection.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return { ok: false, error: "Collection not found." };
  const ids = await ownedIds(user.id, parsed.data.listingIds);
  await db.$transaction([
    db.collectionListing.deleteMany({ where: { collectionId: id } }),
    db.collection.update({
      where: { id },
      data: { title: parsed.data.title, description: parsed.data.description || null, listings: { create: ids.map((listingId, order) => ({ listingId, order })) } },
    }),
  ]);
  revalidatePath("/dashboard/collections");
  return { ok: true };
}

export async function deleteCollection(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const existing = await db.collection.findFirst({ where: { id, userId: user.id }, select: { id: true } });
  if (!existing) return { ok: false, error: "Collection not found." };
  await db.collection.delete({ where: { id } });
  revalidatePath("/dashboard/collections");
  return { ok: true };
}
