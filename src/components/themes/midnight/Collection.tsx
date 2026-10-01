import { Layers } from "lucide-react";
import { ShareButton } from "@/components/public/ShareButton";
import type { CollectionProps } from "@/components/themes/types";
import { Shell, BrandBar, Panel, btnQuiet } from "./ui";
import { BrokerCard } from "./BrokerCard";
import { CardGrid } from "./ListingCard";
import { Reveal } from "./Reveal";

export function Collection({ data }: CollectionProps) {
  const n = data.listings.length;
  return (
    <Shell>
      <BrandBar broker={data.broker} />
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-[#7C5CFF]/25 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-14">
          <div className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[.18em] text-[#7C5CFF]"><Layers size={12} /> Collection · {n} {n === 1 ? "property" : "properties"}</div>
          <h1 className="mt-2 max-w-3xl text-3xl text-white sm:text-5xl">{data.title}</h1>
          {data.description && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#C9CDD6] whitespace-pre-line">{data.description}</p>}
          <div className="mt-5"><ShareButton url={data.url} title={data.title} text={data.description ?? undefined} listingId={null} className={btnQuiet} /></div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
        <main>
          <Reveal from="left"><CardGrid items={data.listings} emptyText="This collection is empty." /></Reveal>
        </main>
        <aside className="mt-8 lg:mt-0">
          <Reveal from="right">
            <Panel className="lg:sticky lg:top-6">
              <BrokerCard broker={data.broker} listingId={null} compact />
            </Panel>
          </Reveal>
        </aside>
      </div>
    </Shell>
  );
}
