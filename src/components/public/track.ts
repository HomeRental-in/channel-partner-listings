"use client";
/**
 * Browser-side event tracking. Fires Meta Pixel (if loaded) and mirrors to POST /api/track (server → CAPI).
 * Same event_id on both sides so Meta deduplicates. Never send names/phones here.
 */
export type TrackType = "VIEW" | "WHATSAPP_TAP" | "CALL_TAP" | "SHARE" | "BROCHURE_DOWNLOAD" | "DOC_DOWNLOAD" | "PHOTO_VIEW" | "VIDEO_PLAY" | "MAP_OPEN" | "FORM_OPEN";

/** Pixel calls queued before fbevents.js has initialised (the Pixel mounts after Personalise strips ?n=). */
export type QueuedPixelCall = { name: string; payload: Record<string, unknown>; eventId: string };

declare global {
  interface Window { fbq?: (...args: unknown[]) => void; __cdViewer?: string | null; __cdPixelQueue?: QueuedPixelCall[] }
}

function eventId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const META_EVENT: Partial<Record<TrackType, string>> = { VIEW: "ViewContent", WHATSAPP_TAP: "Contact", CALL_TAP: "Contact", BROCHURE_DOWNLOAD: "ViewContent" };

export function track(type: TrackType, listingId: string | null, meta: Record<string, unknown> = {}) {
  const id = eventId();
  const metaName = META_EVENT[type];
  if (metaName) {
    const payload = { content_ids: listingId ? [listingId] : undefined, content_type: "product", ...meta };
    if (window.fbq) {
      try {
        window.fbq("track", metaName, payload, { eventID: id });
      } catch {}
    } else {
      // Pixel not ready yet (it initialises after ?n= is stripped): queue with the same event_id so CAPI dedups.
      (window.__cdPixelQueue ??= []).push({ name: metaName, payload, eventId: id });
    }
  }
  const body = JSON.stringify({ type, listingId, eventId: id, viewerName: window.__cdViewer ?? null, path: location.pathname, referrer: document.referrer || null, meta });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, headers: { "content-type": "application/json" }, keepalive: true });
  } catch {}
}
