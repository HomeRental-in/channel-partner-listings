import { z } from "zod";

/**
 * Editor input schema — shared by the dashboard Details step, the /review page and
 * PATCH /api/listings/[id]. Client-safe (no server imports). Server code validates with
 * `ListingInput.parse()` before writing; see src/lib/listings.ts `applyListingInput`.
 */

const str = z.string().trim().max(500).nullable().optional();
const num = z.number().finite().nullable().optional();

export const CATEGORIES = ["RESIDENTIAL", "COMMERCIAL_OFFICE", "COMMERCIAL_SHOP", "WAREHOUSE", "PLOT", "BUILDING"] as const;
export const TRANSACTIONS = ["SALE", "RENT", "LEASE"] as const;
export const CURRENCIES = ["INR", "AED", "USD", "GBP", "EUR", "SGD"] as const;
export const THEME_KEYS = ["EDITORIAL", "MIDNIGHT", "SUNRISE"] as const;
export const ROOM_TAGS = ["Living room", "Bedroom", "Kitchen", "Bathroom", "Balcony", "Exterior", "Amenities", "Floor plan", "Other"] as const;
export const AREA_UNITS = [
  { key: "sqft", label: "sq ft", toSqft: 1 },
  { key: "sqyd", label: "sq yd", toSqft: 9 },
  { key: "sqm", label: "sq m", toSqft: 10.764 },
  { key: "gaz", label: "gaz", toSqft: 9 },
  { key: "acre", label: "acre", toSqft: 43560 },
] as const;

export const CATEGORY_TILES: { key: (typeof CATEGORIES)[number]; emoji: string; label: string }[] = [
  { key: "RESIDENTIAL", emoji: "🏠", label: "Residential" },
  { key: "COMMERCIAL_OFFICE", emoji: "🏢", label: "Office" },
  { key: "COMMERCIAL_SHOP", emoji: "🛍️", label: "Shop / Retail" },
  { key: "WAREHOUSE", emoji: "🏭", label: "Warehouse" },
  { key: "PLOT", emoji: "🌱", label: "Plot / Land" },
  { key: "BUILDING", emoji: "🏬", label: "Building" },
];

export const PriceLineSchema = z.object({
  label: z.string().trim().max(80),
  amount: z.number().finite().nonnegative(),
  unit: z.string().trim().max(40).nullable().optional(),
  note: z.string().trim().max(200).nullable().optional(),
});
export const FeatureItemSchema = z.object({ id: z.string().optional(), icon: z.string().nullable().optional(), label: z.string().trim().max(80), value: z.string().trim().max(120) });
export const FeatureSectionSchema = z.object({ id: z.string().optional(), title: z.string().trim().max(80), items: z.array(FeatureItemSchema).max(40) });
export const NeighbourhoodSchema = z.object({ label: z.string().trim().max(80), value: z.string().trim().max(80) });
export const BrokerCardSchema = z.object({ showNamePhoto: z.boolean(), showAgency: z.boolean(), showProfileLink: z.boolean(), showWhatsApp: z.boolean(), showCall: z.boolean() });
export const DocumentInputSchema = z.object({ id: z.string().optional(), url: z.string().max(1000), name: z.string().trim().max(200), sizeBytes: z.number().int().nonnegative() });

export const ListingInput = z.object({
  title: z.string().trim().max(140),
  category: z.enum(CATEGORIES),
  propertyType: str,
  transaction: z.enum(TRANSACTIONS),
  currency: z.enum(CURRENCIES),
  negotiable: z.boolean(),
  bhk: str,
  areaSqft: num,
  areaLabel: str,
  furnishing: str,
  floor: str,
  totalFloors: str,
  facing: str,
  ageOfProperty: str,
  bathrooms: z.number().int().min(0).max(99).nullable().optional(),
  balconies: z.number().int().min(0).max(99).nullable().optional(),
  ownership: str,
  parking: str,
  possession: str,
  price: num,
  priceLines: z.array(PriceLineSchema).max(12),
  loanAvailable: z.boolean().nullable().optional(),
  electricity: str,
  waterCharges: str,
  priceHistoryNote: str,
  locality: str,
  city: str,
  landmark: str,
  pincode: str,
  mapUrl: z.string().trim().max(2000).nullable().optional(),
  formUrl: z.string().trim().max(2000).nullable().optional(),
  description: z.string().trim().max(5000).nullable().optional(),
  highlights: z.array(z.string().trim().max(120)).max(6),
  features: z.array(FeatureSectionSchema).max(12),
  amenities: z.array(z.string().trim().max(60)).max(80),
  neighbourhood: z.array(NeighbourhoodSchema).max(20),
  urgencyBadge: str,
  videoTourUrl: z.string().trim().max(2000).nullable().optional(),
  documentsTitle: str,
  documents: z.array(DocumentInputSchema).max(5),
  brokerCardOverride: BrokerCardSchema.nullable().optional(),
  theme: z.enum(THEME_KEYS).nullable().optional(),
});
export type ListingInput = z.infer<typeof ListingInput>;

/** Photo as handled by the editor grid (may not be persisted yet). */
export type EditorPhoto = { id?: string; url: string; width?: number | null; height?: number | null; roomTag?: string | null };

export const PhotoInputSchema = z.object({ id: z.string().optional(), url: z.string().max(1000), width: z.number().int().nullable().optional(), height: z.number().int().nullable().optional(), roomTag: z.string().max(40).nullable().optional() });
export const PhotosInput = z.object({ photos: z.array(PhotoInputSchema).max(20), videoUrl: z.string().max(1000).nullable().optional() });
export type PhotosInput = z.infer<typeof PhotosInput>;

export const SignupInput = z.object({
  name: z.string().trim().min(2).max(60),
  username: z.string().trim().toLowerCase(),
  agencyName: z.string().trim().max(80).nullable().optional(),
});
export type SignupInput = z.infer<typeof SignupInput>;

/** Result shape returned by every editor server action. */
export type ActionResult<T = undefined> = { ok: true; data: T; quality?: { score: number; hints: string[] } } | { ok: false; error: string };
