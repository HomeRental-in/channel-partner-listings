"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PhotoGrid } from "./PhotoGrid";
import { VideoUploader } from "./VideoUploader";
import type { ActionResult, EditorPhoto, PhotosInput } from "./schema";

/** Dashboard "Photos" step: grid with room tags + one video, saved through the `save` server action. */
export function PhotosStep({ listingId, initialPhotos, initialVideo, save }: { listingId: string; initialPhotos: EditorPhoto[]; initialVideo: string | null; save: (data: PhotosInput) => Promise<ActionResult<{ quality: { score: number; hints: string[] } }>> }) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [video, setVideo] = useState<string | null>(initialVideo);
  const [dirty, setDirty] = useState(false);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  function persist(next?: string) {
    setMsg(null);
    start(async () => {
      const r = await save({ photos, videoUrl: video });
      if (!r.ok) return setMsg(r.error);
      setDirty(false);
      setMsg("Saved");
      if (next) router.push(`/dashboard/listings/${listingId}?step=${next}`);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-5">
      <section className="card p-5 md:p-7 space-y-4">
        <header className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl md:text-2xl">Photos</h2>
            <p className="text-sm text-muted mt-1">Up to 20 photos. Drag to reorder, star sets the cover, tag rooms so buyers can jump to what they care about.</p>
          </div>
        </header>
        <PhotoGrid
          photos={photos}
          onChange={(p) => {
            setPhotos(p);
            setDirty(true);
          }}
          showRoomTags
        />
      </section>
      <section className="card p-5 md:p-7 space-y-4">
        <h2 className="text-xl md:text-2xl">Walkthrough video</h2>
        <VideoUploader
          value={video}
          onChange={(v) => {
            setVideo(v);
            setDirty(true);
          }}
        />
      </section>
      <div className="h-20" />
      <div className="fixed bottom-20 md:bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="max-w-6xl mx-auto px-4 pb-4">
          <div className="pointer-events-auto card shadow-[0_8px_40px_rgba(0,0,0,.15)] px-4 py-3 flex items-center justify-between gap-3">
            <span className="text-sm text-muted">{pending ? "Saving…" : msg ?? (dirty ? "Unsaved changes" : `${photos.length} photo${photos.length === 1 ? "" : "s"}`)}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => persist()} disabled={pending} className="btn btn-light !py-2.5 disabled:opacity-60">
                Save order
              </button>
              <button type="button" onClick={() => persist("details")} disabled={pending} className="btn btn-dark !py-2.5 disabled:opacity-60">
                Save & continue →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
