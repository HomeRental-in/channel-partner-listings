import { Layers } from "lucide-react";
import { ShareButton } from "@/components/public/ShareButton";
import type { CollectionProps } from "@/components/themes/types";
import { Shell, BrandBar, Card, Pill, btnSoft } from "./ui";
import { BrokerCard } from "./BrokerCard";
import { CardGrid } from "./ListingCard";
import { Pop } from "./Pop";

export function Collection({ data }: CollectionProps) {
  const n = data.listings.length;
  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:pt-8">
        <BrandBar broker={data.broker} />
        <Pop>
          <Card className="relative overflow-hidden bg-gradient-to-br from-white to-[#FFF1EB]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFE4DB]" />
            <div className="relative">
              <Pill tone="coral"><Layers size={12} /> Collection · {n} {n === 1 ? "property" : "properties"}</Pill>
              <h1 className="mt-3 max-w-3xl text-3xl text-[#123F3A] sm:text-5xl">{data.title}</h1>
              {data.description && <p className="mt-4 max-w-2xl whitespace-pre-line text-[15px] leading-relaxed text-[#2D5751]">{data.description}</p>}
              <div className="mt-5"><ShareButton url={data.url} title={data.title} text={data.description ?? undefined} listingId={null} className={btnSoft} /></div>
            </div>
          </Card>
        </Pop>

        <Pop delay={60}>
          <Card className="mt-5 py-4 sm:py-5">
            <BrokerCard broker={data.broker} listingId={null} />
          </Card>
        </Pop>

        <Pop delay={100}>
          <div className="mt-8"><CardGrid items={data.listings} emptyText="This collection is empty." /></div>
        </Pop>
      </div>
    </Shell>
  );
}
