import { ImageResponse } from "next/og";
import { readStored } from "@/lib/storage";
import { BRAND } from "@/lib/site";
import type { PublicListing } from "@/components/themes/types";
import { localityLine, summaryLine } from "@/components/themes/shared/helpers";

export const OG_SIZE = { width: 1200, height: 630 };

/** Cover photo → 1200×630 JPEG data URL (WebP uploads are not renderable by Satori, so we transcode). */
async function coverDataUrl(url: string): Promise<string | null> {
  try {
    const buf = await readStored(url);
    const sharp = (await import("sharp")).default;
    const out = await sharp(buf).rotate().resize(OG_SIZE.width, OG_SIZE.height, { fit: "cover" }).jpeg({ quality: 78 }).toBuffer();
    return `data:image/jpeg;base64,${out.toString("base64")}`;
  } catch {
    return null;
  }
}

/** Shared OG image for listing routes: cover + price + title + broker. */
export async function listingOgImage(l: PublicListing | null) {
  if (!l) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#F6F3EE", color: "#141414", fontSize: 56 }}>{BRAND}</div>,
      OG_SIZE,
    );
  }
  const cover = l.cover ? await coverDataUrl(l.cover.url) : null;
  const meta = [summaryLine(l), localityLine(l)].filter(Boolean).join("  ·  ");
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#141414", color: "#fff", fontFamily: "sans-serif" }}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt="" width={OG_SIZE.width} height={OG_SIZE.height} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        ) : (
          <div style={{ position: "absolute", inset: 0, background: "#2a2622" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(20,20,20,0) 30%, rgba(20,20,20,0.85) 100%)" }} />
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 48, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, letterSpacing: -2, lineHeight: 1 }}>{l.priceDisplay}</div>
          <div style={{ display: "flex", fontSize: 36, lineHeight: 1.15, maxWidth: 1000, overflow: "hidden" }}>{(l.title || "Property listing").slice(0, 90)}</div>
          {meta && <div style={{ display: "flex", fontSize: 24, opacity: 0.85 }}>{meta}</div>}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 14, fontSize: 22, opacity: 0.9 }}>
            <div style={{ display: "flex" }}>{l.broker.card.showNamePhoto && l.broker.hasName ? l.broker.name : l.broker.agencyName ?? BRAND}{l.broker.card.showAgency && l.broker.agencyName && l.broker.card.showNamePhoto ? ` · ${l.broker.agencyName}` : ""}</div>
            <div style={{ display: "flex", padding: "8px 18px", borderRadius: 999, background: "#F6F3EE", color: "#141414", fontSize: 20 }}>{BRAND}</div>
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
