import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicListing, sanitiseViewerName } from "@/lib/public";
import { getCurrentUser } from "@/lib/auth";
import { absoluteUrl } from "@/lib/storage";
import { BRAND } from "@/lib/site";
import { getTheme } from "@/components/themes";
import { PublicShell } from "@/components/themes/shared/PublicShell";
import type { PublicListing } from "@/components/themes/types";
import { localityLine, summaryLine } from "@/components/themes/shared/helpers";

export type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Loads a listing for a public page. Drafts/archived listings 404 unless `?preview=1` and the signed-in user owns it.
 * Calls notFound() itself so route files stay tiny.
 */
export async function loadListing(slug: string, username: string | undefined, sp: SearchParams): Promise<{ data: PublicListing; viewerName: string | null; preview: boolean }> {
  const wantPreview = first(sp.preview) === "1";
  const data = await getPublicListing(slug, username, { allowDraft: wantPreview });
  if (!data) notFound();
  const unpublished = data.status === "DRAFT" || data.status === "ARCHIVED";
  if (unpublished) {
    if (!wantPreview) notFound();
    const user = await getCurrentUser();
    if (!user || user.id !== data.broker.id) notFound();
  }
  return { data, viewerName: sanitiseViewerName(sp.n), preview: unpublished };
}

/** Metadata-only loader: never 404s (generateMetadata runs before the page). */
export async function loadListingForMetadata(slug: string, username: string | undefined, sp: SearchParams) {
  const wantPreview = first(sp.preview) === "1";
  const data = await getPublicListing(slug, username, { allowDraft: wantPreview });
  return { data, viewerName: sanitiseViewerName(sp.n) };
}

export function listingDescription(l: PublicListing) {
  const bits = [l.priceDisplay, summaryLine(l), localityLine(l)].filter(Boolean).join(" · ");
  const body = (l.highlights[0] ?? l.description ?? "").replace(/\s+/g, " ").trim().slice(0, 140);
  return [bits, body].filter(Boolean).join(" — ");
}

export function listingMetadata(l: PublicListing | null, viewerName: string | null): Metadata {
  if (!l) return { title: "Listing not found", robots: { index: false } };
  const title = `${viewerName ? `For ${viewerName} · ` : ""}${l.title || "Property listing"}`;
  const description = listingDescription(l);
  const unpublished = l.status === "DRAFT" || l.status === "ARCHIVED";
  return {
    title,
    description,
    alternates: { canonical: l.url },
    robots: unpublished || Boolean(viewerName) ? { index: false, follow: true } : undefined,
    openGraph: {
      title,
      description,
      url: l.url,
      type: "website",
      siteName: BRAND,
      images: l.cover ? [{ url: absoluteUrl(l.cover.url), alt: l.title }] : undefined,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Renders the theme's listing page inside the tracking shell. */
export async function ListingPageView({ slug, username, searchParams }: { slug: string; username?: string; searchParams: SearchParams }) {
  const { data, viewerName } = await loadListing(slug, username, searchParams);
  const Theme = getTheme(data.theme);
  return (
    <PublicShell viewerName={viewerName} listingId={data.id}>
      <Theme.ListingPage data={data} viewerName={viewerName} />
    </PublicShell>
  );
}
