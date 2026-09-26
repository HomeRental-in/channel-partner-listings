import { formatINR } from "@/lib/format";
import type { Configuration } from "@/lib/types";

/** Pure, client-safe helpers for project templates (no db/ai/storage imports). */

/** "2, 3 & 4 BHK" from configurations; falls back to "Homes". */
export function configLabel(configs: Configuration[]): string {
  const types = Array.from(new Set(configs.map((c) => c.type?.trim()).filter(Boolean)));
  if (!types.length) return "Homes";
  const bhk = types.map((t) => t.match(/^(\d+(?:\.\d+)?)\s*BHK$/i)?.[1]).filter(Boolean) as string[];
  if (bhk.length === types.length && bhk.length > 1) return `${bhk.slice(0, -1).join(", ")} & ${bhk[bhk.length - 1]} BHK`;
  return types.join(" / ");
}

/** "₹ 1.2 Cr – ₹ 2.5 Cr" from the configuration price range, or "Price on request". */
export function configRange(configs: Configuration[]): string {
  const froms = configs.map((c) => c.priceFrom).filter((n): n is number => typeof n === "number" && n > 0);
  const tos = configs.map((c) => c.priceTo ?? c.priceFrom).filter((n): n is number => typeof n === "number" && n > 0);
  if (!froms.length) return "Price on request";
  const lo = Math.min(...froms), hi = Math.max(...tos, lo);
  return hi > lo ? `${formatINR(lo)} – ${formatINR(hi)}` : `${formatINR(lo)} onwards`;
}
