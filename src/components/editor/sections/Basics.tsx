"use client";
import { useState } from "react";
import { PROPERTY_TYPES } from "@/lib/types";
import { AREA_UNITS, CATEGORY_TILES, CURRENCIES, TRANSACTIONS, type ListingInput } from "../schema";
import { Field, Grid, NumberInput, Section, Select, TextInput, Toggle } from "../fields";

export type SectionProps = { d: ListingInput; set: (patch: Partial<ListingInput>) => void };

const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const FACING = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];
const POSSESSION = ["Ready to move", "Under construction", "Within 3 months", "Within 6 months", "2026", "2027", "2028"];
const OWNERSHIP = ["Freehold", "Leasehold", "Co-operative society", "Power of attorney"];
const AGE = ["New / Under construction", "0-1 years", "1-5 years", "5-10 years", "10+ years"];

export function CategoryTiles({ d, set }: SectionProps) {
  return (
    <Section title="Property category">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {CATEGORY_TILES.map((t) => {
          const active = d.category === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => set({ category: t.key, propertyType: PROPERTY_TYPES[t.key]?.includes(d.propertyType ?? "") ? d.propertyType : null })}
              className={`rounded-[var(--radius-inner)] p-4 text-left transition-colors border ${active ? "bg-ink text-white border-ink" : "bg-soft border-transparent hover:border-ink/30"}`}
            >
              <span className="text-2xl block mb-2">{t.emoji}</span>
              <span className="text-sm font-medium">{t.label}</span>
            </button>
          );
        })}
      </div>
    </Section>
  );
}

function guessUnit(label: string | null | undefined) {
  const s = (label ?? "").toLowerCase();
  if (/sq\.?\s*y|yard|gaj/.test(s)) return "sqyd";
  if (/gaz/.test(s)) return "gaz";
  if (/sq\.?\s*m|metre|meter/.test(s)) return "sqm";
  if (/acre/.test(s)) return "acre";
  return "sqft";
}

/** Area input with unit select; always persists sq ft in `areaSqft` and the as-entered string in `areaLabel`. */
export function AreaInput({ d, set }: SectionProps) {
  const [unit, setUnit] = useState<string>(() => guessUnit(d.areaLabel));
  const u = AREA_UNITS.find((x) => x.key === unit) ?? AREA_UNITS[0];
  const shown = d.areaSqft != null ? Math.round((d.areaSqft / u.toSqft) * 100) / 100 : null;
  function apply(amount: number | null, unitKey: string) {
    const uu = AREA_UNITS.find((x) => x.key === unitKey) ?? AREA_UNITS[0];
    set({ areaSqft: amount == null ? null : Math.round(amount * uu.toSqft), areaLabel: amount == null ? null : `${amount} ${uu.label}` });
  }
  return (
    <Field label="Area" hint={d.areaSqft != null && unit !== "sqft" ? `≈ ${d.areaSqft.toLocaleString("en-IN")} sq ft` : "Carpet or built-up area"}>
      <div className="flex gap-2">
        <NumberInput value={shown} onChange={(v) => apply(v, unit)} placeholder="e.g. 1850" min={0} />
        <select
          className="input !w-32"
          value={unit}
          onChange={(e) => {
            setUnit(e.target.value);
            apply(shown, e.target.value);
          }}
        >
          {AREA_UNITS.map((x) => (
            <option key={x.key} value={x.key}>
              {x.label}
            </option>
          ))}
        </select>
      </div>
    </Field>
  );
}

/** Headline, type, transaction, currency, configuration, area, price. */
export function BasicsSection({ d, set, withPrice = true }: SectionProps & { withPrice?: boolean }) {
  const types = PROPERTY_TYPES[d.category] ?? [];
  return (
    <Section title="Basic details">
      <Field label="Headline" hint="What buyers see first — keep it under 70 characters">
        <TextInput value={d.title} onChange={(v) => set({ title: v })} placeholder="4 BHK apartment in DLF The Aureva, Sector 63" maxLength={140} />
      </Field>
      <Grid cols={3}>
        <Field label="Property type">
          <Select value={d.propertyType} onChange={(v) => set({ propertyType: v || null })} options={types} placeholder="Select…" />
        </Field>
        <Field label="Transaction">
          <Select value={d.transaction} onChange={(v) => set({ transaction: v as ListingInput["transaction"] })} options={TRANSACTIONS.map((t) => ({ value: t, label: t === "SALE" ? "Sale" : t === "RENT" ? "Rent" : "Lease" }))} />
        </Field>
        <Field label="Currency">
          <Select value={d.currency} onChange={(v) => set({ currency: v as ListingInput["currency"] })} options={CURRENCIES} />
        </Field>
        <Field label="Configuration (BHK)">
          <TextInput value={d.bhk} onChange={(v) => set({ bhk: v })} placeholder="3 BHK + Servant" />
        </Field>
        <AreaInput d={d} set={set} />
        {withPrice && (
          <Field label={d.transaction === "SALE" ? "Price (total)" : "Rent / month"} hint="Rupees. 1.2 Cr = 12000000">
            <NumberInput value={d.price} onChange={(v) => set({ price: v })} placeholder="e.g. 12000000" min={0} />
          </Field>
        )}
      </Grid>
      <Toggle checked={d.negotiable} onChange={(v) => set({ negotiable: v })} label="Price negotiable" />
    </Section>
  );
}

/** Furnishing, floors, facing, age, bathrooms, balconies, ownership, parking, possession. */
export function DetailsSection({ d, set }: SectionProps) {
  return (
    <Section title="Details">
      <Grid cols={3}>
        <Field label="Furnishing">
          <Select value={d.furnishing} onChange={(v) => set({ furnishing: v || null })} options={FURNISHING} placeholder="Select…" />
        </Field>
        <Field label="Floor">
          <TextInput value={d.floor} onChange={(v) => set({ floor: v })} placeholder="12th" />
        </Field>
        <Field label="Total floors">
          <TextInput value={d.totalFloors} onChange={(v) => set({ totalFloors: v })} placeholder="24" />
        </Field>
        <Field label="Facing">
          <Select value={d.facing} onChange={(v) => set({ facing: v || null })} options={FACING} placeholder="Select…" />
        </Field>
        <Field label="Age of property">
          <Select value={d.ageOfProperty} onChange={(v) => set({ ageOfProperty: v || null })} options={AGE} placeholder="Select…" />
        </Field>
        <Field label="Possession">
          <input className="input" list="possession-options" value={d.possession ?? ""} placeholder="Ready to move" onChange={(e) => set({ possession: e.target.value })} />
          <datalist id="possession-options">
            {POSSESSION.map((p) => (
              <option key={p} value={p} />
            ))}
          </datalist>
        </Field>
        <Field label="Bathrooms">
          <NumberInput value={d.bathrooms} onChange={(v) => set({ bathrooms: v == null ? null : Math.round(v) })} step="1" min={0} />
        </Field>
        <Field label="Balconies">
          <NumberInput value={d.balconies} onChange={(v) => set({ balconies: v == null ? null : Math.round(v) })} step="1" min={0} />
        </Field>
        <Field label="Ownership">
          <Select value={d.ownership} onChange={(v) => set({ ownership: v || null })} options={OWNERSHIP} placeholder="Select…" />
        </Field>
        <Field label="Parking">
          <TextInput value={d.parking} onChange={(v) => set({ parking: v })} placeholder="2 covered" />
        </Field>
      </Grid>
    </Section>
  );
}
