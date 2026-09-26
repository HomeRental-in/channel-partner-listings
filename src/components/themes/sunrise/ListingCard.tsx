import { MapPin, BedDouble, Ruler, ArrowUpRight, Camera } from "lucide-react";
import type { StorefrontListingCard } from "@/components/themes/types";
import { Img, Pill } from "./ui";
import { transactionLabel, statusLabel, placeLine } from "./facts";

export function ListingCard({ l }: { l: StorefrontListingCard }) {
  const status = statusLabel(l.status);
  const place = placeLine(l);
  return (
    <a href={l.url} className="sr-press group block overflow-hidden rounded-[28px] bg-white p-2.5 shadow-[0_8px_30px_-18px_rgba(18,63,58,.3)] hover:shadow-[0_18px_40px_-18px_rgba(255,107,74,.45)]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[20px] bg-[#F1E6D8]">
        {l.cover ? (
          <Img src={l.cover.url} alt={l.cover.roomTag ? `${l.cover.roomTag} — ${l.title}` : l.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
        ) : (
          <div className="flex h-full items-center justify-center text-[#6E8A85]"><Camera size={28} strokeWidth={1.25} /></div>
        )}
        <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
          <Pill tone="white">{transactionLabel(l.transaction)}</Pill>
          {status && <Pill tone="teal">{status}</Pill>}
          {l.urgencyBadge && <Pill tone="coral">{l.urgencyBadge}</Pill>}
        </div>
        <div className="absolute bottom-2.5 left-2.5 rounded-full bg-white/95 px-3 py-1.5 text-base font-extrabold text-[#123F3A] shadow">{l.priceDisplay}</div>
      </div>
      <div className="px-2.5 pb-2 pt-3">
        <h3 className="line-clamp-2 text-base font-extrabold text-[#123F3A]">{l.title}</h3>
        {place && <div className="mt-1 flex items-center gap-1 text-sm text-[#2D5751]"><MapPin size={14} className="text-[#FF6B4A]" /> {place}</div>}
        <div className="mt-3 flex items-center justify-between text-xs text-[#6E8A85]">
          <div className="flex gap-1.5">
            {l.bhk && <Pill tone="sand" className="px-2.5 py-0.5"><BedDouble size={12} /> {l.bhk}</Pill>}
            {l.areaSqft && <Pill tone="sand" className="px-2.5 py-0.5"><Ruler size={12} /> {l.areaSqft.toLocaleString("en-IN")} sq ft</Pill>}
          </div>
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FF6B4A] text-white transition-transform group-hover:rotate-45"><ArrowUpRight size={15} /></span>
        </div>
      </div>
    </a>
  );
}

export function CardGrid({ items, emptyText = "No properties yet." }: { items: StorefrontListingCard[]; emptyText?: string }) {
  if (!items.length) return <p className="rounded-3xl bg-white/60 p-6 text-center text-sm text-[#6E8A85]">{emptyText}</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l) => <ListingCard key={l.id} l={l} />)}
    </div>
  );
}
