export type StoryAnimation = "zoom" | "slide" | "fade";

export type StorySlide = { id: string; url: string; caption: string; include: boolean };

export type StoryBrokerInfo = {
  name: string;
  agency: string | null;
  phone: string | null;
  whatsapp: string | null;
  siteUrl: string;
  avatarUrl: string | null;
  showName: boolean;
  showAgency: boolean;
  showWhatsApp: boolean;
  showCall: boolean;
  showSite: boolean;
};

export type StoryListingInfo = {
  id: string;
  title: string;
  priceDisplay: string;
  transaction: string;
  where: string;
  chips: string[];
  theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE";
  highlights: string[];
  photos: { id: string; url: string }[];
  broker: StoryBrokerInfo;
  brand: string;
  slug: string;
};

export type StorySettings = {
  animation: StoryAnimation;
  seconds: number; // per slide, 2–5
  includePrice: boolean;
  includeContact: boolean;
  music: boolean;
};

export type PlanSlide = { kind: "photo"; url: string; caption: string } | { kind: "price" } | { kind: "contact" };

export type StoryPlan = { slides: PlanSlide[]; settings: StorySettings; listing: StoryListingInfo };

export const STORY_W = 1080;
export const STORY_H = 1920;
export const MAX_SECONDS = 30;
export const TRANSITION_MS = 650;

export function buildPlan(listing: StoryListingInfo, slides: StorySlide[], settings: StorySettings): StoryPlan {
  const out: PlanSlide[] = slides.filter((s) => s.include).map((s) => ({ kind: "photo", url: s.url, caption: s.caption }));
  if (settings.includePrice) out.push({ kind: "price" });
  if (settings.includeContact) out.push({ kind: "contact" });
  return { slides: out, settings, listing };
}

export function planDuration(plan: StoryPlan) {
  return plan.slides.length * plan.settings.seconds;
}
