import { MessageCircle, Phone } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { listingCtas } from "@/components/public/cta";
import type { PublicListing } from "@/components/themes/types";

/** Sticky bottom bar on phones: price + WhatsApp + Call. Hidden on desktop by CSS. */
export function MobileBar({ data }: { data: PublicListing }) {
  const cta = listingCtas(data);
  const { card } = data.broker;
  const showWa = card.showWhatsApp && Boolean(data.broker.whatsapp);
  const showCall = card.showCall && Boolean(data.broker.phone);
  if (!showWa && !showCall) return null;
  return (
    <div className="ed-mobile-bar" role="region" aria-label="Contact">
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ed-serif" style={{ fontSize: "1.25rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{data.priceDisplay}</div>
        {data.perSqft && <div className="ed-faint" style={{ fontSize: "0.72rem" }}>₹{data.perSqft.toLocaleString("en-IN")}/sq ft</div>}
      </div>
      {showCall && (
        <TrackedLink event="CALL_TAP" listingId={data.id} meta={{ from: "mobile_bar" }} href={cta.call} className="ed-btn ed-btn-sm" aria-label="Call">
          <Phone size={16} aria-hidden="true" /> Call
        </TrackedLink>
      )}
      {showWa && (
        <TrackedLink event="WHATSAPP_TAP" listingId={data.id} meta={{ from: "mobile_bar" }} href={cta.whatsapp} target="_blank" rel="noopener" className="ed-btn ed-btn-wa ed-btn-sm">
          <MessageCircle size={16} aria-hidden="true" /> WhatsApp
        </TrackedLink>
      )}
    </div>
  );
}
