import type { Metadata } from "next";
import { getPublicCollection, sanitiseViewerName } from "@/lib/public";
import { collectionMetadata, CollectionView } from "@/components/public/pages/collection";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ username: string; slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const { n } = await searchParams;
  return collectionMetadata(await getPublicCollection(slug, username), sanitiseViewerName(n));
}

/** Collection page on a CP subdomain — <username>.<ROOT_DOMAIN>/c/<slug> */
export default async function CollectionPage({ params, searchParams }: Props) {
  const { username, slug } = await params;
  return <CollectionView slug={slug} username={username} searchParams={await searchParams} />;
}
