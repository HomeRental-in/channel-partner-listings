import Image from "next/image";
import type { StorefrontListingCard } from "@/components/themes/types";
import { localityLine, summaryLine, TRANSACTION_LABEL, STATUS_LABEL } from "@/components/themes/shared/helpers";

/** Storefront / collection card: cover, price, title, locality. */
export function ListingCard({ l }: { l: StorefrontListingCard }) {
  const status = STATUS_LABEL[l.status];
  return (
    <a href={l.url} className="ed-card">
      <div className="ed-card-img">
        {l.cover ? <Image src={l.cover.url} alt={l.title} fill sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw" className="object-cover" /> : <span className="ed-serif-i ed-faint" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>No photo yet</span>}
        {(status || l.urgencyBadge) && (
          <span className={`ed-badge ${status ? "" : "ed-badge-soft"}`} style={{ position: "absolute", left: "0.75rem", top: "0.75rem" }}>{status ?? l.urgencyBadge}</span>
        )}
      </div>
      <div className="ed-card-price">{l.priceDisplay}{l.transaction !== "SALE" && <span className="ed-faint" style={{ fontSize: "0.9rem", fontFamily: "var(--ed-sans)" }}> · {TRANSACTION_LABEL[l.transaction]}</span>}</div>
      <div className="ed-card-title">{l.title || "Untitled listing"}</div>
      <div className="ed-card-meta">{[summaryLine({ bhk: l.bhk, areaSqft: l.areaSqft, areaLabel: null, propertyType: null }), localityLine(l)].filter(Boolean).join(" — ")}</div>
    </a>
  );
}
