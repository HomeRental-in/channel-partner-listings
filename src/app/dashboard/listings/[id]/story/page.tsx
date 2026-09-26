import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPublicListingById } from "@/lib/public";
import { BRAND } from "@/lib/site";
import { StoryVideoEditor } from "@/components/outputs/story/StoryVideoEditor";
import { TRANSACTION_LABEL } from "@/lib/outputs/theme";
import type { StoryListingInfo } from "@/components/outputs/story/types";

export const dynamic = "force-dynamic";

export default async function StoryVideoPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;
  const data = await getPublicListingById(id);
  if (!data || data.broker.id !== user.id) notFound();

  const b = data.broker;
  const listing: StoryListingInfo = {
    id: data.id,
    slug: data.slug,
    title: data.title || "Property",
    priceDisplay: data.priceDisplay,
    transaction: TRANSACTION_LABEL[data.transaction] ?? data.transaction,
    where: [data.locality, data.city].filter(Boolean).join(", "),
    chips: [data.bhk, data.areaLabel ?? (data.areaSqft ? `${data.areaSqft.toLocaleString("en-IN")} sq ft` : null), data.propertyType, data.furnishing].filter(Boolean) as string[],
    theme: data.theme,
    highlights: data.highlights,
    photos: data.photos.map((p) => ({ id: p.id, url: p.url })),
    brand: BRAND,
    broker: {
      name: b.name,
      agency: b.agencyName,
      phone: b.phone,
      whatsapp: b.whatsapp,
      siteUrl: b.siteUrl,
      avatarUrl: b.avatarUrl,
      showName: b.card.showNamePhoto,
      showAgency: b.card.showAgency,
      showWhatsApp: b.card.showWhatsApp,
      showCall: b.card.showCall,
      showSite: b.card.showProfileLink,
    },
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Link href={`/dashboard/listings/${id}?step=done`} className="icon-btn" aria-label="Back to listing">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <p className="eyebrow">Story video</p>
          <h1 className="text-3xl">{listing.title}</h1>
        </div>
      </div>
      <StoryVideoEditor listing={listing} />
    </div>
  );
}
