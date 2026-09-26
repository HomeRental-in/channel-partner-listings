"use client";

import { useState } from "react";
import { Plus, X, Trash2 } from "lucide-react";
import clsx from "clsx";
import { AMENITIES, type FeatureSection, type NeighbourhoodItem } from "@/lib/types";

/** Free-text chips (highlights, amenities). `suggestions` renders a tickable checklist too. */
export function ChipListEditor({ value, onChange, placeholder, max, suggestions, disabled }: { value: string[]; onChange: (v: string[]) => void; placeholder: string; max?: number; suggestions?: readonly string[]; disabled?: boolean }) {
  const [draft, setDraft] = useState("");
  const add = (s: string) => {
    const t = s.trim();
    if (!t || value.includes(t) || (max && value.length >= max)) return;
    onChange([...value, t]);
    setDraft("");
  };
  const toggle = (s: string) => (value.includes(s) ? onChange(value.filter((v) => v !== s)) : add(s));
  return (
    <div className="flex flex-col gap-3">
      {value.length ? (
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <span key={v} className="chip !bg-black text-white">
              {v}
              {!disabled ? (
                <button type="button" onClick={() => onChange(value.filter((x) => x !== v))} aria-label={`Remove ${v}`} className="opacity-70 hover:opacity-100">
                  <X size={14} />
                </button>
              ) : null}
            </span>
          ))}
        </div>
      ) : null}
      {!disabled ? (
        <div className="flex gap-2">
          <input
            className="input"
            value={draft}
            placeholder={placeholder}
            maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add(draft);
              }
            }}
          />
          <button type="button" className="btn btn-light" onClick={() => add(draft)} disabled={!draft.trim() || (!!max && value.length >= max)}>
            <Plus size={16} />
          </button>
        </div>
      ) : null}
      {suggestions && !disabled ? (
        <div className="flex flex-wrap gap-1.5">
          {suggestions.filter((s) => !value.includes(s)).map((s) => (
            <button key={s} type="button" onClick={() => toggle(s)} className="chip text-xs hover:bg-black/10">
              + {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export const AMENITY_SUGGESTIONS = AMENITIES;

/** Label/value rows (location advantages → listing neighbourhood). */
export function KeyValueEditor({ value, onChange, labelPlaceholder, valuePlaceholder, disabled }: { value: NeighbourhoodItem[]; onChange: (v: NeighbourhoodItem[]) => void; labelPlaceholder: string; valuePlaceholder: string; disabled?: boolean }) {
  const set = (i: number, patch: Partial<NeighbourhoodItem>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  return (
    <div className="flex flex-col gap-2">
      {value.map((r, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={r.label} placeholder={labelPlaceholder} disabled={disabled} onChange={(e) => set(i, { label: e.target.value })} />
          <input className="input !w-40" value={r.value} placeholder={valuePlaceholder} disabled={disabled} onChange={(e) => set(i, { value: e.target.value })} />
          {!disabled ? (
            <button type="button" className="icon-btn shrink-0" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X size={16} />
            </button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <button type="button" className="btn btn-light self-start !py-2 !px-4 text-sm" onClick={() => onChange([...value, { label: "", value: "" }])}>
          <Plus size={16} /> Add row
        </button>
      ) : null}
    </div>
  );
}

/** Feature sections: title + label/value tiles, same shape as Listing.features. */
export function FeaturesEditor({ value, onChange, disabled }: { value: FeatureSection[]; onChange: (v: FeatureSection[]) => void; disabled?: boolean }) {
  const setSection = (i: number, patch: Partial<FeatureSection>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="flex flex-col gap-4">
      {value.map((sec, i) => (
        <div key={sec.id ?? i} className="rounded-2xl bg-soft p-4 flex flex-col gap-3">
          <div className="flex gap-2 items-center">
            <input className="input !bg-white font-medium" value={sec.title} placeholder="Section title, e.g. Space & Layout" disabled={disabled} onChange={(e) => setSection(i, { title: e.target.value })} />
            {!disabled ? (
              <button type="button" className="icon-btn !bg-white shrink-0" aria-label="Remove section" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <Trash2 size={16} />
              </button>
            ) : null}
          </div>
          <div className={clsx("grid gap-2", "sm:grid-cols-2")}>
            {sec.items.map((it, k) => (
              <div key={it.id ?? k} className="flex gap-2">
                <input className="input !bg-white" value={it.label} placeholder="Label" disabled={disabled} onChange={(e) => setSection(i, { items: sec.items.map((x, m) => (m === k ? { ...x, label: e.target.value } : x)) })} />
                <input className="input !bg-white" value={it.value} placeholder="Value" disabled={disabled} onChange={(e) => setSection(i, { items: sec.items.map((x, m) => (m === k ? { ...x, value: e.target.value } : x)) })} />
                {!disabled ? (
                  <button type="button" className="icon-btn !bg-white shrink-0" aria-label="Remove item" onClick={() => setSection(i, { items: sec.items.filter((_, m) => m !== k) })}>
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          {!disabled ? (
            <button type="button" className="btn btn-light !bg-white self-start !py-2 !px-4 text-sm" onClick={() => setSection(i, { items: [...sec.items, { label: "", value: "" }] })}>
              <Plus size={14} /> Add tile
            </button>
          ) : null}
        </div>
      ))}
      {!disabled ? (
        <button type="button" className="btn btn-light self-start !py-2 !px-4 text-sm" onClick={() => onChange([...value, { title: "", items: [{ label: "", value: "" }] }])}>
          <Plus size={16} /> Add section
        </button>
      ) : null}
    </div>
  );
}
