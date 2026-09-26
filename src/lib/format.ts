import { customAlphabet } from "nanoid";

const shortId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 6);

/** "₹ 10 Cr", "₹ 95 L", "₹ 45,000" — Indian price formatting. */
export function formatINR(amount: number | null | undefined, opts: { currency?: string; compact?: boolean } = {}) {
  if (amount == null || Number.isNaN(amount)) return "Price on request";
  const { currency = "INR", compact = true } = opts;
  const sym = currency === "INR" ? "₹" : currency + " ";
  if (currency !== "INR") return `${sym}${amount.toLocaleString("en-US")}`;
  if (compact) {
    if (amount >= 1e7) return `${sym} ${trim(amount / 1e7)} Cr`;
    if (amount >= 1e5) return `${sym} ${trim(amount / 1e5)} L`;
  }
  return `${sym} ${amount.toLocaleString("en-IN")}`;
}
function trim(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
/** Parse "1.2 cr", "95 lakh", "45,000", "1,00,00,000" → number (INR). */
export function parseINR(input: string | number | null | undefined): number | null {
  if (input == null) return null;
  if (typeof input === "number") return input;
  const s = input.toLowerCase().replace(/[₹,\s]/g, "");
  const m = s.match(/^([\d.]+)(cr|crore|crores|l|lac|lakh|lakhs|k)?/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n)) return null;
  const unit = m[2];
  if (!unit) return n;
  if (unit.startsWith("cr")) return n * 1e7;
  if (unit.startsWith("l")) return n * 1e5;
  if (unit === "k") return n * 1e3;
  return n;
}
export function priceBand(amount: number | null | undefined): string {
  if (amount == null) return "unknown";
  if (amount < 50e5) return "under_50L";
  if (amount < 1e7) return "50L_1Cr";
  if (amount < 2e7) return "1_2Cr";
  if (amount < 5e7) return "2_5Cr";
  if (amount < 10e7) return "5_10Cr";
  return "10Cr_plus";
}
export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60)
    .replace(/^-|-$/g, "");
}
export function uniqueSlug(title: string) {
  const base = slugify(title) || "listing";
  return `${base}-${shortId()}`;
}
export function usernameFrom(name: string) {
  return slugify(name).replace(/-/g, "").slice(0, 24);
}
export function perSqft(price: number | null | undefined, sqft: number | null | undefined) {
  if (!price || !sqft) return null;
  return Math.round(price / sqft);
}
export function pluralize(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}
