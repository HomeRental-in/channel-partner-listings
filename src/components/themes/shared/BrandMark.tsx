import clsx from "clsx";
import type { PublicBroker } from "@/components/themes/types";

type BrandBroker = Pick<PublicBroker, "logoUrl" | "headerLabel" | "name" | "hasName" | "agencyName" | "city" | "card">;

/**
 * What a page may print as the CP's brand. Never a placeholder: `label` is "" when nothing is set.
 * `honourCard` (listing + collection pages) applies the broker-card toggles: the logo and agency name are
 * agency branding (hidden when `showAgency` is off); the personal name is hidden when `showNamePhoto` is off.
 * Storefronts are the CP's own site and always show the brand, so they pass `honourCard={false}`.
 */
export function brandOf(broker: BrandBroker, honourCard = true): { logoUrl: string | null; label: string } {
  if (!honourCard) return { logoUrl: broker.logoUrl, label: broker.headerLabel };
  const { card } = broker;
  const agency = card.showAgency ? broker.agencyName?.trim() ?? "" : "";
  const person = card.showNamePhoto && broker.hasName ? broker.name : "";
  return { logoUrl: card.showAgency ? broker.logoUrl : null, label: agency || person };
}

const SIZES = {
  sm: "h-6 max-w-[120px]",
  md: "h-9 max-w-[180px]",
  lg: "h-12 max-w-[220px]",
} as const;

/**
 * Brand for headers and broker cards: the logo when one is uploaded, else the header label as text, else nothing.
 * `chip` puts the logo on a white rounded chip so dark logos stay visible on dark themes (Midnight).
 * `logoOnly` renders nothing when there is no logo (for spots where the name is already printed next to it).
 */
export function BrandMark({ broker, honourCard = true, size = "md", chip = false, logoOnly = false, className, textClassName }: { broker: BrandBroker; honourCard?: boolean; size?: keyof typeof SIZES; chip?: boolean; logoOnly?: boolean; className?: string; textClassName?: string }) {
  const { logoUrl, label } = brandOf(broker, honourCard);
  if (logoUrl) {
    // Plain <img>: logos have arbitrary aspect ratios and come from our own storage.
    // eslint-disable-next-line @next/next/no-img-element
    const img = <img src={logoUrl} alt={label || "Logo"} className={clsx("block w-auto object-contain", SIZES[size], !chip && className)} decoding="async" draggable={false} />;
    return chip ? <span className={clsx("inline-flex shrink-0 items-center rounded-lg bg-white", size === "sm" ? "px-2 py-1" : "px-2.5 py-1.5", className)}>{img}</span> : img;
  }
  if (logoOnly || !label) return null;
  return <span className={textClassName}>{label}</span>;
}

/** True when BrandMark would render something (so wrappers can skip an empty header slot). */
export function hasBrand(broker: BrandBroker, honourCard = true) {
  const b = brandOf(broker, honourCard);
  return Boolean(b.logoUrl || b.label);
}

/**
 * Greeting strip: who "shared this with you". The CP's name (or agency when the name is hidden by the card toggles);
 * null when there is nothing to print — themes then say GREETING_FALLBACK instead of a placeholder name.
 */
export function sharedBy(broker: BrandBroker): string | null {
  const { card } = broker;
  if (card.showNamePhoto && broker.hasName) return broker.name;
  return (card.showAgency && broker.agencyName?.trim()) || null;
}
export const GREETING_FALLBACK = "here's a property picked for you";

/** "Hi Asha" when the CP has a name, plain "Hi" otherwise — for prefilled WhatsApp messages. */
export function hiBroker(broker: Pick<PublicBroker, "name" | "hasName">) {
  return broker.hasName ? `Hi ${broker.name}` : "Hi";
}

/**
 * Identity lines for a "Listed by" card, honouring the card toggles and never printing a placeholder name:
 * name (+ agency below) → agency alone → "Get in touch" with no "Listed by" eyebrow.
 */
export function cardIdentity(broker: BrandBroker): { eyebrow: string | null; heading: string; agency: string | null; logoUrl: string | null; named: boolean } {
  const { card } = broker;
  const person = card.showNamePhoto && broker.hasName ? broker.name : "";
  const agency = card.showAgency ? broker.agencyName?.trim() ?? "" : "";
  const logoUrl = card.showAgency ? broker.logoUrl : null;
  if (person) return { eyebrow: "Listed by", heading: person, agency: agency && agency !== person ? agency : null, logoUrl, named: true };
  if (agency) return { eyebrow: "Listed by", heading: agency, agency: null, logoUrl, named: true };
  return { eyebrow: null, heading: "Get in touch", agency: null, logoUrl, named: false };
}

/** Storefront hero copy: eyebrow is "agency · city" (omitted when empty); heading never prints a placeholder name. */
export function storefrontHero(broker: BrandBroker): { eyebrow: string; heading: string } {
  if (!broker.hasName) return { eyebrow: "", heading: broker.city ? `Properties in ${broker.city}` : "Properties" };
  const agency = broker.agencyName?.trim();
  return { eyebrow: [agency && agency !== broker.name ? agency : null, broker.city].filter(Boolean).join(" · "), heading: broker.name };
}
