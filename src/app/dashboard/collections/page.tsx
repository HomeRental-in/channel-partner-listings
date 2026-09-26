import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatINR } from "@/lib/format";
import { collectionUrl } from "@/lib/site";
import { CollectionsList } from "@/components/dashboard/CollectionsList";

export const metadata: Metadata = { title: "Collections" };
export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const user = await requireUser();
  const [collections, live] = await Promise.all([
    db.collection.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: { listings: { orderBy: { order: "asc" }, include: { listing: { select: { id: true, photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } } } } } } },
    }),
    db.listing.findMany({ where: { userId: user.id, status: "LIVE" }, orderBy: { updatedAt: "desc" }, include: { photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } } } }),
  ]);

  return (
    <div className="pt-2 flex flex-col gap-4">
      <CollectionsList
        collections={collections.map((c) => ({
          id: c.id,
          slug: c.slug,
          title: c.title,
          description: c.description,
          url: collectionUrl(user.username, c.slug),
          listingIds: c.listings.map((cl) => cl.listingId),
          covers: c.listings.map((cl) => cl.listing.photos[0]?.url).filter((u): u is string => !!u).slice(0, 3),
          updatedAt: c.updatedAt.toISOString(),
        }))}
        listings={live.map((l) => ({ id: l.id, title: l.title || "Untitled listing", priceDisplay: formatINR(l.price, { currency: l.currency }), locality: l.locality, bhk: l.bhk, cover: l.photos[0]?.url ?? null }))}
      />
    </div>
  );
}
