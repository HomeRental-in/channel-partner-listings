import { toDigits, toE164, type InboundMessage, type WhatsappProvider } from "./provider";

/**
 * Meta WhatsApp Cloud API provider.
 * Env: META_WA_ACCESS_TOKEN, META_WA_PHONE_NUMBER_ID, META_WA_VERIFY_TOKEN (webhook GET verification).
 * Docs: https://developers.facebook.com/docs/whatsapp/cloud-api
 */
const GRAPH = "https://graph.facebook.com/v21.0";

function token() {
  const t = process.env.META_WA_ACCESS_TOKEN;
  if (!t) throw new Error("META_WA_ACCESS_TOKEN is not set");
  return t;
}
function phoneNumberId() {
  const id = process.env.META_WA_PHONE_NUMBER_ID;
  if (!id) throw new Error("META_WA_PHONE_NUMBER_ID is not set");
  return id;
}

async function send(payload: Record<string, unknown>) {
  const res = await fetch(`${GRAPH}/${phoneNumberId()}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${token()}`, "content-type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", ...payload }),
  });
  if (!res.ok) throw new Error(`Meta send failed: ${res.status} ${await res.text()}`);
}

// ── Webhook payload shapes (subset) ──
type MetaMedia = { id: string; mime_type?: string; sha256?: string; caption?: string; filename?: string };
type MetaMessage = {
  id: string;
  from: string; // digits, no '+'
  timestamp?: string;
  type: string; // text | image | video | document | audio | sticker | location | ...
  text?: { body: string };
  image?: MetaMedia;
  video?: MetaMedia;
  document?: MetaMedia;
  audio?: MetaMedia;
  sticker?: MetaMedia;
};
type MetaWebhook = {
  object?: string;
  entry?: { id?: string; changes?: { field?: string; value?: { messaging_product?: string; messages?: MetaMessage[] } }[] }[];
};

function normalise(m: MetaMessage): InboundMessage | null {
  const from = toE164(m.from);
  if (!from) return null;
  const base = { providerMsgId: m.id, from, raw: m } as const;
  switch (m.type) {
    case "text":
      return { ...base, kind: "text", text: m.text?.body ?? "" };
    case "image":
      return { ...base, kind: "image", mediaId: m.image?.id, mimeType: m.image?.mime_type, text: m.image?.caption };
    case "video":
      return { ...base, kind: "video", mediaId: m.video?.id, mimeType: m.video?.mime_type, text: m.video?.caption };
    case "document":
      return { ...base, kind: "document", mediaId: m.document?.id, mimeType: m.document?.mime_type, fileName: m.document?.filename, text: m.document?.caption };
    case "audio":
      return { ...base, kind: "audio", mediaId: m.audio?.id, mimeType: m.audio?.mime_type };
    default:
      return { ...base, kind: "other" };
  }
}

export const metaProvider: WhatsappProvider = {
  name: "meta",
  async sendText(to, text) {
    await send({ to: toDigits(to), type: "text", text: { body: text, preview_url: true } });
  },
  async sendImage(to, imageUrl, caption) {
    await send({ to: toDigits(to), type: "image", image: { link: imageUrl, ...(caption ? { caption } : {}) } });
  },
  async downloadMedia(msg) {
    if (!msg.mediaId) throw new Error("Meta media requires mediaId");
    const meta = await fetch(`${GRAPH}/${msg.mediaId}`, { headers: { authorization: `Bearer ${token()}` } });
    if (!meta.ok) throw new Error(`Meta media lookup failed: ${meta.status}`);
    const info = (await meta.json()) as { url?: string; mime_type?: string };
    if (!info.url) throw new Error("Meta media lookup returned no url");
    const file = await fetch(info.url, { headers: { authorization: `Bearer ${token()}` } });
    if (!file.ok) throw new Error(`Meta media download failed: ${file.status}`);
    return { data: Buffer.from(await file.arrayBuffer()), mimeType: info.mime_type ?? file.headers.get("content-type") ?? msg.mimeType ?? "application/octet-stream" };
  },
  parseWebhook(body) {
    const b = body as MetaWebhook | null;
    if (!b || b.object !== "whatsapp_business_account" || !Array.isArray(b.entry)) return [];
    const out: InboundMessage[] = [];
    for (const entry of b.entry) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        if (!value || value.messaging_product !== "whatsapp" || !Array.isArray(value.messages)) continue; // statuses etc.
        for (const m of value.messages) {
          const n = normalise(m);
          if (n) out.push(n);
        }
      }
    }
    return out;
  },
};

/** Meta webhook verification (GET). Returns the challenge to echo, or null when the token does not match. */
export function verifyMetaWebhook(params: URLSearchParams): string | null {
  const mode = params.get("hub.mode");
  const verify = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");
  const expected = process.env.META_WA_VERIFY_TOKEN;
  if (mode === "subscribe" && expected && verify === expected && challenge) return challenge;
  return null;
}
