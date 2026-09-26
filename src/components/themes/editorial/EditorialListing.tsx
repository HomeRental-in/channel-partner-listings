import { ShareButton } from "@/components/public/ShareButton";
import { listingCtas } from "@/components/public/cta";
import { Reveal } from "@/components/themes/shared/Reveal";
import { localityLine, summaryLine, TRANSACTION_LABEL, STATUS_LABEL } from "@/components/themes/shared/helpers";
import type { ListingPageProps } from "@/components/themes/types";
import { Frame } from "./Frame";
import { Gallery } from "./Gallery";
import { CtaCard } from "./CtaCard";
import { BrokerCard } from "./BrokerCard";
import { MobileBar } from "./MobileBar";
import { ProjectDetails } from "./ProjectBlock";
import { Section, Highlights, About, Features, Amenities, Neighbourhood, MapBlock, VideoBlock, DocumentsBlock } from "./Sections";

/** EDITORIAL listing page — magazine layout: hero, sticky price/CTA column, long-form content column. */
export function EditorialListing({ data, viewerName }: ListingPageProps) {
  const cta = listingCtas(data);
  const status = STATUS_LABEL[data.status];
  const preview = data.status === "DRAFT" || data.status === "ARCHIVED";
  const brokerName = data.broker.card.showNamePhoto ? data.broker.name : data.broker.agencyName ?? "Listing";
  const share = <ShareButton url={data.url} title={data.title} text={cta.share} listingId={data.id} className="ed-btn ed-btn-sm" />;

  return (
    <Frame mastheadName={brokerName} mastheadHref={data.broker.siteUrl} mastheadRight={share} hasMobileBar preview={preview}>
      {viewerName && (
        <p className="ed-greet" role="status">
          <span aria-hidden="true">👋</span>
          <span>
            Hi <strong>{viewerName}</strong>, {data.broker.name} shared this with you
          </span>
        </p>
      )}

      <div style={{ marginTop: "1.25rem" }}>
        <Gallery photos={data.photos} listingId={data.id} title={data.title} />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16" style={{ marginTop: "2rem" }}>
        {/* Left: title, price, CTA (sticky on desktop) */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Reveal className="ed-reveal">
            <p className="ed-eyebrow">
              {[TRANSACTION_LABEL[data.transaction], data.propertyType, data.city].filter(Boolean).join(" · ")}
            </p>
            <h1 className="ed-serif ed-title">{data.title || "Untitled listing"}</h1>
            {localityLine(data) && <p className="ed-muted" style={{ fontSize: "1.05rem" }}>{localityLine(data)}</p>}
            {(status || data.urgencyBadge) && (
              <p style={{ marginTop: "0.75rem" }}>
                <span className={`ed-badge ${status ? "" : "ed-badge-soft"}`}>{status ?? data.urgencyBadge}</span>
              </p>
            )}

            <div className="ed-hairline" style={{ marginTop: "1.5rem", paddingTop: "1.25rem" }}>
              <div className="ed-price">{data.priceDisplay}</div>
              <p className="ed-muted" style={{ marginTop: "0.5rem" }}>
                {[data.perSqft ? `₹${data.perSqft.toLocaleString("en-IN")} per sq ft` : null, data.negotiable ? "Negotiable" : null, data.transaction !== "SALE" ? "per month" : null].filter(Boolean).join(" · ")}
              </p>
              {summaryLine(data) && <p style={{ marginTop: "0.35rem", fontWeight: 500 }}>{summaryLine(data)}</p>}
              {data.priceLines.length > 0 && (
                <dl className="ed-price-lines">
                  {data.priceLines.map((p, i) => (
                    <div key={i}>
                      <dt>
                        {p.label}
                        {p.note && <span className="ed-faint"> · {p.note}</span>}
                      </dt>
                      <dd style={{ margin: 0, fontWeight: 500 }}>
                        {typeof p.amount === "number" ? `₹ ${p.amount.toLocaleString("en-IN")}` : String(p.amount ?? "")}
                        {p.unit ? ` ${p.unit}` : ""}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {data.priceHistoryNote && <p className="ed-serif-i ed-muted" style={{ marginTop: "0.75rem" }}>{data.priceHistoryNote}</p>}
            </div>

            <div style={{ marginTop: "1.5rem" }}>
              <CtaCard data={data} />
            </div>
          </Reveal>
        </aside>

        {/* Right: long-form content */}
        <main style={{ minWidth: 0 }}>
          <Highlights data={data} />
          <About data={data} />
          <Features data={data} />
          <Amenities data={data} />
          <Neighbourhood data={data} />
          <MapBlock data={data} />
          <VideoBlock data={data} />
          <DocumentsBlock data={data} />
          {data.project && (
            <Section title={`About ${data.project.name}`}>
              <ProjectDetails project={data.project} />
            </Section>
          )}
          <Section>
            <BrokerCard broker={data.broker} listingId={data.id} message={`Hi, I'm interested in this property:\n${data.title}\n${data.url}`} />
          </Section>
        </main>
      </div>

      <MobileBar data={data} />
    </Frame>
  );
}
