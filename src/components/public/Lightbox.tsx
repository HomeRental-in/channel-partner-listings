"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { track } from "./track";
import type { PublicPhoto } from "@/components/themes/types";

/** Full-screen swipeable gallery. Controlled via `index` (null = closed). */
export function Lightbox({ photos, index, onClose, listingId }: { photos: PublicPhoto[]; index: number | null; onClose: () => void; listingId: string }) {
  const [i, setI] = useState(index ?? 0);
  // Sync the visible slide when the caller opens at a different index (adjust-state-during-render pattern).
  const [seenIndex, setSeenIndex] = useState(index);
  if (index !== seenIndex) {
    setSeenIndex(index);
    if (index != null) setI(index);
  }
  const startX = useRef(0);
  useEffect(() => { if (index != null) track("PHOTO_VIEW", listingId, { index }); }, [index, listingId]);
  const prev = useCallback(() => setI((v) => (v - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setI((v) => (v + 1) % photos.length), [photos.length]);
  useEffect(() => {
    if (index == null) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); if (e.key === "ArrowLeft") prev(); if (e.key === "ArrowRight") next(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [index, onClose, prev, next]);
  if (index == null || !photos.length) return null;
  return (
    <div className="fixed inset-0 z-[100] bg-black/95 text-white flex flex-col" role="dialog" aria-modal="true"
      onTouchStart={(e) => { startX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => { const dx = e.changedTouches[0].clientX - startX.current; if (dx > 40) prev(); if (dx < -40) next(); }}>
      <div className="flex items-center justify-between p-4 text-sm">
        <span>{i + 1} / {photos.length}{photos[i].roomTag ? ` · ${photos[i].roomTag}` : ""}</span>
        <button onClick={onClose} aria-label="Close" className="p-2"><X /></button>
      </div>
      <div className="flex-1 relative flex items-center justify-center px-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photos[i].url} alt={photos[i].roomTag ?? ""} className="max-h-full max-w-full object-contain select-none" draggable={false} />
        {photos.length > 1 && (
          <>
            <button onClick={prev} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 hidden sm:block"><ChevronLeft /></button>
            <button onClick={next} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 hover:bg-white/20 hidden sm:block"><ChevronRight /></button>
          </>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto p-3">
        {photos.map((p, idx) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={p.id} src={p.url} alt="" onClick={() => setI(idx)} className={`h-14 w-20 object-cover rounded-md cursor-pointer ${idx === i ? "ring-2 ring-white" : "opacity-60"}`} />
        ))}
      </div>
    </div>
  );
}
