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
