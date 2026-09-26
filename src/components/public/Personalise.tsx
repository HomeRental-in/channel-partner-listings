"use client";
import { useEffect } from "react";
import { track } from "./track";

/**
 * Handles the ?n= personalisation parameter on public listing pages.
 * - Strips `n` from the address bar BEFORE the pixel initialises (so the name never reaches Meta).
 * - Exposes the name to track() via window.__cdViewer so server events carry viewerName.
 * - Fires the page VIEW event exactly once.
 * Render this once per public page. Themes render the greeting themselves using `viewerName`.
 */
export function Personalise({ viewerName, listingId }: { viewerName: string | null; listingId: string | null }) {
  useEffect(() => {
    try {
      const url = new URL(location.href);
      if (url.searchParams.has("n")) {
        url.searchParams.delete("n");
        history.replaceState(history.state, "", url.pathname + (url.search || "") + url.hash);
      }
    } catch {}
    window.__cdViewer = viewerName;
    track("VIEW", listingId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
