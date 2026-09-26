import type { WhatsappProvider, InboundMessage } from "./provider";

/** Dev provider: logs outbound messages; inbound is simulated via POST /api/whatsapp/simulate. */
export const mockProvider: WhatsappProvider = {
  name: "mock",
  async sendText(to, text) {
    console.log(`\n[whatsapp:mock] → ${to}\n${text}\n`);
  },
  async sendImage(to, imageUrl, caption) {
    console.log(`\n[whatsapp:mock] → ${to} [image ${imageUrl}] ${caption ?? ""}\n`);
  },
  async downloadMedia(msg) {
    if (!msg.mediaUrl) throw new Error("mock media requires mediaUrl");
    const res = await fetch(msg.mediaUrl);
    return { data: Buffer.from(await res.arrayBuffer()), mimeType: res.headers.get("content-type") ?? msg.mimeType ?? "application/octet-stream" };
  },
  parseWebhook(body) {
    const b = body as Partial<InboundMessage> & { messages?: InboundMessage[] };
    if (Array.isArray(b.messages)) return b.messages;
    if (b.from) return [{ providerMsgId: b.providerMsgId ?? `mock-${Date.now()}`, from: b.from, kind: b.kind ?? "text", text: b.text, mediaUrl: b.mediaUrl, mimeType: b.mimeType, fileName: b.fileName, raw: body }];
    return [];
  },
};
