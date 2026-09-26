import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { parseINR } from "./format";

/**
 * All Claude calls live here. Model: claude-opus-5 (structured outputs via messages.parse).
 * Credentials resolve from ANTHROPIC_API_KEY or an `ant auth login` profile.
 */
const client = new Anthropic();
export const MODEL = process.env.ANTHROPIC_MODEL ?? "claude-opus-5";

export const PriceLine = z.object({
  label: z.string().describe("e.g. '3 BHK', 'Total', 'Per sq ft', 'Rent / month'"),
  amount: z.number().describe("numeric amount in the listing currency (INR rupees, not lakhs)"),
  unit: z.string().nullable().describe("e.g. 'total', 'per sq ft', 'per month'"),
  note: z.string().nullable(),
});
export const FeatureItem = z.object({ label: z.string(), value: z.string() });
export const FeatureSection = z.object({ title: z.string(), items: z.array(FeatureItem) });

export const ExtractedListing = z.object({
  title: z.string().describe("Short buyer-facing headline, max 70 chars, e.g. '4 BHK High-Rise Apartment in DLF The Aureva, Sector 63'"),
  category: z.enum(["RESIDENTIAL", "COMMERCIAL_OFFICE", "COMMERCIAL_SHOP", "WAREHOUSE", "PLOT", "BUILDING"]),
  propertyType: z.string().nullable().describe("Apartment, Villa, Builder Floor, Independent House, Penthouse, Office Space, Shop, Warehouse, Plot, Farmhouse..."),
  transaction: z.enum(["SALE", "RENT", "LEASE"]),
  projectName: z.string().nullable().describe("Developer project name if mentioned, e.g. 'DLF The Aureva'"),
  developer: z.string().nullable(),
  bhk: z.string().nullable().describe("e.g. '4 BHK + Servant + Utility'"),
  areaSqft: z.number().nullable().describe("carpet/built-up area converted to sq ft"),
  areaLabel: z.string().nullable().describe("as written, e.g. '4200 sq ft carpet'"),
  furnishing: z.string().nullable(),
  floor: z.string().nullable(),
  totalFloors: z.string().nullable(),
  facing: z.string().nullable(),
  ageOfProperty: z.string().nullable(),
  bathrooms: z.number().int().nullable(),
  balconies: z.number().int().nullable(),
  ownership: z.string().nullable(),
  parking: z.string().nullable(),
  possession: z.string().nullable(),
  price: z.number().nullable().describe("primary total price in rupees (e.g. 10 Cr → 100000000). null if not stated"),
  priceLines: z.array(PriceLine),
  negotiable: z.boolean(),
  loanAvailable: z.boolean().nullable(),
  locality: z.string().nullable().describe("e.g. 'Sector 63'"),
  city: z.string().nullable().describe("e.g. 'Gurgaon'"),
  landmark: z.string().nullable(),
  pincode: z.string().nullable(),
  reraNumber: z.string().nullable(),
  description: z.string().describe("120-180 word buyer-facing paragraph in clear English. No emojis. Do not invent facts."),
  highlights: z.array(z.string()).max(6).describe("3-6 short callouts, max 6 words each"),
  features: z.array(FeatureSection).describe("Grouped label/value tiles: 'Space & Layout', 'Building & Lifestyle', 'Connectivity'. Values 2-4 words."),
  amenities: z.array(z.string()).describe("Standard amenity names: Lift, Power Backup, Swimming Pool, Gymnasium, Clubhouse, Kids Play Area, Security/CCTV, Gated Community..."),
  neighbourhood: z.array(FeatureItem).describe("Nearby places with travel time or distance, e.g. {label:'IGI Airport', value:'30 min'}"),
  urgencyBadge: z.string().nullable().describe("e.g. 'Only 2 units left' if stated"),
  missing: z.array(z.string()).describe("Important fields the CP did not provide (price, area, locality...)"),
});
export type ExtractedListing = z.infer<typeof ExtractedListing>;

const SYSTEM_EXTRACT = `You turn a real-estate channel partner's rough WhatsApp message (Hindi, Hinglish or English) plus photos into a structured property listing for Indian buyers.
Rules: never invent facts that are not in the message or clearly visible in photos. Convert lakh/crore to rupees. Convert sq yard (×9) / sq metre (×10.764) / gaz (×9) to sq ft. Keep the CP's project name and locality spelling. Write the description in polished English even if the input is Hinglish. If price is missing, set price null and add 'price' to missing.`;

