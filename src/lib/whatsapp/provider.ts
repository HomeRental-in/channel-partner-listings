/**
 * WhatsApp provider abstraction. Providers: mock (dev), meta (Cloud API), ultramsg.
 * Inbound webhooks are normalised to InboundMessage by each provider's parse() function.
 */
export type InboundMessage = {
  providerMsgId: string;
  from: string; // E.164 with '+'
  kind: "text" | "image" | "video" | "document" | "audio" | "other";
  text?: string;
  /** Provider media reference; resolve with provider.downloadMedia() */
  mediaId?: string;
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  raw: unknown;
};

export interface WhatsappProvider {
  name: string;
  sendText(to: string, text: string): Promise<void>;
  sendImage?(to: string, imageUrl: string, caption?: string): Promise<void>;
  /** Returns bytes + mime for an inbound media reference. */
  downloadMedia(msg: InboundMessage): Promise<{ data: Buffer; mimeType: string }>;
  /** Parse a raw webhook body into zero or more inbound messages. */
  parseWebhook(body: unknown, headers: Headers): InboundMessage[];
}

/**
 * Normalise any provider phone representation to E.164 with '+'.
 * Accepts "919650355568", "+91 96503 55568", "919650355568@c.us", "9650355568" (→ +91).
 * Returns null when the digits do not look like a phone number.
 */
export function toE164(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const digits = raw.split("@")[0].replace(/[^\d]/g, "");
  if (digits.length === 10) return "+91" + digits;
  if (digits.length >= 11 && digits.length <= 15) return "+" + digits;
  return null;
}

/** E.164 without the '+', which is what Meta and UltraMsg expect in `to`. */
export function toDigits(phone: string) {
  return phone.replace(/[^\d]/g, "");
}

export function getProvider(): WhatsappProvider {
  const which = process.env.WHATSAPP_PROVIDER ?? "mock";
  if (which === "meta") return metaLoader();
  if (which === "ultramsg") return ultramsgLoader();
  return mockProvider;
}

import { mockProvider } from "./mock";
// Loaders are indirected so the mock stays dependency-free; meta/ultramsg modules are implemented in this folder.
function metaLoader(): WhatsappProvider {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require("./meta") as { metaProvider: WhatsappProvider }).metaProvider;
}
function ultramsgLoader(): WhatsappProvider {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return (require("./ultramsg") as { ultramsgProvider: WhatsappProvider }).ultramsgProvider;
}
