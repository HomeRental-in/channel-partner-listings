import { ShareButton } from "@/components/public/ShareButton";
import { Reveal } from "@/components/themes/shared/Reveal";
import type { CollectionProps } from "@/components/themes/types";
import { Frame } from "./Frame";
import { BrokerCard } from "./BrokerCard";
import { ListingCard } from "./ListingCard";

/** EDITORIAL collection page — title, description, broker mini card, listing grid. */
export function EditorialCollection({ data }: CollectionProps) {
  const b = data.broker;
  return (
    <Frame mastheadName={b.name} mastheadHref={b.siteUrl} mastheadRight={<ShareButton url={data.url} title={data.title} text={`${data.title}\n${data.url}`} listingId={null} className="ed-btn ed-btn-sm" />}>
      <Reveal as="section" className="ed-reveal" style={{ paddingBlock: "2.5rem 1.5rem" }}>
        <p className="ed-eyebrow">Collection · {data.listings.length} {data.listings.length === 1 ? "property" : "properties"}</p>
        <h1 className="ed-serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: "0.35rem", textWrap: "balance" }}>{data.title}</h1>
        {data.description && <p className="ed-prose" style={{ marginTop: "1rem", maxWidth: "64ch" }}>{data.description}</p>}
      </Reveal>

      <Reveal as="section" className="ed-section ed-reveal">
        {data.listings.length ? (
          <div className="ed-grid">
            {data.listings.map((l) => (
              <ListingCard key={l.id} l={l} />
            ))}
          </div>
        ) : (
          <p className="ed-serif-i ed-muted" style={{ fontSize: "1.3rem" }}>Nothing in this collection yet.</p>
        )}
      </Reveal>

      <Reveal as="section" className="ed-section ed-reveal">
        <BrokerCard broker={b} listingId={null} message={`Hi ${b.name}, I'm interested in "${data.title}":\n${data.url}`} />
      </Reveal>
    </Frame>
  );
}
