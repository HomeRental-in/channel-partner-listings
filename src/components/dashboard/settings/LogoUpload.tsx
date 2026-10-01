"use client";
import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const MAX_BYTES = 5 * 1024 * 1024;

/** Brand logo: uploads via POST /api/upload (multipart: file + kind=logo) → { url }. Previewed on light and dark. */
export function LogoUpload({ url, onChange }: { url: string | null; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file.");
    if (file.size > MAX_BYTES) return toast.error("Logo must be under 5 MB.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "logo");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Logo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">Brand logo (optional)</span>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="relative flex shrink-0 gap-2">
          {url ? (
            <>
              <Swatch label="On light" className="border border-line bg-white">
                <Logo url={url} />
              </Swatch>
              {/* Midnight puts the logo on a white chip so dark logos stay visible — mirror that here. */}
              <Swatch label="On dark" className="bg-[#0B0D10]" labelClassName="text-white/60">
                <span className="inline-flex items-center rounded-lg bg-white px-2 py-1">
                  <Logo url={url} small />
                </span>
              </Swatch>
            </>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className="flex h-20 w-40 flex-col items-center justify-center gap-1 rounded-2xl border border-dashed border-line text-xs text-muted transition-colors hover:border-black/40"
            >
              <ImagePlus size={18} />
              No logo yet
            </button>
          )}
          {busy && (
            <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/50 text-white">
              <Loader2 size={20} className="animate-spin" />
            </span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn btn-light !py-2 !px-3.5 text-sm">
              <ImagePlus size={15} /> {url ? "Replace logo" : "Upload logo"}
            </button>
            {url && (
              <button type="button" onClick={() => onChange(null)} disabled={busy} className="btn btn-ghost !py-2 !px-3.5 text-sm">
                <Trash2 size={15} /> Remove
              </button>
            )}
          </div>
          <p className="text-xs text-muted">Shown at the top of your pages and listings instead of your name. PNG with a transparent background works best.</p>
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/png,image/webp,image/jpeg,image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}

function Swatch({ label, className, labelClassName = "text-muted", children }: { label: string; className: string; labelClassName?: string; children: React.ReactNode }) {
  return (
    <div className={`relative flex h-20 w-36 items-center justify-center rounded-2xl px-3 pb-3 pt-1 sm:w-40 ${className}`}>
      {children}
      <span className={`absolute bottom-1.5 left-0 right-0 text-center text-[10px] uppercase tracking-wider ${labelClassName}`}>{label}</span>
    </div>
  );
}

function Logo({ url, small = false }: { url: string; small?: boolean }) {
  // Plain <img>: logos have arbitrary aspect ratios and come from our own storage.
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt="Your brand logo" className={`${small ? "h-7 max-w-[104px]" : "h-9 max-w-[120px]"} w-auto object-contain`} />;
}
