import { z } from "zod";

/**
 * Founding Partner programme (EOI at /partners). Buckets are stored by id; labels are display-only.
 * The programme is about onboarding capacity, not pricing — the product stays free for everyone.
 * Client-safe: no server imports (the EOI form imports the buckets). Phone is normalised in the action.
 */
type Bucket = { id: string; label: string };

export const TEAM_SIZES: Bucket[] = [
  { id: "1", label: "Just me" },
  { id: "2-9", label: "2–9 people" },
  { id: "10-49", label: "10–49 people" },
  { id: "50-199", label: "50–199 people" },
  { id: "200+", label: "200+ people" },
];

export const INVENTORY: Bucket[] = [
  { id: "<50", label: "Under 50" },
  { id: "50-199", label: "50–199" },
  { id: "200-999", label: "200–999" },
  { id: "1000-4999", label: "1,000–4,999" },
  { id: "5000+", label: "5,000+" },
];

export const MONTHLY_LINKS: Bucket[] = [
  { id: "<100", label: "Under 100" },
  { id: "100-499", label: "100–499" },
  { id: "500-999", label: "500–999" },
  { id: "1000-4999", label: "1,000–4,999" },
  { id: "5000+", label: "5,000+" },
];

export const CURRENT_TOOLS = ["WhatsApp + PDFs only", "EstateDeck", "PropSite", "Portals (99acres / MagicBricks / Housing)", "Own website", "CRM", "Other"];

export const TIERS = {
  FOUNDING: { label: "Founding Partner", blurb: "1,000+ listings or links a month in one location" },
  GROWTH: { label: "Growth Partner", blurb: "200+ listings or a team of 10+" },
  PARTNER: { label: "Partner", blurb: "Individual CPs and small teams" },
} as const;
export type Tier = keyof typeof TIERS;

export const EOI_STATUSES = ["NEW", "CONTACTED", "ONBOARDING", "LIVE", "DECLINED"] as const;

const ids = (b: Bucket[]) => b.map((x) => x.id) as [string, ...string[]];
const rank = (b: Bucket[], id: string) => Math.max(0, b.findIndex((x) => x.id === id)) / (b.length - 1);

export const eoiSchema = z.object({
  contactName: z.string().trim().min(2, "Please enter your name.").max(80),
  agencyName: z.string().trim().min(2, "Please enter your firm or agency name.").max(120),
  role: z.string().trim().max(60).optional(),
  phone: z.string().trim().min(10, "Enter a valid mobile number.").max(20),
  email: z.union([z.literal(""), z.string().trim().email("Enter a valid email or leave it blank.")]).optional(),
  city: z.string().trim().min(2, "Choose your main city.").max(60),
  localities: z.string().trim().max(400).optional(),
  teamSize: z.enum(ids(TEAM_SIZES), { message: "Choose your team size." }),
  inventory: z.enum(ids(INVENTORY), { message: "Choose how many listings you carry." }),
  monthlyLinks: z.enum(ids(MONTHLY_LINKS), { message: "Choose how many links you share." }),
  currentTools: z.array(z.string()).max(CURRENT_TOOLS.length).default([]),
  reraNumber: z.string().trim().max(60).optional(),
  message: z.string().trim().max(1000).optional(),
});
export type EoiInput = z.infer<typeof eoiSchema>;

/** Tier + 0–100 score. Volume in a single location is what we are optimising for. */
export function scoreEoi(e: Pick<EoiInput, "teamSize" | "inventory" | "monthlyLinks" | "reraNumber"> & { localities: string[] }) {
  const inv = rank(INVENTORY, e.inventory);
  const links = rank(MONTHLY_LINKS, e.monthlyLinks);
  const team = rank(TEAM_SIZES, e.teamSize);
  const score = Math.round(inv * 40 + links * 35 + team * 15 + (e.reraNumber ? 5 : 0) + (e.localities.length ? 5 : 0));
  const big = (id: string) => id === "1000-4999" || id === "5000+";
  const tier: Tier =
    big(e.inventory) || big(e.monthlyLinks) || e.teamSize === "200+"
      ? "FOUNDING"
      : e.inventory === "200-999" || e.monthlyLinks === "500-999" || ["10-49", "50-199"].includes(e.teamSize)
        ? "GROWTH"
        : "PARTNER";
  return { tier, score: Math.min(100, score) };
}

export function bucketLabel(kind: "team" | "inventory" | "links", id: string) {
  const list = kind === "team" ? TEAM_SIZES : kind === "inventory" ? INVENTORY : MONTHLY_LINKS;
  return list.find((b) => b.id === id)?.label ?? id;
}

export function splitLocalities(raw: string | undefined) {
  return (raw ?? "")
    .split(/[,\n;]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 15);
}
