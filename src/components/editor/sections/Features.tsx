"use client";
import { AMENITIES } from "@/lib/types";
import type { ListingInput } from "../schema";
import { Section, SmallButton } from "../fields";
import { move } from "../upload";
import type { SectionProps } from "./Basics";

type FSection = ListingInput["features"][number];
type FItem = FSection["items"][number];
const uid = () => Math.random().toString(36).slice(2, 10);

/** Custom feature grid: sections with editable titles, label/value items, add/remove, "Move to section". */
export function FeaturesSection({ d, set }: SectionProps) {
  const sections = d.features;
  const write = (next: FSection[]) => set({ features: next });
  const patchSection = (si: number, patch: Partial<FSection>) => write(sections.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const patchItem = (si: number, ii: number, patch: Partial<FItem>) => patchSection(si, { items: sections[si].items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) });
  const moveItem = (si: number, ii: number, toSection: number) => {
    if (toSection === si) return;
    const item = sections[si].items[ii];
    write(sections.map((s, i) => (i === si ? { ...s, items: s.items.filter((_, j) => j !== ii) } : i === toSection ? { ...s, items: [...s.items, item] } : s)));
  };

  return (
    <Section title="Property features" hint="Shown as tiles grouped by section, e.g. “Space & Layout”, “Building & Lifestyle”, “Connectivity”.">
      {sections.length === 0 && <p className="text-sm text-muted">No feature sections yet.</p>}
      <div className="space-y-4">
        {sections.map((s, si) => (
          <div key={s.id ?? si} className="bg-soft rounded-[var(--radius-inner)] p-3 md:p-4 space-y-2">
            <div className="flex items-center gap-2">
              <input className="input !bg-white font-medium" value={s.title} placeholder="Section title" onChange={(e) => patchSection(si, { title: e.target.value })} />
              <SmallButton title="Move section up" disabled={si === 0} onClick={() => write(move(sections, si, si - 1))}>↑</SmallButton>
              <SmallButton title="Move section down" disabled={si === sections.length - 1} onClick={() => write(move(sections, si, si + 1))}>↓</SmallButton>
              <SmallButton danger title="Remove section" onClick={() => write(sections.filter((_, i) => i !== si))}>✕</SmallButton>
            </div>
            {s.items.map((it, ii) => (
              <div key={it.id ?? ii} className="grid grid-cols-[1fr_1fr] md:grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                <input className="input !bg-white !py-2" value={it.label} placeholder="Label (e.g. Carpet area)" onChange={(e) => patchItem(si, ii, { label: e.target.value })} />
                <input className="input !bg-white !py-2" value={it.value} placeholder="Value (e.g. 2,100 sq ft)" onChange={(e) => patchItem(si, ii, { value: e.target.value })} />
                {sections.length > 1 ? (
                  <select className="input !bg-white !py-2 !w-auto text-sm" value={si} onChange={(e) => moveItem(si, ii, Number(e.target.value))} title="Move to section">
                    {sections.map((o, oi) => (
                      <option key={o.id ?? oi} value={oi}>
                        {oi === si ? "Move to…" : o.title || `Section ${oi + 1}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span />
                )}
                <SmallButton danger title="Remove item" onClick={() => patchSection(si, { items: s.items.filter((_, j) => j !== ii) })}>✕</SmallButton>
              </div>
            ))}
            <SmallButton onClick={() => patchSection(si, { items: [...s.items, { id: uid(), label: "", value: "" }] })}>+ Add item</SmallButton>
          </div>
        ))}
      </div>
      {sections.length < 12 && <SmallButton onClick={() => write([...sections, { id: uid(), title: sections.length === 0 ? "Space & Layout" : "", items: [{ id: uid(), label: "", value: "" }] }])}>+ Add section</SmallButton>}
    </Section>
  );
}

export function AmenitiesSection({ d, set }: SectionProps) {
  const selected = new Set(d.amenities);
  const toggle = (a: string) => {
    const next = new Set(selected);
    if (next.has(a)) next.delete(a);
    else next.add(a);
    set({ amenities: Array.from(next) });
  };
  const extras = d.amenities.filter((a) => !(AMENITIES as readonly string[]).includes(a));
  return (
    <Section title="Amenities" hint={`${selected.size} selected`}>
      <div className="flex flex-wrap gap-2">
        {[...AMENITIES, ...extras].map((a) => {
          const on = selected.has(a);
          return (
            <button key={a} type="button" onClick={() => toggle(a)} aria-pressed={on} className={`chip transition-colors ${on ? "!bg-ink !text-white" : "hover:bg-[#dde2e5]"}`}>
              {on ? "✓ " : ""}
              {a}
            </button>
          );
        })}
      </div>
      <form
        className="flex gap-2 max-w-md"
        onSubmit={(e) => {
          e.preventDefault();
          const input = (e.currentTarget.elements.namedItem("extra") as HTMLInputElement | null);
          const v = input?.value.trim();
          if (v && !selected.has(v)) set({ amenities: [...d.amenities, v] });
          if (input) input.value = "";
        }}
      >
        <input name="extra" className="input !py-2" placeholder="Add a custom amenity" maxLength={60} />
        <button type="submit" className="btn btn-light !py-2">
          Add
        </button>
      </form>
    </Section>
  );
}
