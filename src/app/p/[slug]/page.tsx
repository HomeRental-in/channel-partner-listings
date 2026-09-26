import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MessageCircle, ArrowUpRight, ExternalLink, Download } from "lucide-react";
import { db } from "@/lib/db";
import { asArray, type FeatureSection, type NeighbourhoodItem } from "@/lib/types";
import { BRAND, rootUrl, projectUrl, listingUrl, waLink } from "@/lib/site";
import { absoluteUrl } from "@/lib/storage";
import { mapEmbed } from "@/lib/public";
import { PublicShell } from "@/components/themes/shared/PublicShell";
import { Reveal } from "@/components/themes/shared/Reveal";
import { TrackedLink } from "@/components/public/TrackedLink";
import { Frame } from "@/components/themes/editorial/Frame";
import { Avatar } from "@/components/themes/editorial/BrokerCard";
import { ProjectDetails } from "@/components/themes/editorial/ProjectBlock";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function loadProject(slug: string) {
  const project = await db.project.findUnique({ where: { slug } });
  if (!project) return null;
  // CPs with LIVE listings linked to this template, newest first, one per CP.
  const listings = await db.listing.findMany({ where: { projectId: project.id, status: "LIVE" }, include: { user: true }, orderBy: { publishedAt: "desc" } });
  const seen = new Set<string>();
  const listedBy = listings.filter((l) => (seen.has(l.userId) ? false : (seen.add(l.userId), true)));
  return { project, listedBy };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await db.project.findUnique({ where: { slug }, select: { name: true, developer: true, locality: true, city: true, description: true, photos: true } });
  if (!p) return { title: "Project not found", robots: { index: false } };
  const title = [p.name, p.developer].filter(Boolean).join(" by ");
  const description = (p.description ?? "").replace(/\s+/g, " ").trim().slice(0, 160) || `${p.name}${p.locality || p.city ? ` in ${[p.locality, p.city].filter(Boolean).join(", ")}` : ""} — configurations, payment plan, floor plans and channel partners.`;
  const cover = asArray<{ url: string }>(p.photos)[0]?.url;
  return { title, description, alternates: { canonical: projectUrl(slug) }, openGraph: { title, description, url: projectUrl(slug), type: "website", siteName: BRAND, images: cover ? [{ url: absoluteUrl(cover) }] : undefined } };
}

