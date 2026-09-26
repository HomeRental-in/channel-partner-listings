"use client";
import { formatINR } from "@/lib/format";
import type { ListingInput } from "../schema";
import { Field, Grid, NumberInput, Section, SmallButton, TextInput, Toggle } from "../fields";
import { move } from "../upload";
import type { SectionProps } from "./Basics";

type Line = ListingInput["priceLines"][number];
const UNITS = ["total", "per sq ft", "per month", "per year", "per sq yd", "per acre"];

export function PricingSection({ d, set }: SectionProps) {
  const lines = d.priceLines;
  const update = (i: number, patch: Partial<Line>) => set({ priceLines: lines.map((l, j) => (j === i ? { ...l, ...patch } : l)) });
  return (
    <Section title="Pricing" hint="Buyers see the price lines. The primary price is used for sorting, per-sq-ft and analytics bands.">
      <Grid cols={2}>
        <Field label={`Primary price (${d.currency})`} hint={d.price ? `Shown as ${formatINR(d.price, { currency: d.currency })}${d.areaSqft && d.price ? ` · ${formatINR(Math.round(d.price / d.areaSqft), { currency: d.currency, compact: false })}/sq ft` : ""}` : "Leave empty for “Price on request”"}>
          <NumberInput value={d.price} onChange={(v) => set({ price: v })} placeholder="e.g. 12000000" min={0} />
        </Field>
        <div className="flex flex-col justify-end">
          <Toggle checked={!!d.loanAvailable} onChange={(v) => set({ loanAvailable: v })} label="Home loan available" hint="Shows a “Loan available” tag" />
        </div>
      </Grid>

      <div className="space-y-2">
        <span className="block text-sm font-medium">Price lines</span>
        {lines.length === 0 && <p className="text-sm text-muted">No price lines yet. Add lines like “3 BHK — ₹ 2.4 Cr”, “Per sq ft — ₹ 12,000”, “Maintenance — ₹ 4/sq ft per month”.</p>}
        {lines.map((l, i) => (
          <div key={i} className="grid grid-cols-2 md:grid-cols-[1.2fr_1fr_1fr_1.4fr_auto] gap-2 items-center bg-soft rounded-[var(--radius-inner)] p-2">
            <input className="input !bg-white" placeholder="Label" value={l.label} onChange={(e) => update(i, { label: e.target.value })} />
            <input className="input !bg-white" type="number" inputMode="decimal" placeholder="Amount" value={l.amount || ""} onChange={(e) => update(i, { amount: Number(e.target.value) || 0 })} />
            <input className="input !bg-white" list="price-units" placeholder="Unit" value={l.unit ?? ""} onChange={(e) => update(i, { unit: e.target.value || null })} />
            <input className="input !bg-white" placeholder="Note (optional)" value={l.note ?? ""} onChange={(e) => update(i, { note: e.target.value || null })} />
            <div className="flex gap-1 col-span-2 md:col-span-1 justify-end">
              <SmallButton title="Move up" disabled={i === 0} onClick={() => set({ priceLines: move(lines, i, i - 1) })}>↑</SmallButton>
              <SmallButton title="Move down" disabled={i === lines.length - 1} onClick={() => set({ priceLines: move(lines, i, i + 1) })}>↓</SmallButton>
              <SmallButton danger title="Remove" onClick={() => set({ priceLines: lines.filter((_, j) => j !== i) })}>✕</SmallButton>
            </div>
          </div>
        ))}
        <datalist id="price-units">
          {UNITS.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
        {lines.length < 12 && (
          <SmallButton onClick={() => set({ priceLines: [...lines, { label: lines.length === 0 ? "Total" : "", amount: lines.length === 0 && d.price ? d.price : 0, unit: lines.length === 0 ? "total" : null, note: null }] })}>+ Add price line</SmallButton>
        )}
      </div>

      <Grid cols={3}>
        <Field label="Electricity">
          <TextInput value={d.electricity} onChange={(v) => set({ electricity: v })} placeholder="Included / ₹ 8 per unit" />
        </Field>
        <Field label="Water charges">
          <TextInput value={d.waterCharges} onChange={(v) => set({ waterCharges: v })} placeholder="Included / ₹ 500 per month" />
        </Field>
        <Field label="Price history note">
          <TextInput value={d.priceHistoryNote} onChange={(v) => set({ priceHistoryNote: v })} placeholder="Reduced from ₹ 2.6 Cr in Aug" />
        </Field>
      </Grid>
    </Section>
  );
}
