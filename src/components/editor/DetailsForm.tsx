"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import type { BrokerCard, ThemeKey } from "@/lib/types";
import type { ActionResult, ListingInput } from "./schema";
import { QualityMeter } from "./QualityMeter";
import { BasicsSection, CategoryTiles, DetailsSection } from "./sections/Basics";
import { PricingSection } from "./sections/Pricing";
import { LocationSection } from "./sections/Location";
import { AmenitiesSection, FeaturesSection } from "./sections/Features";
import { DescriptionSection } from "./sections/Description";
import { DocumentsSection, EnrichSection } from "./sections/Enrich";
import { BrokerCardSection, ThemeSection } from "./sections/BrokerTheme";

export type Quality = { score: number; hints: string[] };

/** Shared draft state for the editor forms. `dirty` flips on every edit and resets after a save. */
export function useListingDraft(initial: ListingInput) {
  const [d, setD] = useState<ListingInput>(initial);
  const [dirty, setDirty] = useState(false);
  const set = useCallback((patch: Partial<ListingInput>) => {
    setD((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }, []);
  useEffect(() => {
    if (!dirty) return;
    const h = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [dirty]);
  return { d, set, dirty, setDirty };
}

/**
 * Dashboard "Details" step. Every section is a self-contained component reading `d` and calling `set(patch)`.
 * Save goes through the `save` server action passed in from the page (ownership checked there).
 */
export function DetailsForm({ initial, quality: initialQuality, defaults, save, onSaved }: { initial: ListingInput; quality: Quality; defaults: { brokerCard: BrokerCard; theme: ThemeKey }; save: (data: ListingInput) => Promise<ActionResult<{ quality: Quality }>>; onSaved?: () => void }) {
  const { d, set, dirty, setDirty } = useListingDraft(initial);
  const [quality, setQuality] = useState(initialQuality);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const savedAt = useRef<number | null>(null);

  function doSave() {
    setMsg(null);
    start(async () => {
      const r = await save(d);
      if (r.ok) {
        setQuality(r.data.quality);
        setDirty(false);
        savedAt.current = Date.now();
        setMsg({ kind: "ok", text: "Saved" });
        onSaved?.();
      } else setMsg({ kind: "err", text: r.error });
    });
  }

  return (
    <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
      <div className="space-y-5 min-w-0">
        <div className="lg:hidden">
          <QualityMeter score={quality.score} hints={quality.hints} compact />
        </div>
        <CategoryTiles d={d} set={set} />
        <BasicsSection d={d} set={set} withPrice={false} />
        <DetailsSection d={d} set={set} />
        <PricingSection d={d} set={set} />
        <LocationSection d={d} set={set} />
        <FeaturesSection d={d} set={set} />
        <AmenitiesSection d={d} set={set} />
        <DescriptionSection d={d} set={set} />
        <EnrichSection d={d} set={set} />
        <DocumentsSection d={d} set={set} />
        <BrokerCardSection d={d} set={set} defaults={defaults.brokerCard} />
        <ThemeSection d={d} set={set} defaultTheme={defaults.theme} />
        <div className="h-24" />
      </div>
      <aside className="hidden lg:block sticky top-6 space-y-4">
        <QualityMeter score={quality.score} hints={quality.hints} />
        <nav className="card p-4 text-sm space-y-1">
          {["Property category", "Basic details", "Details", "Pricing", "Location", "Property features", "Amenities", "Description & highlights", "Enrich", "Documents", "Broker card", "Theme"].map((s) => (
            <a key={s} href={`#${s.toLowerCase().replace(/[^a-z]+/g, "-")}`} className="block text-muted hover:text-ink">
              {s}
            </a>
          ))}
        </nav>
      </aside>

      <div className="fixed bottom-20 md:bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="pointer-events-auto card shadow-[0_8px_40px_rgba(0,0,0,.15)] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{pending ? "Saving…" : msg ? <span className={msg.kind === "err" ? "text-red-600" : ""}>{msg.text}</span> : dirty ? "Unsaved changes" : "All changes saved"}</span>
            <button type="button" onClick={doSave} disabled={pending} className="btn btn-dark !py-2.5 disabled:opacity-60">
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
