"use server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { normalizePhone } from "@/lib/auth";
import { getProvider } from "@/lib/whatsapp/provider";
import { eoiSchema, scoreEoi, splitLocalities, TIERS, bucketLabel } from "@/lib/partners";
import { cityBySlug } from "@/lib/seo/cities";
import { BRAND, rootUrl } from "@/lib/site";

export type EoiState = { ok: boolean; error?: string; fieldErrors?: Record<string, string>; tier?: string };

const SOURCE_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "ref", "path"];

/** Public EOI submit. No login: large agencies should be able to register in one step. */
export async function submitEoi(_prev: EoiState, form: FormData): Promise<EoiState> {
  // Honeypot — real browsers never fill this hidden field.
  if (String(form.get("website") ?? "")) return { ok: true, tier: TIERS.PARTNER.label };

  const parsed = eoiSchema.safeParse({
    contactName: form.get("contactName"),
    agencyName: form.get("agencyName"),
    role: form.get("role") || undefined,
    phone: form.get("phone"),
    email: form.get("email") ?? "",
    city: String(form.get("city") ?? ""),
    localities: form.get("localities") || undefined,
    teamSize: form.get("teamSize"),
    inventory: form.get("inventory"),
    monthlyLinks: form.get("monthlyLinks"),
    currentTools: form.getAll("currentTools").map(String),
    reraNumber: form.get("reraNumber") || undefined,
    message: form.get("message") || undefined,
  });
  const phone = normalizePhone(String(form.get("phone") ?? ""));
  if (!parsed.success || !phone) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.success ? [] : parsed.error.issues) fieldErrors[String(issue.path[0])] ??= issue.message;
    if (!phone) fieldErrors.phone = "Enter a valid mobile number.";
    return { ok: false, error: "Please fix the highlighted fields.", fieldErrors };
  }

  const e = parsed.data;
  const localities = splitLocalities(e.localities);
  const { tier, score } = scoreEoi({ ...e, localities });
  const source: Record<string, string> = {};
  for (const k of SOURCE_KEYS) {
    const v = String(form.get(k) ?? "").slice(0, 120);
    if (v) source[k] = v;
  }
  const data = {
    contactName: e.contactName,
    agencyName: e.agencyName,
    role: e.role ?? null,
    email: e.email || null,
    city: e.city,
    localities: localities as Prisma.InputJsonValue,
    teamSize: e.teamSize,
    inventory: e.inventory,
    monthlyLinks: e.monthlyLinks,
    currentTools: e.currentTools as Prisma.InputJsonValue,
    reraNumber: e.reraNumber ?? null,
    message: e.message ?? null,
    tier,
    score,
    source: source as Prisma.InputJsonValue,
  };
  await db.partnerEoi.upsert({ where: { phone }, create: { phone, ...data }, update: data });

  // Notifications are best-effort; the EOI is already saved.
  const cityName = cityBySlug(e.city)?.name ?? e.city;
  const provider = getProvider();
  const team = (process.env.EOI_NOTIFY_WHATSAPP ?? "").split(",").map((s) => normalizePhone(s)).filter((s): s is string => Boolean(s));
  const summary = [
    `New ${TIERS[tier].label} EOI (score ${score})`,
    `${e.agencyName} · ${e.contactName} · ${phone}`,
    `${cityName}${localities.length ? ` — ${localities.slice(0, 4).join(", ")}` : ""}`,
    `Inventory ${bucketLabel("inventory", e.inventory)} · links/mo ${bucketLabel("links", e.monthlyLinks)} · team ${bucketLabel("team", e.teamSize)}`,
    rootUrl("/admin/eoi"),
  ].join("\n");
  const ack =
    tier === "FOUNDING"
      ? `Hi ${e.contactName.split(" ")[0]}, thanks for registering ${e.agencyName} as a ${BRAND} Founding Partner for ${cityName}. Our partnerships team will WhatsApp you within one working day to plan onboarding for your inventory.`
      : `Hi ${e.contactName.split(" ")[0]}, thanks for registering ${e.agencyName} with ${BRAND}. You can start right now: send "Hi" to this number with photos and a few lines about a property. We will be in touch about onboarding your team.`;
  await Promise.allSettled([...team.map((to) => provider.sendText(to, summary)), provider.sendText(phone, ack)]);

  return { ok: true, tier: TIERS[tier].label };
}
