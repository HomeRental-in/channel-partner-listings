import Link from "next/link";
import Image from "next/image";
import { BRAND, ROOT_DOMAIN, WHATSAPP_DISPLAY, whatsappStartUrl } from "@/lib/site";
import { CITIES } from "@/lib/seo/cities";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#features", label: "Everything included" },
      { href: "/#themes", label: "Themes" },
      { href: "/sample", label: "Sample listing" },
      { href: whatsappStartUrl(), label: "Create a free listing" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/partners", label: "Founding Partners" },
      { href: "/channel-partners", label: "Cities" },
      { href: "/answers", label: "Answers" },
      { href: "/#faq", label: "FAQ" },
      { href: "/login", label: "Log in" },
      { href: "/#who", label: "Who it's for" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mk-footer mk-wrap pb-6 pt-8 md:pt-12">
      <div className="mk-panel">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${BRAND} home`}>
              <Image src="/marketing/mark.svg" alt="" width={40} height={40} />
              <span className="text-2xl font-medium tracking-tight">{BRAND}</span>
            </Link>
            <p className="mk-muted mt-5 max-w-xs text-base leading-snug">
              Free listing pages for channel partners. Send a WhatsApp message, get a link buyers trust, share it everywhere.
            </p>
            <p className="mt-6 text-sm">
              <span className="mk-muted">WhatsApp:</span>{" "}
              <a href={whatsappStartUrl()} target="_blank" rel="noopener noreferrer" className="chip font-medium">
                {WHATSAPP_DISPLAY}
              </a>
            </p>
            <p className="mt-3 text-sm">
              <span className="mk-muted">Your site:</span>{" "}
              <span className="chip font-medium">yourname.{ROOT_DOMAIN}</span>
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="eyebrow mb-4">{col.title}</h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.href + l.label}>
                    {l.href.startsWith("/#") || l.href.startsWith("http") ? (
                      <a href={l.href} className="text-base font-medium" {...(l.href.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="text-base font-medium">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <nav className="hairline mt-12 pt-6" aria-label="Cities">
          <h3 className="eyebrow mb-3">Channel partners by city</h3>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/channel-partners/${c.slug}`} className="mk-muted">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hairline mt-6 flex flex-col gap-3 pt-6 text-sm md:flex-row md:items-center md:justify-between">
          <p className="mk-muted">Free listing software for channel partners. Not a broker or marketplace.</p>
          <p className="mk-muted">
            © {year} {BRAND}. We never collect buyer names or phone numbers.
          </p>
        </div>
      </div>
    </footer>
  );
}
