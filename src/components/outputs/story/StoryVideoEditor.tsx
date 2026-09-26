"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Download, Loader2, Film } from "lucide-react";
import clsx from "clsx";
import { SlideStrip } from "./SlideStrip";
import { PreviewCanvas } from "./PreviewCanvas";
import { buildPlan, MAX_SECONDS, planDuration, type StoryAnimation, type StoryListingInfo, type StorySettings, type StorySlide } from "./types";
import { detectFontFamily, loadImages, type ImageMap } from "./render";
import { downloadBlob, recordStory, uploadStory, type UploadResult } from "./record";

type Props = { listing: StoryListingInfo };

const ANIMATIONS: { key: StoryAnimation; label: string }[] = [
  { key: "zoom", label: "Zoom" },
  { key: "slide", label: "Slide" },
  { key: "fade", label: "Fade" },
];

function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 py-3 cursor-pointer">
      <span>
        <span className="block font-medium">{label}</span>
        {hint ? <span className="block text-sm text-black/55">{hint}</span> : null}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={clsx("relative w-12 h-7 rounded-full transition shrink-0", checked ? "bg-black" : "bg-black/20")}>
        <span className={clsx("absolute top-1 w-5 h-5 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
      </button>
    </label>
  );
}

export function StoryVideoEditor({ listing }: Props) {
  const [slides, setSlides] = useState<StorySlide[]>(() =>
    listing.photos.map((p, i) => ({ id: p.id, url: p.url, caption: listing.highlights[i] ?? (i === 0 ? listing.title : ""), include: i < 8 })),
  );
  const [settings, setSettings] = useState<StorySettings>({ animation: "zoom", seconds: 3, includePrice: true, includeContact: true, music: true });
  const [images, setImages] = useState<ImageMap>(new Map());
  const [seek, setSeek] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | { stage: "render" | "upload"; progress: number }>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    detectFontFamily();
    const urls = [...listing.photos.map((p) => p.url), ...(listing.broker.avatarUrl ? [listing.broker.avatarUrl] : [])];
    loadImages(urls).then(setImages);
  }, [listing]);

  const plan = useMemo(() => buildPlan(listing, slides, settings), [listing, slides, settings]);
  const duration = planDuration(plan);
  const tooLong = duration > MAX_SECONDS;
  const includedCount = slides.filter((s) => s.include).length;

  const selectSlide = (id: string) => {
    setActiveId(id);
    const idx = slides.filter((s) => s.include).findIndex((s) => s.id === id);
    if (idx >= 0) setSeek(idx);
  };

  const save = async () => {
    setError(null);
    setResult(null);
    if (!plan.slides.length) return setError("Include at least one slide.");
    try {
      setBusy({ stage: "render", progress: 0 });
      const blob = await recordStory(plan, images, (p) => setBusy({ stage: "render", progress: p }));
      downloadBlob(blob, `${listing.slug}-story.webm`);
      setBusy({ stage: "upload", progress: 1 });
      const res = await uploadStory(listing.id, blob);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="panel p-6 lg:sticky lg:top-6 self-start">
        <p className="eyebrow mb-4 text-center">Live preview · {duration}s</p>
        <PreviewCanvas plan={plan} images={images} seekToSlide={seek} />
      </div>

      <div className="flex flex-col gap-6">
        <section className="panel p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl">Slides</h2>
            <span className="text-sm text-black/55">{includedCount} of {slides.length} photos included</span>
          </div>
          <p className="text-sm text-black/55 mb-4">Drag to reorder, tap the caption to edit, tick to include. Captions start from your highlights.</p>
          {slides.length ? <SlideStrip slides={slides} onChange={setSlides} activeId={activeId} onSelect={selectSlide} /> : <p className="text-black/55">Add photos to the listing first.</p>}
        </section>

        <section className="panel p-6 grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="text-xl mb-2">Extra slides</h2>
            <Toggle label="Price slide" hint="Price, title, locality and chips" checked={settings.includePrice} onChange={(v) => setSettings({ ...settings, includePrice: v })} />
            <Toggle label="Contact card" hint="Your name, WhatsApp and site" checked={settings.includeContact} onChange={(v) => setSettings({ ...settings, includeContact: v })} />
            <Toggle label="Background music" hint="Soft generated loop, no copyright issues" checked={settings.music} onChange={(v) => setSettings({ ...settings, music: v })} />
          </div>
          <div>
            <h2 className="text-xl mb-3">Motion</h2>
            <div className="flex gap-2 mb-5">
              {ANIMATIONS.map((a) => (
                <button key={a.key} type="button" onClick={() => setSettings({ ...settings, animation: a.key })} className={clsx("btn !py-2.5 !px-4 text-sm", settings.animation === a.key ? "btn-dark" : "btn-light")}>
                  {a.label}
                </button>
              ))}
            </div>
            <label className="block">
              <span className="flex justify-between text-sm mb-1">
                <span className="font-medium">Speed</span>
                <span className="text-black/55">{settings.seconds}s per slide</span>
              </span>
              <input type="range" min={2} max={5} step={0.5} value={settings.seconds} onChange={(e) => setSettings({ ...settings, seconds: Number(e.target.value) })} className="w-full accent-black" />
            </label>
            <div className={clsx("mt-4 flex items-start gap-2 text-sm rounded-2xl p-3", tooLong ? "bg-amber-50 text-amber-900" : "bg-soft text-black/60")}>
              {tooLong ? <AlertTriangle size={18} className="shrink-0 mt-0.5" /> : <Film size={18} className="shrink-0 mt-0.5" />}
              <span>
                {tooLong
                  ? `Total ${duration}s is over the 30s WhatsApp Status limit. Remove ${Math.ceil((duration - MAX_SECONDS) / settings.seconds)} slide(s) or lower the speed.`
                  : `Total ${duration}s · fits a WhatsApp Status (max 30s).`}
              </span>
            </div>
          </div>
        </section>

        <section className="panel p-6">
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn btn-dark" onClick={save} disabled={!!busy || !plan.slides.length}>
              {busy ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              {busy?.stage === "render" ? `Rendering… ${Math.round(busy.progress * 100)}%` : busy?.stage === "upload" ? "Converting to MP4…" : "Save video"}
            </button>
            {result ? (
              <a className="btn btn-light" href={result.url} download={result.filename}>
                <Download size={18} /> Download {result.format.toUpperCase()} for WhatsApp Status
              </a>
            ) : null}
            <Link href={`/dashboard/listings/${listing.id}?step=done`} className="btn btn-ghost ml-auto">
              Back to listing
            </Link>
          </div>
          <p className="text-sm text-black/55 mt-3">
            Rendering happens in your browser in real time ({duration}s). The WebM downloads immediately; the MP4 (for WhatsApp Status and Instagram) is ready a few seconds later.
          </p>
          {result?.warning ? <p className="text-sm text-amber-700 mt-2">{result.warning}</p> : null}
          {error ? <p className="text-sm text-red-600 mt-2">{error}</p> : null}
        </section>
      </div>
    </div>
  );
}
