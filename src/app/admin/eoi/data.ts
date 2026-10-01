import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export type EoiFilters = { city?: string; tier?: string; status?: string };

const TIER_ORDER: Record<string, number> = { FOUNDING: 0, GROWTH: 1, PARTNER: 2 };

/** Founding first, then by score, then newest. */
export async function listEois(f: EoiFilters) {
  const where: Prisma.PartnerEoiWhereInput = {
    ...(f.city ? { city: f.city } : {}),
    ...(f.tier ? { tier: f.tier } : {}),
    ...(f.status ? { status: f.status } : {}),
  };
  const rows = await db.partnerEoi.findMany({ where, orderBy: [{ score: "desc" }, { createdAt: "desc" }], take: 1000 });
  return rows.sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));
}

export function filtersFrom(sp: Record<string, string | string[] | undefined>): EoiFilters {
  const one = (k: string) => (typeof sp[k] === "string" && sp[k] ? (sp[k] as string) : undefined);
  return { city: one("city"), tier: one("tier"), status: one("status") };
}
