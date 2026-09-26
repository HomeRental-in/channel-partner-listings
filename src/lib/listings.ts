import { Prisma, type Listing, type Photo, type Document as Doc, type SourceChannel } from "@prisma/client";
import { nanoid } from "nanoid";
import { db } from "./db";
import { qualityScore, type ExtractedListing } from "./ai";
import { uniqueSlug } from "./format";
import { asArray, type FeatureSection } from "./types";
import { ListingInput, PhotosInput } from "@/components/editor/schema";

/**
 * Listing create/update helpers shared by the web editor, the review page and the WhatsApp intake.
 * All functions are server-only (they touch Prisma). None of them check ownership — callers do
 * (`requireUser()` + `where: { id, userId }`, or `verifyReviewToken()`).
 */

export type IntakePhoto = { url: string; width?: number | null; height?: number | null; roomTag?: string | null };
type Json = Prisma.InputJsonValue;

/** Ensure every feature section/item has a stable id (the editor needs keys for drag/move). */
export function withFeatureIds(sections: { id?: string; title: string; items: { id?: string; icon?: string | null; label: string; value: string }[] }[]): FeatureSection[] {
  return sections.map((s) => ({ id: s.id ?? nanoid(8), title: s.title, items: s.items.map((i) => ({ id: i.id ?? nanoid(8), icon: i.icon ?? null, label: i.label, value: i.value })) }));
}

/**
 * Create a DRAFT listing (+ Photo rows) from an AI extraction.
 * @param userId       owner
 * @param extracted    result of `extractListing()`
 * @param photos       ordered photos already stored via `storeImage()` (first = cover)
 * @param originalMessage raw text the CP sent (kept for "What you originally sent us")
 * @param source       "WHATSAPP" | "WEB"
 * @param extra        optional `videoUrl` (stored walkthrough) / `projectId`
 */
export async function createListingFromExtraction(
  userId: string,
  extracted: ExtractedListing,
  photos: IntakePhoto[],
  originalMessage: string,
  source: SourceChannel,
  extra: { videoUrl?: string | null; projectId?: string | null } = {},
): Promise<Listing & { photos: Photo[] }> {
  const e = extracted;
  const title = (e.title || [e.bhk, e.propertyType, e.locality].filter(Boolean).join(" ") || "New listing").slice(0, 140);
  const features = withFeatureIds(e.features ?? []);
  const highlights = (e.highlights ?? []).slice(0, 6);
  const amenities = e.amenities ?? [];
  const quality = qualityScore({ ...e, title, highlights, amenities, photoCount: photos.length });

  return db.listing.create({
    data: {
      userId,
      slug: uniqueSlug(title),
      status: "DRAFT",
      source,
      projectId: extra.projectId ?? null,
      title,
      category: e.category,
      propertyType: e.propertyType,
      transaction: e.transaction,
      bhk: e.bhk,
      areaSqft: e.areaSqft,
      areaLabel: e.areaLabel,
      furnishing: e.furnishing,
      floor: e.floor,
      totalFloors: e.totalFloors,
      facing: e.facing,
      ageOfProperty: e.ageOfProperty,
      bathrooms: e.bathrooms,
      balconies: e.balconies,
      ownership: e.ownership,
      parking: e.parking,
      possession: e.possession,
      price: e.price,
      priceLines: (e.priceLines ?? []) as Json,
      negotiable: !!e.negotiable,
      loanAvailable: e.loanAvailable,
      locality: e.locality,
      city: e.city,
      landmark: e.landmark,
      pincode: e.pincode,
      description: e.description,
      highlights: highlights as Json,
      features: features as unknown as Json,
      amenities: amenities as Json,
      neighbourhood: (e.neighbourhood ?? []) as Json,
      urgencyBadge: e.urgencyBadge,
      videoUrl: extra.videoUrl ?? null,
      originalMessage,
      qualityScore: quality.score,
      photos: { create: photos.map((p, i) => ({ url: p.url, width: p.width ?? null, height: p.height ?? null, order: i, roomTag: p.roomTag ?? null })) },
    },
    include: { photos: { orderBy: { order: "asc" } } },
  });
}

/** Recompute and persist `qualityScore`. Returns score + hints for the UI meter. */
export async function updateQuality(listingId: string) {
  const l = await db.listing.findUnique({ where: { id: listingId }, include: { _count: { select: { photos: true, documents: true } } } });
  if (!l) return { score: 0, hints: [] as string[] };
  const q = qualityScore({ ...l, photoCount: l._count.photos, documentsCount: l._count.documents });
  await db.listing.update({ where: { id: listingId }, data: { qualityScore: q.score } });
  return q;
}

/** Set LIVE (keeps the original publishedAt on re-publish). */
export async function publishListing(listingId: string) {
  const l = await db.listing.findUnique({ where: { id: listingId }, select: { publishedAt: true } });
  return db.listing.update({ where: { id: listingId }, data: { status: "LIVE", publishedAt: l?.publishedAt ?? new Date() } });
}

