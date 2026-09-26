import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { formatINR } from "@/lib/format";
import { listingUrl, ROOT_DOMAIN } from "@/lib/site";
import { qualityScore } from "@/lib/ai";
import { toListingInput } from "@/lib/listings";
import { asBrokerCard } from "@/lib/types";
import { StepperHeader, type EditorStep } from "@/components/editor/StepperHeader";
import { PhotosStep } from "@/components/editor/PhotosStep";
import { DetailsForm } from "@/components/editor/DetailsForm";
import { DoneStep } from "@/components/editor/DoneStep";
import { publishFromDashboard, savePhotos, setListingStatus, updateListing } from "./actions";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const l = await db.listing.findUnique({ where: { id }, select: { title: true } });
  return { title: l?.title ? `Edit · ${l.title}` : "Edit listing" };
}

/** Listing editor: /dashboard/listings/[id]?step=photos|details|done */
export default async function EditListingPage({ params, searchParams }: Props) {
  const user = await requireUser();
  const { id } = await params;
  const sp = await searchParams;
  const stepRaw = Array.isArray(sp.step) ? sp.step[0] : sp.step;
  const step: EditorStep = stepRaw === "photos" || stepRaw === "done" ? stepRaw : "details";

  const listing = await db.listing.findFirst({ where: { id, userId: user.id }, include: { photos: { orderBy: { order: "asc" } }, documents: { orderBy: { createdAt: "asc" } } } });
  if (!listing) notFound();

  const priceDisplay = formatINR(listing.price, { currency: listing.currency });
  const publicUrl = listingUrl(user.username, listing.slug);
  const quality = qualityScore({ ...listing, photoCount: listing.photos.length, documentsCount: listing.documents.length });

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-6">
      <StepperHeader listingId={listing.id} title={listing.title} priceDisplay={priceDisplay} status={listing.status} step={step} publicUrl={publicUrl} transaction={listing.transaction} setStatus={setListingStatus.bind(null, listing.id)} />

      {step === "photos" && <PhotosStep listingId={listing.id} initialPhotos={listing.photos.map((p) => ({ id: p.id, url: p.url, width: p.width, height: p.height, roomTag: p.roomTag }))} initialVideo={listing.videoUrl} save={savePhotos.bind(null, listing.id)} />}

      {step === "details" && <DetailsForm initial={toListingInput(listing)} quality={quality} defaults={{ brokerCard: asBrokerCard(user.brokerCard), theme: user.defaultTheme }} save={updateListing.bind(null, listing.id)} />}

      {step === "done" && (
        <DoneStep listing={{ id: listing.id, slug: listing.slug, title: listing.title, priceDisplay, status: listing.status }} username={user.username} publicUrl={publicUrl} rootDomain={ROOT_DOMAIN} needsSignup={!user.username} publish={publishFromDashboard.bind(null, listing.id)} />
      )}
    </div>
  );
}
