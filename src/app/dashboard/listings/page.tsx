import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getListingStats } from "@/lib/analytics";
import { formatINR } from "@/lib/format";
import { ListingsGrid } from "@/components/dashboard/ListingsGrid";

export const metadata: Metadata = { title: "My Listings" };
export const dynamic = "force-dynamic";

export default async function ListingsPage() {
  const user = await requireUser();
  const listings = await db.listing.findMany({
    where: { userId: user.id, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    include: { photos: { orderBy: { order: "asc" }, select: { url: true } }, _count: { select: { photos: true } } },
  });
  const stats = await getListingStats(listings.map((l) => l.id));

  return (
    <div className="pt-2 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl">My Listings</h1>
          <p className="text-muted mt-1">{listings.length} listing{listings.length === 1 ? "" : "s"}</p>
        </div>
        <Link href="/dashboard/listings/new" className="btn btn-dark">
          <Plus size={18} /> New listing
        </Link>
      </div>
      <ListingsGrid
        username={user.username}
        defaultTheme={user.defaultTheme}
        listings={listings.map((l) => ({
          id: l.id,
          slug: l.slug,
          title: l.title,
          priceDisplay: formatINR(l.price, { currency: l.currency }),
          locality: l.locality,
          city: l.city,
          bhk: l.bhk,
          propertyType: l.propertyType,
          status: l.status,
          theme: l.theme,
          hidden: l.hiddenFromStorefront,
          cover: l.photos[0]?.url ?? null,
          photoCount: l._count.photos,
          views: stats[l.id]?.views ?? 0,
          updatedAt: l.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
