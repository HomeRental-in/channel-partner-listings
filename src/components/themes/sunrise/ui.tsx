import type { ReactNode } from "react";
import clsx from "clsx";
import { BRAND, rootUrl } from "@/lib/site";
import { BrandMark, hasBrand } from "@/components/themes/shared/BrandMark";
import type { PublicBroker } from "@/components/themes/types";
import { jakarta } from "./fonts";

export const SR = {
  sand: "#FBF4EC",
  coral: "#FF6B4A",
  teal: "#123F3A",
  wa: "#25D366",
} as const;

/** Tinted backgrounds for the colourful fact tiles (rotated in order). */
export const TINTS = [
  "bg-[#FFE4DB] text-[#9A2E14]",
  "bg-[#DDEFEA] text-[#123F3A]",
  "bg-[#FFEFC2] text-[#7A5200]",
  "bg-[#DCE9FA] text-[#1D3F6E]",
  "bg-[#EDE3FA] text-[#4E2C86]",
  "bg-[#E2F3D8] text-[#2F5E1C]",
] as const;

/** Scoped stylesheet: fonts, spring pops, press feedback, focus rings. Everything lives under .th-sr. */
const CSS = `
.th-sr{font-family:var(--font-sr),system-ui,sans-serif;letter-spacing:-0.01em;color:${SR.teal};background:${SR.sand};-webkit-font-smoothing:antialiased}
.th-sr h1,.th-sr h2,.th-sr h3,.th-sr h4{font-family:var(--font-sr),system-ui,sans-serif;font-weight:800;letter-spacing:-0.025em;line-height:1.08}
:where(html.js) .th-sr .sr-pop{opacity:0;transform:scale(.96) translate3d(0,10px,0);transition:opacity .45s ease-out,transform .7s cubic-bezier(.34,1.56,.64,1);transition-delay:var(--sr-delay,0ms);will-change:opacity,transform}
.th-sr .sr-pop.is-in{opacity:1;transform:none}
.th-sr .sr-press{transition:transform .18s cubic-bezier(.34,1.56,.64,1),background-color .2s ease,box-shadow .2s ease}
.th-sr .sr-press:hover{transform:translateY(-1px)}
.th-sr .sr-press:active{transform:scale(.96)}
.th-sr :focus-visible{outline:3px solid ${SR.coral};outline-offset:3px;border-radius:14px}
.th-sr ::selection{background:${SR.coral};color:#fff}
.th-sr .sr-scroll{scrollbar-width:thin;scrollbar-color:#E7D8C8 transparent}
@media (prefers-reduced-motion:reduce){
  .th-sr .sr-pop{opacity:1;transform:none;transition:none}
  .th-sr .sr-press,.th-sr .sr-press:hover,.th-sr .sr-press:active{transform:none;transition:none}
}
`;

/** Root wrapper for every Sunrise page. Applies the font variable, scoped CSS and the "Powered by" footer. */
export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("th-sr min-h-dvh", jakarta.variable, className)}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
      <footer className="mx-auto max-w-5xl px-4 py-10 text-center text-xs text-[#6E8A85]">
        <a href={rootUrl()} className="inline-flex items-center gap-1 rounded-full bg-white/70 px-4 py-2 hover:bg-white transition-colors">
          Powered by <span className="font-bold text-[#123F3A]">{BRAND}</span>
        </a>
      </footer>
    </div>
  );
}

/**
 * Page header with the CP's brand: the logo, else the agency/name as text.
 * Renders nothing when there is no brand to show (never a placeholder). Honours the broker-card toggles.
 */
export function BrandBar({ broker }: { broker: PublicBroker }) {
  if (!hasBrand(broker)) return null;
  const mark = <BrandMark broker={broker} textClassName="truncate text-lg font-extrabold tracking-tight text-[#123F3A]" />;
  const cls = "inline-flex min-w-0 max-w-full items-center";
  return (
    <div className="mb-4 flex items-center">
      {broker.card.showProfileLink ? <a href={broker.siteUrl} className={cls}>{mark}</a> : <span className={cls}>{mark}</span>}
    </div>
  );
}

/** Plain <img>: photos come from our own storage and may lack intrinsic dimensions, so next/image isn't a fit here. */
export function Img({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" draggable={false} />;
}

export function Card({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={clsx("rounded-[28px] bg-white p-5 shadow-[0_8px_30px_-18px_rgba(18,63,58,.25)] sm:p-7", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, eyebrow, className }: { children: ReactNode; eyebrow?: string; className?: string }) {
  return (
    <div className={clsx("mb-4", className)}>
      {eyebrow && <div className="mb-1.5 inline-block rounded-full bg-[#FFE4DB] px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[.14em] text-[#C2411F]">{eyebrow}</div>}
      <h2 className="text-2xl text-[#123F3A] sm:text-[28px]">{children}</h2>
    </div>
  );
}

/** Pill chip. */
export function Pill({ children, tone = "sand", className }: { children: ReactNode; tone?: "sand" | "coral" | "teal" | "white" | "wa" | "honey"; className?: string }) {
  const tones = {
    sand: "bg-[#F1E6D8] text-[#123F3A]",
    coral: "bg-[#FF6B4A] text-white",
    teal: "bg-[#123F3A] text-white",
    white: "bg-white text-[#123F3A] shadow-sm",
    wa: "bg-[#25D366] text-[#052B14]",
    honey: "bg-[#FFEFC2] text-[#7A5200]",
  } as const;
  return <span className={clsx("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold", tones[tone], className)}>{children}</span>;
}

/** Colourful label/value tile. */
export function Tile({ label, value, icon, tint = 0 }: { label: string; value: string; icon?: ReactNode; tint?: number }) {
  return (
    <div className={clsx("rounded-3xl p-4", TINTS[tint % TINTS.length])}>
      {icon && <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/70">{icon}</div>}
      <div className="text-[11px] font-bold uppercase tracking-wider opacity-70">{label}</div>
      <div className="mt-0.5 text-base font-extrabold leading-snug break-words">{value}</div>
    </div>
  );
}

export const btnBase = "sr-press inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold";
export const btnWa = clsx(btnBase, "bg-[#25D366] text-[#052B14] shadow-[0_10px_24px_-10px_rgba(37,211,102,.7)] hover:bg-[#2EE374]");
export const btnCoral = clsx(btnBase, "bg-[#FF6B4A] text-white shadow-[0_10px_24px_-10px_rgba(255,107,74,.7)] hover:bg-[#FF7C5E]");
export const btnTeal = clsx(btnBase, "bg-[#123F3A] text-white hover:bg-[#1B5A52]");
export const btnSoft = clsx(btnBase, "bg-[#F1E6D8] text-[#123F3A] hover:bg-[#EADCCB]");
export const btnOutline = clsx(btnBase, "border-2 border-[#123F3A]/15 bg-white text-[#123F3A] hover:border-[#123F3A]/40");
