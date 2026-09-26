import { NextResponse, after, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { mockProvider } from "@/lib/whatsapp/mock";
import { toE164 } from "@/lib/whatsapp/provider";
import { ingestInbound, processInbound } from "@/lib/whatsapp/intake";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const isDev = () => process.env.NODE_ENV === "development";

/**
 * Dev-only: feed a fake inbound message through the real intake pipeline using the mock provider
 * (outbound replies are captured in WhatsappMessage with direction OUT).
 * Body: { from, text?, mediaUrl?, kind? }
 */
export async function POST(req: NextRequest) {
  if (!isDev()) return new NextResponse("Not found", { status: 404 });
  const body = (await req.json().catch(() => ({}))) as { from?: string; text?: string; mediaUrl?: string; kind?: string; fileName?: string };
  const from = toE164(body.from);
  if (!from) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  const kind = (body.kind ?? (body.mediaUrl ? "image" : "text")) as "text" | "image" | "video" | "document" | "audio" | "other";
  const [msg] = mockProvider.parseWebhook(
    { from, kind, text: body.text, mediaUrl: body.mediaUrl, fileName: body.fileName, providerMsgId: `sim-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` },
    req.headers,
  );
  if (!msg) return NextResponse.json({ error: "Nothing to send" }, { status: 400 });
  const ctx = await ingestInbound(msg);
  if (ctx) after(() => processInbound(ctx, mockProvider));
  return NextResponse.json({ ok: true, messageId: ctx?.row.id ?? null, conversationId: ctx?.conversation.id ?? null });
}

export type SimulateTranscript = {
  phone: string;
  state: "IDLE" | "COLLECTING" | "PROCESSING" | null;
  draftListingId: string | null;
  messages: { id: string; direction: string; kind: string; text: string | null; mediaUrl: string | null; createdAt: string }[];
};

/** Dev-only transcript for the simulator UI: GET /api/whatsapp/simulate?from=+9198... */
export async function GET(req: NextRequest) {
  if (!isDev()) return new NextResponse("Not found", { status: 404 });
  const from = toE164(req.nextUrl.searchParams.get("from"));
  if (!from) return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
  const conv = await db.whatsappConversation.findUnique({
    where: { phone: from },
    include: { messages: { where: { kind: { not: "system" } }, orderBy: { createdAt: "desc" }, take: 100 } },
  });
  const out: SimulateTranscript = {
    phone: from,
    state: conv?.state ?? null,
    draftListingId: conv?.draftListingId ?? null,
    messages: (conv?.messages ?? [])
      .reverse()
      .map((m) => ({ id: m.id, direction: m.direction, kind: m.kind, text: m.text, mediaUrl: m.mediaUrl, createdAt: m.createdAt.toISOString() })),
  };
  return NextResponse.json(out);
}
