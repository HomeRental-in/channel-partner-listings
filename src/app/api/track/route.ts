import { NextRequest, after } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { recordEvent } from "@/lib/analytics";
import { sendCapiEvent } from "@/lib/capi";

export const dynamic = "force-dynamic";

/**
 * POST /api/track — browser → server event mirror.
 * Body: {type, listingId, eventId, viewerName, path, referrer, meta}. Always answers 204.
 * Stores the event (no PII beyond the CP-typed ?n= label) and mirrors it to Meta CAPI (never with the name).
 */
const EVENT_TYPES = ["VIEW", "WHATSAPP_TAP", "CALL_TAP", "SHARE", "BROCHURE_DOWNLOAD", "DOC_DOWNLOAD", "PHOTO_VIEW", "VIDEO_PLAY", "MAP_OPEN", "FORM_OPEN"] as const;

const Body = z.object({
  type: z.enum(EVENT_TYPES),
  listingId: z.string().max(64).nullish(),
  eventId: z.string().max(64).optional(),
  viewerName: z.string().max(40).nullish(),
  path: z.string().max(512).nullish(),
  referrer: z.string().max(1024).nullish(),
  meta: z.record(z.string(), z.unknown()).optional(),
});

const ROOT = (process.env.ROOT_DOMAIN ?? process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000").toLowerCase();
const RESERVED = new Set(["www", "app", "api", "admin", "mail", "static", "cdn", "assets"]);

function deviceFrom(ua: string | null): string | null {
  if (!ua) return null;
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) return "tablet";
  if (/mobi|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return "mobile";
  return "desktop";
}

function cityFrom(req: NextRequest): string | null {
  const raw = req.headers.get("x-vercel-ip-city") ?? req.headers.get("cf-ipcity");
  if (!raw) return null;
  try {
    return decodeURIComponent(raw).slice(0, 80);
  } catch {
    return raw.slice(0, 80);
  }
}

function ipFrom(req: NextRequest): string | null {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim() || null;
  return req.headers.get("x-real-ip") ?? req.headers.get("cf-connecting-ip") ?? null;
}

/** Subdomain (CP username) of the request host, if any — used to attribute storefront views. */
function usernameFromHost(host: string | null): string | null {
  const h = (host ?? "").toLowerCase();
  if (!h || h === ROOT || !h.endsWith("." + ROOT)) return null;
  const sub = h.slice(0, -(ROOT.length + 1));
  return sub && !RESERVED.has(sub) && !sub.includes(".") ? sub : null;
}

const NO_CONTENT = () => new Response(null, { status: 204 });

export async function POST(req: NextRequest) {
  let parsed: z.infer<typeof Body>;
  try {
    parsed = Body.parse(await req.json());
  } catch {
    return NO_CONTENT();
  }

  try {
    const ua = req.headers.get("user-agent");
    const host = req.headers.get("host");
    const visitorId = req.cookies.get("cd_vid")?.value ?? null;
    const path = parsed.path ?? null;

    const listing = parsed.listingId
      ? await db.listing.findUnique({
          where: { id: parsed.listingId },
          select: { id: true, userId: true, title: true, city: true, price: true, bhk: true, propertyType: true, user: { select: { username: true } }, project: { select: { slug: true } } },
        })
      : null;

    let ownerId = listing?.userId ?? null;
    if (!ownerId) {
      // Storefront / collection views carry no listing: attribute to the subdomain's CP (or agency owner).
      const username = usernameFromHost(host);
      if (username) {
        const u = await db.user.findUnique({ where: { username }, select: { id: true } });
        ownerId = u?.id ?? (await db.agency.findUnique({ where: { username }, select: { ownerId: true } }))?.ownerId ?? null;
      }
    }
    if (!ownerId) return NO_CONTENT();

    await recordEvent({
      listingId: listing?.id ?? null,
      ownerId,
      type: parsed.type,
      visitorId,
      viewerName: parsed.viewerName?.trim() || null,
      city: cityFrom(req),
      device: deviceFrom(ua),
      referrer: parsed.referrer ?? null,
      path,
      meta: parsed.meta ? JSON.parse(JSON.stringify({ ...parsed.meta, eventId: parsed.eventId })) : { eventId: parsed.eventId },
    });

    // Mirror to Meta CAPI after the response is sent. Never includes viewerName.
    const proto = req.headers.get("x-forwarded-proto") ?? (host?.startsWith("localhost") || host?.endsWith(".localhost:3000") ? "http" : "https");
    const sourceUrl = host && path ? `${proto}://${host}${path}` : null;
    const capiInput = {
      type: parsed.type,
      eventId: parsed.eventId ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      sourceUrl,
      ip: ipFrom(req),
      userAgent: ua,
      fbp: req.cookies.get("_fbp")?.value ?? null,
      fbc: req.cookies.get("_fbc")?.value ?? null,
      visitorId,
      listing: listing
        ? { id: listing.id, title: listing.title, city: listing.city, price: listing.price, configuration: listing.bhk ?? listing.propertyType, cpUsername: listing.user.username, projectSlug: listing.project?.slug ?? null }
        : null,
    };
    after(() => sendCapiEvent(capiInput));
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.warn("[track] failed", (err as Error)?.message);
  }
  return NO_CONTENT();
}
