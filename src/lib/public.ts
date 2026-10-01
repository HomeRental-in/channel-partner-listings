import { db } from "./db";
import { formatINR, perSqft } from "./format";
import { asArray, asBrokerCard, type FeatureSection, type NeighbourhoodItem, type PriceLine, type StorefrontGroup, type Testimonial, type Award } from "./types";
import { listingUrl, collectionUrl, siteUrl, rootUrl } from "./site";
import type { PublicBroker, PublicListing, PublicStorefront, PublicCollection, StorefrontListingCard } from "@/components/themes/types";
import type { User, Listing, Photo, Document as Doc, Project } from "@prisma/client";

function brokerFrom(u: User, activeListings: number, cardOverride?: unknown): PublicBroker {
  return {
    id: u.id,
    username: u.username,
    name: u.name?.trim() || u.agencyName?.trim() || "Your advisor",
    hasName: Boolean(u.name?.trim() || u.agencyName?.trim()),
    headerLabel: u.agencyName?.trim() || u.name?.trim() || "",
    logoUrl: u.logoUrl,
    agencyName: u.agencyName,
    avatarUrl: u.avatarUrl,
    phone: u.phone,
    whatsapp: u.whatsappNumber ?? u.phone,
    reraNumber: u.reraNumber,
    city: u.city,
    bio: u.bio,
    yearsExperience: u.yearsExperience,
    dealsClosed: u.dealsClosed,
    activeListings,
    responseTime: u.responseTime,
    languages: asArray<string>(u.languages),
    areas: asArray<string>(u.areas),
    testimonials: asArray<Testimonial>(u.testimonials),
    awards: asArray<Award>(u.awards),
    card: cardOverride ? asBrokerCard({ ...asBrokerCard(u.brokerCard), ...(cardOverride as object) }) : asBrokerCard(u.brokerCard),
    siteUrl: u.username ? siteUrl(u.username) : rootUrl("/"),
  };
}

export function mapEmbed(url: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (u.hostname.includes("google") && u.pathname.includes("/maps")) {
      const q = u.searchParams.get("q") ?? u.searchParams.get("query");
      const at = u.pathname.match(/@(-?[\d.]+),(-?[\d.]+)/);
      if (at) return `https://maps.google.com/maps?q=${at[1]},${at[2]}&z=15&output=embed`;
      if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
      const place = u.pathname.match(/\/place\/([^/]+)/);
      if (place) return `https://maps.google.com/maps?q=${place[1]}&z=15&output=embed`;
    }
    if (u.hostname === "maps.app.goo.gl" || u.hostname === "goo.gl") return null; // short links can't embed
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=15&output=embed`;
  } catch {
    return null;
  }
}
export function videoEmbed(url: string | null): string | null {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([\w-]{6,})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const ig = url.match(/instagram\.com\/(?:reel|p)\/([\w-]+)/);
  if (ig) return `https://www.instagram.com/p/${ig[1]}/embed`;
  return null;
}

type ListingWithRel = Listing & { photos: Photo[]; documents: Doc[]; user: User; project: Project | null };

export function toPublicListing(l: ListingWithRel, activeListings: number): PublicListing {
  const photos = [...l.photos].sort((a, b) => a.order - b.order).map((p) => ({ id: p.id, url: p.url, width: p.width, height: p.height, roomTag: p.roomTag }));
  return {
    id: l.id,
    slug: l.slug,
    url: listingUrl(l.user.username, l.slug),
    status: l.status,
    theme: l.theme ?? l.user.defaultTheme,
    title: l.title,
    category: l.category,
    propertyType: l.propertyType,
    transaction: l.transaction,
    bhk: l.bhk,
    areaSqft: l.areaSqft,
    areaLabel: l.areaLabel,
    furnishing: l.furnishing,
    floor: l.floor,
    totalFloors: l.totalFloors,
    facing: l.facing,
    ageOfProperty: l.ageOfProperty,
    bathrooms: l.bathrooms,
    balconies: l.balconies,
    ownership: l.ownership,
    parking: l.parking,
    possession: l.possession,
    currency: l.currency,
    price: l.price,
    priceDisplay: formatINR(l.price, { currency: l.currency }),
    perSqft: perSqft(l.price, l.areaSqft),
    priceLines: asArray<PriceLine>(l.priceLines),
    negotiable: l.negotiable,
    loanAvailable: l.loanAvailable,
    electricity: l.electricity,
    waterCharges: l.waterCharges,
    priceHistoryNote: l.priceHistoryNote,
    locality: l.locality,
    city: l.city,
    landmark: l.landmark,
    pincode: l.pincode,
    mapUrl: l.mapUrl,
    mapEmbedUrl: mapEmbed(l.mapUrl),
    formUrl: l.formUrl,
    description: l.description,
    highlights: asArray<string>(l.highlights),
    features: asArray<FeatureSection>(l.features),
    amenities: asArray<string>(l.amenities),
    neighbourhood: asArray<NeighbourhoodItem>(l.neighbourhood),
    urgencyBadge: l.urgencyBadge,
    videoUrl: l.videoUrl,
    videoTourUrl: l.videoTourUrl,
    videoTourEmbedUrl: videoEmbed(l.videoTourUrl),
    documentsTitle: l.documentsTitle,
    documents: l.documents.map((d) => ({ id: d.id, url: d.url, name: d.name, sizeBytes: d.sizeBytes })),
    photos,
    cover: photos[0] ?? null,
    project: l.project ? { slug: l.project.slug, name: l.project.name, developer: l.project.developer, reraNumber: l.project.reraNumber, possessionDate: l.project.possessionDate, configurations: asArray(l.project.configurations), paymentPlan: asArray(l.project.paymentPlan), floorPlans: asArray(l.project.floorPlans) } : null,
    broker: brokerFrom(l.user, activeListings, l.brokerCardOverride),
    publishedAt: l.publishedAt?.toISOString() ?? null,
  };
}

