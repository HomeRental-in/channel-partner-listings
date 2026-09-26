import type { WhatsappConversation, WhatsappMessage, User, Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { findOrCreateUserByPhone, signReviewToken } from "@/lib/auth";
import { extractListing } from "@/lib/ai";
import { absoluteUrl, readStored, storeFile, storeImage } from "@/lib/storage";
import { rootUrl } from "@/lib/site";
import { createListingFromExtraction } from "@/lib/listings";
import { istDayStart } from "@/lib/reports";
import type { InboundMessage, WhatsappProvider } from "./provider";

/**
 * WhatsApp intake state machine (Flow A).
 *
 *   IDLE ──any message──▶ COLLECTING ──DONE──▶ PROCESSING ──listing created──▶ IDLE
 *
 * A "session" is everything the CP sent since the last boundary. Boundaries are OUT rows with
 * kind "system" and raw {marker:"boundary", since} written by this module (provider-independent);
 * they are hidden from transcripts. Media is downloaded on receipt and the stored URL lives on
 * WhatsappMessage.mediaUrl, so pending photos/video/documents are simply the session's media rows.
 */

export const DONE_RE = /^(done|ho gaya|hogaya|bas|finish|finished|complete|ok done)$/i;
const HELP_RE = /^(help|\?|how|kaise)$/i;
const CANCEL_RE = /^(cancel|stop|rehne do)$/i;
const NEW_RE = /^(new|start|restart|start over|naya)$/i;

const MAX_DAILY_UNVERIFIED = 10;

export const WELCOME = "Hi! Send me photos and a few lines about the property — price, BHK, area, locality, project name. Type DONE when finished.";
const HELP = [
  "Here's how it works:",
  "1. Send photos of the property (up to 20).",
  "2. Send a few lines — price, BHK, area, locality, project name.",
  "3. Type DONE. I'll build the listing page and send you a link to review.",
  "Type NEW to start over, CANCEL to discard.",
].join("\n");

export type IngestResult = { conversation: WhatsappConversation; user: User; row: WhatsappMessage; msg: InboundMessage };

/**
 * Persist an inbound message. Returns null when it was already seen (providerMsgId de-dupe).
 * Fast and DB-only so webhooks can respond 200 before the heavy work in processInbound().
 */
export async function ingestInbound(msg: InboundMessage): Promise<IngestResult | null> {
  if (msg.providerMsgId) {
    const seen = await db.whatsappMessage.findUnique({ where: { providerMsgId: msg.providerMsgId }, select: { id: true } });
    if (seen) return null;
  }
  const user = await findOrCreateUserByPhone(msg.from);
  const conversation = await db.whatsappConversation.upsert({
    where: { phone: msg.from },
    update: { userId: user.id, lastMessageAt: new Date() },
    create: { phone: msg.from, userId: user.id },
  });
  const row = await db.whatsappMessage.create({
    data: {
      conversationId: conversation.id,
      providerMsgId: msg.providerMsgId || null,
      direction: "IN",
      kind: msg.kind,
      text: msg.text?.trim() || null,
      mediaUrl: null,
      raw: (msg.raw ?? null) as Prisma.InputJsonValue,
    },
  });
  return { conversation, user, row, msg };
}

/** Run the state machine for one ingested message. Safe to call after the HTTP response. */
export async function processInbound(ctx: IngestResult, provider: WhatsappProvider) {
  const m = new Machine(ctx, provider);
  try {
    await m.run();
  } catch (err) {
    console.error("[whatsapp:intake] failed", err);
    await m.say("Sorry, something went wrong on my side. Please try again in a minute.").catch(() => {});
  }
}

/** Ingest + process in one go (used by the dev simulator). */
export async function handleInbound(msg: InboundMessage, provider: WhatsappProvider) {
  const ctx = await ingestInbound(msg);
  if (ctx) await processInbound(ctx, provider);
  return ctx;
}

// ────────────────────────────────────────────────────────────────────────────

class Machine {
  private conv: WhatsappConversation;
  private readonly user: User;
  private readonly row: WhatsappMessage;
  private readonly msg: InboundMessage;

  constructor(ctx: IngestResult, private readonly provider: WhatsappProvider) {
    this.conv = ctx.conversation;
    this.user = ctx.user;
    this.row = ctx.row;
    this.msg = ctx.msg;
  }

  async say(text: string) {
    await this.provider.sendText(this.conv.phone, text);
  }

  private async setState(state: WhatsappConversation["state"], extra: Prisma.WhatsappConversationUpdateInput = {}) {
    this.conv = await db.whatsappConversation.update({ where: { id: this.conv.id }, data: { state, ...extra } });
  }

  /** Mark the start of a fresh session. Everything the CP sends at/after `since` belongs to it. */
  private async boundary(since: Date) {
    await db.whatsappMessage.create({
      data: { conversationId: this.conv.id, direction: "OUT", kind: "system", text: null, raw: { marker: "boundary", since: since.toISOString() } },
    });
  }

  private async sessionMessages(): Promise<WhatsappMessage[]> {
    const b = await db.whatsappMessage.findFirst({
      where: { conversationId: this.conv.id, direction: "OUT", kind: "system" },
      orderBy: { createdAt: "desc" },
    });
    const raw = (b?.raw ?? {}) as { since?: string };
    const since = raw.since ? new Date(raw.since) : b?.createdAt;
    return db.whatsappMessage.findMany({
      where: { conversationId: this.conv.id, direction: "IN", ...(since ? { createdAt: { gte: since } } : {}) },
      orderBy: { createdAt: "asc" },
    });
  }

  private command(): "done" | "help" | "cancel" | "new" | null {
    if (this.msg.kind !== "text") return null;
    const t = (this.msg.text ?? "").trim();
    if (DONE_RE.test(t)) return "done";
    if (HELP_RE.test(t)) return "help";
    if (CANCEL_RE.test(t)) return "cancel";
    if (NEW_RE.test(t)) return "new";
    return null;
  }

  async run() {
    const cmd = this.command();
    const isMedia = this.msg.kind === "image" || this.msg.kind === "video" || this.msg.kind === "document";

    if (this.conv.state === "PROCESSING") {
      if (cmd === "cancel" || cmd === "new") {
        // Escape hatch if a previous run died mid-way.
        await this.boundary(new Date());
        await this.setState(cmd === "new" ? "COLLECTING" : "IDLE");
        await this.say(cmd === "new" ? "Starting fresh. Send photos and details, then type DONE." : "Cancelled. Send photos whenever you're ready.");
        return;
      }
      await this.say("Hold on — still preparing your last listing. I'll send the link in a moment.");
      return;
    }

    if (this.conv.state === "IDLE") {
      await this.boundary(this.row.createdAt);
      await this.setState("COLLECTING");
      await this.say(WELCOME);
      if (cmd === "help") await this.say(HELP);
      if (isMedia) await this.storeMedia({ quiet: true });
      return;
    }

    // COLLECTING
    switch (cmd) {
      case "help":
        await this.say(HELP);
        return;
      case "cancel":
        await this.boundary(new Date());
        await this.setState("IDLE", { draftListingId: null });
        await this.say("Cancelled — I've discarded those photos and notes. Send photos whenever you're ready.");
        return;
      case "new":
        await this.boundary(new Date());
        await this.setState("COLLECTING", { draftListingId: null });
        await this.say("Starting fresh. Send photos and a few lines about the property, then type DONE.");
        return;
      case "done":
        await this.finalize();
        return;
    }

    if (isMedia) {
      await this.storeMedia({ quiet: false });
      return;
    }
    if (this.msg.kind === "audio") {
      await this.say("I can't listen to voice notes yet — please type the details (price, BHK, area, locality).");
      return;
    }
    if (this.msg.kind === "text") {
      const session = await this.sessionMessages();
      const texts = session.filter((r) => r.kind === "text" && r.text);
      if (texts.length === 1) await this.say("Noted 👍 Send more photos or details, and type DONE when finished.");
      return;
    }
    await this.say("I can only read photos, videos, PDFs and text. Type HELP for instructions.");
  }

  /** Download the inbound media via the provider, store it, and attach the stored URL to the message row. */
  private async storeMedia(opts: { quiet: boolean }) {
    let stored: { url: string } | null = null;
    try {
      const { data, mimeType } = await this.provider.downloadMedia(this.msg);
      if (this.msg.kind === "image") {
        stored = await storeImage(data, "photos");
      } else if (this.msg.kind === "video") {
        const ext = extFor(mimeType, "mp4");
        stored = await storeFile(data, { ext, folder: "videos", contentType: mimeType });
      } else {
        const ext = extFor(mimeType, this.msg.fileName?.split(".").pop() || "pdf");
        stored = await storeFile(data, { ext, folder: "documents", contentType: mimeType });
      }
    } catch (err) {
      console.error("[whatsapp:intake] media download failed", err);
      await this.say(`I couldn't download that ${this.msg.kind}. Please send it again.`);
      return;
    }
    await db.whatsappMessage.update({ where: { id: this.row.id }, data: { mediaUrl: stored.url } });
    if (opts.quiet) return;

    if (this.msg.kind === "image") {
      const session = await this.sessionMessages();
      const n = session.filter((r) => r.kind === "image" && r.mediaUrl).length;
      if (n % 3 === 0) await this.say(`Got ${n} photos so far. Send more, or type DONE.`);
    } else if (this.msg.kind === "video") {
      await this.say("Got the video — it'll go on the listing page as the walkthrough.");
    } else {
      await this.say("Got the document — it'll be attached to the listing.");
    }
  }

  private async finalize() {
    const session = await this.sessionMessages();
    const texts = session.filter((r) => r.kind === "text" && r.text && !DONE_RE.test(r.text) && !HELP_RE.test(r.text)).map((r) => r.text!.trim());
    const photos = session.filter((r) => r.kind === "image" && r.mediaUrl).map((r) => r.mediaUrl!);
    const videos = session.filter((r) => r.kind === "video" && r.mediaUrl).map((r) => r.mediaUrl!);
    const documents = session.filter((r) => r.kind === "document" && r.mediaUrl);

    if (!photos.length && !texts.length) {
      await this.say("Nothing to work with yet — send a few photos and a line or two about the property, then type DONE.");
      return;
    }

    if (!this.user.username) {
      const today = await db.listing.count({ where: { userId: this.user.id, createdAt: { gte: istDayStart() } } });
      if (today >= MAX_DAILY_UNVERIFIED) {
        await this.say(`You've created ${MAX_DAILY_UNVERIFIED} listings today — that's the limit until you finish setting up your profile. Open your dashboard to pick a username and the limit goes away: ${rootUrl("/dashboard")}`);
        return;
      }
    }

    await this.setState("PROCESSING");
    await this.say(photos.length ? `Working on it — ${photos.length} photo${photos.length === 1 ? "" : "s"} and your notes. Give me a minute…` : "Working on it — give me a minute…");

    try {
      const originalMessage = texts.join("\n");
      const images = await imageInputs(photos.slice(0, 8));
      const extracted = await extractListing({ text: originalMessage, ...images });
      const listing = await createListingFromExtraction(
        this.user.id,
        extracted,
        photos.map((url) => ({ url })),
        originalMessage,
        "WHATSAPP",
        { videoUrl: videos.at(-1) ?? null },
      );
      if (documents.length) {
        await db.document.createMany({
          data: documents.map((d, i) => ({
            listingId: listing.id,
            url: d.mediaUrl!,
            name: docName(d, i),
            sizeBytes: 0,
          })),
        });
      }
      await this.boundary(new Date());
      await this.setState("IDLE", { draftListingId: listing.id });
      const token = await signReviewToken(listing.id);
      const url = rootUrl(`/review/${listing.id}?t=${token}`);
      await this.say(`Your listing is ready to review 👇\n${url}\nFix anything, then tap Publish.`);
      if (extracted.missing?.length) {
        await this.say(`Tip: I couldn't find ${extracted.missing.slice(0, 3).join(", ")} in your message — add it on the review page.`);
      }
    } catch (err) {
      console.error("[whatsapp:intake] extraction failed", err);
      await this.setState("COLLECTING");
      await this.say("Sorry, I couldn't build the listing just now. Your photos and notes are safe — add a line or two more and type DONE again.");
    }
  }
}

// ── helpers ──

function extFor(mime: string, fallback: string) {
  const map: Record<string, string> = {
    "video/mp4": "mp4",
    "video/quicktime": "mov",
    "video/3gpp": "3gp",
    "video/webm": "webm",
    "application/pdf": "pdf",
    "application/msword": "doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };
  return map[mime.split(";")[0].trim()] ?? (fallback.replace(/[^a-z0-9]/gi, "").toLowerCase() || "bin");
}

function docName(d: WhatsappMessage, i: number) {
  const raw = (d.raw ?? {}) as { fileName?: string; filename?: string; document?: { filename?: string } };
  return raw.fileName ?? raw.filename ?? raw.document?.filename ?? d.text ?? `Document ${i + 1}`;
}

/**
 * Claude can fetch public URLs but not localhost, so in dev (or with the local storage driver on a
 * non-public host) we send bytes instead.
 */
async function imageInputs(urls: string[]): Promise<{ imageUrls?: string[]; imageBuffers?: { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" }[] }> {
  const abs = urls.map(absoluteUrl);
  const isLocal = abs.some((u) => /^https?:\/\/(localhost|127\.0\.0\.1|[^/]*\.localhost|[^/]*lvh\.me)/.test(u));
  if (!isLocal) return { imageUrls: abs };
  const imageBuffers: { data: Buffer; mediaType: "image/jpeg" | "image/png" | "image/webp" }[] = [];
  for (const u of urls) {
    try {
      imageBuffers.push({ data: await readStored(u), mediaType: "image/webp" }); // storeImage() always encodes WebP
    } catch (err) {
      console.warn("[whatsapp:intake] could not read stored image", u, err);
    }
  }
  return { imageBuffers };
}
