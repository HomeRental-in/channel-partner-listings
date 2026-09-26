import { MapPin, Sparkles, Check, ExternalLink, FileText, Download, Landmark } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { listingCtas } from "@/components/public/cta";
import { formatINR } from "@/lib/format";
import type { ListingPageProps } from "@/components/themes/types";
import { Shell, Panel, SectionTitle, Chip, Tile, btnQuiet } from "./ui";
import { Gallery } from "./Gallery";
import { Reveal } from "./Reveal";
import { Description } from "./Description";
import { MobileSheet } from "./MobileSheet";
import { VideoBlock } from "./VideoBlock";
import { PrimaryCtas, QuickQuestions, SecondaryActions, FormButton } from "./Ctas";
import { BrokerCard } from "./BrokerCard";
import { ProjectBlock } from "./ProjectBlock";
import { listingFacts, transactionLabel, statusLabel, placeLine } from "./facts";

export function ListingPage({ data, viewerName }: ListingPageProps) {
  const l = data;
  const c = listingCtas(l);
  const facts = listingFacts(l);
  const status = statusLabel(l.status);
  const place = placeLine(l);
  const perSqft = l.perSqft ? `${formatINR(l.perSqft, { currency: l.currency, compact: false })}/sq ft` : null;
  const sub = [perSqft, l.negotiable ? "Negotiable" : null].filter(Boolean).join(" · ");
  const hasVideo = !!(l.videoUrl || l.videoTourEmbedUrl || l.videoTourUrl);
  const hasMap = !!(l.mapEmbedUrl || l.mapUrl);

  const heroOverlay = (
    <div className="mx-auto max-w-6xl px-4 pb-6 sm:pb-8">
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Chip tone="accent">{transactionLabel(l.transaction)}</Chip>
        {l.propertyType && <Chip>{l.propertyType}</Chip>}
        {status && <Chip tone="danger">{status}</Chip>}
        {l.urgencyBadge && <Chip tone="cyan"><Sparkles size={12} /> {l.urgencyBadge}</Chip>}
        {l.status === "LIVE" && !status && <Chip tone="live">Available</Chip>}
      </div>
      <h1 className="max-w-3xl text-3xl text-white drop-shadow sm:text-5xl">{l.title}</h1>
      {place && (
        <div className="mt-2 flex items-center gap-1.5 text-sm text-[#C9CDD6] sm:text-base">
          <MapPin size={16} className="text-[#22D3EE]" /> {place}{l.landmark ? ` · near ${l.landmark}` : ""}{l.pincode ? ` · ${l.pincode}` : ""}
        </div>
      )}
    </div>
  );

  const priceBlock = (
    <div>
      <div className="text-[11px] uppercase tracking-[.18em] text-[#7D8391]">{l.transaction === "SALE" ? "Asking price" : "Rent"}</div>
      <div className="mt-1 text-3xl font-bold text-white sm:text-4xl">{l.priceDisplay}</div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-[#A9AFBC]">
        {perSqft && <span>{perSqft}</span>}
        {l.negotiable && <Chip tone="live">Negotiable</Chip>}
        {l.loanAvailable && <Chip tone="cyan">Loan available</Chip>}
      </div>
      {(l.priceLines.length > 0 || l.electricity || l.waterCharges) && (
        <dl className="mt-3 space-y-1.5 border-t border-white/5 pt-3 text-sm">
          {l.priceLines.map((p, i) => (
            <div key={i} className="flex items-baseline justify-between gap-3">
              <dt className="text-[#A9AFBC]">{p.label}{p.note ? <span className="text-[#7D8391]"> · {p.note}</span> : null}</dt>
              <dd className="font-semibold text-white">{formatINR(p.amount, { currency: l.currency })}{p.unit ? <span className="text-xs font-normal text-[#7D8391]"> {p.unit}</span> : null}</dd>
            </div>
          ))}
          {l.electricity && <div className="flex justify-between gap-3"><dt className="text-[#A9AFBC]">Electricity</dt><dd className="text-white">{l.electricity}</dd></div>}
          {l.waterCharges && <div className="flex justify-between gap-3"><dt className="text-[#A9AFBC]">Water</dt><dd className="text-white">{l.waterCharges}</dd></div>}
        </dl>
      )}
      {l.priceHistoryNote && <p className="mt-3 text-xs text-[#7D8391]">{l.priceHistoryNote}</p>}
    </div>
  );

  return (
    <Shell>
      {viewerName && (
        <div className="border-b border-[#7C5CFF]/30 bg-[#7C5CFF]/10 px-4 py-2.5 text-center text-sm text-[#E2DBFF]">
          Hi {viewerName} 👋 — <span className="font-semibold text-white">{l.broker.name}</span> shared this with you
        </div>
      )}

      <Gallery photos={l.photos} listingId={l.id} title={l.title} overlay={heroOverlay} />

      <div className="mx-auto max-w-6xl px-4 pt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8">
        {/* ── Long-scroll content ── */}
        <main className="space-y-5">
          {/* Price card (mobile/tablet only — desktop has the rail) */}
          <Reveal from="left" className="lg:hidden">
            <Panel>
              {priceBlock}
              <SecondaryActions data={l} className="mt-4" />
            </Panel>
          </Reveal>

          {facts.length > 0 && (
            <Reveal from="right">
              <Panel>
                <SectionTitle eyebrow="At a glance">Key facts</SectionTitle>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {facts.map((f) => <Tile key={f.key} label={f.label} value={f.value} icon={<f.Icon size={14} />} />)}
                </div>
              </Panel>
            </Reveal>
          )}

          {l.highlights.length > 0 && (
            <Reveal from="left">
              <Panel>
                <SectionTitle eyebrow="Why this one">Highlights</SectionTitle>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {l.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 rounded-lg border border-[#7C5CFF]/20 bg-[#7C5CFF]/[.07] px-3 py-2.5 text-sm text-[#EEF0F4]">
                      <Sparkles size={15} className="mt-0.5 shrink-0 text-[#C4B5FF]" /> {h}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          )}

          {l.description && (
            <Reveal from="right">
              <Panel>
                <SectionTitle eyebrow="About">The property</SectionTitle>
                <Description text={l.description} />
              </Panel>
            </Reveal>
          )}

          {l.features.filter((s) => s.items?.length).map((s, i) => (
            <Reveal key={s.id ?? i} from={i % 2 ? "right" : "left"}>
              <Panel>
                <SectionTitle>{s.title}</SectionTitle>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {s.items.map((it, j) => <Tile key={it.id ?? j} label={it.label} value={it.value} />)}
                </div>
              </Panel>
            </Reveal>
          ))}

          {l.amenities.length > 0 && (
            <Reveal from="left">
              <Panel>
                <SectionTitle eyebrow="Included">Amenities</SectionTitle>
                <ul className="flex flex-wrap gap-2">
                  {l.amenities.map((a) => (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#0F1216] px-3 py-1.5 text-sm text-[#C9CDD6]">
                      <Check size={14} className="text-[#25D366]" /> {a}
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          )}

          {l.neighbourhood.length > 0 && (
            <Reveal from="right">
              <Panel>
                <SectionTitle eyebrow="Around you">Neighbourhood</SectionTitle>
                <dl className="divide-y divide-white/5">
                  {l.neighbourhood.map((n, i) => (
                    <div key={i} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                      <dt className="flex items-center gap-2 text-[#C9CDD6]"><Landmark size={14} className="text-[#22D3EE]" /> {n.label}</dt>
                      <dd className="text-right font-medium text-white">{n.value}</dd>
                    </div>
                  ))}
                </dl>
              </Panel>
            </Reveal>
          )}

          {hasMap && (
            <Reveal from="left">
              <Panel>
                <SectionTitle eyebrow="Location">On the map</SectionTitle>
                {l.mapEmbedUrl && (
                  <div className="overflow-hidden rounded-xl border border-white/5 grayscale-[.35] contrast-[1.05]">
                    <iframe src={l.mapEmbedUrl} title={`Map of ${l.title}`} className="h-64 w-full sm:h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                  </div>
                )}
                {l.mapUrl && (
                  <TrackedLink event="MAP_OPEN" listingId={l.id} href={l.mapUrl} target="_blank" rel="noopener noreferrer" className={`${btnQuiet} mt-3`}>
                    <ExternalLink size={14} /> Open in Maps
                  </TrackedLink>
                )}
              </Panel>
            </Reveal>
          )}

          {hasVideo && (
            <Reveal from="right">
              <Panel>
                <SectionTitle eyebrow="Walkthrough">Video</SectionTitle>
                <VideoBlock listingId={l.id} videoUrl={l.videoUrl} embedUrl={l.videoTourEmbedUrl} tourUrl={l.videoTourUrl} title={l.title} className="aspect-video w-full overflow-hidden rounded-xl border border-white/5 bg-black" />
              </Panel>
            </Reveal>
          )}

          {l.documents.length > 0 && (
            <Reveal from="left">
              <Panel>
                <SectionTitle eyebrow="Downloads">{l.documentsTitle || "Documents"}</SectionTitle>
                <ul className="divide-y divide-white/5">
                  {l.documents.map((d) => (
                    <li key={d.id}>
                      <TrackedLink event="DOC_DOWNLOAD" listingId={l.id} meta={{ doc: d.id }} href={d.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 py-2.5 text-sm text-[#EEF0F4] hover:text-white">
                        <FileText size={18} className="shrink-0 text-[#C4B5FF]" />
                        <span className="min-w-0 flex-1 truncate">{d.name}</span>
                        <span className="text-xs text-[#7D8391]">{(d.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                        <Download size={16} className="text-[#7D8391]" />
                      </TrackedLink>
                    </li>
                  ))}
                </ul>
              </Panel>
            </Reveal>
          )}

          {l.project && (
            <Reveal from="right">
              <ProjectBlock project={l.project} currency={l.currency} />
            </Reveal>
          )}

          <Reveal from="left">
            <Panel id="contact">
              <SectionTitle eyebrow="Talk to">Get in touch</SectionTitle>
              <BrokerCard broker={l.broker} listingId={l.id} waHref={c.whatsapp} callHref={c.call} />
              <div className="mt-5 border-t border-white/5 pt-5">
                <div className="mb-2 text-[11px] uppercase tracking-[.18em] text-[#7D8391]">Quick questions</div>
                <QuickQuestions data={l} layout="row" />
                <div className="mt-3"><FormButton data={l} /></div>
              </div>
            </Panel>
          </Reveal>
        </main>

        {/* ── Sticky right rail (desktop) ── */}
        <aside className="hidden lg:block">
          <div className="sticky top-6 space-y-3">
            <Panel className="shadow-[0_0_60px_-20px_rgba(124,92,255,.55)]">
              {priceBlock}
              <PrimaryCtas data={l} size="lg" className="mt-5" />
              <div className="mt-4">
                <div className="mb-2 text-[11px] uppercase tracking-[.18em] text-[#7D8391]">Quick questions</div>
                <QuickQuestions data={l} />
              </div>
              <SecondaryActions data={l} className="mt-4 border-t border-white/5 pt-4" />
            </Panel>
            <Panel className="p-4">
              <BrokerCard broker={l.broker} listingId={l.id} waHref={c.whatsapp} callHref={c.call} compact />
            </Panel>
          </div>
        </aside>
      </div>

      <MobileSheet price={l.priceDisplay} sub={sub || null} primary={<PrimaryCtas data={l} className="w-full" />} expanded={<QuickQuestions data={l} />} />
    </Shell>
  );
}
