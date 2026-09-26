"use client";
import { useRef, useState } from "react";
import { Field, Grid, Section, SmallButton, TextInput } from "../fields";
import { formatBytes, uploadFile, type ReviewAuth } from "../upload";
import type { SectionProps } from "./Basics";

/** Urgency badge, neighbourhood highlights, video tour URL. */
export function EnrichSection({ d, set }: SectionProps) {
  const nb = d.neighbourhood;
  return (
    <Section title="Enrich" hint="Small touches that make the page feel complete.">
      <Grid cols={2}>
        <Field label="Urgency badge" hint="Shown as a tag on the hero, e.g. “Only 2 units left”, “Price drop”">
          <TextInput value={d.urgencyBadge} onChange={(v) => set({ urgencyBadge: v })} placeholder="Only 2 units left" maxLength={40} />
        </Field>
        <Field label="Video tour link" hint="YouTube or Instagram reel — embedded on the page">
          <TextInput value={d.videoTourUrl} onChange={(v) => set({ videoTourUrl: v })} placeholder="https://youtu.be/…" inputMode="url" />
        </Field>
      </Grid>
      <div className="space-y-2">
        <span className="block text-sm font-medium">Neighbourhood highlights</span>
        {nb.map((n, i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
            <input className="input !py-2" placeholder="Place (e.g. IGI Airport)" value={n.label} onChange={(e) => set({ neighbourhood: nb.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })} />
            <input className="input !py-2" placeholder="Distance / time (e.g. 30 min)" value={n.value} onChange={(e) => set({ neighbourhood: nb.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)) })} />
            <SmallButton danger title="Remove" onClick={() => set({ neighbourhood: nb.filter((_, j) => j !== i) })}>✕</SmallButton>
          </div>
        ))}
        {nb.length < 20 && <SmallButton onClick={() => set({ neighbourhood: [...nb, { label: "", value: "" }] })}>+ Add place</SmallButton>}
      </div>
    </Section>
  );
}

/** ≤5 PDFs (25 MB each) with a custom section title. */
export function DocumentsSection({ d, set, auth }: SectionProps & { auth?: ReviewAuth }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  const docs = d.documents;

  async function add(files: FileList) {
    setError(null);
    const room = 5 - docs.length;
    const list = Array.from(files).slice(0, Math.max(0, room));
    if (files.length > room) setError(`Up to 5 documents (you can add ${room} more).`);
    setBusy(true);
    const added: typeof docs = [];
    for (const f of list) {
      try {
        const r = await uploadFile(f, "document", auth);
        added.push({ url: r.url, name: f.name.replace(/\.pdf$/i, ""), sizeBytes: r.sizeBytes });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      }
    }
    if (added.length) set({ documents: [...d.documents, ...added] });
    setBusy(false);
  }

  return (
    <Section title="Documents" hint="Brochure, floor plans, payment plan — PDF only, up to 25 MB each.">
      <Field label="Section title on the page">
        <TextInput value={d.documentsTitle} onChange={(v) => set({ documentsTitle: v })} placeholder="Brochure & floor plans" maxLength={60} />
      </Field>
      <ul className="space-y-2">
        {docs.map((doc, i) => (
          <li key={doc.id ?? doc.url} className="flex items-center gap-2 bg-soft rounded-[var(--radius-inner)] p-2 pl-3">
            <span className="text-lg">📄</span>
            <input className="input !bg-white !py-2" value={doc.name} maxLength={200} onChange={(e) => set({ documents: docs.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) })} />
            <span className="text-xs text-muted whitespace-nowrap">{formatBytes(doc.sizeBytes)}</span>
            <a href={doc.url} target="_blank" rel="noreferrer" className="chip">Open</a>
            <SmallButton danger title="Remove" onClick={() => set({ documents: docs.filter((_, j) => j !== i) })}>✕</SmallButton>
          </li>
        ))}
      </ul>
      {docs.length < 5 && (
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="w-full rounded-[var(--radius-inner)] border-2 border-dashed border-line hover:border-ink py-5 text-sm text-muted disabled:opacity-60">
          {busy ? "Uploading…" : `+ Add PDF (${docs.length}/5)`}
        </button>
      )}
      <input ref={ref} type="file" accept="application/pdf,.pdf" multiple hidden onChange={(e) => e.target.files && void add(e.target.files).then(() => (e.target.value = ""))} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </Section>
  );
}