/** Map a DB listing (+documents) to the editor's `ListingInput` shape. */
export function toListingInput(l: Listing & { documents: Doc[] }): ListingInput {
  return {
    title: l.title,
    category: l.category,
    propertyType: l.propertyType,
    transaction: l.transaction,
    currency: (["INR", "AED", "USD", "GBP", "EUR", "SGD"].includes(l.currency) ? l.currency : "INR") as ListingInput["currency"],
    negotiable: l.negotiable,
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
    price: l.price,
    priceLines: asArray(l.priceLines),
    loanAvailable: l.loanAvailable,
    electricity: l.electricity,
    waterCharges: l.waterCharges,
    priceHistoryNote: l.priceHistoryNote,
    locality: l.locality,
    city: l.city,
    landmark: l.landmark,
    pincode: l.pincode,
    mapUrl: l.mapUrl,
    formUrl: l.formUrl,
    description: l.description,
    highlights: asArray<string>(l.highlights),
    features: withFeatureIds(asArray(l.features)),
    amenities: asArray<string>(l.amenities),
    neighbourhood: asArray(l.neighbourhood),
    urgencyBadge: l.urgencyBadge,
    videoTourUrl: l.videoTourUrl,
    documentsTitle: l.documentsTitle,
    documents: l.documents.map((d) => ({ id: d.id, url: d.url, name: d.name, sizeBytes: d.sizeBytes })),
    brokerCardOverride: l.brokerCardOverride ? (l.brokerCardOverride as ListingInput["brokerCardOverride"]) : null,
    theme: l.theme,
  };
}

/** Validate + write the Details step. Throws ZodError on bad input. Returns the new quality score. */
export async function applyListingInput(listingId: string, raw: unknown) {
  const d = ListingInput.parse(raw);
  const { documents, ...fields } = d;
  const empty = (s: string | null | undefined) => (s && s.trim() ? s.trim() : null);
  await db.$transaction(async (tx) => {
    await tx.listing.update({
      where: { id: listingId },
      data: {
        ...fields,
        propertyType: empty(fields.propertyType),
        bhk: empty(fields.bhk),
        areaLabel: empty(fields.areaLabel),
        furnishing: empty(fields.furnishing),
        floor: empty(fields.floor),
        totalFloors: empty(fields.totalFloors),
        facing: empty(fields.facing),
        ageOfProperty: empty(fields.ageOfProperty),
        ownership: empty(fields.ownership),
        parking: empty(fields.parking),
        possession: empty(fields.possession),
        electricity: empty(fields.electricity),
        waterCharges: empty(fields.waterCharges),
        priceHistoryNote: empty(fields.priceHistoryNote),
        locality: empty(fields.locality),
        city: empty(fields.city),
        landmark: empty(fields.landmark),
        pincode: empty(fields.pincode),
        mapUrl: empty(fields.mapUrl),
        formUrl: empty(fields.formUrl),
        description: empty(fields.description),
        urgencyBadge: empty(fields.urgencyBadge),
        videoTourUrl: empty(fields.videoTourUrl),
        documentsTitle: empty(fields.documentsTitle),
        priceLines: fields.priceLines as Json,
        highlights: fields.highlights.filter(Boolean) as Json,
        features: withFeatureIds(fields.features) as unknown as Json,
        amenities: fields.amenities as Json,
        neighbourhood: fields.neighbourhood as Json,
        brokerCardOverride: fields.brokerCardOverride ? (fields.brokerCardOverride as Json) : Prisma.JsonNull,
        theme: fields.theme ?? null,
      },
    });
    const keep = documents.map((x) => x.id).filter((x): x is string => !!x);
    await tx.document.deleteMany({ where: { listingId, id: { notIn: keep } } });
    for (const doc of documents) {
      if (doc.id) await tx.document.update({ where: { id: doc.id }, data: { name: doc.name } });
      else await tx.document.create({ data: { listingId, url: doc.url, name: doc.name, sizeBytes: doc.sizeBytes } });
    }
  });
  return updateQuality(listingId);
}

/** Validate + write the Photos step (order, cover = index 0, room tags, video). */
export async function applyPhotosInput(listingId: string, raw: unknown) {
  const d = PhotosInput.parse(raw);
  await db.$transaction(async (tx) => {
    const keep = d.photos.map((p) => p.id).filter((x): x is string => !!x);
    await tx.photo.deleteMany({ where: { listingId, id: { notIn: keep } } });
    for (const [i, p] of d.photos.entries()) {
      if (p.id) await tx.photo.update({ where: { id: p.id }, data: { order: i, roomTag: p.roomTag ?? null } });
      else await tx.photo.create({ data: { listingId, url: p.url, width: p.width ?? null, height: p.height ?? null, order: i, roomTag: p.roomTag ?? null } });
    }
    if (d.videoUrl !== undefined) await tx.listing.update({ where: { id: listingId }, data: { videoUrl: d.videoUrl } });
  });
  return updateQuality(listingId);
}

// ── Username / signup at publish time ──
export const RESERVED_USERNAMES = new Set(["www", "api", "app", "admin", "dashboard", "login", "logout", "review", "static", "assets", "cdn", "uploads", "mail", "help", "support", "blog", "sample", "privacy", "terms", "about", "l", "c", "p", "sites", "site", "agency", "settings", "channeldeck", "root"]);
export const USERNAME_RE = /^[a-z0-9]{3,24}$/;

/** Returns an error string or null when the username is acceptable for `userId`. */
export async function usernameProblem(username: string, userId?: string): Promise<string | null> {
  const u = username.toLowerCase().trim();
  if (!USERNAME_RE.test(u)) return "Username must be 3-24 characters, letters and numbers only";
  if (RESERVED_USERNAMES.has(u)) return "That username is reserved";
  const taken = await db.user.findUnique({ where: { username: u }, select: { id: true } });
  if (taken && taken.id !== userId) return "That username is already taken";
  const agency = await db.agency.findUnique({ where: { username: u }, select: { id: true } });
  if (agency) return "That username is already taken";
  return null;
}

/** Complete signup: name + username (+ optional agency). Throws Error with a user-facing message. */
export async function claimProfile(userId: string, input: { name: string; username: string; agencyName?: string | null }) {
  const username = input.username.toLowerCase().trim();
  const problem = await usernameProblem(username, userId);
  if (problem) throw new Error(problem);
  return db.user.update({ where: { id: userId }, data: { name: input.name.trim(), username, agencyName: input.agencyName?.trim() || undefined, onboardedAt: new Date() } });
}
