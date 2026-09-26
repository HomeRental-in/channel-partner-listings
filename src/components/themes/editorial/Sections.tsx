import { FileText, Download, ExternalLink, MapPin, ClipboardList } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { Reveal } from "@/components/themes/shared/Reveal";
import { brochureUrl, documentEvent, formatBytes, keyFacts } from "@/components/themes/shared/helpers";
import type { PublicListing } from "@/components/themes/types";
import { AboutText } from "./AboutText";

export function Section({ title, children, id }: { title?: string; children: React.ReactNode; id?: string }) {
  return (
    <Reveal as="section" className="ed-section ed-reveal" id={id}>
      {title && <h2 className="ed-h2">{title}</h2>}
      {children}
    </Reveal>
  );
}

export function Highlights({ data }: { data: PublicListing }) {
  if (!data.highlights.length) return null;
  return (
    <Section title="Highlights">
      <ul className="ed-highlights">
        {data.highlights.map((h, i) => (
          <li key={i}>
            <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
            <span>{h}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function About({ data }: { data: PublicListing }) {
  if (!data.description?.trim()) return null;
  return (
    <Section title="About this property">
      <AboutText text={data.description.trim()} />
    </Section>
  );
}

/** Key facts + the CP's custom feature grid, grouped by section with hairline dividers. */
export function Features({ data }: { data: PublicListing }) {
  const facts = keyFacts(data);
  const sections = data.features.filter((s) => Array.isArray(s.items) && s.items.length);
  if (!facts.length && !sections.length) return null;
  return (
    <Section title="Details">
      {facts.length > 0 && (
        <dl className="ed-facts">
          {facts.map((f) => (
            <div className="ed-fact" key={f.label}>
              <dt>{f.label}</dt>
              <dd>{f.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {sections.map((s, i) => (
        <div key={s.id ?? i}>
          <h3 className="ed-h3">{s.title}</h3>
          <dl className="ed-facts">
            {s.items.map((it, j) => (
              <div className="ed-fact" key={it.id ?? j}>
                <dt>{it.label}</dt>
                <dd>{it.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </Section>
  );
}

export function Amenities({ data }: { data: PublicListing }) {
  if (!data.amenities.length) return null;
  return (
    <Section title="Amenities">
      <ul className="ed-chips" style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {data.amenities.map((a) => (
          <li key={a} className="ed-chip">{a}</li>
        ))}
      </ul>
    </Section>
  );
}

export function Neighbourhood({ data }: { data: PublicListing }) {
  const items = data.neighbourhood.filter((n) => n && n.label);
  if (!items.length && !data.landmark) return null;
  return (
    <Section title="Neighbourhood">
      {data.landmark && <p className="ed-muted" style={{ marginBottom: "0.75rem" }}>Near {data.landmark}</p>}
      {items.length > 0 && (
        <ul className="ed-list">
          {items.map((n, i) => (
            <li key={i}>
              <span>{n.label}</span>
              <span>{n.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function MapBlock({ data }: { data: PublicListing }) {
  if (!data.mapUrl && !data.mapEmbedUrl) return null;
  return (
    <Section title="Location">
      {data.mapEmbedUrl && (
        <div className="ed-frame">
          <iframe src={data.mapEmbedUrl} title={`Map of ${data.locality ?? data.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
        </div>
      )}
      {data.mapUrl && (
        <div style={{ marginTop: "0.9rem" }}>
          <TrackedLink event="MAP_OPEN" listingId={data.id} href={data.mapUrl} target="_blank" rel="noopener" className="ed-btn ed-btn-sm">
            <MapPin size={15} aria-hidden="true" /> Open in Maps <ExternalLink size={13} aria-hidden="true" />
          </TrackedLink>
        </div>
      )}
    </Section>
  );
}

export function VideoBlock({ data }: { data: PublicListing }) {
  if (!data.videoUrl && !data.videoTourEmbedUrl && !data.videoTourUrl) return null;
  return (
    <Section title="Video walkthrough">
      {data.videoUrl ? (
        <div className="ed-frame">
          <video controls preload="metadata" playsInline src={data.videoUrl} poster={data.cover?.url} aria-label={`Video walkthrough of ${data.title}`} />
        </div>
      ) : data.videoTourEmbedUrl ? (
        <div className="ed-frame">
          <iframe src={data.videoTourEmbedUrl} title={`Video tour of ${data.title}`} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      ) : (
        <TrackedLink event="VIDEO_PLAY" listingId={data.id} href={data.videoTourUrl!} target="_blank" rel="noopener" className="ed-btn ed-btn-sm">
          Watch video tour <ExternalLink size={13} aria-hidden="true" />
        </TrackedLink>
      )}
    </Section>
  );
}

/** Uploaded documents, the generated PDF brochure and the optional requirement form. */
export function DocumentsBlock({ data }: { data: PublicListing }) {
  const docs = data.documents;
  return (
    <Section title={data.documentsTitle?.trim() || "Documents & brochure"}>
      {docs.length > 0 && (
        <div className="ed-docs" style={{ marginBottom: "1rem" }}>
          {docs.map((d) => (
            <TrackedLink key={d.id} event={documentEvent(d, docs)} listingId={data.id} meta={{ doc: d.name }} href={d.url} target="_blank" rel="noopener" className="ed-doc" download>
              <FileText size={20} aria-hidden="true" />
              <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{d.name}</span>
              <small>{formatBytes(d.sizeBytes)}</small>
            </TrackedLink>
          ))}
        </div>
      )}
      <div className="ed-chips">
        <TrackedLink event="BROCHURE_DOWNLOAD" listingId={data.id} meta={{ generated: true }} href={brochureUrl(data.id)} target="_blank" rel="noopener" className="ed-btn ed-btn-ink ed-btn-sm">
          <Download size={15} aria-hidden="true" /> Download brochure
        </TrackedLink>
        {data.formUrl && (
          <TrackedLink event="FORM_OPEN" listingId={data.id} href={data.formUrl} target="_blank" rel="noopener" className="ed-btn ed-btn-sm">
            <ClipboardList size={15} aria-hidden="true" /> Share your requirement
          </TrackedLink>
        )}
      </div>
    </Section>
  );
}
