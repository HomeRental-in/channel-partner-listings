"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { PhotoGrid } from "@/components/editor/PhotoGrid";
import { VideoUploader } from "@/components/editor/VideoUploader";
import type { EditorPhoto } from "@/components/editor/schema";
import { createFromWeb, type NewListingInput } from "./actions";

const HINTS = ["location", "floor", "facing", "BHK", "area", "price", "furnishing", "parking", "possession", "amenities", "project name"];
const EXAMPLE = "3 BHK, 1850 sq ft in DLF The Aureva, Sector 63 Gurgaon. 12th floor, east facing, semi-furnished, 2 covered parking. 2.4 Cr negotiable. Ready to move. Pool, gym, clubhouse.";

export function NewListingForm() {
  const [photos, setPhotos] = useState<EditorPhoto[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    const payload: NewListingInput = { text, photos, videoUrl: video };
    start(async () => {
      const r = await createFromWeb(payload);
      if (r && !r.ok) setError(r.error);
    });
  }

  if (pending) {
    return (
      <div className="card p-10 md:p-16 text-center space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full border-4 border-line border-t-ink animate-spin" />
        <h2 className="text-2xl">AI is reading your details…</h2>
        <p className="text-muted max-w-md mx-auto">We are looking at {photos.length} photo{photos.length === 1 ? "" : "s"} and your description to write the headline, features and a buyer-friendly description. This takes 10-30 seconds.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="card p-5 md:p-7 space-y-4">
        <div>
          <span className="eyebrow">Step 1 of 3</span>
          <h2 className="text-xl md:text-2xl mt-1">Photos</h2>
          <p className="text-sm text-muted">Drop up to 20 photos. The first one becomes the cover — drag to reorder.</p>
        </div>
        <PhotoGrid photos={photos} onChange={setPhotos} />
        <div className="pt-2">
          <span className="block text-sm font-medium mb-2">Walkthrough video (optional)</span>
          <VideoUploader value={video} onChange={setVideo} />
        </div>
      </section>

      <section className="card p-5 md:p-7 space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl">Describe your property</h2>
          <p className="text-sm text-muted">Write it the way you would on WhatsApp — Hindi, Hinglish or English. AI turns it into a clean listing.</p>
        </div>
        <textarea className="input resize-y leading-relaxed" rows={7} value={text} maxLength={8000} placeholder={EXAMPLE} onChange={(e) => setText(e.target.value)} />
        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted mr-1">Try to include:</span>
          {HINTS.map((h) => (
            <span key={h} className={`chip !text-xs ${text.toLowerCase().includes(h.toLowerCase().split(" ")[0]) ? "!bg-ink !text-white" : ""}`}>
              {h}
            </span>
          ))}
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex items-center justify-between gap-3">
        <Link href="/dashboard/listings" className="btn btn-ghost">
          Cancel
        </Link>
        <button type="button" onClick={submit} disabled={pending || (photos.length === 0 && !text.trim())} className="btn btn-dark disabled:opacity-50">
          Continue →
        </button>
      </div>
    </div>
  );
}
