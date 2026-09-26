import type { WhatsappProvider, InboundMessage } from "./provider";

/**
 * Dev provider: logs outbound messages and mirrors them into the WhatsappMessage table (direction OUT)
 * so the /dev/whatsapp simulator can show a transcript. Inbound is simulated via POST /api/whatsapp/simulate.
 */
async function recordOutbound(to: string, kind: string, text: string, mediaUrl?: string) {
  try {
    const { db } = await import("@/lib/db");
    const conv = await db.whatsappConversation.upsert({ where: { phone: to }, update: {}, create: { phone: to } });
    await db.whatsappMessage.create({ data: { conversationId: conv.id, direction: "OUT", kind, text, mediaUrl: mediaUrl ?? null, raw: { provider: "mock" } } });
  } catch (err) {
    console.warn("[whatsapp:mock] could not record outbound message", err);
  }
}

export const mockProvider: WhatsappProvider = {
  name: "mock",
  async sendText(to, text) {
    console.log(`\n[whatsapp:mock] → ${to}\n${text}\n`);
    await recordOutbound(to, "text", text);
  },
  async sendImage(to, imageUrl, caption) {
    console.log(`\n[whatsapp:mock] → ${to} [image ${imageUrl}] ${caption ?? ""}\n`);
    await recordOutbound(to, "image", caption ?? "", imageUrl);
  },
  async downloadMedia(msg) {
    if (!msg.mediaUrl) throw new Error("mock media requires mediaUrl");
    const res = await fetch(msg.mediaUrl);
    if (!res.ok) throw new Error(`mock media download failed: ${res.status}`);
    return { data: Buffer.from(await res.arrayBuffer()), mimeType: res.headers.get("content-type") ?? msg.mimeType ?? "application/octet-stream" };
  },
  parseWebhook(body) {
    const b = body as Partial<InboundMessage> & { messages?: InboundMessage[] };
    if (Array.isArray(b.messages)) return b.messages;
    if (b.from) return [{ providerMsgId: b.providerMsgId ?? `mock-${Date.now()}`, from: b.from, kind: b.kind ?? "text", text: b.text, mediaUrl: b.mediaUrl, mimeType: b.mimeType, fileName: b.fileName, raw: body }];
    return [];
  },
};
