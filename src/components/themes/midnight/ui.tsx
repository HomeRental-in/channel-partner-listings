import type { ReactNode } from "react";
import clsx from "clsx";
import { BRAND, rootUrl } from "@/lib/site";
import { BrandMark, hasBrand } from "@/components/themes/shared/BrandMark";
import type { PublicBroker } from "@/components/themes/types";
import { spaceGrotesk } from "./fonts";

export const MN = {
  bg: "#0B0D10",
  panel: "#15181D",
  accent: "#7C5CFF",
  cyan: "#22D3EE",
  wa: "#25D366",
} as const;

/** Scoped stylesheet: fonts, reveals, glow, focus rings. Everything lives under .th-mn so nothing leaks. */
const CSS = `
.th-mn{font-family:var(--font-mn),system-ui,sans-serif;letter-spacing:-0.01em;color:#EEF0F4;background:${MN.bg};-webkit-font-smoothing:antialiased}
.th-mn h1,.th-mn h2,.th-mn h3,.th-mn h4{font-family:var(--font-mn),system-ui,sans-serif;font-weight:600;letter-spacing:-0.03em;line-height:1.05}
:where(html.js) .th-mn .mn-reveal{opacity:0;transform:translate3d(var(--mn-dx,-40px),var(--mn-dy,0px),0);transition:opacity .7s cubic-bezier(.2,.7,.2,1),transform .7s cubic-bezier(.2,.7,.2,1);transition-delay:var(--mn-delay,0ms);will-change:opacity,transform}
.th-mn .mn-reveal.is-in{opacity:1;transform:none}
.th-mn .mn-glow{box-shadow:0 0 0 0 rgba(37,211,102,.5),0 0 28px rgba(37,211,102,.35);animation:mn-glow 2.6s ease-in-out infinite}
@keyframes mn-glow{0%,100%{box-shadow:0 0 0 0 rgba(37,211,102,.5),0 0 28px rgba(37,211,102,.35)}50%{box-shadow:0 0 0 10px rgba(37,211,102,0),0 0 44px rgba(37,211,102,.6)}}
.th-mn .mn-sheet{transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.th-mn :focus-visible{outline:2px solid ${MN.accent};outline-offset:2px;border-radius:6px}
.th-mn ::selection{background:${MN.accent};color:#fff}
.th-mn .mn-scroll{scrollbar-width:thin;scrollbar-color:#2A2F38 transparent}
@media (prefers-reduced-motion:reduce){
  .th-mn .mn-reveal{opacity:1;transform:none;transition:none}
  .th-mn .mn-glow{animation:none}
  .th-mn .mn-sheet{transition:none}
}
`;

/** Root wrapper for every Midnight page. Applies the font variable, scoped CSS and the "Powered by" footer. */
export function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("th-mn min-h-dvh", spaceGrotesk.variable, className)}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      {children}
      <footer className="mx-auto max-w-6xl px-4 py-10 text-center text-xs text-[#7D8391]">
        <a href={rootUrl()} className="inline-flex items-center gap-1 hover:text-[#EEF0F4] transition-colors">
          Powered by <span className="font-semibold text-[#A9AFBC]">{BRAND}</span>
        </a>
      </footer>
    </div>
  );
}

/**
 * Slim top bar with the CP's brand: the logo on a white chip (so dark logos stay visible), else the agency/name as text.
 * Renders nothing when there is no brand to show (never a placeholder). Honours the broker-card toggles.
 */
export function BrandBar({ broker }: { broker: PublicBroker }) {
  if (!hasBrand(broker)) return null;
  const mark = <BrandMark broker={broker} chip textClassName="truncate text-base font-semibold tracking-tight text-white" />;
  const cls = "inline-flex min-w-0 max-w-full items-center";
  return (
    <div className="border-b border-white/5">
      <div className="mx-auto flex max-w-6xl items-center px-4 py-3">
        {broker.card.showProfileLink ? <a href={broker.siteUrl} className={cls}>{mark}</a> : <span className={cls}>{mark}</span>}
      </div>
    </div>
  );
}

/** Plain <img>: photos come from our own storage and may lack intrinsic dimensions, so next/image isn't a fit here. */
export function Img({ src, alt, className, eager = false }: { src: string; alt: string; className?: string; eager?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} className={className} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" draggable={false} />;
}

export function Panel({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  return (
    <section id={id} className={clsx("rounded-2xl border border-white/5 bg-[#15181D] p-5 sm:p-6", className)}>
      {children}
    </section>
  );
}

export function SectionTitle({ children, eyebrow }: { children: ReactNode; eyebrow?: string }) {
  return (
    <div className="mb-4">
      {eyebrow && <div className="text-[11px] font-medium uppercase tracking-[.18em] text-[#7C5CFF]">{eyebrow}</div>}
      <h2 className="text-xl sm:text-2xl text-[#F5F6F8]">{children}</h2>
    </div>
  );
}

export function Chip({ children, tone = "default", className }: { children: ReactNode; tone?: "default" | "accent" | "cyan" | "danger" | "live"; className?: string }) {
  const tones = {
    default: "bg-white/5 text-[#C9CDD6] border-white/10",
    accent: "bg-[#7C5CFF]/15 text-[#C4B5FF] border-[#7C5CFF]/40",
    cyan: "bg-[#22D3EE]/10 text-[#8EEBF7] border-[#22D3EE]/40",
    danger: "bg-[#FF5C7A]/15 text-[#FFB3C0] border-[#FF5C7A]/40",
    live: "bg-[#25D366]/15 text-[#9BF0BB] border-[#25D366]/40",
  } as const;
  return <span className={clsx("inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium uppercase tracking-wider", tones[tone], className)}>{children}</span>;
}

/** Label/value tile used by key facts and feature sections. */
export function Tile({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-[#0F1216] p-3.5">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-[#7D8391]">
        {icon && <span className="text-[#22D3EE]">{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="mt-1.5 text-sm font-medium text-[#F5F6F8] break-words">{value}</div>
    </div>
  );
}

export const btnBase = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all active:scale-[.98] disabled:opacity-50";
export const btnWa = clsx(btnBase, "bg-[#25D366] text-[#052B14] hover:bg-[#2EE374]");
export const btnAccent = clsx(btnBase, "bg-[#7C5CFF] text-white hover:bg-[#8F74FF]");
export const btnGhost = clsx(btnBase, "border border-white/10 bg-white/[.04] text-[#EEF0F4] hover:bg-white/[.08]");
export const btnQuiet = "inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[.03] px-3 py-2 text-xs font-medium text-[#C9CDD6] hover:bg-white/[.08] hover:text-white transition-colors";
