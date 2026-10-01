import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Faq from "@/components/marketing/Faq";
import HowItWorks from "@/components/marketing/HowItWorks";
import { cityFaqs } from "@/components/marketing/faqs";
import { CITIES, cityBySlug } from "@/lib/seo/cities";
import { getCityStats } from "@/lib/seo/cityStats";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";
import { BRAND, projectUrl, rootUrl, whatsappStartUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ city: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = cityBySlug((await params).city);
  if (!c) return { title: "City not found", robots: { index: false } };
  const title = `Free property listing tool for channel partners in ${c.name}`;
  const description = `Channel partners and real-estate brokers in ${c.name} — ${c.localities.slice(0, 3).join(", ")} and beyond — create unlimited listing pages, PDF brochures and story videos from WhatsApp. Free.`;
  const url = rootUrl(`/channel-partners/${c.slug}`);
  return {
    title: { absolute: `${title} · ${BRAND}` },
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "website", siteName: BRAND },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function CityPage({ params }: Props) {
  const c = cityBySlug((await params).city);
  if (!c) notFound();
  const stats = await getCityStats(c);
  const faqs = cityFaqs(c);
  const others = CITIES.filter((x) => x.slug !== c.slug);
  // Early on, small numbers read as "nobody uses this" — only show counts once they're persuasive.
  const showStats = stats.partners >= 10 || stats.listings >= 25;

  return (
    <>
      <JsonLd
        data={[
          faqLd(faqs),
          breadcrumbLd([
            { name: BRAND, path: "/" },
            { name: "Channel partners", path: "/channel-partners" },
            { name: c.name, path: `/channel-partners/${c.slug}` },
          ]),
        ]}
      />

      <section className="mk-hero mk-wrap" aria-labelledby="hero-title">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow mk-fade mb-6">
            For channel partners in {c.name}, {c.state}
          </p>
          <h1 id="hero-title" className="mk-h1 mk-fade mx-auto max-w-4xl">
            The free listing tool for {c.name} channel partners.
          </h1>
          <p className="mk-body mk-muted mk-fade mx-auto mt-6 max-w-2xl">{c.market}</p>
          <div className="mk-fade mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href={whatsappStartUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-dark text-base md:text-lg">
              Create a free listing <span aria-hidden>👋</span>
            </a>
            <Link href={`/partners?city=${c.slug}#eoi`} className="btn bg-white text-base md:text-lg">
              Onboard my firm <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="mk-wrap py-3 md:py-4" aria-labelledby="local-title">
        <div className="mk-panel">
          <div className="mk-grid">
            <div>
              <p className="mk-label reveal">{c.name} today</p>
              <h2 id="local-title" className="mk-h2 reveal mt-6 max-w-sm" data-delay="0.05">
                One link per unit, in every micro-market you work.
              </h2>
            </div>
            <div className="reveal" data-delay="0.1">
              {showStats && (
              <div className="mb-10 grid grid-cols-3 gap-3">
                <div className="mk-stat">
                  <strong>{stats.partners.toLocaleString("en-IN")}</strong>
                  <span>CPs with a site</span>
                </div>
                <div className="mk-stat">
                  <strong>{stats.listings.toLocaleString("en-IN")}</strong>
                  <span>Live listings</span>
                </div>
                <div className="mk-stat">
                  <strong>{stats.projects.length.toLocaleString("en-IN")}</strong>
                  <span>Project pages</span>
                </div>
              </div>
              )}
              <h3 className="mk-h3">Micro-markets we&apos;re onboarding</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.localities.map((l) => (
                  <span key={l} className="chip">
                    {l}
                  </span>
                ))}
              </div>
              {stats.projects.length > 0 && (
                <>
                  <h3 className="mk-h3 mt-10">Project pages in {c.name}</h3>
                  <ul className="mt-4 flex flex-col">
                    {stats.projects.map((p) => (
                      <li key={p.slug} className="hairline">
                        <a href={projectUrl(p.slug)} className="flex items-center justify-between gap-4 py-3 text-base">
                          <span>
                            <span className="font-medium">{p.name}</span>
                            <span className="mk-muted">{[p.developer, p.locality].filter(Boolean).map((x) => ` · ${x}`).join("")}</span>
                          </span>
                          <ArrowRight size={16} className="flex-none" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <HowItWorks />

      <section className="mk-wrap py-3 md:py-4" aria-labelledby="firm-title">
        <div className="mk-panel reveal text-white" style={{ background: "var(--ink)" }}>
          <div className="grid items-end gap-10 md:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
            <div>
              <p className="eyebrow !text-white/60">Founding Partners · {c.name}</p>
              <h2 id="firm-title" className="mk-h2 mt-5 max-w-2xl">
                Run a CP firm with 1,000+ listings in {c.name}?
              </h2>
              <p className="mk-body mt-5 max-w-xl text-white/70">
                We take a limited number of Founding Partners per city. Our team onboards your agents and builds your inventory for
                you — free, with no per-listing fees.
              </p>
            </div>
            <div className="flex flex-col gap-3 md:items-end">
              <Link href={`/partners?city=${c.slug}#eoi`} className="btn bg-white text-base text-ink md:text-lg">
                Register interest <span aria-hidden>👋</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Faq items={faqs} title={`Questions ${c.name} channel partners ask us.`} />

      <section className="mk-wrap py-3 md:py-4" aria-labelledby="cities-title">
        <div className="mk-panel">
          <p id="cities-title" className="mk-label">
            Other cities
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/channel-partners/${o.slug}`} className="chip">
                Channel partners in {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
