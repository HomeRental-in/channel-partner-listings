import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CITIES } from "@/lib/seo/cities";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { BRAND, rootUrl } from "@/lib/site";

const TITLE = "Listing tool for channel partners, city by city";
const DESCRIPTION = `${BRAND} is free listing software for real-estate channel partners across India. Find your city and the micro-markets we're onboarding.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: rootUrl("/channel-partners") },
  openGraph: { title: TITLE, description: DESCRIPTION, url: rootUrl("/channel-partners"), type: "website", siteName: BRAND },
};

export default function ChannelPartnersIndex() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: BRAND, path: "/" }, { name: "Channel partners", path: "/channel-partners" }])} />
      <section className="mk-hero mk-wrap" aria-labelledby="hero-title">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow mk-fade mb-6">Channel partners across India</p>
          <h1 id="hero-title" className="mk-h1 mk-fade mx-auto max-w-4xl">
            Find your city.
          </h1>
          <p className="mk-body mk-muted mk-fade mx-auto mt-6 max-w-2xl">{DESCRIPTION}</p>
        </div>
      </section>
      <section className="mk-wrap py-3 md:py-4">
        <div className="mk-panel">
          <ol>
            {CITIES.map((c, i) => (
              <li key={c.slug}>
                <Link href={`/channel-partners/${c.slug}`} className="mk-row group">
                  <span className="mk-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="mk-h3 block">Channel partners in {c.name}</span>
                    <span className="mk-muted mt-1.5 block text-base">{c.localities.slice(0, 5).join(" · ")}</span>
                  </span>
                  <span className="mk-row-arrow" aria-hidden>
                    <ArrowRight size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
