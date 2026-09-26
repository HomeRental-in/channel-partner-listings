"use client";
import { useRef } from "react";
import { track } from "@/components/public/track";

/** Uploaded video or embedded tour. Fires VIDEO_PLAY once per page view. */
export function VideoBlock({ listingId, videoUrl, embedUrl, tourUrl, title, className }: { listingId: string; videoUrl: string | null; embedUrl: string | null; tourUrl: string | null; title: string; className?: string }) {
  const fired = useRef(false);
  const fire = () => { if (!fired.current) { fired.current = true; track("VIDEO_PLAY", listingId); } };
  if (videoUrl) {
    return (
      <video src={videoUrl} controls playsInline preload="metadata" onPlay={fire} className={className} aria-label={`Video of ${title}`} />
    );
  }
  if (embedUrl) {
    return (
      <div className={className} onPointerDown={fire}>
        <iframe src={embedUrl} title={`Video tour of ${title}`} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen loading="lazy" />
      </div>
    );
  }
  if (tourUrl) {
    return (
      <a href={tourUrl} target="_blank" rel="noopener noreferrer" onClick={fire} className="underline underline-offset-4">
        Watch the video tour
      </a>
    );
  }
  return null;
}
