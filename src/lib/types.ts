/** Shapes stored in JSON columns. Keep in sync with prisma/schema.prisma comments. */
export type PriceLine = { label: string; amount: number; unit?: string | null; note?: string | null };
export type FeatureItem = { id?: string; icon?: string | null; label: string; value: string };
export type FeatureSection = { id?: string; title: string; items: FeatureItem[] };
export type NeighbourhoodItem = { label: string; value: string };
export type Testimonial = { quote: string; author: string; role?: string | null };
export type Award = { title: string; year?: string | null; by?: string | null };
export type StorefrontGroup = { id: string; title: string; listingIds: string[] };
export type BrokerCard = { showNamePhoto: boolean; showAgency: boolean; showProfileLink: boolean; showWhatsApp: boolean; showCall: boolean };
export type Configuration = { type: string; sizeSqft?: number | null; priceFrom?: number | null; priceTo?: number | null; note?: string | null };
export type PaymentMilestone = { milestone: string; percent?: number | null };
export type FloorPlan = { url: string; label?: string | null };

export const DEFAULT_BROKER_CARD: BrokerCard = { showNamePhoto: true, showAgency: true, showProfileLink: true, showWhatsApp: true, showCall: true };

export function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}
export function asBrokerCard(v: unknown): BrokerCard {
  return { ...DEFAULT_BROKER_CARD, ...((v && typeof v === "object" ? v : {}) as Partial<BrokerCard>) };
}

export const AMENITIES = [
  "Lift", "Power Backup", "24x7 Water", "Security/CCTV", "Gated Community", "Visitor Parking", "Covered Parking",
  "Swimming Pool", "Gymnasium", "Clubhouse", "Kids Play Area", "Jogging Track", "Tennis Court", "Badminton Court",
  "Indoor Games", "Library", "Community Hall", "Amphitheatre", "Garden / Park", "Shopping Centre", "School Nearby",
  "Hospital Nearby", "Metro Nearby", "Vastu Compliant", "Rainwater Harvesting", "Solar Panels", "EV Charging",
  "Pet Friendly", "Intercom", "Piped Gas", "Maintenance Staff", "Video Door Phone", "Fire Safety",
  "Earthquake Resistant", "Modular Kitchen", "Wardrobes", "Air Conditioning", "Servant Room", "Study Room", "Private Terrace",
] as const;

export const PROPERTY_TYPES: Record<string, string[]> = {
  RESIDENTIAL: ["Apartment", "Independent House", "Villa", "Builder Floor", "Penthouse", "Studio", "Farmhouse"],
  COMMERCIAL_OFFICE: ["Office Space", "Co-working Space", "Business Centre"],
  COMMERCIAL_SHOP: ["Shop / Showroom", "Food Court", "Kiosk"],
  WAREHOUSE: ["Warehouse / Godown", "Industrial Shed", "Factory"],
  PLOT: ["Residential Plot", "Commercial Plot", "Agricultural Land"],
  BUILDING: ["Whole Building", "Hotel", "Hospital", "School"],
};

export const THEMES = [
  { key: "EDITORIAL", name: "Editorial", blurb: "Cream & ink, serif headlines, magazine layout." },
  { key: "MIDNIGHT", name: "Midnight", blurb: "Dark, bold grotesk, parallax hero." },
  { key: "SUNRISE", name: "Sunrise", blurb: "Warm sand & coral, bento grid, playful motion." },
] as const;
export type ThemeKey = (typeof THEMES)[number]["key"];
