import { MessageCircle, Phone, Clock, CalendarDays, BadgeIndianRupee } from "lucide-react";
import { TrackedLink } from "@/components/public/TrackedLink";
import { listingCtas } from "@/components/public/cta";
import type { PublicListing } from "@/components/themes/types";

/** Sticky CTA card: WhatsApp, Call, quick questions. Honours broker.card toggles. */
export function CtaCard({ data }: { data: PublicListing }) {
  const cta = listingCtas(data);
  const { card, name, responseTime } = data.broker;
  const showWa = card.showWhatsApp && Boolean(data.broker.whatsapp);
  const showCall = card.showCall && Boolean(data.broker.phone);
  return (
    <div className="ed-cta-card">
      <p className="ed-eyebrow" style={{ marginBottom: "0.75rem" }}>Talk to {card.showNamePhoto ? name : "the advisor"}</p>
      <div style={{ display: "grid", gap: "0.6rem" }}>
        {showWa && (
          <TrackedLink event="WHATSAPP_TAP" listingId={data.id} href={cta.whatsapp} target="_blank" rel="noopener" className="ed-btn ed-btn-wa ed-btn-block">
            <MessageCircle size={18} aria-hidden="true" /> WhatsApp
          </TrackedLink>
        )}
        {showCall && (
          <TrackedLink event="CALL_TAP" listingId={data.id} href={cta.call} className="ed-btn ed-btn-block">
            <Phone size={18} aria-hidden="true" /> Call
          </TrackedLink>
        )}
      </div>
      {showWa && (
        <div style={{ marginTop: "1rem" }}>
          <p className="ed-eyebrow" style={{ marginBottom: "0.5rem" }}>Quick questions</p>
          <div className="ed-chips">
            <TrackedLink event="WHATSAPP_TAP" listingId={data.id} meta={{ q: "available" }} href={cta.stillAvailable} target="_blank" rel="noopener" className="ed-quick">
              <Clock size={14} aria-hidden="true" /> Still available?
            </TrackedLink>
            <TrackedLink event="WHATSAPP_TAP" listingId={data.id} meta={{ q: "visit" }} href={cta.scheduleVisit} target="_blank" rel="noopener" className="ed-quick">
              <CalendarDays size={14} aria-hidden="true" /> Schedule a visit
            </TrackedLink>
            <TrackedLink event="WHATSAPP_TAP" listingId={data.id} meta={{ q: "price" }} href={cta.bestPrice} target="_blank" rel="noopener" className="ed-quick">
              <BadgeIndianRupee size={14} aria-hidden="true" /> Best price?
            </TrackedLink>
          </div>
        </div>
      )}
      {responseTime && <p className="ed-muted" style={{ marginTop: "0.9rem", fontSize: "0.82rem" }}>Usually replies {responseLabel(responseTime)}.</p>}
    </div>
  );
}

export function responseLabel(v: string) {
  return ({ "1h": "within an hour", same_day: "the same day", "24h": "within 24 hours", "48h": "within 48 hours" } as Record<string, string>)[v] ?? v;
}
