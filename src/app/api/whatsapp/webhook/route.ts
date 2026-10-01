import { NextResponse, after, type NextRequest } from "next/server";
import { getProvider } from "@/lib/whatsapp/provider";
import { verifyMetaWebhook } from "@/lib/whatsapp/meta";
import { ingestInbound, processInbound, type IngestResult } from "@/lib/whatsapp/intake";

export const dynamic = "force-dynamic";
export const maxDuration = 120; // AI extraction runs in after(); keep the worker alive long enough

/** Meta Cloud API webhook verification handshake. */
export async function GET(req: NextRequest) {
  const challenge = verifyMetaWebhook(req.nextUrl.searchParams);
  if (challenge) return new NextResponse(challenge, { status: 200, headers: { "content-type": "text/plain" } });
  return new NextResponse("Forbidden", { status: 403 });
}

/**
 * Inbound messages from whichever provider is configured (WHATSAPP_PROVIDER).
 * Persist quickly, respond 200, then run the intake state machine after the response so the
 * provider never retries because of a slow AI call.
 */
export async function POST(req: NextRequest) {
  // Providers differ: Meta posts JSON; UltraMsg may post form-encoded (event_type=...&data[from]=...).
  const raw = await req.text();
  const contentType = req.headers.get("content-type") ?? "";
  let body: unknown = null;
  try {
    body = JSON.parse(raw);
  } catch {
    body = parseFormBody(raw);
    if (!body) {
      console.warn("[whatsapp:webhook] unparseable body", JSON.stringify({ contentType, length: raw.length }));
      return NextResponse.json({ ok: true, received: 0 });
    }
  }
  const provider = getProvider();
  let messages: ReturnType<typeof provider.parseWebhook> = [];
  try {
    messages = provider.parseWebhook(body, req.headers);
  } catch (err) {
    console.error("[whatsapp:webhook] parse failed", err);
    return NextResponse.json({ ok: true, received: 0 });
  }

  const ingested: IngestResult[] = [];
  for (const msg of messages) {
    try {
      const ctx = await ingestInbound(msg);
      if (ctx) ingested.push(ctx);
    } catch (err) {
      console.error("[whatsapp:webhook] ingest failed", err);
    }
  }

  if (ingested.length) {
    after(async () => {
      // Sequential per webhook so a photo burst updates the same conversation in order.
      for (const ctx of ingested) await processInbound(ctx, provider);
    });
  }
  return NextResponse.json({ ok: true, received: messages.length, new: ingested.length });
}

/** Parse "a=1&data[from]=x&data[quotedMsg][id]=y" into { a: "1", data: { from: "x", quotedMsg: { id: "y" } } }. */
function parseFormBody(raw: string): Record<string, unknown> | null {
  if (!raw || !raw.includes("=")) return null;
  const out: Record<string, unknown> = {};
  for (const [key, value] of new URLSearchParams(raw)) {
    const path = key.replace(/\]/g, "").split("[").filter(Boolean);
    let cur: Record<string, unknown> = out;
    path.forEach((part, i) => {
      if (i === path.length - 1) {
        cur[part] = value === "true" ? true : value === "false" ? false : value;
      } else {
        if (typeof cur[part] !== "object" || cur[part] === null) cur[part] = {};
        cur = cur[part] as Record<string, unknown>;
      }
    });
  }
  return out;
}
