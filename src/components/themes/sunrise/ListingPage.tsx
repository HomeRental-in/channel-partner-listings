import { MapPin, Sparkles, Check, ExternalLink, FileText, Download, Landmark, Tag, MessageCircle, Phone } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { listingCtas } from "@/components/public/cta";
import { formatINR } from "@/lib/format";
import type { ListingPageProps } from "@/components/themes/types";
import { Shell, Card, SectionTitle, Pill, Tile, btnSoft, btnWa, btnTeal } from "./ui";
import { Bento } from "./Bento";
import { Pop } from "./Pop";
import { Description } from "./Description";
import { VideoBlock } from "./VideoBlock";
import { PrimaryCtas, QuickQuestions, SecondaryActions, FormButton, WhatsAppTile, canWhatsApp, canCall } from "./Ctas";
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
  const hasVideo = !!(l.videoUrl || l.videoTourEmbedUrl || l.videoTourUrl);
  const hasMap = !!(l.mapEmbedUrl || l.mapUrl);
  const hasPricing = l.priceLines.length > 0 || l.electricity || l.waterCharges || l.priceHistoryNote || l.loanAvailable;

  const priceTile = (
    <div className="flex h-full w-full flex-col justify-between bg-[#FF6B4A] p-4 text-white">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/25"><Tag size={20} /></span>
      <span>
        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-80">{l.transaction === "SALE" ? "Asking price" : "Rent"}</span>
        <span className="block text-2xl font-extrabold leading-tight">{l.priceDisplay}</span>
        {(perSqft || l.negotiable) && <span className="mt-0.5 block text-xs font-semibold opacity-90">{[perSqft, l.negotiable ? "Negotiable" : null].filter(Boolean).join(" · ")}</span>}
      </span>
    </div>
  );

  return (
    <Shell>
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:pt-6">
        {viewerName && (
          <Pop>
            <div className="mb-4 flex items-center gap-2 rounded-full bg-[#DDEFEA] px-4 py-2.5 text-sm text-[#123F3A]">
              <span aria-hidden>👋</span>
              <span>Hi <span className="font-extrabold">{viewerName}</span> — <span className="font-bold">{l.broker.name}</span> shared this with you</span>
            </div>
          </Pop>
        )}

        {/* Header */}
        <Pop>
          <header className="mb-4">
            <div className="mb-3 flex flex-wrap gap-1.5">
              <Pill tone="teal">{transactionLabel(l.transaction)}</Pill>
              {l.propertyType && <Pill tone="white">{l.propertyType}</Pill>}
              {status && <Pill tone="coral">{status}</Pill>}
              {l.urgencyBadge && <Pill tone="honey"><Sparkles size={12} /> {l.urgencyBadge}</Pill>}
              {l.status === "LIVE" && !status && <Pill tone="wa">Available</Pill>}
            </div>
            <h1 className="max-w-3xl text-3xl text-[#123F3A] sm:text-5xl">{l.title}</h1>
            {place && (
              <div className="mt-2 flex items-center gap-1.5 text-sm text-[#2D5751] sm:text-base">
                <MapPin size={16} className="text-[#FF6B4A]" /> {place}{l.landmark ? ` · near ${l.landmark}` : ""}{l.pincode ? ` · ${l.pincode}` : ""}
              </div>
            )}
          </header>
        </Pop>

        {/* Bento hero */}
        <Pop delay={60}>
          <Bento photos={l.photos} listingId={l.id} title={l.title} priceTile={priceTile} waTile={<WhatsAppTile data={l} />} fillers={l.highlights} />
        </Pop>

        <Pop delay={80}>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <SecondaryActions data={l} />
            <PrimaryCtas data={l} className="hidden md:flex" />
          </div>
        </Pop>

        {/* Facts tiles */}
        {facts.length > 0 && (
          <Pop delay={100}>
            <section className="mt-6" aria-label="Key facts">
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
                {facts.map((f, i) => <Tile key={f.key} label={f.label} value={f.value} tint={i} icon={<f.Icon size={18} />} />)}
              </div>
            </section>
          </Pop>
        )}

        {/* Single centered column */}
        <main className="mx-auto mt-8 max-w-3xl space-y-5">
          {hasPricing && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Money matters">Pricing</SectionTitle>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-3xl font-extrabold text-[#123F3A]">{l.priceDisplay}</span>
                  {perSqft && <span className="text-sm text-[#2D5751]">{perSqft}</span>}
                  {l.negotiable && <Pill tone="wa">Negotiable</Pill>}
                  {l.loanAvailable && <Pill tone="honey">Loan available</Pill>}
                </div>
                {(l.priceLines.length > 0 || l.electricity || l.waterCharges) && (
                  <dl className="mt-4 divide-y divide-[#F1E6D8] rounded-3xl bg-[#FBF4EC] px-4">
                    {l.priceLines.map((p, i) => (
                      <div key={i} className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
                        <dt className="text-[#2D5751]">{p.label}{p.note ? <span className="text-[#6E8A85]"> · {p.note}</span> : null}</dt>
                        <dd className="font-extrabold text-[#123F3A]">{formatINR(p.amount, { currency: l.currency })}{p.unit ? <span className="text-xs font-semibold text-[#6E8A85]"> {p.unit}</span> : null}</dd>
                      </div>
                    ))}
                    {l.electricity && <div className="flex justify-between gap-3 py-2.5 text-sm"><dt className="text-[#2D5751]">Electricity</dt><dd className="font-bold">{l.electricity}</dd></div>}
                    {l.waterCharges && <div className="flex justify-between gap-3 py-2.5 text-sm"><dt className="text-[#2D5751]">Water</dt><dd className="font-bold">{l.waterCharges}</dd></div>}
                  </dl>
                )}
                {l.priceHistoryNote && <p className="mt-3 text-xs text-[#6E8A85]">{l.priceHistoryNote}</p>}
              </Card>
            </Pop>
          )}

          {l.highlights.length > 0 && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Why you'll love it">Highlights</SectionTitle>
                <ul className="flex flex-wrap gap-2">
                  {l.highlights.map((h, i) => (
                    <li key={i} className="inline-flex items-center gap-2 rounded-full bg-[#FFE4DB] px-4 py-2 text-sm font-bold text-[#9A2E14]">
                      <Sparkles size={14} /> {h}
                    </li>
                  ))}
                </ul>
              </Card>
            </Pop>
          )}

          {l.description && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="About">The property</SectionTitle>
                <Description text={l.description} />
              </Card>
            </Pop>
          )}

          {l.features.filter((s) => s.items?.length).map((s, i) => (
            <Pop key={s.id ?? i}>
              <Card>
                <SectionTitle>{s.title}</SectionTitle>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {s.items.map((it, j) => <Tile key={it.id ?? j} label={it.label} value={it.value} tint={j + i} />)}
                </div>
              </Card>
            </Pop>
          ))}

          {l.amenities.length > 0 && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Included">Amenities</SectionTitle>
                <ul className="flex flex-wrap gap-2">
                  {l.amenities.map((a) => (
                    <li key={a} className="inline-flex items-center gap-1.5 rounded-full bg-[#F1E6D8] px-3.5 py-1.5 text-sm font-semibold text-[#123F3A]">
                      <Check size={14} className="text-[#25D366]" strokeWidth={3} /> {a}
                    </li>
                  ))}
                </ul>
              </Card>
            </Pop>
          )}

          {l.neighbourhood.length > 0 && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Around you">Neighbourhood</SectionTitle>
                <dl className="grid gap-2 sm:grid-cols-2">
                  {l.neighbourhood.map((n, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-2xl bg-[#DCE9FA] px-4 py-2.5 text-sm text-[#1D3F6E]">
                      <dt className="flex items-center gap-2"><Landmark size={14} /> {n.label}</dt>
                      <dd className="text-right font-extrabold">{n.value}</dd>
                    </div>
                  ))}
                </dl>
              </Card>
            </Pop>
          )}

          {hasMap && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Location">On the map</SectionTitle>
                {l.mapEmbedUrl && (
                  <div className="overflow-hidden rounded-3xl">
                    <iframe src={l.mapEmbedUrl} title={`Map of ${l.title}`} className="h-64 w-full sm:h-80" loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                  </div>
                )}
                {l.mapUrl && (
                  <TrackedLink event="MAP_OPEN" listingId={l.id} href={l.mapUrl} target="_blank" rel="noopener noreferrer" className={`${btnSoft} mt-3`}>
                    <ExternalLink size={14} /> Open in Maps
                  </TrackedLink>
                )}
              </Card>
            </Pop>
          )}

          {hasVideo && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Walkthrough">Video</SectionTitle>
                <VideoBlock listingId={l.id} videoUrl={l.videoUrl} embedUrl={l.videoTourEmbedUrl} tourUrl={l.videoTourUrl} title={l.title} className="aspect-video w-full overflow-hidden rounded-3xl bg-[#123F3A]" />
              </Card>
            </Pop>
          )}

          {l.documents.length > 0 && (
            <Pop>
              <Card>
                <SectionTitle eyebrow="Downloads">{l.documentsTitle || "Documents"}</SectionTitle>
                <ul className="grid gap-2">
                  {l.documents.map((d) => (
                    <li key={d.id}>
                      <TrackedLink event="DOC_DOWNLOAD" listingId={l.id} meta={{ doc: d.id }} href={d.url} target="_blank" rel="noopener noreferrer" className="sr-press flex items-center gap-3 rounded-2xl bg-[#FBF4EC] px-4 py-3 text-sm font-bold text-[#123F3A] hover:bg-[#F1E6D8]">
                        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-[#FF6B4A]"><FileText size={18} /></span>
                        <span className="min-w-0 flex-1 truncate">{d.name}</span>
                        <span className="text-xs font-semibold text-[#6E8A85]">{(d.sizeBytes / 1024 / 1024).toFixed(1)} MB</span>
                        <Download size={16} className="text-[#6E8A85]" />
                      </TrackedLink>
                    </li>
                  ))}
                </ul>
              </Card>
            </Pop>
          )}

          {l.project && (
            <Pop>
              <ProjectBlock project={l.project} currency={l.currency} />
            </Pop>
          )}

          {/* Broker card + big CTA at the bottom */}
          <Pop>
            <Card id="contact" className="bg-gradient-to-br from-white to-[#FFF1EB]">
              <SectionTitle eyebrow="Talk to">Get in touch</SectionTitle>
              <BrokerCard broker={l.broker} listingId={l.id} waHref={c.whatsapp} callHref={c.call} big />
              {canWhatsApp(l) && (
                <div className="mt-6 border-t border-[#F1E6D8] pt-5">
                  <div className="mb-2 text-[11px] font-bold uppercase tracking-[.14em] text-[#6E8A85]">Quick questions</div>
                  <QuickQuestions data={l} />
                </div>
              )}
              {l.formUrl && <div className="mt-4"><FormButton data={l} /></div>}
            </Card>
          </Pop>
        </main>
      </div>

      {/* Sticky mobile CTA bar */}
      {(canWhatsApp(l) || canCall(l)) && (
        <>
          <div className="fixed inset-x-0 bottom-0 z-40 md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
            <div className="mx-3 mb-3 flex items-center gap-2 rounded-full bg-white/95 p-2 shadow-[0_12px_40px_-10px_rgba(18,63,58,.45)] backdrop-blur">
              <div className="min-w-0 flex-1 pl-3">
                <div className="truncate text-base font-extrabold text-[#123F3A]">{l.priceDisplay}</div>
                {perSqft && <div className="truncate text-[11px] text-[#6E8A85]">{perSqft}</div>}
              </div>
              {canWhatsApp(l) && (
                <TrackedLink event="WHATSAPP_TAP" listingId={l.id} href={c.whatsapp} target="_blank" rel="noopener noreferrer" className={`${btnWa} px-4`} aria-label="WhatsApp">
                  <MessageCircle size={18} /> WhatsApp
                </TrackedLink>
              )}
              {canCall(l) && (
                <TrackedLink event="CALL_TAP" listingId={l.id} href={c.call} className={`${btnTeal} px-4`} aria-label="Call">
                  <Phone size={18} />
                </TrackedLink>
              )}
            </div>
          </div>
          <div className="h-20 md:hidden" aria-hidden />
        </>
      )}
    </Shell>
  );
}