export async function extractListing(input: { text: string; imageUrls?: string[]; imageBuffers?: { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" }[] }): Promise<ExtractedListing> {
  const content: Anthropic.ContentBlockParam[] = [];
  for (const url of (input.imageUrls ?? []).slice(0, 8)) content.push({ type: "image", source: { type: "url", url } });
  for (const img of (input.imageBuffers ?? []).slice(0, 8)) content.push({ type: "image", source: { type: "base64", media_type: img.mediaType, data: img.data.toString("base64") } });
  content.push({ type: "text", text: `Channel partner's message:\n\n${input.text || "(no text, photos only)"}` });

  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: SYSTEM_EXTRACT,
    messages: [{ role: "user", content }],
    output_config: { format: zodOutputFormat(ExtractedListing) },
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("AI extraction failed");
  const out = res.parsed_output;
  // Defensive normalisation for lakh/crore written as text in priceLines
  out.priceLines = out.priceLines.map((p) => ({ ...p, amount: p.amount < 1000 && p.note ? (parseINR(p.note) ?? p.amount) : p.amount }));
  return out;
}

export const RewriteOut = z.object({ description: z.string(), highlights: z.array(z.string()).max(6) });

/** Regenerate description + highlights from the (possibly edited) structured details. */
export async function rewriteDescription(details: Record<string, unknown>): Promise<z.infer<typeof RewriteOut>> {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: "Write a 120-180 word buyer-facing property description in clear, warm English for Indian buyers, plus 3-6 highlights (max 6 words each). Use only the facts given. No emojis, no superlatives you cannot back with a fact.",
    messages: [{ role: "user", content: `Property details (JSON):\n${JSON.stringify(details, null, 2)}` }],
    output_config: { format: zodOutputFormat(RewriteOut) },
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("AI rewrite failed");
  return res.parsed_output;
}

export const ExtractedProject = z.object({
  name: z.string(),
  developer: z.string().nullable(),
  reraNumber: z.string().nullable(),
  reraUrl: z.string().nullable(),
  possessionDate: z.string().nullable(),
  city: z.string().nullable(),
  locality: z.string().nullable(),
  landmark: z.string().nullable(),
  description: z.string().describe("150-220 words, buyer-facing"),
  highlights: z.array(z.string()).max(6),
  configurations: z.array(z.object({ type: z.string(), sizeSqft: z.number().nullable(), priceFrom: z.number().nullable(), priceTo: z.number().nullable(), note: z.string().nullable() })),
  paymentPlan: z.array(z.object({ milestone: z.string(), percent: z.number().nullable() })),
  amenities: z.array(z.string()),
  locationAdvantages: z.array(FeatureItem),
  features: z.array(FeatureSection),
  missing: z.array(z.string()),
});
export type ExtractedProject = z.infer<typeof ExtractedProject>;

/** Ingest a developer brochure PDF into a Project template. */
export async function extractProjectFromBrochure(pdf: Buffer, hint?: string): Promise<ExtractedProject> {
  const res = await client.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    system: "You read Indian real-estate developer brochures and extract a structured project template. Prices in rupees. Sizes in sq ft. Do not invent numbers; use null when absent.",
    messages: [
      {
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: "application/pdf", data: pdf.toString("base64") } },
          { type: "text", text: `Extract the project template.${hint ? ` Hint from the channel partner: ${hint}` : ""}` },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(ExtractedProject) },
  });
  if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error("AI brochure extraction failed");
  return res.parsed_output;
}

/** Cheap heuristic listing quality score (0-100) with hints; no AI call. */
export function qualityScore(l: { title?: string | null; price?: number | null; areaSqft?: number | null; locality?: string | null; city?: string | null; description?: string | null; highlights?: unknown; amenities?: unknown; photoCount: number; bhk?: string | null; furnishing?: string | null; possession?: string | null; mapUrl?: string | null; documentsCount?: number }) {
  const checks: { ok: boolean; hint: string; w: number }[] = [
    { ok: l.photoCount >= 5, hint: "Add at least 5 photos", w: 20 },
    { ok: !!l.price, hint: "Add a price", w: 15 },
    { ok: !!l.areaSqft, hint: "Add the area", w: 10 },
    { ok: !!l.locality && !!l.city, hint: "Add locality and city", w: 10 },
    { ok: !!l.description && l.description.length > 80, hint: "Write a description", w: 10 },
    { ok: Array.isArray(l.highlights) && (l.highlights as unknown[]).length >= 3, hint: "Add 3 highlights", w: 8 },
    { ok: Array.isArray(l.amenities) && (l.amenities as unknown[]).length >= 4, hint: "Tick amenities", w: 7 },
    { ok: !!l.bhk, hint: "Add configuration", w: 5 },
    { ok: !!l.furnishing, hint: "Add furnishing", w: 5 },
    { ok: !!l.possession, hint: "Add possession status", w: 4 },
    { ok: !!l.mapUrl, hint: "Add a map link", w: 3 },
    { ok: (l.documentsCount ?? 0) > 0, hint: "Attach a brochure or floor plan", w: 3 },
  ];
  const score = checks.reduce((s, c) => s + (c.ok ? c.w : 0), 0);
  return { score, hints: checks.filter((c) => !c.ok).map((c) => c.hint) };
}
