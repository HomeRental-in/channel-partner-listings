"use client";
import { useEffect } from "react";

/**
 * Meta Pixel bootstrap. Injects fbevents.js and runs fbq('init') only when NEXT_PUBLIC_META_PIXEL_ID is set.
 * Must mount AFTER <Personalise> so its effect runs after the ?n= parameter has been stripped from the URL
 * (React runs sibling effects in tree order). Flushes any pixel calls queued by track() before init so the
 * browser event and the server CAPI mirror share the same event_id.
 */
const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const SRC = "https://connect.facebook.net/en_US/fbevents.js";

type FbqStub = ((...args: unknown[]) => void) & { callMethod?: (...args: unknown[]) => void; queue: unknown[]; loaded: boolean; version: string; push: unknown };

function ensureFbq(): (...args: unknown[]) => void {
  if (window.fbq) return window.fbq;
  const stub = function (...args: unknown[]) {
    if (stub.callMethod) stub.callMethod(...args);
    else stub.queue.push(args);
  } as FbqStub;
  stub.push = stub;
  stub.loaded = true;
  stub.version = "2.0";
  stub.queue = [];
  window.fbq = stub;
  (window as unknown as { _fbq?: unknown })._fbq ??= stub;
  const s = document.createElement("script");
  s.async = true;
  s.src = SRC;
  document.head.appendChild(s);
  return stub;
}

let initialised = false;

export function Pixel() {
  useEffect(() => {
    if (!PIXEL_ID) return;
    // Belt and braces: never initialise while a personalisation name is still in the address bar.
    if (new URL(location.href).searchParams.has("n")) {
      const url = new URL(location.href);
      url.searchParams.delete("n");
      history.replaceState(history.state, "", url.pathname + (url.search || "") + url.hash);
    }
    const fbq = ensureFbq();
    try {
      if (!initialised) {
        fbq("init", PIXEL_ID);
        initialised = true;
      }
      fbq("track", "PageView");
      const queued = window.__cdPixelQueue ?? [];
      window.__cdPixelQueue = [];
      for (const q of queued) fbq("track", q.name, q.payload, { eventID: q.eventId });
    } catch {}
  }, []);
  return null;
}
