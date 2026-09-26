"use client";
import { Plus, Trash2 } from "lucide-react";
import type { Award, Testimonial } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

export function TestimonialsEditor({ value, onChange }: { value: Testimonial[]; onChange: (v: Testimonial[]) => void }) {
  const set = (i: number, patch: Partial<Testimonial>) => onChange(value.map((t, j) => (j === i ? { ...t, ...patch } : t)));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Testimonials</p>
        <span className="text-xs text-muted">{value.length} / 3</span>
      </div>
      {value.length === 0 && <p className="rounded-xl bg-soft px-4 py-3 text-sm text-muted">Add up to three short quotes from happy buyers or sellers.</p>}
      {value.map((t, i) => (
        <div key={i} className="rounded-2xl border border-line p-4 flex flex-col gap-3">
          <Textarea placeholder="“Found us the perfect 3 BHK in two weeks.”" value={t.quote} onChange={(e) => set(i, { quote: e.target.value })} maxLength={300} counter className="!min-h-[72px]" />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
            <Input placeholder="Name" value={t.author} onChange={(e) => set(i, { author: e.target.value })} maxLength={60} />
            <Input placeholder="Role, e.g. Buyer, Sector 63" value={t.role ?? ""} onChange={(e) => set(i, { role: e.target.value })} maxLength={60} />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="icon-btn !w-11 !h-11 hover:!bg-red-50 hover:text-red-600 self-end" aria-label="Remove testimonial">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
      {value.length < 3 && (
        <button type="button" onClick={() => onChange([...value, { quote: "", author: "", role: "" }])} className="btn btn-light !py-2 !px-3.5 text-sm self-start">
          <Plus size={15} /> Add testimonial
        </button>
      )}
    </div>
  );
}

export function AwardsEditor({ value, onChange }: { value: Award[]; onChange: (v: Award[]) => void }) {
  const set = (i: number, patch: Partial<Award>) => onChange(value.map((a, j) => (j === i ? { ...a, ...patch } : a)));
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-medium">Awards and recognition</p>
        <span className="text-xs text-muted">{value.length} / 6</span>
      </div>
      {value.length === 0 && <p className="rounded-xl bg-soft px-4 py-3 text-sm text-muted">Developer awards, top-performer certificates, association memberships.</p>}
      {value.map((a, i) => (
        <div key={i} className="grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_auto] gap-2">
          <Input placeholder="Award title" value={a.title} onChange={(e) => set(i, { title: e.target.value })} maxLength={80} />
          <Input placeholder="Year" inputMode="numeric" value={a.year ?? ""} onChange={(e) => set(i, { year: e.target.value.replace(/\D/g, "").slice(0, 4) })} maxLength={4} />
          <Input placeholder="Given by" value={a.by ?? ""} onChange={(e) => set(i, { by: e.target.value })} maxLength={60} />
          <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="icon-btn !w-11 !h-11 hover:!bg-red-50 hover:text-red-600" aria-label="Remove award">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      {value.length < 6 && (
        <button type="button" onClick={() => onChange([...value, { title: "", year: "", by: "" }])} className="btn btn-light !py-2 !px-3.5 text-sm self-start">
          <Plus size={15} /> Add award
        </button>
      )}
    </div>
  );
}
