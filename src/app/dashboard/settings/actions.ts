"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { destroySession, normalizePhone, requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normaliseUsername, validateUsername } from "@/components/dashboard/username";
import type { ActionResult } from "@/app/dashboard/actions";

const nullableStr = (max: number) => z.string().trim().max(max).nullable().optional().transform((v) => (v === "" ? null : v));

const Patch = z.object({
  name: nullableStr(80),
  agencyName: nullableStr(80),
  whatsappNumber: nullableStr(20),
  city: nullableStr(60),
  username: z.string().optional(),
  avatarUrl: nullableStr(500),
  reraNumber: nullableStr(60),
  bio: nullableStr(300),
  yearsExperience: z.number().int().min(0).max(60).nullable().optional(),
  dealsClosed: z.number().int().min(0).max(100000).nullable().optional(),
  areas: z.array(z.string().trim().min(1).max(40)).max(20).optional(),
  propertyTypes: z.array(z.string().max(40)).max(12).optional(),
  languages: z.array(z.string().max(30)).max(12).optional(),
  responseTime: z.enum(["1h", "same_day", "24h", "48h"]).nullable().optional(),
  testimonials: z.array(z.object({ quote: z.string().trim().min(1).max(300), author: z.string().trim().min(1).max(60), role: z.string().trim().max(60).nullable().optional() })).max(3).optional(),
  awards: z.array(z.object({ title: z.string().trim().min(1).max(80), year: z.string().trim().max(8).nullable().optional(), by: z.string().trim().max(60).nullable().optional() })).max(6).optional(),
  brokerCard: z.object({ showNamePhoto: z.boolean(), showAgency: z.boolean(), showProfileLink: z.boolean(), showWhatsApp: z.boolean(), showCall: z.boolean() }).optional(),
  defaultTheme: z.enum(["EDITORIAL", "MIDNIGHT", "SUNRISE"]).optional(),
  dailyReport: z.boolean().optional(),
});
export type ProfilePatch = z.input<typeof Patch>;

/** Partial profile update used by the auto-saving settings form. Only provided keys are written. */
export async function updateProfile(raw: ProfilePatch): Promise<ActionResult<{ username?: string | null }>> {
  const user = await requireUser();
  const parsed = Patch.safeParse(raw);
  if (!parsed.success) {
    const i = parsed.error.issues[0];
    return { ok: false, error: i ? `${i.path.join(".") || "field"}: ${i.message}` : "Invalid input." };
  }
  const p = parsed.data;
  const data: Prisma.UserUpdateInput = {};

  if ("name" in p) data.name = p.name ?? null;
  if ("agencyName" in p) data.agencyName = p.agencyName ?? null;
  if ("city" in p) data.city = p.city ?? null;
  if ("avatarUrl" in p) data.avatarUrl = p.avatarUrl ?? null;
  if ("reraNumber" in p) data.reraNumber = p.reraNumber ?? null;
  if ("bio" in p) data.bio = p.bio ?? null;
  if ("yearsExperience" in p) data.yearsExperience = p.yearsExperience ?? null;
  if ("dealsClosed" in p) data.dealsClosed = p.dealsClosed ?? null;
  if (p.areas) data.areas = p.areas;
  if (p.propertyTypes) data.propertyTypes = p.propertyTypes;
  if (p.languages) data.languages = p.languages;
  if ("responseTime" in p) data.responseTime = p.responseTime ?? null;
  if (p.testimonials) data.testimonials = p.testimonials;
  if (p.awards) data.awards = p.awards;
  if (p.brokerCard) data.brokerCard = p.brokerCard;
  if (p.defaultTheme) data.defaultTheme = p.defaultTheme;
  if (typeof p.dailyReport === "boolean") data.dailyReport = p.dailyReport;

  if ("whatsappNumber" in p) {
    if (p.whatsappNumber) {
      const n = normalizePhone(p.whatsappNumber);
      if (!n) return { ok: false, error: "Enter a valid WhatsApp number." };
      data.whatsappNumber = n;
    } else data.whatsappNumber = user.phone;
  }

  let username: string | null | undefined;
  if (typeof p.username === "string") {
    username = normaliseUsername(p.username);
    if (username !== user.username) {
      const err = validateUsername(username);
      if (err) return { ok: false, error: err };
      const [u, a] = await Promise.all([db.user.findUnique({ where: { username }, select: { id: true } }), db.agency.findUnique({ where: { username }, select: { id: true } })]);
      if ((u && u.id !== user.id) || a) return { ok: false, error: "That address is already taken." };
      data.username = username;
      if (!user.onboardedAt) data.onboardedAt = new Date();
    }
  }

  if (Object.keys(data).length === 0) return { ok: true };
  await db.user.update({ where: { id: user.id }, data });
  revalidatePath("/dashboard", "layout");
  return { ok: true, data: { username } };
}

/** Deletes the account (cascade removes listings, sessions, collections, memberships…). Requires typing the phone. */
export async function deleteAccount(phoneConfirm: string): Promise<ActionResult> {
  const user = await requireUser();
  const typed = normalizePhone(phoneConfirm);
  if (!typed || typed !== user.phone) return { ok: false, error: "The number you typed does not match your account." };
  await db.user.delete({ where: { id: user.id } });
  await destroySession();
  redirect("/");
}
