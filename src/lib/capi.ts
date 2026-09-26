import { createHash } from "node:crypto";
import { priceBand } from "./format";

/**
 * Meta Conversions API mirror. Every browser event carries the same event_id, so Meta deduplicates.
 * Never receives buyer names (viewerName) — only the listing facts and Meta's own cookies.
 * No-op when META_CAPI_ACCESS_TOKEN / NEXT_PUBLIC_META_PIXEL_ID are unset.
 */
const GRAPH = "https://graph.facebook.com/v21.0";
const TIMEOUT_MS = 3000;

/** Browser event → Meta standard event. Anything not listed is server-only (never mirrored). */
export const CAPI_EVENT_NAME: Record<string, string | undefined> = {
  VIEW: "ViewContent",
  BROCHURE_DOWNLOAD: "ViewContent",
  WHATSAPP_TAP: "Contact",
  CALL_TAP: "Contact",
};

export type CapiListing = {
  id: string;
  title?: string | null;
  city: string | null;
  price: number | null;
  /** "4 BHK" etc. — falls back to propertyType */
  configuration: string | null;
  cpUsername: string | null;
  projectSlug: string | null;
};

export type CapiInput = {
  type: string;
  eventId: string;
  /** Absolute page URL WITHOUT the ?n= parameter. */
  sourceUrl: string | null;
  ip: string | null;
  userAgent: string | null;
  fbp: string | null;
  fbc: string | null;
  /** First-party random visitor id (cd_vid). Hashed before sending; never an identity. */
  visitorId: string | null;
  listing: CapiListing | null;
  eventTime?: number;
};

function sha256(s: string) {
  return createHash("sha256").update(s.trim().toLowerCase()).digest("hex");
}

export function capiEnabled() {
  return Boolean(process.env.META_CAPI_ACCESS_TOKEN && process.env.NEXT_PUBLIC_META_PIXEL_ID);
}

/** Build the payload (exported for tests / inspection). Returns null when the event is not mirrored. */
export function buildCapiPayload(e: CapiInput) {
  const eventName = CAPI_EVENT_NAME[e.type];
  if (!eventName) return null;
  const userData: Record<string, unknown> = {};
  if (e.ip) userData.client_ip_address = e.ip; // Meta requires ip + ua un-hashed for matching
  if (e.userAgent) userData.client_user_agent = e.userAgent;
  if (e.fbp) userData.fbp = e.fbp;
  if (e.fbc) userData.fbc = e.fbc;
  if (e.visitorId) userData.external_id = [sha256(e.visitorId)];
  const l = e.listing;
  const customData: Record<string, unknown> = l
    ? {
        content_type: "product",
        content_ids: [l.id],
        content_name: l.title ?? undefined,
        content_category: l.city ?? undefined,
        price_band: priceBand(l.price),
        configuration: l.configuration ?? undefined,
        cp_username: l.cpUsername ?? undefined,
        project_slug: l.projectSlug ?? undefined,
        currency: "INR",
      }
    : {};
  const data = {
    event_name: eventName,
    event_time: e.eventTime ?? Math.floor(Date.now() / 1000),
    event_id: e.eventId,
    action_source: "website",
    event_source_url: e.sourceUrl ?? undefined,
    user_data: userData,
    custom_data: customData,
  };
  const testCode = process.env.META_CAPI_TEST_EVENT_CODE;
  return { data: [data], ...(testCode ? { test_event_code: testCode } : {}) };
}

/** Fire-and-forget mirror. Resolves quietly on any failure; 3s hard timeout. */
export async function sendCapiEvent(e: CapiInput): Promise<void> {
  if (!capiEnabled()) return;
  const payload = buildCapiPayload(e);
  if (!payload) return;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID!;
  const token = process.env.META_CAPI_ACCESS_TOKEN!;
  try {
    const res = await fetch(`${GRAPH}/${pixelId}/events?access_token=${encodeURIComponent(token)}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok && process.env.NODE_ENV !== "production") {
      console.warn("[capi]", res.status, await res.text().catch(() => ""));
    }
  } catch (err) {
    if (process.env.NODE_ENV !== "production") console.warn("[capi] failed", (err as Error)?.message);
  }
}
