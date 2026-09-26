import { toDigits, toE164, type InboundMessage, type WhatsappProvider } from "./provider";

/**
 * UltraMsg provider (unofficial WhatsApp gateway).
 * Env: ULTRAMSG_INSTANCE_ID, ULTRAMSG_TOKEN.
 * Webhook body: { event_type: "message_received", instanceId, data: { id, from: "9198...@c.us", to, type, body, media, caption?, filename?, fromMe, ... } }
 * Docs: https://docs.ultramsg.com
 */
const API = "https://api.ultramsg.com";

function instance() {
  const id = process.env.ULTRAMSG_INSTANCE_ID;
  if (!id) throw new Error("ULTRAMSG_INSTANCE_ID is not set");
  return id;
}
function token() {
  const t = process.env.ULTRAMSG_TOKEN;
  if (!t) throw new Error("ULTRAMSG_TOKEN is not set");
  return t;
}

async function post(path: string, fields: Record<string, string>) {
  const body = new URLSearchParams({ token: token(), ...fields });
  const res = await fetch(`${API}/${instance()}/${path}`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`UltraMsg send failed: ${res.status} ${await res.text()}`);
  const json = (await res.json().catch(() => ({}))) as { sent?: string | boolean; error?: unknown };
  if (json.error) throw new Error(`UltraMsg send error: ${JSON.stringify(json.error)}`);
}

type UltraData = {
  id?: string;
  from?: string; // "919650355568@c.us"
  to?: string;
  author?: string;
  pushname?: string;
  type?: string; // chat | image | video | document | ptt | audio | sticker | location | ...
  body?: string; // text for chat, media URL for media messages
  caption?: string;
  media?: string; // media URL
  filename?: string;
  mimetype?: string;
  fromMe?: boolean;
  time?: number;
};
type UltraWebhook = { event_type?: string; instanceId?: string; data?: UltraData };

function kindOf(type: string | undefined): InboundMessage["kind"] {
  switch (type) {
    case "chat":
    case "text":
      return "text";
    case "image":
      return "image";
    case "video":
      return "video";
    case "document":
      return "document";
    case "ptt":
    case "audio":
      return "audio";
    default:
      return "other";
  }
}

export const ultramsgProvider: WhatsappProvider = {
  name: "ultramsg",
  async sendText(to, text) {
    await post("messages/chat", { to: "+" + toDigits(to), body: text });
  },
  async sendImage(to, imageUrl, caption) {
    await post("messages/image", { to: "+" + toDigits(to), image: imageUrl, caption: caption ?? "" });
  },
  async downloadMedia(msg) {
    if (!msg.mediaUrl) throw new Error("UltraMsg media requires mediaUrl");
    const res = await fetch(msg.mediaUrl);
    if (!res.ok) throw new Error(`UltraMsg media download failed: ${res.status}`);
    return { data: Buffer.from(await res.arrayBuffer()), mimeType: res.headers.get("content-type") ?? msg.mimeType ?? "application/octet-stream" };
  },
  parseWebhook(body) {
    const b = body as UltraWebhook | null;
    if (!b || b.event_type !== "message_received" || !b.data) return [];
    const d = b.data;
    if (d.fromMe) return [];
    const from = toE164(d.from);
    if (!from) return [];
    const kind = kindOf(d.type);
    const isMedia = kind === "image" || kind === "video" || kind === "document" || kind === "audio";
    const mediaUrl = isMedia ? d.media || (d.body && /^https?:\/\//.test(d.body) ? d.body : undefined) : undefined;
    const text = kind === "text" ? d.body ?? "" : d.caption || undefined;
    return [
      {
        providerMsgId: d.id ?? `ultramsg-${d.time ?? Date.now()}-${from}`,
        from,
        kind,
        text,
        mediaUrl,
        mimeType: d.mimetype,
        fileName: d.filename,
        raw: d,
      },
    ];
  },
};
