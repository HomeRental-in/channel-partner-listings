"use client";
import { useState } from "react";
import { Plus } from "lucide-react";
import { Chip } from "@/components/ui/Chip";

/** Free-text chips (e.g. areas served). Enter or comma adds; backspace on empty removes the last. */
export function ChipsInput({ label, hint, value, onChange, placeholder, max = 20 }: { label: string; hint?: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string; max?: number }) {
  const [draft, setDraft] = useState("");

  function add() {
    const parts = draft.split(",").map((s) => s.trim()).filter(Boolean);
    if (!parts.length) return;
    const next = [...value];
    for (const p of parts) if (!next.some((x) => x.toLowerCase() === p.toLowerCase()) && next.length < max) next.push(p.slice(0, 40));
    onChange(next);
    setDraft("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium">{label}</label>
      <div className="input flex flex-wrap items-center gap-1.5 !py-2 cursor-text" onClick={(e) => (e.currentTarget.querySelector("input") as HTMLInputElement | null)?.focus()}>
        {value.map((v) => (
          <Chip key={v} size="sm" onRemove={() => onChange(value.filter((x) => x !== v))}>
            {v}
          </Chip>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              add();
            } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
          }}
          onBlur={add}
          placeholder={value.length ? "" : placeholder}
          className="flex-1 min-w-[140px] bg-transparent outline-none py-1 text-[15px]"
          aria-label={label}
        />
        {draft && (
          <button type="button" onClick={add} className="chip !py-1 !px-2 text-xs">
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      {hint && <p className="text-sm text-muted">{hint}</p>}
    </div>
  );
}

/** Fixed option toggles rendered as chips (property types, languages). */
export function ToggleChips({ label, options, value, onChange }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return (
            <Chip key={o} active={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])}>
              {o}
            </Chip>
          );
        })}
      </div>
    </div>
  );
}
