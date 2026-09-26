import type { ReactNode } from "react";
import { Personalise } from "@/components/public/Personalise";
import { Pixel } from "./Pixel";

/**
 * Wraps every public page: strips ?n= + fires the VIEW event (Personalise), THEN boots the Meta Pixel.
 * Order matters — keep Personalise before Pixel so the name never reaches Meta.
 * Usage: <PublicShell viewerName={viewerName} listingId={data.id}><Theme.ListingPage … /></PublicShell>
 */
export function PublicShell({ viewerName, listingId, children }: { viewerName: string | null; listingId: string | null; children?: ReactNode }) {
  return (
    <>
      <Personalise viewerName={viewerName} listingId={listingId} />
      <Pixel />
      {children}
    </>
  );
}
