import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CITIES } from "@/lib/seo/cities";
import { ANSWERS } from "@/lib/seo/answers";
import { listingUrl, collectionUrl, projectUrl, rootUrl, siteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

const MAX = 45000; // stay under the 50k-per-sitemap limit

/** Marketing + city pages + every public CP storefront, listing, collection and project page. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const marketing: MetadataRoute.Sitemap = [
    { url: rootUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: rootUrl("/partners"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: rootUrl("/channel-partners"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...CITIES.map((c) => ({ url: rootUrl(`/channel-partners/${c.slug}`), lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 })),
    { url: rootUrl("/answers"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...ANSWERS.map((a) => ({ url: rootUrl(`/answers/${a.slug}`), lastModified: new Date(a.updated), changeFrequency: "monthly" as const, priority: 0.8 })),
    { url: rootUrl("/sample"), changeFrequency: "monthly", priority: 0.5 },
    { url: rootUrl("/privacy"), changeFrequency: "yearly", priority: 0.2 },
    { url: rootUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];

  const [users, listings, collections, projects] = await Promise.all([
    db.user.findMany({ where: { username: { not: null }, listings: { some: { status: "LIVE" } } }, select: { username: true, updatedAt: true }, take: 10000 }),
    db.listing.findMany({ where: { status: "LIVE" }, select: { slug: true, updatedAt: true, user: { select: { username: true } } }, orderBy: { updatedAt: "desc" }, take: MAX }),
    db.collection.findMany({ where: { listings: { some: { listing: { status: "LIVE" } } } }, select: { slug: true, updatedAt: true, user: { select: { username: true } } }, take: 5000 }),
    db.project.findMany({ select: { slug: true, updatedAt: true }, take: 5000 }),
  ]);

  const dynamicUrls: MetadataRoute.Sitemap = [
    ...projects.map((p) => ({ url: projectUrl(p.slug), lastModified: p.updatedAt, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...users.map((u) => ({ url: siteUrl(u.username!), lastModified: u.updatedAt, changeFrequency: "daily" as const, priority: 0.6 })),
    ...listings.map((l) => ({ url: listingUrl(l.user.username, l.slug), lastModified: l.updatedAt, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...collections.map((c) => ({ url: collectionUrl(c.user.username, c.slug), lastModified: c.updatedAt, changeFrequency: "weekly" as const, priority: 0.4 })),
  ];
  return [...marketing, ...dynamicUrls].slice(0, MAX + marketing.length);
}
