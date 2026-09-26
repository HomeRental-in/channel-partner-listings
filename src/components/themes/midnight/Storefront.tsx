import { MapPin, BadgeCheck, MessageCircle, Phone, Languages, Map as MapIcon, Trophy, Quote, Clock } from "lucide-react";
import clsx from "clsx";
import { TrackedLink } from "@/components/public/TrackedLink";
import { waLink, telLink } from "@/lib/site";
import type { StorefrontProps } from "@/components/themes/types";
import { Shell, Panel, SectionTitle, Chip, btnWa, btnGhost } from "./ui";
import { Avatar } from "./BrokerCard";
import { CardGrid } from "./ListingCard";
import { Reveal } from "./Reveal";

export function Storefront({ data }: StorefrontProps) {
  const b = data.broker;
  const wa = b.card.showWhatsApp && b.whatsapp ? waLink(b.whatsapp, `Hi ${b.name}, I'm looking for a property. Can you help?`) : null;
  const call = b.card.showCall && b.phone ? telLink(b.phone) : null;
  const byId = new Map(data.listings.map((l) => [l.id, l]));
  const grouped = new Set<string>();
  const groups = data.groups
    .map((g) => ({ ...g, items: g.listingIds.map((id) => byId.get(id)).filter((x): x is NonNullable<typeof x> => !!x) }))
    .filter((g) => g.items.length > 0);
  for (const g of groups) for (const it of g.items) grouped.add(it.id);
  const rest = data.listings.filter((l) => !grouped.has(l.id));
  const stats = [
    b.yearsExperience ? { v: `${b.yearsExperience}+`, l: "Years" } : null,
    b.dealsClosed ? { v: String(b.dealsClosed), l: "Deals closed" } : null,
    { v: String(b.activeListings), l: "Live listings" },
  ].filter((s): s is { v: string; l: string } => !!s);

  return (
    <Shell>
      {/* Hero */}
      <header className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-[#7C5CFF]/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-[#22D3EE]/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-10 sm:py-16">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar broker={b} size={112} className="h-24 w-24 sm:h-28 sm:w-28" />
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-[.18em] text-[#7C5CFF]">Property advisor</div>
              <h1 className="mt-1 text-3xl text-white sm:text-5xl">{b.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#A9AFBC]">
                {b.agencyName && <span>{b.agencyName}</span>}
                {b.city && <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-[#22D3EE]" /> {b.city}</span>}
                {b.reraNumber && <span className="inline-flex items-center gap-1"><BadgeCheck size={14} className="text-[#22D3EE]" /> RERA {b.reraNumber}</span>}
                {b.responseTime && <span className="inline-flex items-center gap-1"><Clock size={14} /> Replies {b.responseTime}</span>}
              </div>
              {b.bio && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#C9CDD6]">{b.bio}</p>}
              <div className="mt-5 flex flex-wrap gap-2">
                {wa && (
                  <TrackedLink event="WHATSAPP_TAP" listingId={null} href={wa} target="_blank" rel="noopener noreferrer" className={clsx(btnWa, "mn-glow")}>
                    <MessageCircle size={18} /> WhatsApp
                  </TrackedLink>
                )}
                {call && (
                  <TrackedLink event="CALL_TAP" listingId={null} href={call} className={btnGhost}>
                    <Phone size={18} /> Call
                  </TrackedLink>
                )}
              </div>
            </div>
            <dl className="grid grid-cols-3 gap-2 sm:grid-cols-1 sm:gap-2">
              {stats.map((s) => (
                <div key={s.l} className="rounded-xl border border-white/5 bg-[#15181D] px-4 py-3 text-center sm:min-w-32">
                  <dd className="text-2xl font-bold text-white">{s.v}</dd>
                  <dt className="text-[10px] uppercase tracking-wider text-[#7D8391]">{s.l}</dt>
                </div>
              ))}
            </dl>
          </div>
          {(b.languages.length > 0 || b.areas.length > 0) && (
            <div className="mt-6 flex flex-col gap-2 text-sm">
              {b.areas.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#7D8391]"><MapIcon size={12} /> Areas</span>
                  {b.areas.map((a) => <Chip key={a} tone="accent" className="normal-case tracking-normal">{a}</Chip>)}
                </div>
              )}
              {b.languages.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 inline-flex items-center gap-1 text-xs uppercase tracking-wider text-[#7D8391]"><Languages size={12} /> Speaks</span>
                  {b.languages.map((a) => <Chip key={a} className="normal-case tracking-normal">{a}</Chip>)}
                </div>
              )}
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8">
        {groups.map((g, i) => (
          <Reveal key={g.id} from={i % 2 ? "right" : "left"}>
            <section>
              <SectionTitle eyebrow={`${g.items.length} ${g.items.length === 1 ? "property" : "properties"}`}>{g.title}</SectionTitle>
              <CardGrid items={g.items} />
            </section>
          </Reveal>
        ))}
        {(rest.length > 0 || groups.length === 0) && (
          <Reveal from={groups.length % 2 ? "right" : "left"}>
            <section>
              <SectionTitle eyebrow={`${rest.length} ${rest.length === 1 ? "property" : "properties"}`}>Properties</SectionTitle>
              <CardGrid items={rest} />
            </section>
          </Reveal>
        )}

        {(b.testimonials.length > 0 || b.awards.length > 0) && (
          <Reveal from="up">
            <div className="grid gap-5 lg:grid-cols-2">
              {b.testimonials.length > 0 && (
                <Panel>
                  <SectionTitle eyebrow="Clients say">Testimonials</SectionTitle>
                  <ul className="space-y-3">
                    {b.testimonials.map((t, i) => (
                      <li key={i} className="rounded-xl border border-white/5 bg-[#0F1216] p-4">
                        <Quote size={16} className="text-[#7C5CFF]" />
                        <p className="mt-2 text-sm leading-relaxed text-[#C9CDD6]">{t.quote}</p>
                        <div className="mt-2 text-xs text-[#7D8391]"><span className="font-semibold text-[#EEF0F4]">{t.author}</span>{t.role ? ` · ${t.role}` : ""}</div>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
              {b.awards.length > 0 && (
                <Panel>
                  <SectionTitle eyebrow="Recognition">Awards</SectionTitle>
                  <ul className="space-y-2">
                    {b.awards.map((a, i) => (
                      <li key={i} className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0F1216] p-3 text-sm">
                        <Trophy size={16} className="mt-0.5 shrink-0 text-[#22D3EE]" />
                        <div>
                          <div className="font-semibold text-white">{a.title}</div>
                          <div className="text-xs text-[#7D8391]">{[a.by, a.year].filter(Boolean).join(" · ")}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Panel>
              )}
            </div>
          </Reveal>
        )}
      </div>
    </Shell>
  );
}
