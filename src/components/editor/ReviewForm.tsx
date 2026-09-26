"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useListingDraft, type Quality } from "./DetailsForm";
import { PhotoGrid } from "./PhotoGrid";
import { BasicsSection, DetailsSection } from "./sections/Basics";
import { LocationSection } from "./sections/Location";
import { DescriptionSection } from "./sections/Description";
import { PublishBox } from "./PublishBox";
import { ShareLinks } from "./ShareLinks";
import { QualityMeter } from "./QualityMeter";
import type { ActionResult, EditorPhoto, ListingInput, PhotosInput, SignupInput } from "./schema";

/**
 * The no-login "Review your listing" screen reached from WhatsApp. Reuses the editor sections,
 * saves via the token-authorised `save` action and publishes via `publish` (which also signs the CP in).
 */
export function ReviewForm({ listingId, token, initial, initialPhotos, videoUrl, originalMessage, quality: initialQuality, needsSignup, rootDomain, save, publish }: { listingId: string; token: string; initial: ListingInput; initialPhotos: EditorPhoto[]; videoUrl: string | null; originalMessage: string | null; quality: Quality; needsSignup: boolean; rootDomain: string; save: (details: ListingInput, photos: PhotosInput) => Promise<ActionResult<{ quality: Quality }>>; publish: (signup?: SignupInput) => Promise<ActionResult<{ url: string }>> }) {
  const { d, set, dirty, setDirty } = useListingDraft(initial);
  const [photos, setPhotos] = useState(initialPhotos);
  const [quality, setQuality] = useState(initialQuality);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [published, setPublished] = useState<string | null>(null);
  const auth = { token, listingId };

  async function persist(): Promise<boolean> {
    const r = await save(d, { photos, videoUrl });
    if (!r.ok) {
      setMsg(r.error);
      return false;
    }
    setQuality(r.data.quality);
    setDirty(false);
    return true;
  }

  if (published) {
    return (
      <div className="max-w-xl mx-auto space-y-5">
        <section className="card p-6 md:p-8 space-y-5 text-center">
          <div className="text-5xl">🎉</div>
          <h1 className="text-2xl md:text-3xl">Your listing is live</h1>
          <p className="text-muted">Share the link on WhatsApp. Every open shows up in your dashboard, and you get a report each morning.</p>
          <div className="text-left">
            <ShareLinks url={published} title={d.title} priceDisplay={d.price ? `${d.currency === "INR" ? "₹" : d.currency} ${d.price.toLocaleString("en-IN")}` : "Price on request"} />
          </div>
          <Link href="/dashboard" className="btn btn-dark w-full justify-center">
            Open dashboard →
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header className="card p-5 md:p-7">
        <span className="eyebrow">Review your listing</span>
        <h1 className="text-2xl md:text-3xl mt-1">Review your listing</h1>
        <p className="text-muted mt-1">We pulled these details from what you sent on WhatsApp. Fix anything that looks off, then publish.</p>
      </header>

      <QualityMeter score={quality.score} hints={quality.hints} compact />

      <section className="card p-5 md:p-7 space-y-3">
        <h2 className="text-xl md:text-2xl">Photos</h2>
        <PhotoGrid
          photos={photos}
          onChange={(p) => {
            setPhotos(p);
            setDirty(true);
          }}
          auth={auth}
        />
      </section>

      <BasicsSection d={d} set={set} />
      <LocationSection d={d} set={set} />
      <DetailsSection d={d} set={set} />
      <DescriptionSection d={d} set={set} auth={auth} rewriteLabel="Rewrite from details" />

      {originalMessage && (
        <details className="card p-5 md:p-7">
          <summary className="cursor-pointer text-lg font-medium">What you originally sent us</summary>
          <pre className="mt-3 whitespace-pre-wrap text-sm text-muted font-sans bg-soft rounded-[var(--radius-inner)] p-4">{originalMessage}</pre>
        </details>
      )}
      <div className="h-28" />

      <div className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
        <div className="max-w-4xl mx-auto px-4 pb-4">
          <div className="pointer-events-auto card shadow-[0_8px_40px_rgba(0,0,0,.15)] p-3 md:p-4 space-y-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted">{pending ? "Saving…" : msg ?? (dirty ? "Unsaved changes" : "Draft saved")}</span>
              <button
                type="button"
                disabled={pending}
                onClick={() => {
                  setMsg(null);
                  start(async () => {
                    if (await persist()) setMsg("Saved");
                  });
                }}
                className="btn btn-light !py-2 text-sm"
              >
                Save draft
              </button>
            </div>
            <PublishBox needsSignup={needsSignup} rootDomain={rootDomain} publish={publish} big label="Publish listing" extraSaving={persist} onPublished={(url) => setPublished(url)} />
          </div>
        </div>
      </div>
    </div>
  );
}
