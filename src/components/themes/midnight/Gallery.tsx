"use client";
import { useState, type ReactNode } from "react";
import { Images } from "lucide-react";
import clsx from "clsx";
import { Lightbox } from "@/components/public/Lightbox";
import type { PublicPhoto } from "@/components/themes/types";
import { Parallax } from "./Parallax";
import { Img } from "./ui";

/**
 * Full-bleed parallax hero + thumbnail strip + lightbox.
 * `overlay` is server-rendered content (badges, title) drawn over the hero gradient.
 */
export function Gallery({ photos, listingId, title, overlay }: { photos: PublicPhoto[]; listingId: string; title: string; overlay?: ReactNode }) {
  const [index, setIndex] = useState<number | null>(null);
  const cover = photos[0];
  const alt = (p: PublicPhoto | undefined, i: number) => (p?.roomTag ? `${p.roomTag} — ${title}` : `${title} — photo ${i + 1}`);

  return (
    <>
      <div className="relative h-[62vh] min-h-[380px] max-h-[720px] w-full overflow-hidden bg-[#0F1216]">
        {cover ? (
          <Parallax className="absolute inset-0 -top-[12%] h-[124%]">
            <button
              type="button"
              onClick={() => setIndex(0)}
              className="block h-full w-full cursor-zoom-in"
              aria-label="Open photo gallery"
            >
              <Img src={cover.url} alt={alt(cover, 0)} eager className="h-full w-full object-cover" />
            </button>
          </Parallax>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#7D8391]">
            <Images size={40} strokeWidth={1.25} />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#0B0D10] via-[#0B0D10]/35 to-[#0B0D10]/10" />
        {overlay && <div className="absolute inset-x-0 bottom-0">{overlay}</div>}
        {photos.length > 1 && (
          <button
            type="button"
            onClick={() => setIndex(0)}
            className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur hover:bg-black/70"
          >
            <Images size={14} /> {photos.length} photos
          </button>
        )}
      </div>

      {photos.length > 1 && (
        <div className="mn-scroll mx-auto max-w-6xl overflow-x-auto px-4 pt-3">
          <ul className="flex gap-2 pb-2" aria-label="Photo thumbnails">
            {photos.map((p, i) => (
              <li key={p.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  className={clsx("block h-16 w-24 overflow-hidden rounded-lg border transition-colors sm:h-20 sm:w-32", i === 0 ? "border-[#7C5CFF]" : "border-white/10 hover:border-white/40")}
                  aria-label={`Open photo ${i + 1}${p.roomTag ? `: ${p.roomTag}` : ""}`}
                >
                  <Img src={p.url} alt={alt(p, i)} className="h-full w-full object-cover" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Lightbox photos={photos} index={index} onClose={() => setIndex(null)} listingId={listingId} />
    </>
  );
}
