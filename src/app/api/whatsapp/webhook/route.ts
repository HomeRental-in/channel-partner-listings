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
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: true, received: 0 });
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
