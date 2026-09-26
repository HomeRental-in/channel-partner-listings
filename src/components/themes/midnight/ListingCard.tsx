import { MapPin, BedDouble, Ruler, ArrowUpRight, Images } from "lucide-react";
import type { StorefrontListingCard } from "@/components/themes/types";
import { Img, Chip } from "./ui";
import { transactionLabel, statusLabel, placeLine } from "./facts";

export function ListingCard({ l }: { l: StorefrontListingCard }) {
  const status = statusLabel(l.status);
  const place = placeLine(l);
  return (
    <a href={l.url} className="group block overflow-hidden rounded-2xl border border-white/5 bg-[#15181D] transition-colors hover:border-[#7C5CFF]/50">
      <div className="relative aspect-[4/3] overflow-hidden bg-[#0F1216]">
        {l.cover ? (
          <Img src={l.cover.url} alt={l.cover.roomTag ? `${l.cover.roomTag} — ${l.title}` : l.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#7D8391]"><Images size={28} strokeWidth={1.25} /></div>
        )}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <Chip tone="accent">{transactionLabel(l.transaction)}</Chip>
          {status && <Chip tone="danger">{status}</Chip>}
          {l.urgencyBadge && <Chip tone="cyan">{l.urgencyBadge}</Chip>}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0D10] to-transparent px-4 pb-3 pt-10">
          <div className="text-xl font-bold text-white">{l.priceDisplay}</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-semibold text-[#F5F6F8] group-hover:text-white">{l.title}</h3>
        {place && <div className="mt-1 flex items-center gap-1 text-sm text-[#A9AFBC]"><MapPin size={14} className="text-[#22D3EE]" /> {place}</div>}
        <div className="mt-3 flex items-center justify-between text-xs text-[#7D8391]">
          <div className="flex gap-3">
            {l.bhk && <span className="inline-flex items-center gap-1"><BedDouble size={13} /> {l.bhk}</span>}
            {l.areaSqft && <span className="inline-flex items-center gap-1"><Ruler size={13} /> {l.areaSqft.toLocaleString("en-IN")} sq ft</span>}
          </div>
          <span className="inline-flex items-center gap-0.5 font-medium text-[#C4B5FF]">View <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </a>
  );
}

export function CardGrid({ items, emptyText = "No properties yet." }: { items: StorefrontListingCard[]; emptyText?: string }) {
  if (!items.length) return <p className="text-sm text-[#7D8391]">{emptyText}</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => <ListingCard key={l.id} l={l} />)}
    </div>
  );
}
