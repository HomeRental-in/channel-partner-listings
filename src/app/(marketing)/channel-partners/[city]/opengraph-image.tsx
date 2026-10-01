import { marketingOgImage, OG_SIZE } from "@/components/marketing/og";
import { cityBySlug } from "@/lib/seo/cities";

export const alt = "Free listing tool for channel partners";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({ params }: { params: Promise<{ city: string }> }) {
  const c = cityBySlug((await params).city);
  return marketingOgImage({
    eyebrow: c ? `Channel partners · ${c.name}` : "Channel partners",
    title: c ? `The free listing tool for ${c.name} channel partners.` : "The free listing tool for channel partners.",
    chips: c?.localities.slice(0, 4) ?? [],
    cta: "Create a free listing",
  });
}
