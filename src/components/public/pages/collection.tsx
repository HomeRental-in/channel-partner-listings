import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicCollection, sanitiseViewerName } from "@/lib/public";
import { absoluteUrl } from "@/lib/storage";
import { BRAND } from "@/lib/site";
import { getTheme } from "@/components/themes";
import { PublicShell } from "@/components/themes/shared/PublicShell";
import type { PublicCollection } from "@/components/themes/types";
import type { SearchParams } from "./listing";

export function collectionMetadata(c: PublicCollection | null, viewerName: string | null): Metadata {
  if (!c) return { title: "Collection not found", robots: { index: false } };
  const title = `${viewerName ? `For ${viewerName} · ` : ""}${c.title}`;
  const n = c.listings.length;
  const description = c.description?.trim() || `${n} propert${n === 1 ? "y" : "ies"} picked by ${c.broker.name}.`;
  const cover = c.listings.find((l) => l.cover)?.cover;
  return {
    title,
    description,
    alternates: { canonical: c.url },
    robots: viewerName ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: c.url, type: "website", siteName: BRAND, images: cover ? [{ url: absoluteUrl(cover.url), alt: c.title }] : undefined },
    twitter: { card: "summary_large_image", title, description },
  };
}

export async function CollectionView({ slug, username, searchParams }: { slug: string; username?: string; searchParams: SearchParams }) {
  const data = await getPublicCollection(slug, username);
  if (!data) notFound();
  const viewerName = sanitiseViewerName(searchParams.n);
  const Theme = getTheme(data.theme);
  return (
    <PublicShell viewerName={viewerName} listingId={null}>
      <Theme.Collection data={data} />
    </PublicShell>
  );
}
