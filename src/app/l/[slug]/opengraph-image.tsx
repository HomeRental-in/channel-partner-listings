import { getPublicListing } from "@/lib/public";
import { listingOgImage, OG_SIZE } from "@/components/public/pages/og";

export const dynamic = "force-dynamic";
export const alt = "Property listing";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return listingOgImage(await getPublicListing(slug));
}
