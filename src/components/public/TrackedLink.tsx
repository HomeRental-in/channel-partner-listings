"use client";
import { track, type TrackType } from "./track";
import type { AnchorHTMLAttributes, ReactNode } from "react";

type Props = AnchorHTMLAttributes<HTMLAnchorElement> & { event: TrackType; listingId: string | null; meta?: Record<string, unknown>; children: ReactNode };

/** Anchor that records an event (browser + server) before navigating. Use for WhatsApp, Call, brochure, docs, map. */
export function TrackedLink({ event, listingId, meta, onClick, children, ...rest }: Props) {
  return (
    <a
      {...rest}
      onClick={(e) => {
        track(event, listingId, meta);
        onClick?.(e);
      }}
    >
      {children}
    </a>
  );
}
