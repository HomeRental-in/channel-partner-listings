"use client";

import { useRef, useState } from "react";
import { Plus, X, Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { formatINR, parseINR } from "@/lib/format";
import type { Configuration, FloorPlan, PaymentMilestone } from "@/lib/types";

type UploadKind = "floorplan" | "photo";
type UploadResp = { url: string; key: string; width?: number; height?: number; sizeBytes: number; name: string };

/** POST /api/upload (built by another engineer): multipart `file` + `kind`. */
async function uploadFile(file: File, kind: UploadKind): Promise<UploadResp> {
  const form = new FormData();
  form.append("file", file);
  form.append("kind", kind);
  const res = await fetch("/api/upload", { method: "POST", body: form });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error ?? "Upload failed");
  return json as UploadResp;
}

function MoneyInput({ value, onChange, placeholder, disabled }: { value: number | null | undefined; onChange: (v: number | null) => void; placeholder: string; disabled?: boolean }) {
  const [text, setText] = useState(value ? formatINR(value).replace("₹ ", "") : "");
  return (
    <input
      className="input"
      value={text}
      placeholder={placeholder}
      disabled={disabled}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const n = parseINR(text);
        onChange(n && n > 0 ? n : null);
        setText(n && n > 0 ? formatINR(n).replace("₹ ", "") : "");
      }}
    />
  );
}

export function ConfigurationsEditor({ value, onChange, disabled }: { value: Configuration[]; onChange: (v: Configuration[]) => void; disabled?: boolean }) {
  const set = (i: number, patch: Partial<Configuration>) => onChange(value.map((c, j) => (j === i ? { ...c, ...patch } : c)));
  return (
    <div className="flex flex-col gap-2">
      <div className="hidden sm:grid grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_44px] gap-2 text-xs text-black/50 px-1">
        <span>Type</span><span>Size (sq ft)</span><span>Price from</span><span>Price to</span><span>Note</span><span />
      </div>
      {value.map((c, i) => (
        <div key={i} className="grid grid-cols-2 sm:grid-cols-[1.2fr_1fr_1fr_1fr_1.2fr_44px] gap-2">
          <input className="input" value={c.type} placeholder="3 BHK" disabled={disabled} onChange={(e) => set(i, { type: e.target.value })} />
          <input className="input" type="number" min={0} value={c.sizeSqft ?? ""} placeholder="1850" disabled={disabled} onChange={(e) => set(i, { sizeSqft: e.target.value ? Number(e.target.value) : null })} />
          <MoneyInput value={c.priceFrom} placeholder="1.2 Cr" disabled={disabled} onChange={(v) => set(i, { priceFrom: v })} />
          <MoneyInput value={c.priceTo} placeholder="1.4 Cr" disabled={disabled} onChange={(v) => set(i, { priceTo: v })} />
          <input className="input" value={c.note ?? ""} placeholder="Corner units" disabled={disabled} onChange={(e) => set(i, { note: e.target.value || null })} />
          {!disabled ? (
            <button type="button" className="icon-btn" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X size={16} />
            </button>
          ) : <span />}
        </div>
      ))}
      {!disabled ? (
        <button type="button" className="btn btn-light self-start !py-2 !px-4 text-sm" onClick={() => onChange([...value, { type: "", sizeSqft: null, priceFrom: null, priceTo: null, note: null }])}>
          <Plus size={16} /> Add configuration
        </button>
      ) : null}
    </div>
  );
}

export function PaymentPlanEditor({ value, onChange, disabled }: { value: PaymentMilestone[]; onChange: (v: PaymentMilestone[]) => void; disabled?: boolean }) {
  const set = (i: number, patch: Partial<PaymentMilestone>) => onChange(value.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  const total = value.reduce((s, m) => s + (m.percent ?? 0), 0);
  return (
    <div className="flex flex-col gap-2">
      {value.map((m, i) => (
        <div key={i} className="flex gap-2">
          <input className="input" value={m.milestone} placeholder="On booking" disabled={disabled} onChange={(e) => set(i, { milestone: e.target.value })} />
          <div className="relative w-28 shrink-0">
            <input className="input pr-7" type="number" min={0} max={100} value={m.percent ?? ""} placeholder="10" disabled={disabled} onChange={(e) => set(i, { percent: e.target.value ? Number(e.target.value) : null })} />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-black/50 text-sm">%</span>
          </div>
          {!disabled ? (
            <button type="button" className="icon-btn shrink-0" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X size={16} />
            </button>
          ) : null}
        </div>
      ))}
      <div className="flex items-center gap-3">
        {!disabled ? (
          <button type="button" className="btn btn-light !py-2 !px-4 text-sm" onClick={() => onChange([...value, { milestone: "", percent: null }])}>
            <Plus size={16} /> Add milestone
          </button>
        ) : null}
        {value.length ? <span className={`text-sm ${total === 100 ? "text-black/55" : "text-amber-700"}`}>Total {total}%{total !== 100 ? " (should add up to 100%)" : ""}</span> : null}
      </div>
    </div>
  );
}

/** Image list with upload + paste-URL. Used for floor plans (labelled) and photos. */
export function ImageListEditor({ value, onChange, kind, labelled, disabled }: { value: FloorPlan[]; onChange: (v: FloorPlan[]) => void; kind: UploadKind; labelled?: boolean; disabled?: boolean }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    try {
      const added: FloorPlan[] = [];
      for (const f of Array.from(files).slice(0, 10)) {
        const r = await uploadFile(f, kind);
        added.push({ url: r.url, label: labelled ? f.name.replace(/\.[^.]+$/, "") : null });
      }
      onChange([...value, ...added]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };
  const addUrl = () => {
    const u = url.trim();
    if (!/^https?:\/\/|^\//.test(u)) return setError("Enter a full image URL");
    onChange([...value, { url: u, label: null }]);
    setUrl("");
    setError(null);
  };

  return (
    <div className="flex flex-col gap-3">
      {value.length ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
          {value.map((img, i) => (
            <div key={`${img.url}-${i}`} className="relative group">
              <div className="aspect-[4/3] rounded-xl overflow-hidden bg-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.label ?? ""} className="w-full h-full object-cover" />
              </div>
              {labelled ? (
                <input className="input !py-1.5 !px-2 text-xs mt-1" value={img.label ?? ""} placeholder="Label, e.g. 3 BHK · 1850 sq ft" disabled={disabled} onChange={(e) => onChange(value.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} />
              ) : null}
              {!disabled ? (
                <button type="button" aria-label="Remove" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center">
                  <X size={14} />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
      {!disabled ? (
        <div className="flex flex-wrap gap-2 items-center">
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          <button type="button" className="btn btn-light !py-2 !px-4 text-sm" disabled={busy} onClick={() => fileRef.current?.click()}>
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />} Upload
          </button>
          <div className="flex gap-2 flex-1 min-w-[240px]">
            <input className="input !py-2" value={url} placeholder="…or paste an image URL" onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())} />
            <button type="button" className="btn btn-light !py-2 !px-3" onClick={addUrl} aria-label="Add URL">
              <LinkIcon size={16} />
            </button>
          </div>
        </div>
      ) : null}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
