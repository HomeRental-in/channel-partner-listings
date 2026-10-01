import { MessageCircle, Phone } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { ShareButton } from "@/components/public/ShareButton";
import { Reveal } from "@/components/themes/shared/Reveal";
import { groupListings } from "@/components/themes/shared/helpers";
import { BrandMark, hasBrand, hiBroker, storefrontHero } from "@/components/themes/shared/BrandMark";
import { waLink, telLink } from "@/lib/site";
import type { StorefrontProps } from "@/components/themes/types";
import { Frame } from "./Frame";
import { Avatar } from "./BrokerCard";
import { ListingCard } from "./ListingCard";
import { responseLabel } from "./CtaCard";

/** EDITORIAL storefront — broker hero + grouped listing grid. */
export function EditorialStorefront({ data }: StorefrontProps) {
  const b = data.broker;
  const groups = groupListings(data);
  const showWa = b.card.showWhatsApp && Boolean(b.whatsapp);
  const showCall = b.card.showCall && Boolean(b.phone);
  const hero = storefrontHero(b);
  // Storefront = the CP's own site: the brand always shows here (card toggles only apply to listing cards).
  const masthead = hasBrand(b, false) ? <BrandMark broker={b} honourCard={false} /> : null;
  const stats = [
    { n: b.activeListings, label: b.activeListings === 1 ? "Listing" : "Listings" },
    b.yearsExperience ? { n: b.yearsExperience, label: "Yrs exp" } : null,
    b.dealsClosed ? { n: b.dealsClosed, label: "Deals" } : null,
  ].filter((s): s is { n: number; label: string } => Boolean(s));

  return (
    <Frame masthead={masthead} mastheadHref={b.siteUrl} mastheadRight={<ShareButton url={b.siteUrl} title={hero.heading} listingId={null} className="ed-btn ed-btn-sm" />}>
      <Reveal as="section" className="ed-store-hero ed-reveal">
        <Avatar broker={b} size="lg" />
        <div style={{ minWidth: 0 }}>
          {hero.eyebrow && <p className="ed-eyebrow">{hero.eyebrow}</p>}
          <h1 className="ed-serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: hero.eyebrow ? "0.35rem" : 0 }}>{hero.heading}</h1>
          {b.reraNumber && <p className="ed-faint" style={{ fontSize: "0.8rem", marginTop: "0.35rem" }}>RERA {b.reraNumber}</p>}
          {stats.length > 0 && (
            <div className="ed-stats">
              {stats.map((s) => (
                <div className="ed-stat" key={s.label}>
                  <b>{s.n}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          )}
          <div className="ed-chips" style={{ marginTop: "1.5rem" }}>
            {showWa && (
              <TrackedLink event="WHATSAPP_TAP" listingId={null} meta={{ from: "storefront" }} href={waLink(b.whatsapp, `${hiBroker(b)}, I saw your listings on ${b.siteUrl}`)} target="_blank" rel="noopener" className="ed-btn ed-btn-wa">
                <MessageCircle size={17} aria-hidden="true" /> WhatsApp
              </TrackedLink>
            )}
            {showCall && (
              <TrackedLink event="CALL_TAP" listingId={null} meta={{ from: "storefront" }} href={telLink(b.phone)} className="ed-btn">
                <Phone size={17} aria-hidden="true" /> Call
              </TrackedLink>
            )}
          </div>
          {b.bio && <p className="ed-prose" style={{ marginTop: "1.5rem", maxWidth: "62ch" }}>{b.bio}</p>}
          <dl style={{ marginTop: "1.25rem", display: "grid", gap: "0.5rem", fontSize: "0.95rem" }}>
            {b.areas.length > 0 && (
              <div>
                <dt className="ed-eyebrow" style={{ marginBottom: "0.35rem" }}>Areas</dt>
                <dd className="ed-chips" style={{ margin: 0 }}>{b.areas.map((a) => <span key={a} className="ed-chip">{a}</span>)}</dd>
              </div>
            )}
            {b.languages.length > 0 && (
              <div>
                <dt className="ed-eyebrow" style={{ marginBottom: "0.2rem" }}>Languages</dt>
                <dd style={{ margin: 0 }}>{b.languages.join(", ")}</dd>
              </div>
            )}
            {b.responseTime && (
              <div>
                <dt className="ed-eyebrow" style={{ marginBottom: "0.2rem" }}>Response time</dt>
                <dd style={{ margin: 0 }}>Usually replies {responseLabel(b.responseTime)}</dd>
              </div>
            )}
          </dl>
        </div>
      </Reveal>

      {groups.length === 0 ? (
        <Reveal as="section" className="ed-section ed-reveal">
          <p className="ed-serif-i ed-muted" style={{ fontSize: "1.3rem" }}>No listings published yet. Check back soon.</p>
        </Reveal>
      ) : (
        groups.map((g) => (
          <Reveal as="section" className="ed-section ed-reveal" key={g.title}>
            <h2 className="ed-h2">
              {g.title} <span className="ed-faint" style={{ fontFamily: "var(--ed-sans)", fontSize: "0.9rem", letterSpacing: 0 }}>({g.listings.length})</span>
            </h2>
            <div className="ed-grid">
              {g.listings.map((l) => (
                <ListingCard key={l.id} l={l} />
              ))}
            </div>
          </Reveal>
        ))
      )}

      {b.testimonials.length > 0 && (
        <Reveal as="section" className="ed-section ed-reveal">
          <h2 className="ed-h2">What clients say</h2>
          <div className="ed-testimonials">
            {b.testimonials.slice(0, 3).map((t, i) => (
              <blockquote key={i} className="ed-testimonial" style={{ margin: 0 }}>
                <p className="ed-quote">“{t.quote}”</p>
                <footer className="ed-muted" style={{ marginTop: "0.75rem", fontSize: "0.9rem" }}>
                  — {t.author}
                  {t.role ? `, ${t.role}` : ""}
                </footer>
              </blockquote>
            ))}
          </div>
        </Reveal>
      )}

      {b.awards.length > 0 && (
        <Reveal as="section" className="ed-section ed-reveal">
          <h2 className="ed-h2">Recognition</h2>
          <ul className="ed-list">
            {b.awards.slice(0, 6).map((a, i) => (
              <li key={i}>
                <span>
                  {a.title}
                  {a.by ? <span className="ed-muted"> · {a.by}</span> : null}
                </span>
                <span>{a.year ?? ""}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      )}
    </Frame>
  );
}
