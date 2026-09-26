"use client";
import { useState, type ReactNode } from "react";
import { Images, Sparkles, Camera } from "lucide-react";
import clsx from "clsx";
import { Lightbox } from "@/components/public/Lightbox";
import type { PublicPhoto } from "@/components/themes/types";
import { Img } from "./ui";

/**
 * Bento hero: big cover + 4 smaller photos + a price tile + a "chat on WhatsApp" tile.
 * Desktop: 6 columns × 2 rows (cover 3×2, photos 2×2, tiles stacked in the last column).
 * Mobile: cover full width, then tiles, then the small photos as a 2×2.
 * `priceTile` / `waTile` are server-rendered nodes; `fillers` are strings shown in empty photo slots.
 */
export function Bento({ photos, listingId, title, priceTile, waTile, fillers = [] }: { photos: PublicPhoto[]; listingId: string; title: string; priceTile: ReactNode; waTile: ReactNode | null; fillers?: string[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const cover = photos[0];
  const small = photos.slice(1, 5);
  const extra = photos.length - 5;
  const alt = (p: PublicPhoto | undefined, i: number) => (p?.roomTag ? `${p.roomTag} — ${title}` : `${title} — photo ${i + 1}`);
  const cell = "relative overflow-hidden rounded-[24px] sm:rounded-[28px]";
  const smallPos = ["md:col-start-4 md:row-start-1", "md:col-start-5 md:row-start-1", "md:col-start-4 md:row-start-2", "md:col-start-5 md:row-start-2"];

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:grid-cols-6 md:grid-rows-[repeat(2,minmax(0,1fr))]">
        {/* Cover: its 3:2 aspect defines the row height on desktop, so every other cell is ~square */}
        <div className={clsx(cell, "col-span-2 aspect-[4/3] md:col-span-3 md:col-start-1 md:row-span-2 md:row-start-1 md:aspect-[3/2]")}>
          {cover ? (
            <button type="button" onClick={() => setIndex(0)} className="sr-press group block h-full w-full cursor-zoom-in" aria-label="Open photo gallery">
              <Img src={cover.url} alt={alt(cover, 0)} eager className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
            </button>
          ) : (
            <div className="flex h-full min-h-56 items-center justify-center bg-[#F1E6D8] text-[#6E8A85]"><Camera size={40} strokeWidth={1.25} /></div>
          )}
          {photos.length > 1 && (
            <button type="button" onClick={() => setIndex(0)} className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-[#123F3A] shadow backdrop-blur hover:bg-white">
              <Images size={14} /> {photos.length} photos
            </button>
          )}
        </div>

        {/* Price + WhatsApp tiles */}
        <div className={clsx(cell, "min-h-32 md:col-start-6 md:row-start-1 md:min-h-0", !waTile && "col-span-2 md:col-span-1")}>{priceTile}</div>
        {waTile && <div className={clsx(cell, "min-h-32 md:col-start-6 md:row-start-2 md:min-h-0")}>{waTile}</div>}

        {/* Four small photos (or fillers) */}
        {[0, 1, 2, 3].map((i) => {
          const p = small[i];
          const isLast = i === 3 && extra > 0;
          if (p) {
            return (
              <button key={p.id} type="button" onClick={() => setIndex(i + 1)} className={clsx(cell, "sr-press group aspect-square md:aspect-auto", smallPos[i])} aria-label={`Open photo ${i + 2}${p.roomTag ? `: ${p.roomTag}` : ""}`}>
                <Img src={p.url} alt={alt(p, i + 1)} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                {isLast && (
                  <span className="absolute inset-0 flex items-center justify-center bg-[#123F3A]/55 text-lg font-extrabold text-white">+{extra} more</span>
                )}
              </button>
            );
          }
          const f = fillers[i - small.length];
          return (
            <div key={`f${i}`} className={clsx(cell, "flex aspect-square items-center justify-center p-4 text-center md:aspect-auto", i % 2 ? "bg-[#DDEFEA]" : "bg-[#FFEFC2]", smallPos[i])}>
              {f ? (
                <span className="text-sm font-bold leading-snug text-[#123F3A]"><Sparkles size={16} className="mx-auto mb-1 text-[#FF6B4A]" /> {f}</span>
              ) : (
                <Camera size={22} className="text-[#123F3A]/40" strokeWidth={1.5} />
              )}
            </div>
          );
        })}
      </div>
      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} listingId={listingId} />
    </>
  );
}
