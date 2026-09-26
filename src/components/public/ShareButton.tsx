"use client";
import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { track } from "./track";

export function ShareButton({ url, title, text, listingId, className = "" }: { url: string; title: string; text?: string; listingId: string | null; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className}
      onClick={async () => {
        track("SHARE", listingId);
        try {
          if (navigator.share) await navigator.share({ url, title, text });
          else { await navigator.clipboard.writeText(url); setDone(true); setTimeout(() => setDone(false), 1500); }
        } catch {}
      }}
      aria-label="Share"
    >
      {done ? <Check size={18} /> : <Share2 size={18} />}
      <span>{done ? "Copied" : "Share"}</span>
    </button>
  );
}
