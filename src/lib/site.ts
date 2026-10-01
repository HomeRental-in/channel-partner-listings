/** URL helpers. All CP sites are subdomains of ROOT_DOMAIN so the Meta cookie is shared. */
export const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
export const BRAND = process.env.NEXT_PUBLIC_BRAND_NAME ?? "EstateInfo";
/** The WhatsApp bot number CPs message to create listings (E.164). Shown on the marketing site and used by every "Create a free listing" CTA. */
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "+917090080801";
/** "+91 70900 80801" */
export const WHATSAPP_DISPLAY = WHATSAPP_NUMBER.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
/** Opens a chat with the bot with "Hi" prefilled — the first message starts the listing flow and gives us the CP's number. */
export function whatsappStartUrl(text = "Hi") {
  return `https://wa.me/${WHATSAPP_NUMBER.replace(/[^\d]/g, "")}?text=${encodeURIComponent(text)}`;
}
const PROTOCOL = ROOT_DOMAIN.startsWith("localhost") || ROOT_DOMAIN.includes("lvh.me") ? "http" : "https";

export function rootUrl(path = "/") {
  return `${PROTOCOL}://${ROOT_DOMAIN}${path}`;
}
export function siteUrl(username: string, path = "/") {
  return `${PROTOCOL}://${username}.${ROOT_DOMAIN}${path}`;
}
/** Canonical public URL for a listing. Falls back to root /l/<slug> when the CP has no username yet. */
export function listingUrl(username: string | null | undefined, slug: string, viewerName?: string | null) {
  const base = username ? siteUrl(username, `/l/${slug}`) : rootUrl(`/l/${slug}`);
  return viewerName ? `${base}?n=${encodeURIComponent(viewerName.trim().replace(/\s+/g, "-"))}` : base;
}
export function collectionUrl(username: string | null | undefined, slug: string) {
  return username ? siteUrl(username, `/c/${slug}`) : rootUrl(`/c/${slug}`);
}
export function projectUrl(slug: string) {
  return rootUrl(`/p/${slug}`);
}
/** WhatsApp deep link with prefilled text. Phone must be E.164 without '+'. */
export function waLink(phone: string | null | undefined, text: string) {
  const p = (phone ?? "").replace(/[^\d]/g, "");
  return p ? `https://wa.me/${p}?text=${encodeURIComponent(text)}` : `https://wa.me/?text=${encodeURIComponent(text)}`;
}
export function telLink(phone: string | null | undefined) {
  const p = (phone ?? "").replace(/[^\d+]/g, "");
  return `tel:${p.startsWith("+") ? p : "+" + p}`;
}
