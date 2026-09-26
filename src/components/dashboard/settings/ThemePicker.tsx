"use client";
import clsx from "clsx";
import { Check } from "lucide-react";
import { THEMES, type ThemeKey } from "@/lib/types";
import { THEME_SWATCHES } from "./types";

const FONT: Record<ThemeKey, string> = { EDITORIAL: "font-serif", MIDNIGHT: "font-sans tracking-tight", SUNRISE: "font-sans" };

export function ThemePicker({ value, onChange }: { value: ThemeKey; onChange: (t: ThemeKey) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Default theme">
      {THEMES.map((t) => {
        const on = value === t.key;
        const sw = THEME_SWATCHES[t.key];
        return (
          <button
            key={t.key}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(t.key)}
            className={clsx("relative rounded-2xl border-2 p-3 text-left transition-colors", on ? "border-black" : "border-line hover:border-black/30")}
          >
            <div className="h-24 overflow-hidden rounded-xl p-3 flex flex-col justify-between" style={{ background: sw[0], color: sw[1] }}>
              <div className={clsx("text-base font-medium leading-tight", FONT[t.key])} style={t.key === "MIDNIGHT" ? { color: sw[3] } : undefined}>
                4 BHK · Sector 63
              </div>
              <div className="flex items-end justify-between">
                <span className="text-xs opacity-80" style={t.key === "MIDNIGHT" ? { color: sw[3] } : undefined}>
                  ₹ 10 Cr
                </span>
                <span className="rounded-full px-2.5 py-1 text-[10px] font-medium" style={{ background: sw[2], color: t.key === "EDITORIAL" ? "#fff" : t.key === "MIDNIGHT" ? "#fff" : "#fff" }}>
                  WhatsApp
                </span>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{t.name}</p>
                <p className="text-xs text-muted leading-snug">{t.blurb}</p>
              </div>
              <div className="flex gap-1 ml-2 shrink-0">
                {sw.map((c) => (
                  <span key={c} className="h-4 w-4 rounded-full border border-black/10" style={{ background: c }} />
                ))}
              </div>
            </div>
            {on && (
              <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black text-white">
                <Check size={13} />
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
