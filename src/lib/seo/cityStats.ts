import { db } from "@/lib/db";
import type { SeoCity } from "./cities";

const cityWhere = (c: SeoCity) => ({ OR: c.match.map((m) => ({ city: { equals: m, mode: "insensitive" as const } })) });

/** Live counts + projects for a city landing page. Only aggregate, public data. */
export async function getCityStats(c: SeoCity) {
  const [partners, listings, projects] = await Promise.all([
    db.user.count({ where: { ...cityWhere(c), username: { not: null } } }),
    db.listing.count({ where: { ...cityWhere(c), status: "LIVE" } }),
    db.project.findMany({ where: cityWhere(c), select: { slug: true, name: true, developer: true, locality: true }, orderBy: { updatedAt: "desc" }, take: 12 }),
  ]);
  return { partners, listings, projects };
}