function toCard(l: Listing & { photos: Photo[]; user: User }): StorefrontListingCard {
  const cover = [...l.photos].sort((a, b) => a.order - b.order)[0];
  return { id: l.id, slug: l.slug, url: listingUrl(l.user.username, l.slug), title: l.title, priceDisplay: formatINR(l.price, { currency: l.currency }), transaction: l.transaction, bhk: l.bhk, areaSqft: l.areaSqft, locality: l.locality, city: l.city, cover: cover ? { id: cover.id, url: cover.url, width: cover.width, height: cover.height, roomTag: cover.roomTag } : null, status: l.status, urgencyBadge: l.urgencyBadge };
}

const PUBLIC_STATUSES = ["LIVE", "SOLD", "RENTED"] as const;

/** Listing by slug. `username` optional: when given, the listing must belong to that CP. Draft listings are not public. */
export async function getPublicListing(slug: string, username?: string, opts: { allowDraft?: boolean } = {}): Promise<PublicListing | null> {
  const l = await db.listing.findFirst({
    where: { slug, ...(username ? { user: { username } } : {}), ...(opts.allowDraft ? {} : { status: { in: [...PUBLIC_STATUSES] } }) },
    include: { photos: true, documents: true, user: true, project: true },
  });
  if (!l) return null;
  const active = await db.listing.count({ where: { userId: l.userId, status: "LIVE" } });
  return toPublicListing(l, active);
}

export async function getPublicListingById(id: string): Promise<PublicListing | null> {
  const l = await db.listing.findUnique({ where: { id }, include: { photos: true, documents: true, user: true, project: true } });
  if (!l) return null;
  const active = await db.listing.count({ where: { userId: l.userId, status: "LIVE" } });
  return toPublicListing(l, active);
}

export async function getStorefront(username: string): Promise<PublicStorefront | null> {
  const u = await db.user.findUnique({ where: { username } });
  if (!u) return null;
  const listings = await db.listing.findMany({ where: { userId: u.id, status: { in: [...PUBLIC_STATUSES] }, hiddenFromStorefront: false }, include: { photos: true, user: true }, orderBy: { publishedAt: "desc" } });
  const active = listings.filter((l) => l.status === "LIVE").length;
  return { broker: brokerFrom(u, active), theme: u.defaultTheme, listings: listings.map(toCard), groups: asArray<StorefrontGroup>(u.storefrontGroups) };
}

export async function getPublicCollection(slug: string, username?: string): Promise<PublicCollection | null> {
  const c = await db.collection.findFirst({ where: { slug, ...(username ? { user: { username } } : {}) }, include: { user: true, listings: { orderBy: { order: "asc" }, include: { listing: { include: { photos: true, user: true } } } } } });
  if (!c) return null;
  const active = await db.listing.count({ where: { userId: c.userId, status: "LIVE" } });
  const cards = c.listings.map((cl) => cl.listing).filter((l) => (PUBLIC_STATUSES as readonly string[]).includes(l.status)).map(toCard);
  return { slug: c.slug, url: collectionUrl(c.user.username, c.slug), title: c.title, description: c.description, broker: brokerFrom(c.user, active), theme: c.user.defaultTheme, listings: cards };
}

/** Sanitise the ?n= personalisation parameter: hyphen → space, max 30 chars, letters/marks/spaces only. */
export function sanitiseViewerName(raw: string | string[] | undefined): string | null {
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  const cleaned = s.replace(/[-_+]/g, " ").replace(/[^\p{L}\p{M}\s.']/gu, "").replace(/\s+/g, " ").trim().slice(0, 30);
  if (!cleaned) return null;
  return cleaned.replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}
