/* eslint-disable jsx-a11y/alt-text, @next/next/no-img-element -- satori (ImageResponse) requires plain <img> */
import React from "react";
import type { PublicListing } from "@/components/themes/types";
import { BRAND } from "@/lib/site";
import { paletteFor, TRANSACTION_LABEL, type OutputPalette } from "./theme";

export const STORY_W = 1080;
export const STORY_H = 1920;

// ── Font: try Outfit from Google Fonts (cached in memory); fall back to satori's default sans and "Rs." for ₹ ──
export type StoryFont = { name: string; data: ArrayBuffer; weight: 400 | 700 };
let fontCache: { fonts: StoryFont[]; rupee: boolean } | null | undefined;

async function fetchGoogleFont(family: string, weight: number, text?: string): Promise<ArrayBuffer | null> {
  try {
    // No browser User-Agent on purpose: Google then serves one full TTF (satori cannot read woff2).
    const url0 = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:wght@${weight}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
    const css = await fetch(url0, { signal: AbortSignal.timeout(4000) }).then((r) => r.text());
    const url = css.match(/src:\s*url\(([^)]+)\)\s*format\('(?:truetype|opentype)'\)/)?.[1];
    if (!url) return null;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    return res.ok ? await res.arrayBuffer() : null;
  } catch {
    return null;
  }
}

/** Outfit 400/700 plus a one-glyph Noto Sans subset for the rupee sign (Outfit has no U+20B9). Cached per process. */
export async function storyFonts() {
  if (fontCache !== undefined) return fontCache;
  const [regular, bold, rupee] = await Promise.all([fetchGoogleFont("Outfit", 400), fetchGoogleFont("Outfit", 700), fetchGoogleFont("Noto Sans", 700, "₹")]);
  if (!regular || !bold) {
    fontCache = null;
    return fontCache;
  }
  const fonts: StoryFont[] = [{ name: "Outfit", data: regular, weight: 400 }, { name: "Outfit", data: bold, weight: 700 }];
  if (rupee) fonts.push({ name: "Rupee", data: rupee, weight: 700 });
  fontCache = { fonts, rupee: !!rupee };
  return fontCache;
}

export type StoryInput = { data: PublicListing; cover: string | null; avatar: string | null; variant: 1 | 2 | 3; rupeeOk: boolean };

const money = (s: string, ok: boolean) => (ok ? s : s.replace(/₹\s?/g, "Rs. "));

function Chips({ data, p, light }: { data: PublicListing; p: OutputPalette; light?: boolean }) {
  const chips = [data.bhk, data.areaLabel ?? (data.areaSqft ? `${data.areaSqft.toLocaleString("en-IN")} sq ft` : null), data.propertyType, data.furnishing].filter(Boolean) as string[];
  if (!chips.length) return null;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
      {chips.slice(0, 4).map((c) => (
        <div key={c} style={{ display: "flex", padding: "14px 26px", borderRadius: 999, fontSize: 30, background: light ? "rgba(255,255,255,0.18)" : p.soft, color: light ? "#fff" : p.ink, border: light ? "2px solid rgba(255,255,255,0.35)" : `2px solid ${p.line}` }}>
          {c}
        </div>
      ))}
    </div>
  );
}

function Broker({ data, avatar, light, p }: { data: PublicListing; avatar: string | null; light: boolean; p: OutputPalette }) {
  const b = data.broker;
  const wa = b.card.showWhatsApp ? (b.whatsapp ?? b.phone) : null;
  const showName = b.card.showNamePhoto;
  if (!showName && !wa) return null;
  const ink = light ? "#fff" : p.ink;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      {showName && avatar ? <img src={avatar} width={96} height={96} style={{ borderRadius: 48, objectFit: "cover", border: `4px solid ${light ? "rgba(255,255,255,0.8)" : p.accent}` }} /> : null}
      <div style={{ display: "flex", flexDirection: "column" }}>
        {showName ? <div style={{ fontSize: 36, fontWeight: 700, color: ink }}>{b.name}</div> : null}
        {showName && b.card.showAgency && b.agencyName ? <div style={{ fontSize: 26, color: light ? "rgba(255,255,255,0.8)" : p.muted }}>{b.agencyName}</div> : null}
        {wa ? <div style={{ fontSize: 28, color: light ? "#fff" : p.accent, marginTop: 4 }}>{`WhatsApp ${wa}`}</div> : null}
      </div>
    </div>
  );
}

