"use client";
import type { ReactNode } from "react";

/** Small form primitives styled with globals.css tokens (no dependency on src/components/ui). */

export function Section({ title, hint, children, id }: { title: string; hint?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id ?? title.toLowerCase().replace(/[^a-z]+/g, "-")} className="card p-5 md:p-7 space-y-5 scroll-mt-6">
      <header>
        <h2 className="text-xl md:text-2xl">{title}</h2>
        {hint && <p className="text-sm text-muted mt-1">{hint}</p>}
      </header>
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="block text-sm font-medium mb-1.5">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted mt-1">{hint}</span>}
    </label>
  );
}

export function TextInput({ value, onChange, placeholder, type = "text", inputMode, maxLength }: { value: string | null | undefined; onChange: (v: string) => void; placeholder?: string; type?: string; inputMode?: "text" | "numeric" | "decimal" | "url"; maxLength?: number }) {
  return <input className="input" type={type} inputMode={inputMode} value={value ?? ""} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />;
}

export function NumberInput({ value, onChange, placeholder, step = "any", min }: { value: number | null | undefined; onChange: (v: number | null) => void; placeholder?: string; step?: string; min?: number }) {
  return (
    <input
      className="input"
      type="number"
      inputMode="decimal"
      step={step}
      min={min}
      value={value ?? ""}
      placeholder={placeholder}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? null : Number(v));
      }}
    />
  );
}

export function Select({ value, onChange, options, placeholder }: { value: string | null | undefined; onChange: (v: string) => void; options: readonly (string | { value: string; label: string })[]; placeholder?: string }) {
  return (
    <select className="input" value={value ?? ""} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.value;
        const l = typeof o === "string" ? o : o.label;
        return (
          <option key={v} value={v}>
            {l}
          </option>
        );
      })}
    </select>
  );
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex items-center justify-between gap-4 w-full text-left py-2">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
      <span className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 ${checked ? "bg-ink" : "bg-line"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${checked ? "translate-x-5" : ""}`} />
      </span>
    </button>
  );
}

export function Textarea({ value, onChange, placeholder, rows = 5, maxLength }: { value: string | null | undefined; onChange: (v: string) => void; placeholder?: string; rows?: number; maxLength?: number }) {
  return <textarea className="input resize-y leading-relaxed" rows={rows} value={value ?? ""} placeholder={placeholder} maxLength={maxLength} onChange={(e) => onChange(e.target.value)} />;
}

export function SmallButton({ onClick, children, title, disabled, danger }: { onClick: () => void; children: ReactNode; title?: string; disabled?: boolean; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} title={title} disabled={disabled} className={`chip hover:bg-[#dde2e5] disabled:opacity-40 ${danger ? "text-red-600" : ""}`}>
      {children}
    </button>
  );
}

export const Grid = ({ children, cols = 2 }: { children: ReactNode; cols?: 2 | 3 | 4 }) => <div className={`grid gap-4 ${cols === 4 ? "md:grid-cols-4 sm:grid-cols-2" : cols === 3 ? "md:grid-cols-3 sm:grid-cols-2" : "sm:grid-cols-2"}`}>{children}</div>;
