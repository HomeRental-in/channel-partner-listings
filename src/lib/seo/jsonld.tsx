import { BRAND, rootUrl } from "@/lib/site";
import { FACTS, ONE_LINER } from "./facts";

/** Renders schema.org JSON-LD. `<` is escaped so user-controlled strings can't close the script tag. */
export function JsonLd({ data }: { data: object | object[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": rootUrl("/#org"),
    name: BRAND,
    url: rootUrl("/"),
    logo: rootUrl("/marketing/mark.svg"),
    description: ONE_LINER,
    sameAs: (process.env.NEXT_PUBLIC_SAME_AS ?? "").split(",").map((s) => s.trim()).filter(Boolean),
  };
}

export function softwareLd() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: BRAND,
    url: rootUrl("/"),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, WhatsApp",
    description: ONE_LINER,
    featureList: FACTS,
    offers: { "@type": "Offer", price: "0", priceCurrency: "INR" },
    audience: { "@type": "BusinessAudience", audienceType: "Real-estate channel partners and brokers" },
    publisher: { "@id": rootUrl("/#org") },
  };
}

export function websiteLd() {
  return { "@context": "https://schema.org", "@type": "WebSite", name: BRAND, url: rootUrl("/"), publisher: { "@id": rootUrl("/#org") } };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: rootUrl(it.path) })),
  };
}

export function articleLd(a: { question: string; description: string; path: string; updated: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.question,
    description: a.description,
    url: rootUrl(a.path),
    mainEntityOfPage: rootUrl(a.path),
    datePublished: a.updated,
    dateModified: a.updated,
    author: { "@id": rootUrl("/#org") },
    publisher: { "@id": rootUrl("/#org") },
  };
}

export function howToLd(name: string, steps: { name: string; text: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name,
    step: steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.name, text: s.text })),
  };
}
