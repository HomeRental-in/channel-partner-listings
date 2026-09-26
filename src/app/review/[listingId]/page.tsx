import Link from "next/link";
import { db } from "@/lib/db";
import { verifyReviewToken } from "@/lib/auth";
import { qualityScore } from "@/lib/ai";
import { toListingInput } from "@/lib/listings";
import { BRAND, ROOT_DOMAIN } from "@/lib/site";
import { ReviewForm } from "@/components/editor/ReviewForm";
import { reviewPublish, reviewSave } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Review your listing", robots: { index: false, follow: false } };

type Props = { params: Promise<{ listingId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

/** /review/[listingId]?t=<token> — the WhatsApp intake review screen. No session required. */
export default async function ReviewPage({ params, searchParams }: Props) {
  const { listingId } = await params;
  const sp = await searchParams;
  const token = (Array.isArray(sp.t) ? sp.t[0] : sp.t) ?? "";
  const valid = token ? await verifyReviewToken(token, listingId) : false;
  const listing = valid ? await db.listing.findUnique({ where: { id: listingId }, include: { user: true, photos: { orderBy: { order: "asc" } }, documents: true } }) : null;

  if (!listing) {
    return (
      <main className="min-h-dvh flex items-center justify-center p-6">
        <div className="card p-8 max-w-md text-center space-y-3">
          <h1 className="text-2xl">This review link is not valid</h1>
          <p className="text-muted">It may have expired (links last 30 days) or the listing was removed. Send “Hi” to our WhatsApp number to get a new link, or log in to edit from your dashboard.</p>
          <Link href="/login" className="btn btn-dark">
            Log in
          </Link>
        </div>
      </main>
    );
  }

  const quality = qualityScore({ ...listing, photoCount: listing.photos.length, documentsCount: listing.documents.length });

  return (
    <main className="min-h-dvh">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <span className="font-medium">{BRAND}</span>
          <span className="text-xs text-muted">Private review link · Free forever</span>
        </div>
        <ReviewForm
          listingId={listing.id}
          token={token}
          initial={toListingInput(listing)}
          initialPhotos={listing.photos.map((p) => ({ id: p.id, url: p.url, width: p.width, height: p.height, roomTag: p.roomTag }))}
          videoUrl={listing.videoUrl}
          originalMessage={listing.originalMessage}
          quality={quality}
          needsSignup={!listing.user.username || !listing.user.name}
          rootDomain={ROOT_DOMAIN}
          save={reviewSave.bind(null, listing.id, token)}
          publish={reviewPublish.bind(null, listing.id, token)}
        />
      </div>
    </main>
  );
}
