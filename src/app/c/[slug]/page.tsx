import type { Metadata } from "next";
import { getPublicCollection, sanitiseViewerName } from "@/lib/public";
import { collectionMetadata, CollectionView } from "@/components/public/pages/collection";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  const { n } = await searchParams;
  return collectionMetadata(await getPublicCollection(slug), sanitiseViewerName(n));
}

/** Root-domain fallback collection page — <ROOT_DOMAIN>/c/<slug> */
export default async function CollectionPage({ params, searchParams }: Props) {
  const { slug } = await params;
  return <CollectionView slug={slug} searchParams={await searchParams} />;
}
