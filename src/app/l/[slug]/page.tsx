import type { Metadata } from "next";
import { ListingPageView, listingMetadata, loadListingForMetadata } from "@/components/public/pages/listing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { data, viewerName } = await loadListingForMetadata(slug, undefined, await searchParams);
  return listingMetadata(data, viewerName);
}

/** Root-domain fallback listing page — <ROOT_DOMAIN>/l/<slug> (slugs are globally unique). */
export default async function ListingPage({ params, searchParams }: Props) {
  const { slug } = await params;
  return <ListingPageView slug={slug} searchParams={await searchParams} />;
}