/** Project template page — developer facts + "Listed by" channel partners. Simple editorial styling. */
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const res = await loadProject(slug);
  if (!res) notFound();
  const { project: p, listedBy } = res;
  const photos = asArray<{ url: string }>(p.photos).filter((x) => x && typeof x.url === "string");
  const highlights = asArray<string>(p.highlights);
  const amenities = asArray<string>(p.amenities);
  const advantages = asArray<NeighbourhoodItem>(p.locationAdvantages).filter((a) => a && a.label);
  const features = asArray<FeatureSection>(p.features).filter((s) => Array.isArray(s.items) && s.items.length);
  const embed = mapEmbed(p.mapUrl);
  const place = [p.locality, p.city].filter(Boolean).join(", ");

  return (
    <PublicShell viewerName={null} listingId={null}>
      <Frame mastheadName={BRAND} mastheadHref={rootUrl("/")}>
        <Reveal as="section" className="ed-reveal" style={{ paddingBlock: "2.5rem 1.5rem" }}>
          <p className="ed-eyebrow">{[p.developer ? `By ${p.developer}` : "Project", place].filter(Boolean).join(" · ")}</p>
          <h1 className="ed-serif" style={{ fontSize: "clamp(2.2rem, 5vw, 3.6rem)", marginTop: "0.35rem", textWrap: "balance" }}>{p.name}</h1>
          <p className="ed-muted" style={{ marginTop: "0.5rem" }}>
            {[p.reraNumber ? `RERA ${p.reraNumber}` : null, p.possessionDate ? `Possession ${p.possessionDate}` : null, p.landmark ? `Near ${p.landmark}` : null].filter(Boolean).join(" · ")}
            {p.reraUrl && (
              <>
                {" "}
                <a href={p.reraUrl} target="_blank" rel="noopener" style={{ textUnderlineOffset: 4 }}>Verify <ExternalLink size={12} aria-hidden="true" style={{ display: "inline" }} /></a>
              </>
            )}
          </p>
        </Reveal>

        {photos.length > 0 && (
          <div className="ed-strip" role="list" aria-label="Project photos" style={{ marginTop: 0 }}>
            {photos.slice(0, 10).map((ph, i) => (
              <div key={i} role="listitem" style={{ flex: "0 0 auto", scrollSnapAlign: "start", width: "min(70vw, 420px)", aspectRatio: "4 / 3", borderRadius: 14, overflow: "hidden", background: "var(--ed-cream-2)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={ph.url} alt={`${p.name} photo ${i + 1}`} loading={i === 0 ? "eager" : "lazy"} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            ))}
          </div>
        )}

        <div className="grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16" style={{ marginTop: "2rem" }}>
          <main style={{ minWidth: 0 }}>
            {highlights.length > 0 && (
              <Reveal as="section" className="ed-section ed-reveal">
                <h2 className="ed-h2">Highlights</h2>
                <ul className="ed-highlights">
                  {highlights.map((h, i) => (
                    <li key={i}>
                      <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </Reveal>
            )}
            <Reveal as="section" className="ed-section ed-reveal">
              <h2 className="ed-h2">Configurations & plans</h2>
              <ProjectDetails project={{ ...p, configurations: asArray(p.configurations), paymentPlan: asArray(p.paymentPlan), floorPlans: asArray(p.floorPlans) }} showHeader={false} />
              {p.brochureUrl && (
                <p style={{ marginTop: "1.25rem" }}>
                  <a href={p.brochureUrl} target="_blank" rel="noopener" className="ed-btn ed-btn-ink ed-btn-sm">
                    <Download size={15} aria-hidden="true" /> Developer brochure
                  </a>
                </p>
              )}
            </Reveal>
            {features.map((s, i) => (
              <Reveal as="section" className="ed-section ed-reveal" key={s.id ?? i}>
                <h2 className="ed-h2">{s.title}</h2>
                <dl className="ed-facts">
                  {s.items.map((it, j) => (
                    <div className="ed-fact" key={it.id ?? j}>
                      <dt>{it.label}</dt>
                      <dd>{it.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
            {amenities.length > 0 && (
              <Reveal as="section" className="ed-section ed-reveal">
                <h2 className="ed-h2">Amenities</h2>
                <ul className="ed-chips" style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {amenities.map((a) => <li key={a} className="ed-chip">{a}</li>)}
                </ul>
              </Reveal>
            )}
            {(advantages.length > 0 || embed) && (
              <Reveal as="section" className="ed-section ed-reveal">
                <h2 className="ed-h2">Location advantages</h2>
                {advantages.length > 0 && (
                  <ul className="ed-list" style={{ marginBottom: embed ? "1rem" : 0 }}>
                    {advantages.map((a, i) => (
                      <li key={i}>
                        <span>{a.label}</span>
                        <span>{a.value}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {embed && (
                  <div className="ed-frame">
                    <iframe src={embed} title={`Map of ${p.name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
                  </div>
                )}
              </Reveal>
            )}
            {p.description && (
              <Reveal as="section" className="ed-section ed-reveal">
                <h2 className="ed-h2">About {p.name}</h2>
                <p className="ed-prose">{p.description.trim()}</p>
              </Reveal>
            )}
          </main>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <Reveal className="ed-reveal">
              <h2 className="ed-h2">Listed by</h2>
              {listedBy.length === 0 ? (
                <p className="ed-serif-i ed-muted" style={{ fontSize: "1.15rem" }}>No channel partner has listed this project yet.</p>
              ) : (
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {listedBy.map((l) => {
                    const u = l.user;
                    const name = u.name ?? "Channel partner";
                    const wa = u.whatsappNumber ?? u.phone;
                    return (
                      <div className="ed-broker" key={u.id}>
                        <Avatar broker={{ name, avatarUrl: u.avatarUrl }} />
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontWeight: 500 }}>{name}</p>
                          <p className="ed-muted" style={{ fontSize: "0.88rem" }}>{[u.agencyName, u.city, u.reraNumber ? `RERA ${u.reraNumber}` : null].filter(Boolean).join(" · ")}</p>
                          <div className="ed-chips" style={{ marginTop: "0.7rem" }}>
                            <TrackedLink event="WHATSAPP_TAP" listingId={l.id} meta={{ from: "project_page" }} href={waLink(wa, `Hi, I'm interested in ${p.name}${place ? ` (${place})` : ""}.\n${listingUrl(u.username, l.slug)}`)} target="_blank" rel="noopener" className="ed-btn ed-btn-wa ed-btn-sm">
                              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
                            </TrackedLink>
                            <a href={listingUrl(u.username, l.slug)} className="ed-quick">
                              View listing <ArrowUpRight size={14} aria-hidden="true" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Reveal>
          </aside>
        </div>
      </Frame>
    </PublicShell>
  );
}
