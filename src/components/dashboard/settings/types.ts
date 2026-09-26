import type { Award, BrokerCard, Testimonial, ThemeKey } from "@/lib/types";

export type ResponseTime = "1h" | "same_day" | "24h" | "48h";

export type ProfileData = {
  phone: string;
  name: string;
  agencyName: string;
  whatsappNumber: string;
  city: string;
  username: string;
  avatarUrl: string | null;
  reraNumber: string;
  bio: string;
  yearsExperience: number | null;
  dealsClosed: number | null;
  areas: string[];
  propertyTypes: string[];
  languages: string[];
  responseTime: ResponseTime | "";
  testimonials: Testimonial[];
  awards: Award[];
  brokerCard: BrokerCard;
  defaultTheme: ThemeKey;
  dailyReport: boolean;
};

export const PROPERTY_TYPE_OPTIONS = ["Residential", "Commercial", "Luxury", "Plots & Land", "Rentals", "New Projects", "Farmhouses", "Warehousing"];
export const LANGUAGE_OPTIONS = ["English", "Hindi", "Punjabi", "Marathi", "Gujarati", "Bengali", "Tamil", "Telugu", "Kannada", "Malayalam", "Urdu"];
export const RESPONSE_TIME_OPTIONS: { value: ResponseTime; label: string }[] = [
  { value: "1h", label: "Within an hour" },
  { value: "same_day", label: "Same day" },
  { value: "24h", label: "Within 24 hours" },
  { value: "48h", label: "Within 48 hours" },
];
export const BROKER_CARD_FIELDS: { key: keyof BrokerCard; label: string; description: string }[] = [
  { key: "showNamePhoto", label: "Name and photo", description: "Your name and avatar on every listing" },
  { key: "showAgency", label: "Agency name", description: "Shown under your name" },
  { key: "showProfileLink", label: "Link to your site", description: "“See all listings” button" },
  { key: "showWhatsApp", label: "WhatsApp button", description: "Buyers message you in one tap" },
  { key: "showCall", label: "Call button", description: "Buyers call your phone directly" },
];
export const THEME_SWATCHES: Record<ThemeKey, string[]> = {
  EDITORIAL: ["#F4EFE6", "#111111", "#B9A67C", "#FFFFFF"],
  MIDNIGHT: ["#0B0B10", "#1C1C26", "#5B8CFF", "#E7E7EF"],
  SUNRISE: ["#F7E8D6", "#FF7A59", "#2B2B2B", "#FFD8A8"],
};
