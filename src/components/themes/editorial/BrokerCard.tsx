import Image from "next/image";
import { MessageCircle, Phone, ArrowUpRight, Home } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { waLink, telLink } from "@/lib/site";
import { BrandMark, cardIdentity } from "@/components/themes/shared/BrandMark";
import type { PublicBroker } from "@/components/themes/types";

/** Photo, else the name's initial; a neutral home icon when the CP has no name yet (`hasName === false`). */
export function Avatar({ broker, size = "md" }: { broker: Pick<PublicBroker, "name" | "avatarUrl"> & { hasName?: boolean }; size?: "md" | "lg" }) {
  const cls = size === "lg" ? "ed-avatar ed-avatar-lg" : "ed-avatar";
  const named = broker.hasName !== false;
  const initial = broker.name.trim().charAt(0).toUpperCase() || "•";
  return (
    <div className={cls} aria-hidden={broker.avatarUrl ? undefined : true}>
      {broker.avatarUrl ? (
        <Image src={broker.avatarUrl} alt={named ? broker.name : ""} fill sizes={size === "lg" ? "112px" : "64px"} className="object-cover" />
      ) : named ? (
        <span>{initial}</span>
      ) : (
        <Home size={size === "lg" ? 40 : 24} strokeWidth={1.5} aria-hidden="true" />
      )}
    </div>
  );
}

/** "Listed by" card honouring the broker card toggles. `listingId` null on storefront/collection pages. */
export function BrokerCard({ broker, listingId, message }: { broker: PublicBroker; listingId: string | null; message: string }) {
  const { card } = broker;
  const showWa = card.showWhatsApp && Boolean(broker.whatsapp);
  const showCall = card.showCall && Boolean(broker.phone);
  const showName = card.showNamePhoto;
  const id = cardIdentity(broker);
  const sub = [id.agency, broker.city].filter(Boolean).join(" · ");
  return (
    <div className="ed-broker">
      {showName && <Avatar broker={broker} />}
      <div style={{ minWidth: 0, gridColumn: showName ? undefined : "1 / -1" }}>
        {id.eyebrow && <p className="ed-eyebrow">{id.eyebrow}</p>}
        <p className="ed-serif" style={{ fontSize: "1.4rem", marginTop: id.eyebrow ? "0.15rem" : 0 }}>{id.heading}</p>
        {(id.logoUrl || sub) && (
          <p className="ed-broker-sub">
            <BrandMark broker={broker} size="sm" logoOnly />
            {sub && <span>{sub}</span>}
          </p>
        )}
        {broker.reraNumber && <p className="ed-faint" style={{ fontSize: "0.78rem", marginTop: "0.2rem" }}>RERA {broker.reraNumber}</p>}
        <div className="ed-chips" style={{ marginTop: "0.9rem" }}>
          {showWa && (
            <TrackedLink event="WHATSAPP_TAP" listingId={listingId} meta={{ from: "broker_card" }} href={waLink(broker.whatsapp, message)} target="_blank" rel="noopener" className="ed-btn ed-btn-wa ed-btn-sm">
              <MessageCircle size={15} aria-hidden="true" /> WhatsApp
            </TrackedLink>
          )}
          {showCall && (
            <TrackedLink event="CALL_TAP" listingId={listingId} meta={{ from: "broker_card" }} href={telLink(broker.phone)} className="ed-btn ed-btn-sm">
              <Phone size={15} aria-hidden="true" /> Call
            </TrackedLink>
          )}
          {card.showProfileLink && (
            <a href={broker.siteUrl} className="ed-quick">
              View all listings <ArrowUpRight size={14} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
