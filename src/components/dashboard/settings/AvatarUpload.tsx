"use client";
import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/** Uploads via POST /api/upload (multipart: file + kind=avatar) → { url }. */
export function AvatarUpload({ url, name, onChange }: { url: string | null; name: string; onChange: (url: string | null) => void }) {
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  async function upload(file: File) {
    if (!file.type.startsWith("image/")) return toast.error("Choose an image file.");
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be under 10 MB.");
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      onChange(data.url);
      toast.success("Photo updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  const initial = name.trim().charAt(0).toUpperCase() || "•";
  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0">
        {url ? (
          <Image src={url} alt="" fill sizes="80px" className="rounded-full object-cover" unoptimized />
        ) : (
          <span className="flex h-full w-full items-center justify-center rounded-full bg-black text-white text-2xl font-medium">{initial}</span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 text-white">
            <Loader2 size={20} className="animate-spin" />
          </span>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn btn-light !py-2 !px-3.5 text-sm">
            <Camera size={15} /> {url ? "Change photo" : "Upload photo"}
          </button>
          {url && (
            <button type="button" onClick={() => onChange(null)} disabled={busy} className="btn btn-ghost !py-2 !px-3.5 text-sm">
              <Trash2 size={15} /> Remove
            </button>
          )}
        </div>
        <p className="text-xs text-muted">Square photo works best. Shown on your site and every listing.</p>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
    </div>
  );
}
