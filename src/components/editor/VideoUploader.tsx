"use client";
import { useRef, useState } from "react";
import { uploadFile, type ReviewAuth } from "./upload";

/** One optional walkthrough video (≤100 MB) stored via /api/upload. */
export function VideoUploader({ value, onChange, auth }: { value: string | null | undefined; onChange: (url: string | null) => void; auth?: ReviewAuth }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  async function pick(file: File) {
    setError(null);
    if (file.size > 100 * 1024 * 1024) return setError("Video must be under 100 MB");
    setBusy(true);
    try {
      const r = await uploadFile(file, "video", auth);
      onChange(r.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <video src={value} controls preload="metadata" className="rounded-[var(--radius-inner)] bg-black w-full sm:w-64 aspect-video" />
          <button type="button" className="chip text-red-600 self-start" onClick={() => onChange(null)}>
            Remove video
          </button>
        </div>
      ) : (
        <button type="button" disabled={busy} onClick={() => ref.current?.click()} className="w-full rounded-[var(--radius-inner)] border-2 border-dashed border-line hover:border-ink py-6 text-sm text-muted disabled:opacity-60">
          {busy ? "Uploading video…" : "+ Add a walkthrough video (optional, MP4/MOV up to 100 MB)"}
        </button>
      )}
      <input ref={ref} type="file" accept="video/mp4,video/quicktime,video/webm" hidden onChange={(e) => e.target.files?.[0] && void pick(e.target.files[0])} />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
