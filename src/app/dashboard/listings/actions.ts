"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ListingStatus, Theme } from "@prisma/client";
import type { ActionResult } from "@/app/dashboard/actions";

const STATUSES: ListingStatus[] = ["LIVE", "SOLD", "RENTED"];
const THEMES: Theme[] = ["EDITORIAL", "MIDNIGHT", "SUNRISE"];

async function owned(id: string, userId: string) {
  return db.listing.findFirst({ where: { id, userId }, select: { id: true, status: true, publishedAt: true } });
}

function revalidate(id: string) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/listings");
  revalidatePath(`/dashboard/listings/${id}`);
}

export async function deleteListing(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const l = await owned(id, user.id);
  if (!l) return { ok: false, error: "Listing not found." };
  await db.listing.delete({ where: { id } });
  revalidate(id);
  return { ok: true };
}

/** Live / Sold / Rented. Publishing a draft sets publishedAt. */
export async function setListingStatus(id: string, status: ListingStatus): Promise<ActionResult> {
  const user = await requireUser();
  if (!STATUSES.includes(status)) return { ok: false, error: "Invalid status." };
  const l = await owned(id, user.id);
  if (!l) return { ok: false, error: "Listing not found." };
  await db.listing.update({ where: { id }, data: { status, publishedAt: l.publishedAt ?? (status === "LIVE" ? new Date() : null) } });
  revalidate(id);
  return { ok: true };
}

export async function setListingHidden(id: string, hidden: boolean): Promise<ActionResult> {
  const user = await requireUser();
  const l = await owned(id, user.id);
  if (!l) return { ok: false, error: "Listing not found." };
  await db.listing.update({ where: { id }, data: { hiddenFromStorefront: hidden } });
  revalidate(id);
  return { ok: true };
}

/** theme null → follow the user's default theme. */
export async function setListingTheme(id: string, theme: Theme | null): Promise<ActionResult> {
  const user = await requireUser();
  if (theme !== null && !THEMES.includes(theme)) return { ok: false, error: "Invalid theme." };
  const l = await owned(id, user.id);
  if (!l) return { ok: false, error: "Listing not found." };
  await db.listing.update({ where: { id }, data: { theme } });
  revalidate(id);
  return { ok: true };
}
