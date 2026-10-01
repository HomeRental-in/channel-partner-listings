import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import WhyFirms from "@/components/marketing/partners/WhyFirms";
import Tiers from "@/components/marketing/partners/Tiers";
import EoiForm from "@/components/marketing/partners/EoiForm";
import Faq from "@/components/marketing/Faq";
import { PARTNER_FAQS } from "@/components/marketing/faqs";
import { CITIES } from "@/lib/seo/cities";
import { JsonLd, breadcrumbLd, faqLd } from "@/lib/seo/jsonld";
import { BRAND, rootUrl } from "@/lib/site";

const TITLE = "Founding Partner Programme for channel partner firms";
const DESCRIPTION = `Run a CP firm or agency with hundreds or thousands of listings? Register interest and ${BRAND} will onboard your whole team and inventory — free, with unlimited listings for every agent.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: rootUrl("/partners") },
  openGraph: { title: `${TITLE} · ${BRAND}`, description: DESCRIPTION, url: rootUrl("/partners"), type: "website", siteName: BRAND },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

const STEPS = [
  { title: "Register interest", body: "Two minutes. Tell us your city, micro-markets and how much inventory you carry." },
  { title: "A 20-minute call", body: "Your partnerships manager maps your projects, agents and the links you share most." },
  { title: "We build your inventory", body: "Send brochures, inventory sheets or photo folders. We turn them into project pages and listings for your agents." },
  { title: "Your team shares links", body: "Agents join with your agency code and start sharing from WhatsApp. You see every open and tap." },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function PartnersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const defaultCity = typeof sp.city === "string" ? sp.city : undefined;
  const cities = CITIES.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <>
      <JsonLd data={[faqLd(PARTNER_FAQS), breadcrumbLd([{ name: BRAND, path: "/" }, { name: "Founding Partners", path: "/partners" }])]} />

      <section className="mk-hero mk-wrap" aria-labelledby="hero-title">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow mk-fade mb-6">Founding Partner Programme · for CP firms &amp; agencies</p>
          <h1 id="hero-title" className="mk-h1 mk-fade mx-auto max-w-4xl">
            A thousand listings in one city? We&apos;ll put every one on a link.
          </h1>
          <p className="mk-body mk-muted mk-fade mx-auto mt-6 max-w-2xl">
            {BRAND} is the free listing tool for channel partners. For firms with large inventory, our team onboards your agents and
            builds your pages for you — every unit, every project, under your brand. No credits, no per-listing fees.
          </p>
          <div className="mk-fade mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="#eoi" className="btn btn-dark text-base md:text-lg">
              Register interest <span aria-hidden>👋</span>
            </a>
            <Link href="/sample" className="btn bg-white text-base md:text-lg">
              See a sample listing <ArrowUpRight size={18} />
            </Link>
          </div>
          <div className="mk-fade mt-12 flex justify-center md:mt-16">
            <a href="#why" className="mk-scroll-btn" aria-label="Scroll down">
              <ArrowDown size={22} />
            </a>
          </div>
        </div>
      </section>

      <WhyFirms />
      <Tiers />

      <section id="onboarding" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="onboarding-title">
        <div className="mk-panel">
          <div className="mk-grid">
            <div>
              <p className="mk-label reveal">Onboarding</p>
              <h2 id="onboarding-title" className="mk-h2 reveal mt-6 max-w-sm" data-delay="0.05">
                From registration to your team sharing links.
              </h2>
            </div>
            <ol className="flex flex-col">
              {STEPS.map((s, i) => (
                <li key={s.title} className="mk-step reveal" data-delay={i * 0.08}>
                  <span className="mk-step-num">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="mk-h3">{s.title}</h3>
                    <p className="mk-muted mt-3 max-w-xl text-base leading-snug md:text-lg">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="eoi" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="eoi-title">
        <div className="mk-panel" style={{ background: "var(--soft)" }}>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,35fr)_minmax(0,65fr)] lg:gap-16">
            <div>
              <p className="mk-label">Expression of interest</p>
              <h2 id="eoi-title" className="mk-h2 mt-6 max-w-sm">
                Register your firm.
              </h2>
              <p className="mk-body mk-muted mt-5 max-w-sm">
                Firms with 1,000+ listings or links a month in one location are reviewed first. Everyone gets a reply on WhatsApp
                within one working day.
              </p>
              <p className="mk-muted mt-8 text-sm">Onboarding now in</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {CITIES.map((c) => (
                  <Link key={c.slug} href={`/channel-partners/${c.slug}`} className="chip bg-white">
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>
            <EoiForm cities={cities} defaultCity={defaultCity} />
          </div>
        </div>
      </section>

      <Faq items={PARTNER_FAQS} title="Questions CP firms ask us." />
    </>
  );
}
