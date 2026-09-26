"use client";
import { DEFAULT_BROKER_CARD, THEMES, type BrokerCard, type ThemeKey } from "@/lib/types";
import { Section, Toggle } from "../fields";
import type { SectionProps } from "./Basics";

const CARD_TOGGLES: { key: keyof BrokerCard; label: string; hint: string }[] = [
  { key: "showNamePhoto", label: "Show my name & photo", hint: "Broker card at the bottom of the page" },
  { key: "showAgency", label: "Show agency name", hint: "" },
  { key: "showProfileLink", label: "Link to my storefront", hint: "“See all listings” link" },
  { key: "showWhatsApp", label: "WhatsApp button", hint: "Primary call-to-action" },
  { key: "showCall", label: "Call button", hint: "Secondary call-to-action" },
];

/** Radio: follow account defaults, or customise the five broker card toggles for this listing. */
export function BrokerCardSection({ d, set, defaults }: SectionProps & { defaults: BrokerCard }) {
  const custom = d.brokerCardOverride ?? null;
  const card = custom ?? defaults ?? DEFAULT_BROKER_CARD;
  return (
    <Section title="Broker card" hint="How you appear on this listing. Defaults live in Settings.">
      <div className="flex flex-wrap gap-2">
        <label className={`chip cursor-pointer ${!custom ? "!bg-ink !text-white" : ""}`}>
          <input type="radio" name="brokercard" className="sr-only" checked={!custom} onChange={() => set({ brokerCardOverride: null })} />
          Follow my defaults
        </label>
        <label className={`chip cursor-pointer ${custom ? "!bg-ink !text-white" : ""}`}>
          <input type="radio" name="brokercard" className="sr-only" checked={!!custom} onChange={() => set({ brokerCardOverride: { ...defaults } })} />
          Customise for this listing
        </label>
      </div>
      <div className={`divide-y divide-line ${custom ? "" : "opacity-50 pointer-events-none"}`}>
        {CARD_TOGGLES.map((t) => (
          <Toggle key={t.key} label={t.label} hint={t.hint || undefined} checked={card[t.key]} onChange={(v) => set({ brokerCardOverride: { ...card, [t.key]: v } })} />
        ))}
      </div>
    </Section>
  );
}

const PALETTES: Record<ThemeKey, { swatches: string[]; font: string }> = {
  EDITORIAL: { swatches: ["#f5f1e8", "#111111", "#c8bfae", "#8a7f6a"], font: "serif" },
  MIDNIGHT: { swatches: ["#0b0b0f", "#1c1c24", "#7c5cff", "#e6e6f0"], font: "sans-serif" },
  SUNRISE: { swatches: ["#f7e9d7", "#ff6b4a", "#ffb347", "#2b2b2b"], font: "sans-serif" },
};

/** Three theme cards with mini palette swatches, plus "Use my default". */
export function ThemeSection({ d, set, defaultTheme }: SectionProps & { defaultTheme: ThemeKey }) {
  return (
    <Section title="Theme" hint="Changes fonts, colours, layout and motion of the listing page.">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
        <button type="button" onClick={() => set({ theme: null })} className={`rounded-[var(--radius-inner)] p-4 text-left border transition-colors ${d.theme == null ? "border-ink bg-soft" : "border-line hover:border-ink/40"}`}>
          <span className="block text-sm font-medium">Use my default</span>
          <span className="block text-xs text-muted mt-1">Currently {THEMES.find((t) => t.key === defaultTheme)?.name ?? defaultTheme}</span>
        </button>
        {THEMES.map((t) => {
          const p = PALETTES[t.key];
          const active = d.theme === t.key;
          return (
            <button key={t.key} type="button" onClick={() => set({ theme: t.key })} className={`rounded-[var(--radius-inner)] p-4 text-left border transition-colors ${active ? "border-ink bg-soft" : "border-line hover:border-ink/40"}`}>
              <span className="flex gap-1 mb-3">
                {p.swatches.map((c) => (
                  <span key={c} className="w-6 h-6 rounded-full border border-black/10" style={{ background: c }} />
                ))}
              </span>
              <span className="block text-sm font-medium" style={{ fontFamily: p.font }}>
                {t.name}
              </span>
              <span className="block text-xs text-muted mt-1">{t.blurb}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}
