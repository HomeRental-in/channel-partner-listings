import type { Metadata } from "next";
import { ListingPageView, listingMetadata, loadListingForMetadata } from "@/components/public/pages/listing";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const { data, viewerName } = await loadListingForMetadata(slug, username, await searchParams);
  return listingMetadata(data, viewerName);
}

/** Listing page on a CP subdomain — <username>.<ROOT_DOMAIN>/l/<slug>?n=Name */
export default async function ListingPage({ params, searchParams }: Props) {
  const { username, slug } = await params;
  return <ListingPageView slug={slug} username={username} searchParams={await searchParams} />;
}
