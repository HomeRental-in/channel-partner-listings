"use client";
import { useState } from "react";
import Image from "next/image";
import { Lightbox } from "@/components/public/Lightbox";
import type { PublicPhoto } from "@/components/themes/types";

const STRIP_MAX = 8;

/** Large hero cover (click → lightbox) + horizontal scroll-snap photo strip. */
export function Gallery({ photos, listingId, title }: { photos: PublicPhoto[]; listingId: string; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!photos.length) {
    return (
      <div className="ed-hero" aria-hidden="true" style={{ cursor: "default", display: "grid", placeItems: "center" }}>
        <span className="ed-serif-i ed-faint" style={{ fontSize: "1.4rem" }}>Photos coming soon</span>
      </div>
    );
  }
  const cover = photos[0];
  const strip = photos.slice(1, 1 + STRIP_MAX);
  const remaining = photos.length - 1 - strip.length;
  return (
    <div>
      <button type="button" className="ed-hero" onClick={() => setOpen(0)} aria-label={`Open photo gallery, ${photos.length} photos`}>
        <Image src={cover.url} alt={cover.roomTag ? `${cover.roomTag} — ${title}` : title} fill sizes="(min-width: 1280px) 1200px, 100vw" className="object-cover" loading="eager" fetchPriority="high" />
        <span className="ed-hero-count" aria-hidden="true">{photos.length} photo{photos.length === 1 ? "" : "s"}</span>
      </button>
      {strip.length > 0 && (
        <div className="ed-strip" role="list" aria-label="More photos">
          {strip.map((p, i) => {
            const idx = i + 1;
            const last = i === strip.length - 1 && remaining > 0;
            return (
              <button key={p.id} type="button" role="listitem" onClick={() => setOpen(idx)} aria-label={p.roomTag ? `Photo ${idx + 1}: ${p.roomTag}` : `Photo ${idx + 1}`}>
                <Image src={p.url} alt="" fill sizes="(min-width: 640px) 200px, 40vw" className="object-cover" />
                {last && <span className="ed-more" aria-hidden="true">+{remaining}</span>}
              </button>
            );
          })}
        </div>
      )}
      <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} listingId={listingId} />
    </div>
  );
}
