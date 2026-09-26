"use client";
import { useEffect, useRef, useState, type DragEvent } from "react";
import Image from "next/image";
import { ROOM_TAGS, type EditorPhoto } from "./schema";
import { uploadFile, move, type ReviewAuth } from "./upload";

/**
 * Photo grid used by web intake, the Photos step and the review page.
 * HTML5 drag-and-drop reorder (no library), cover star (moves to index 0), remove, optional room tag,
 * drop-zone / file-picker upload straight to /api/upload. First photo is always the cover.
 */
export function PhotoGrid({ photos, onChange, auth, max = 20, showRoomTags = false, compact = false }: { photos: EditorPhoto[]; onChange: (p: EditorPhoto[]) => void; auth?: ReviewAuth; max?: number; showRoomTags?: boolean; compact?: boolean }) {
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [zoneActive, setZoneActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const latest = useRef(photos);
  useEffect(() => {
    latest.current = photos;
  }, [photos]);

  async function addFiles(files: FileList | File[]) {
    setError(null);
    const list = Array.from(files).filter((f) => f.type.startsWith("image/") || /\.(heic|heif)$/i.test(f.name));
    const room = max - latest.current.length;
    if (list.length > room) setError(`You can add ${room} more photo${room === 1 ? "" : "s"} (max ${max}).`);
    const batch = list.slice(0, Math.max(0, room));
    setUploading((n) => n + batch.length);
    await Promise.all(
      batch.map(async (file) => {
        try {
          const r = await uploadFile(file, "photo", auth);
          const next = [...latest.current, { url: r.url, width: r.width, height: r.height, roomTag: null }];
          latest.current = next;
          onChange(next);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Upload failed");
        } finally {
          setUploading((n) => n - 1);
        }
      }),
    );
  }

  function onDrop(e: DragEvent, index?: number) {
    e.preventDefault();
    setZoneActive(false);
    if (drag != null && index != null) {
      onChange(move(photos, drag, index));
    } else if (e.dataTransfer.files?.length) {
      void addFiles(e.dataTransfer.files);
    }
    setDrag(null);
    setOver(null);
  }

  const tile = compact ? "aspect-square" : "aspect-[4/3]";

  return (
    <div className="space-y-3">
      <div className={`grid gap-3 ${compact ? "grid-cols-3 sm:grid-cols-4 md:grid-cols-5" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
        {photos.map((p, i) => (
          <figure
            key={p.id ?? p.url}
            draggable
            onDragStart={() => setDrag(i)}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(i);
            }}
            onDragLeave={() => setOver(null)}
            onDrop={(e) => onDrop(e, i)}
            onDragEnd={() => {
              setDrag(null);
              setOver(null);
            }}
            className={`relative group rounded-[var(--radius-inner)] overflow-hidden bg-soft ${tile} ${over === i && drag !== i ? "ring-2 ring-ink" : ""} ${drag === i ? "opacity-50" : ""} cursor-grab active:cursor-grabbing`}
          >
            <Image src={p.url} alt="" fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover pointer-events-none" unoptimized />
            {i === 0 && <span className="absolute top-2 left-2 chip !bg-ink !text-white !text-xs !py-1">★ Cover</span>}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {i !== 0 && (
                <button type="button" title="Make cover" onClick={() => onChange(move(photos, i, 0))} className="w-8 h-8 rounded-full bg-white/95 text-sm shadow">
                  ★
                </button>
              )}
              <button type="button" title="Remove" onClick={() => onChange(photos.filter((_, j) => j !== i))} className="w-8 h-8 rounded-full bg-white/95 text-sm shadow">
                ✕
              </button>
            </div>
            <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between gap-1">
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button type="button" title="Move left" disabled={i === 0} onClick={() => onChange(move(photos, i, i - 1))} className="w-7 h-7 rounded-full bg-white/95 text-xs shadow disabled:opacity-30">
                  ←
                </button>
                <button type="button" title="Move right" disabled={i === photos.length - 1} onClick={() => onChange(move(photos, i, i + 1))} className="w-7 h-7 rounded-full bg-white/95 text-xs shadow disabled:opacity-30">
                  →
                </button>
              </div>
              {showRoomTags && (
                <select
                  value={p.roomTag ?? ""}
                  onChange={(e) => onChange(photos.map((q, j) => (j === i ? { ...q, roomTag: e.target.value || null } : q)))}
                  className="text-xs rounded-full bg-white/95 px-2 py-1 shadow max-w-[60%]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Tag room…</option>
                  {ROOM_TAGS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </figure>
        ))}
        {Array.from({ length: uploading }).map((_, i) => (
          <div key={`up-${i}`} className={`rounded-[var(--radius-inner)] bg-soft ${tile} animate-pulse flex items-center justify-center text-xs text-muted`}>
            Uploading…
          </div>
        ))}
        {photos.length + uploading < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setZoneActive(true);
            }}
            onDragLeave={() => setZoneActive(false)}
            onDrop={(e) => onDrop(e)}
            className={`rounded-[var(--radius-inner)] border-2 border-dashed ${tile} flex flex-col items-center justify-center gap-1 text-sm text-muted transition-colors ${zoneActive ? "border-ink bg-soft" : "border-line hover:border-ink"}`}
          >
            <span className="text-2xl leading-none">+</span>
            <span>{photos.length === 0 ? "Add photos" : "Add more"}</span>
            <span className="text-xs">or drop here</span>
          </button>
        )}
      </div>
      <input ref={inputRef} type="file" accept="image/*,.heic,.heif" multiple hidden onChange={(e) => e.target.files && void addFiles(e.target.files).then(() => (e.target.value = ""))} />
      <p className="text-xs text-muted">
        {photos.length}/{max} photos · JPG, PNG, WebP up to 10 MB · drag to reorder · first photo is the cover
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