function Brand({ light }: { light: boolean }) {
  return <div style={{ display: "flex", fontSize: 24, letterSpacing: 4, textTransform: "uppercase", color: light ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.45)" }}>{`Made with ${BRAND}`}</div>;
}

const where = (d: PublicListing) => [d.locality, d.city].filter(Boolean).join(", ");
const font = (fonts: boolean) => (fonts ? "Outfit, Rupee, sans-serif" : "sans-serif");

/** Variant 1 — full-bleed photo with a bottom gradient. */
function V1({ data, cover, avatar, p, rupeeOk, fonts }: StoryInput & { p: OutputPalette; fonts: boolean }) {
  return (
    <div style={{ width: STORY_W, height: STORY_H, display: "flex", flexDirection: "column", position: "relative", background: p.bg, fontFamily: font(fonts) }}>
      {cover ? <img src={cover} width={STORY_W} height={STORY_H} style={{ position: "absolute", inset: 0, objectFit: "cover" }} /> : null}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 30%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.85) 100%)" }} />
      <div style={{ position: "absolute", top: 80, left: 70, right: 70, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", padding: "14px 28px", borderRadius: 999, background: p.accent, color: p.accentInk, fontSize: 28, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase" }}>{TRANSACTION_LABEL[data.transaction]}</div>
        {data.urgencyBadge ? <div style={{ display: "flex", padding: "14px 28px", borderRadius: 999, background: "rgba(255,255,255,0.9)", color: "#111", fontSize: 26, fontWeight: 700 }}>{data.urgencyBadge}</div> : null}
      </div>
      <div style={{ position: "absolute", left: 70, right: 70, bottom: 90, display: "flex", flexDirection: "column", gap: 28 }}>
        <div style={{ fontSize: 96, fontWeight: 700, color: "#fff", lineHeight: 1 }}>{money(data.priceDisplay, rupeeOk)}</div>
        <div style={{ fontSize: 52, fontWeight: 700, color: "#fff", lineHeight: 1.15 }}>{data.title}</div>
        {where(data) ? <div style={{ fontSize: 34, color: "rgba(255,255,255,0.85)" }}>{where(data)}</div> : null}
        <Chips data={data} p={p} light />
        <div style={{ height: 2, background: "rgba(255,255,255,0.3)", marginTop: 10 }} />
        <Broker data={data} avatar={avatar} light p={p} />
        <Brand light />
      </div>
    </div>
  );
}

/** Variant 2 — photo card on top, theme-coloured panel below. */
function V2({ data, cover, avatar, p, rupeeOk, fonts }: StoryInput & { p: OutputPalette; fonts: boolean }) {
  return (
    <div style={{ width: STORY_W, height: STORY_H, display: "flex", flexDirection: "column", background: p.bg, color: p.ink, padding: 60, fontFamily: font(fonts) }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase", color: p.accent }}>{TRANSACTION_LABEL[data.transaction]}</div>
        <Brand light={p.dark} />
      </div>
      <div style={{ display: "flex", width: "100%", height: 1000, borderRadius: 48, overflow: "hidden", background: p.soft }}>
        {cover ? <img src={cover} width={960} height={1000} style={{ objectFit: "cover" }} /> : null}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 50, flexGrow: 1 }}>
        <div style={{ fontSize: 90, fontWeight: 700, color: p.accent, lineHeight: 1 }}>{money(data.priceDisplay, rupeeOk)}</div>
        <div style={{ fontSize: 50, fontWeight: 700, lineHeight: 1.15 }}>{data.title}</div>
        {where(data) ? <div style={{ fontSize: 32, color: p.muted }}>{where(data)}</div> : null}
        <Chips data={data} p={p} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderTop: `2px solid ${p.line}`, paddingTop: 30 }}>
        <Broker data={data} avatar={avatar} light={p.dark} p={p} />
      </div>
    </div>
  );
}

/** Variant 3 — accent header block, tilted polaroid photo, dark footer. */
function V3({ data, cover, avatar, p, rupeeOk, fonts }: StoryInput & { p: OutputPalette; fonts: boolean }) {
  return (
    <div style={{ width: STORY_W, height: STORY_H, display: "flex", flexDirection: "column", background: p.accent, fontFamily: font(fonts), position: "relative" }}>
      <div style={{ display: "flex", flexDirection: "column", padding: "90px 70px 0 70px", color: p.accentInk, gap: 20 }}>
        <div style={{ fontSize: 28, letterSpacing: 5, textTransform: "uppercase", opacity: 0.85 }}>{[TRANSACTION_LABEL[data.transaction], data.propertyType].filter(Boolean).join(" · ")}</div>
        <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{data.title}</div>
        {where(data) ? <div style={{ fontSize: 34, opacity: 0.9 }}>{where(data)}</div> : null}
      </div>
      <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
        <div style={{ display: "flex", flexDirection: "column", background: "#fff", padding: 24, paddingBottom: 90, borderRadius: 18, transform: "rotate(-3deg)", boxShadow: "0 40px 80px rgba(0,0,0,0.35)" }}>
          <div style={{ display: "flex", width: 860, height: 860, background: p.soft, overflow: "hidden", borderRadius: 8 }}>
            {cover ? <img src={cover} width={860} height={860} style={{ objectFit: "cover" }} /> : null}
          </div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, display: "flex", flexDirection: "column", gap: 26, background: "#111111", color: "#fff", padding: "70px 70px 70px 70px", borderTopLeftRadius: 60, borderTopRightRadius: 60 }}>
        <div style={{ fontSize: 92, fontWeight: 700, lineHeight: 1 }}>{money(data.priceDisplay, rupeeOk)}</div>
        <Chips data={data} p={p} light />
        <Broker data={data} avatar={avatar} light p={p} />
        <Brand light />
      </div>
    </div>
  );
}

export function StoryImage(input: StoryInput & { fonts: boolean }) {
  const p = paletteFor(input.data.theme);
  if (input.variant === 2) return <V2 {...input} p={p} />;
  if (input.variant === 3) return <V3 {...input} p={p} />;
  return <V1 {...input} p={p} />;
}
