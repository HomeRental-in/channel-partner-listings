import { rootUrl } from "@/lib/site";
import { formatINR } from "@/lib/format";
import type { TrackType } from "@/components/public/track";
import type { PublicDocument, PublicListing, StorefrontListingCard, PublicStorefront } from "@/components/themes/types";
import type { Configuration, PaymentMilestone, FloorPlan } from "@/lib/types";

/** Absolute brochure PDF URL (root domain: the proxy rewrites /api/* on CP subdomains). */
export function brochureUrl(listingId: string) {
  return rootUrl(`/api/listings/${listingId}/brochure.pdf`);
}

/** The first PDF whose name starts with "brochure" is the brochure → BROCHURE_DOWNLOAD; the rest are DOC_DOWNLOAD. */
export function documentEvent(doc: PublicDocument, all: PublicDocument[]): TrackType {
  const brochure = all.find((d) => /^brochure/i.test(d.name.trim()) && /\.pdf$/i.test(d.name.trim()));
  return brochure && brochure.id === doc.id ? "BROCHURE_DOWNLOAD" : "DOC_DOWNLOAD";
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Splits storefront listings into the CP's "Organise" groups (in order) plus a trailing "Properties" bucket. */
export function groupListings(data: PublicStorefront): { title: string; listings: StorefrontListingCard[] }[] {
  const byId = new Map(data.listings.map((l) => [l.id, l]));
  const used = new Set<string>();
  const out: { title: string; listings: StorefrontListingCard[] }[] = [];
  for (const g of data.groups) {
    const items = (Array.isArray(g.listingIds) ? g.listingIds : []).map((id) => byId.get(id)).filter((l): l is StorefrontListingCard => Boolean(l) && !used.has(l!.id));
    if (!items.length) continue;
    items.forEach((l) => used.add(l.id));
    out.push({ title: g.title, listings: items });
  }
  const rest = data.listings.filter((l) => !used.has(l.id));
  if (rest.length) out.push({ title: out.length ? "Properties" : "Properties", listings: rest });
  return out;
}

export const TRANSACTION_LABEL: Record<PublicListing["transaction"], string> = { SALE: "For sale", RENT: "For rent", LEASE: "For lease" };
export const STATUS_LABEL: Record<string, string | undefined> = { SOLD: "Sold", RENTED: "Rented" };

export function localityLine(l: Pick<PublicListing, "locality" | "city">) {
  return [l.locality, l.city].filter(Boolean).join(", ");
}

/** "4 BHK · 2,400 sq ft · Apartment" style summary line. */
export function summaryLine(l: Pick<PublicListing, "bhk" | "areaSqft" | "areaLabel" | "propertyType">) {
  return [l.bhk, l.areaLabel ?? (l.areaSqft ? `${l.areaSqft.toLocaleString("en-IN")} sq ft` : null), l.propertyType].filter(Boolean).join(" · ");
}

/** Key facts as label/value pairs (only the ones present). */
export function keyFacts(l: PublicListing): { label: string; value: string }[] {
  const rows: [string, string | number | null | undefined][] = [
    ["Type", l.propertyType],
    ["Configuration", l.bhk],
    ["Area", l.areaLabel ?? (l.areaSqft ? `${l.areaSqft.toLocaleString("en-IN")} sq ft` : null)],
    ["Furnishing", l.furnishing],
    ["Floor", l.floor && l.totalFloors ? `${l.floor} of ${l.totalFloors}` : l.floor],
    ["Facing", l.facing],
    ["Age", l.ageOfProperty],
    ["Bathrooms", l.bathrooms],
    ["Balconies", l.balconies],
    ["Ownership", l.ownership],
    ["Parking", l.parking],
    ["Possession", l.possession],
    ["Loan", l.loanAvailable == null ? null : l.loanAvailable ? "Available" : "Not available"],
    ["Electricity", l.electricity],
    ["Water charges", l.waterCharges],
  ];
  return rows.filter(([, v]) => v != null && v !== "").map(([label, v]) => ({ label, value: String(v) }));
}

export function asConfigurations(v: unknown[]): Configuration[] {
  return v.filter((c): c is Configuration => Boolean(c) && typeof c === "object" && typeof (c as Configuration).type === "string");
}
export function asPaymentPlan(v: unknown[]): PaymentMilestone[] {
  return v.filter((c): c is PaymentMilestone => Boolean(c) && typeof c === "object" && typeof (c as PaymentMilestone).milestone === "string");
}
export function asFloorPlans(v: unknown[]): FloorPlan[] {
  return v.filter((c): c is FloorPlan => Boolean(c) && typeof c === "object" && typeof (c as FloorPlan).url === "string");
}
export function configPrice(c: Configuration) {
  if (c.priceFrom == null && c.priceTo == null) return "On request";
  if (c.priceFrom != null && c.priceTo != null) return `${formatINR(c.priceFrom)} – ${formatINR(c.priceTo)}`;
  return formatINR(c.priceFrom ?? c.priceTo);
}
