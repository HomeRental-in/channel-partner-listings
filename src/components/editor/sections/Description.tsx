"use client";
import { useState } from "react";
import { Field, Section, SmallButton, Textarea } from "../fields";
import { apiUrl, move, type ReviewAuth } from "../upload";
import type { SectionProps } from "./Basics";

/** Description + highlights (≤6, reorderable) with "Regenerate with AI" via POST /api/ai/rewrite. */
export function DescriptionSection({ d, set, auth, rewriteLabel = "Regenerate with AI" }: SectionProps & { auth?: ReviewAuth; rewriteLabel?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);

  async function rewrite() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(apiUrl("/api/ai/rewrite", auth), { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ details: d }) });
      const json = (await res.json()) as { description?: string; highlights?: string[]; error?: string };
      if (!res.ok || !json.description) throw new Error(json.error ?? "AI rewrite failed");
      set({ description: json.description, highlights: (json.highlights ?? []).slice(0, 6) });
    } catch (e) {
      setError(e instanceof Error ? e.message : "AI rewrite failed");
    } finally {
      setBusy(false);
    }
  }

  const hl = d.highlights;
  return (
    <Section title="Description & highlights">
      <Field label="Description" hint={`${(d.description ?? "").length} characters · 120-180 words reads best`}>
        <Textarea value={d.description} onChange={(v) => set({ description: v })} rows={8} maxLength={5000} placeholder="A buyer-facing paragraph about the property…" />
      </Field>
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={rewrite} disabled={busy} className="btn btn-dark !py-2.5 disabled:opacity-60">
          {busy ? "Writing…" : `✨ ${rewriteLabel}`}
        </button>
        <span className="text-xs text-muted">Uses the details above; nothing is invented.</span>
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium">Highlights ({hl.length}/6)</span>
        {hl.map((h, i) => (
          <div
            key={i}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (drag != null) set({ highlights: move(hl, drag, i) });
              setDrag(null);
            }}
            className={`flex items-center gap-2 ${drag === i ? "opacity-50" : ""}`}
          >
            <span className="cursor-grab text-muted select-none px-1" title="Drag to reorder">⋮⋮</span>
            <input className="input !py-2" value={h} maxLength={120} placeholder="e.g. Corner unit with park view" onChange={(e) => set({ highlights: hl.map((x, j) => (j === i ? e.target.value : x)) })} />
            <SmallButton danger title="Remove" onClick={() => set({ highlights: hl.filter((_, j) => j !== i) })}>✕</SmallButton>
          </div>
        ))}
        {hl.length < 6 && <SmallButton onClick={() => set({ highlights: [...hl, ""] })}>+ Add highlight</SmallButton>}
      </div>
    </Section>
  );
}
