import Link from "next/link";
import Image from "next/image";
import { Eye, ImageOff } from "lucide-react";
import { StatusPill, type ListingStatusKey } from "./StatusPill";

export type RecentListingRow = { id: string; title: string; priceDisplay: string; locality: string | null; bhk: string | null; status: ListingStatusKey; cover: string | null; views: number };

export function RecentListings({ rows }: { rows: RecentListingRow[] }) {
  return (
    <section className="card p-5 md:p-6">
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg">Recent listings</h2>
        <Link href="/dashboard/listings" className="text-sm text-muted hover:text-black">
          See all →
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted py-6 text-center">No listings yet. Create one above or send photos on WhatsApp.</p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((l) => (
            <li key={l.id}>
              <Link href={`/dashboard/listings/${l.id}`} className="flex items-center gap-3 py-3 hover:bg-soft -mx-2 px-2 rounded-xl">
                <div className="relative h-14 w-[72px] shrink-0 overflow-hidden rounded-xl bg-soft">
                  {l.cover ? <Image src={l.cover} alt="" fill sizes="72px" className="object-cover" unoptimized /> : <ImageOff size={18} className="absolute inset-0 m-auto text-muted" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium">{l.title || "Untitled listing"}</p>
                  <p className="truncate text-sm text-muted">
                    {l.priceDisplay}
                    {l.locality ? ` · ${l.locality}` : ""}
                    {l.bhk ? ` · ${l.bhk}` : ""}
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 text-sm text-muted tabular-nums">
                  <Eye size={14} /> {l.views}
                </span>
                <StatusPill status={l.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
