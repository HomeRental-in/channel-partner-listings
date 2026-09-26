import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { asArray, asBrokerCard, type Award, type Testimonial } from "@/lib/types";
import { listingUrl, siteUrl } from "@/lib/site";
import type { PublicBroker, PublicStorefront, StorefrontListingCard } from "@/components/themes/types";
import type { Listing, Photo, User } from "@prisma/client";

function toCard(l: Listing & { photos: Photo[]; user: User }): StorefrontListingCard {
  const cover = [...l.photos].sort((a, b) => a.order - b.order)[0];
  return {
    id: l.id,
    slug: l.slug,
    url: listingUrl(l.user.username, l.slug),
    title: l.title,
    priceDisplay: formatINR(l.price, { currency: l.currency }),
    transaction: l.transaction,
    bhk: l.bhk,
    areaSqft: l.areaSqft,
    locality: l.locality,
    city: l.city,
    cover: cover ? { id: cover.id, url: cover.url, width: cover.width, height: cover.height, roomTag: cover.roomTag } : null,
    status: l.status,
    urgencyBadge: l.urgencyBadge,
  };
}

/**
 * Storefront for an agency subdomain (Agency.username): all members' LIVE listings under the agency name,
 * grouped by member. Contact details come from the agency owner. Returns null when no such agency exists.
 */
export async function getAgencyStorefront(username: string): Promise<PublicStorefront | null> {
  const agency = await db.agency.findUnique({ where: { username }, include: { owner: true, members: { include: { user: true } } } });
  if (!agency) return null;
  const memberIds = Array.from(new Set([agency.ownerId, ...agency.members.map((m) => m.userId)]));
  const listings = await db.listing.findMany({
    where: { userId: { in: memberIds }, status: "LIVE", hiddenFromStorefront: false },
    include: { photos: true, user: true },
    orderBy: { publishedAt: "desc" },
  });
  const owner = agency.owner;
  const members = [owner, ...agency.members.map((m) => m.user).filter((u) => u.id !== owner.id)];
  const cities = Array.from(new Set(members.map((u) => u.city).filter((c): c is string => Boolean(c))));

  const broker: PublicBroker = {
    id: owner.id,
    username: agency.username,
    name: agency.name,
    agencyName: null,
    avatarUrl: owner.avatarUrl,
    phone: owner.phone,
    whatsapp: owner.whatsappNumber ?? owner.phone,
    reraNumber: owner.reraNumber,
    city: cities[0] ?? null,
    bio: owner.bio ?? `${agency.name} — ${members.length} advisor${members.length === 1 ? "" : "s"}${cities.length ? ` in ${cities.join(", ")}` : ""}.`,
    yearsExperience: owner.yearsExperience,
    dealsClosed: members.reduce((n, u) => n + (u.dealsClosed ?? 0), 0) || null,
    activeListings: listings.length,
    responseTime: owner.responseTime,
    languages: Array.from(new Set(members.flatMap((u) => asArray<string>(u.languages)))),
    areas: Array.from(new Set(members.flatMap((u) => asArray<string>(u.areas)))),
    testimonials: asArray<Testimonial>(owner.testimonials),
    awards: asArray<Award>(owner.awards),
    card: asBrokerCard(owner.brokerCard),
    siteUrl: siteUrl(username),
  };

  // One "Organise" group per member who has listings, in member order.
  const groups = members
    .map((u) => ({ id: u.id, title: u.name ?? "Property advisor", listingIds: listings.filter((l) => l.userId === u.id).map((l) => l.id) }))
    .filter((g) => g.listingIds.length);

  return { broker, theme: owner.defaultTheme, listings: listings.map(toCard), groups: groups.length > 1 ? groups : [] };
}
