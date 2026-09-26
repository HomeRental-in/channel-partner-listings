"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normaliseUsername, validateUsername } from "@/components/dashboard/username";

export type ActionResult<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

/** Claim or change the CP's subdomain. Validates format, reserved words and uniqueness. */
export async function updateUsername(raw: string): Promise<ActionResult<{ username: string }>> {
  const user = await requireUser();
  const username = normaliseUsername(raw);
  const err = validateUsername(username);
  if (err) return { ok: false, error: err };
  if (username === user.username) return { ok: true, data: { username } };
  const taken = await db.user.findUnique({ where: { username }, select: { id: true } });
  if (taken && taken.id !== user.id) return { ok: false, error: "That address is already taken." };
  const agencyTaken = await db.agency.findUnique({ where: { username }, select: { id: true } });
  if (agencyTaken) return { ok: false, error: "That address is already taken." };
  await db.user.update({ where: { id: user.id }, data: { username, onboardedAt: user.onboardedAt ?? new Date() } });
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: { username } };
}

export async function markNotificationRead(id: string): Promise<ActionResult> {
  const user = await requireUser();
  await db.notification.updateMany({ where: { id, userId: user.id, readAt: null }, data: { readAt: new Date() } });
  return { ok: true };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  const user = await requireUser();
  await db.notification.updateMany({ where: { userId: user.id, readAt: null }, data: { readAt: new Date() } });
  revalidatePath("/dashboard", "layout");
  return { ok: true };
}
