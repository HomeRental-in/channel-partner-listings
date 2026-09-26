import { MapPin, BadgeCheck, MessageCircle, Phone, Languages, Map as MapIcon, Trophy, Quote, Clock } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { waLink, telLink } from "@/lib/site";
import type { StorefrontProps } from "@/components/themes/types";
import { Shell, Card, SectionTitle, Pill, btnWa, btnTeal, TINTS } from "./ui";
import { Avatar } from "./BrokerCard";
import { CardGrid } from "./ListingCard";
import { Pop } from "./Pop";

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
      <div className="mx-auto max-w-5xl px-4 pb-8 pt-4 sm:pt-8">
        {/* Hero card */}
        <Pop>
          <Card className="relative overflow-hidden bg-gradient-to-br from-white via-white to-[#FFF1EB]">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#FFE4DB]" />
            <div className="pointer-events-none absolute -bottom-20 right-24 h-40 w-40 rounded-full bg-[#DDEFEA]" />
            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
              <Avatar broker={b} size={112} className="h-24 w-24 sm:h-28 sm:w-28" />
              <div className="min-w-0 flex-1">
                <Pill tone="coral">Channel partner</Pill>
                <h1 className="mt-2 text-3xl text-[#123F3A] sm:text-5xl">{b.name}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[#2D5751]">
                  {b.agencyName && <span className="font-bold">{b.agencyName}</span>}
                  {b.city && <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-[#FF6B4A]" /> {b.city}</span>}
                  {b.reraNumber && <span className="inline-flex items-center gap-1"><BadgeCheck size={14} className="text-[#FF6B4A]" /> RERA {b.reraNumber}</span>}
                  {b.responseTime && <span className="inline-flex items-center gap-1"><Clock size={14} /> Replies {b.responseTime}</span>}
                </div>
                {b.bio && <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#2D5751]">{b.bio}</p>}
                <div className="mt-5 flex flex-wrap gap-2">
                  {wa && (
                    <TrackedLink event="WHATSAPP_TAP" listingId={null} href={wa} target="_blank" rel="noopener noreferrer" className={btnWa}>
                      <MessageCircle size={18} /> WhatsApp
                    </TrackedLink>
                  )}
                  {call && (
                    <TrackedLink event="CALL_TAP" listingId={null} href={call} className={btnTeal}>
                      <Phone size={18} /> Call
                    </TrackedLink>
                  )}
                </div>
              </div>
            </div>
            <dl className="relative mt-6 grid grid-cols-3 gap-2.5">
              {stats.map((s, i) => (
                <div key={s.l} className={`rounded-3xl p-4 text-center ${TINTS[i % TINTS.length]}`}>
                  <dd className="text-2xl font-extrabold sm:text-3xl">{s.v}</dd>
                  <dt className="text-[10px] font-bold uppercase tracking-wider opacity-70">{s.l}</dt>
                </div>
              ))}
            </dl>
            {(b.languages.length > 0 || b.areas.length > 0) && (
              <div className="relative mt-5 flex flex-col gap-2 text-sm">
                {b.areas.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#6E8A85]"><MapIcon size={12} /> Areas</span>
                    {b.areas.map((a) => <Pill key={a} tone="sand">{a}</Pill>)}
                  </div>
                )}
                {b.languages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#6E8A85]"><Languages size={12} /> Speaks</span>
                    {b.languages.map((a) => <Pill key={a} tone="white">{a}</Pill>)}
                  </div>
                )}
              </div>
            )}
          </Card>
        </Pop>

        <div className="mt-8 space-y-10">
          {groups.map((g, i) => (
            <Pop key={g.id} delay={i * 40}>
              <section>
                <SectionTitle eyebrow={`${g.items.length} ${g.items.length === 1 ? "property" : "properties"}`}>{g.title}</SectionTitle>
                <CardGrid items={g.items} />
              </section>
            </Pop>
          ))}
          {(rest.length > 0 || groups.length === 0) && (
            <Pop>
              <section>
                <SectionTitle eyebrow={`${rest.length} ${rest.length === 1 ? "property" : "properties"}`}>Properties</SectionTitle>
                <CardGrid items={rest} />
              </section>
            </Pop>
          )}

          {(b.testimonials.length > 0 || b.awards.length > 0) && (
            <div className="grid gap-5 lg:grid-cols-2">
              {b.testimonials.length > 0 && (
                <Pop>
                  <Card>
                    <SectionTitle eyebrow="Clients say">Testimonials</SectionTitle>
                    <ul className="space-y-3">
                      {b.testimonials.map((t, i) => (
                        <li key={i} className="rounded-3xl bg-[#FBF4EC] p-4">
                          <Quote size={16} className="text-[#FF6B4A]" />
                          <p className="mt-2 text-sm leading-relaxed text-[#2D5751]">{t.quote}</p>
                          <div className="mt-2 text-xs text-[#6E8A85]"><span className="font-extrabold text-[#123F3A]">{t.author}</span>{t.role ? ` · ${t.role}` : ""}</div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Pop>
              )}
              {b.awards.length > 0 && (
                <Pop delay={60}>
                  <Card>
                    <SectionTitle eyebrow="Recognition">Awards</SectionTitle>
                    <ul className="space-y-2">
                      {b.awards.map((a, i) => (
                        <li key={i} className="flex items-start gap-3 rounded-3xl bg-[#FFEFC2] p-4 text-sm text-[#7A5200]">
                          <Trophy size={18} className="mt-0.5 shrink-0" />
                          <div>
                            <div className="font-extrabold">{a.title}</div>
                            <div className="text-xs opacity-80">{[a.by, a.year].filter(Boolean).join(" · ")}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </Card>
                </Pop>
              )}
            </div>
          )}
        </div>
      </div>
    </Shell>
  );
}
