import type { ComponentType } from "react";
import type { BrokerCard, FeatureSection, NeighbourhoodItem, PriceLine, StorefrontGroup, Testimonial, Award } from "@/lib/types";

/** Everything a theme needs to render a listing page. Built by src/lib/public.ts. Themes are presentational. */
export type PublicBroker = {
  id: string;
  username: string | null;
  name: string;
  agencyName: string | null;
  avatarUrl: string | null;
  logoUrl: string | null;        // brand / agency logo for the page header (falls back to agency name, then name)
  hasName: boolean;              // false when the CP has not set a name yet: never print a placeholder name to buyers
  headerLabel: string;           // text for the header when there is no logo: agency name, else name, else ""
  phone: string | null;          // for Call (already E.164)
  whatsapp: string | null;       // for WhatsApp
  reraNumber: string | null;
  city: string | null;
  bio: string | null;
  yearsExperience: number | null;
  dealsClosed: number | null;
  activeListings: number;
  responseTime: string | null;
  languages: string[];
  areas: string[];
  testimonials: Testimonial[];
  awards: Award[];
  card: BrokerCard;              // resolved visibility (listing override merged with defaults)
  siteUrl: string;               // absolute storefront URL
};

export type PublicPhoto = { id: string; url: string; width: number | null; height: number | null; roomTag: string | null };
export type PublicDocument = { id: string; url: string; name: string; sizeBytes: number };

export type PublicListing = {
  id: string;
  slug: string;
  url: string;                   // canonical absolute URL (no ?n=)
  status: "LIVE" | "SOLD" | "RENTED" | "DRAFT" | "ARCHIVED";
  theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE";
  title: string;
  category: string;
  propertyType: string | null;
  transaction: "SALE" | "RENT" | "LEASE";
  bhk: string | null;
  areaSqft: number | null;
  areaLabel: string | null;
  furnishing: string | null;
  floor: string | null;
  totalFloors: string | null;
  facing: string | null;
  ageOfProperty: string | null;
  bathrooms: number | null;
  balconies: number | null;
  ownership: string | null;
  parking: string | null;
  possession: string | null;
  currency: string;
  price: number | null;
  priceDisplay: string;          // "₹ 10 Cr" / "Price on request"
  perSqft: number | null;
  priceLines: PriceLine[];
  negotiable: boolean;
  loanAvailable: boolean | null;
  electricity: string | null;
  waterCharges: string | null;
  priceHistoryNote: string | null;
  locality: string | null;
  city: string | null;
  landmark: string | null;
  pincode: string | null;
  mapUrl: string | null;
  mapEmbedUrl: string | null;    // derived embeddable URL when possible
  formUrl: string | null;
  description: string | null;
  highlights: string[];
  features: FeatureSection[];
  amenities: string[];
  neighbourhood: NeighbourhoodItem[];
  urgencyBadge: string | null;
  videoUrl: string | null;
  videoTourUrl: string | null;
  videoTourEmbedUrl: string | null;
  documentsTitle: string | null;
  documents: PublicDocument[];
  photos: PublicPhoto[];         // ordered, first = cover
  cover: PublicPhoto | null;
  project: { slug: string; name: string; developer: string | null; reraNumber: string | null; possessionDate: string | null; configurations: unknown[]; paymentPlan: unknown[]; floorPlans: unknown[] } | null;
  broker: PublicBroker;
  publishedAt: string | null;
};

export type StorefrontListingCard = Pick<PublicListing, "id" | "slug" | "url" | "title" | "priceDisplay" | "transaction" | "bhk" | "areaSqft" | "locality" | "city" | "cover" | "status" | "urgencyBadge">;

export type PublicStorefront = {
  broker: PublicBroker;
  theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE";
  listings: StorefrontListingCard[];
  groups: StorefrontGroup[];     // Organise headings; ungrouped listings render under "Properties"
};

export type PublicCollection = {
  slug: string;
  url: string;
  title: string;
  description: string | null;
  broker: PublicBroker;
  theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE";
  listings: StorefrontListingCard[];
};

/** Props every theme's components receive. `viewerName` comes from ?n= (already sanitised, may be null). */
export type ListingPageProps = { data: PublicListing; viewerName: string | null };
export type StorefrontProps = { data: PublicStorefront };
export type CollectionProps = { data: PublicCollection };

export type ThemeModule = {
  ListingPage: ComponentType<ListingPageProps>;
  Storefront: ComponentType<StorefrontProps>;
  Collection: ComponentType<CollectionProps>;
};
