"use client";
import { useState } from "react";
import { Field, Grid, Section, TextInput } from "../fields";
import type { SectionProps } from "./Basics";

/** Client-safe copy of src/lib/public.ts mapEmbed (that module imports Prisma). */
function mapEmbed(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("google") && u.pathname.includes("/maps")) {
      const q = u.searchParams.get("q") ?? u.searchParams.get("query");
      const at = u.pathname.match(/@(-?[\d.]+),(-?[\d.]+)/);
      if (at) return `https://maps.google.com/maps?q=${at[1]},${at[2]}&z=15&output=embed`;
      if (q) return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
      const place = u.pathname.match(/\/place\/([^/]+)/);
      if (place) return `https://maps.google.com/maps?q=${place[1]}&z=15&output=embed`;
    }
    if (u.hostname === "maps.app.goo.gl" || u.hostname === "goo.gl") return null;
    return `https://maps.google.com/maps?q=${encodeURIComponent(url)}&z=15&output=embed`;
  } catch {
    return null;
  }
}

export function LocationSection({ d, set }: SectionProps) {
  const [preview, setPreview] = useState<string | null>(null);
  function previewMap() {
    const url = d.mapUrl?.trim();
    const q = url ? mapEmbed(url) : null;
    if (q) return setPreview(q);
    const text = [d.landmark, d.locality, d.city, d.pincode].filter(Boolean).join(", ");
    setPreview(text ? `https://maps.google.com/maps?q=${encodeURIComponent(text)}&z=14&output=embed` : null);
  }
  return (
    <Section title="Location">
      <Grid cols={2}>
        <Field label="Locality / sector">
          <TextInput value={d.locality} onChange={(v) => set({ locality: v })} placeholder="Sector 63" />
        </Field>
        <Field label="City">
          <TextInput value={d.city} onChange={(v) => set({ city: v })} placeholder="Gurgaon" />
        </Field>
        <Field label="Landmark">
          <TextInput value={d.landmark} onChange={(v) => set({ landmark: v })} placeholder="Near Golf Course Extension Road" />
        </Field>
        <Field label="Pincode">
          <TextInput value={d.pincode} onChange={(v) => set({ pincode: v })} placeholder="122102" inputMode="numeric" maxLength={10} />
        </Field>
      </Grid>
      <Field label="Google Maps link" hint="Paste a maps.google.com link with coordinates or a place. Short links (maps.app.goo.gl) open but cannot be embedded.">
        <div className="flex gap-2">
          <TextInput value={d.mapUrl} onChange={(v) => set({ mapUrl: v })} placeholder="https://www.google.com/maps/place/…" inputMode="url" />
          <button type="button" className="btn btn-light !py-2 whitespace-nowrap" onClick={previewMap}>
            Preview map
          </button>
        </div>
      </Field>
      {preview && (
        <div className="rounded-[var(--radius-inner)] overflow-hidden bg-soft">
          <iframe title="Map preview" src={preview} className="w-full h-64 border-0" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      )}
      <Field label="Requirement form link (optional)" hint="A Google Form / Typeform for buyer enquiries. Shown as a button on the listing page.">
        <TextInput value={d.formUrl} onChange={(v) => set({ formUrl: v })} placeholder="https://forms.gle/…" inputMode="url" />
      </Field>
    </Section>
  );
}
