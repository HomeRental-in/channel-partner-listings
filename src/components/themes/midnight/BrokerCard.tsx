import { MessageCircle, Phone, BadgeCheck, ArrowUpRight, Clock } from "lucide-react";
import clsx from "clsx";
import { TrackedLink } from "@/components/public/TrackedLink";
import { waLink, telLink } from "@/lib/site";
import type { PublicBroker } from "@/components/themes/types";
import { Img, btnWa, btnGhost } from "./ui";

export function Avatar({ broker, size = 56, className }: { broker: PublicBroker; size?: number; className?: string }) {
  const initials = broker.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return broker.avatarUrl ? (
    <Img src={broker.avatarUrl} alt={broker.name} className={clsx("rounded-full object-cover ring-2 ring-[#7C5CFF]/50", className)} />
  ) : (
    <div className={clsx("flex items-center justify-center rounded-full bg-gradient-to-br from-[#7C5CFF] to-[#22D3EE] font-bold text-white", className)} style={{ width: size, height: size }} aria-hidden>
      {initials}
    </div>
  );
}

/**
 * Broker card for the listing page. Honours `broker.card` toggles.
 * `listingId` scopes the tap events; `waText` is the prefilled message.
 */
export function BrokerCard({ broker, listingId, waHref, callHref, compact = false }: { broker: PublicBroker; listingId: string | null; waHref?: string; callHref?: string; compact?: boolean }) {
  const { card } = broker;
  const wa = card.showWhatsApp && broker.whatsapp ? (waHref ?? waLink(broker.whatsapp, `Hi ${broker.name}, I found you on your property site.`)) : null;
  const call = card.showCall && broker.phone ? (callHref ?? telLink(broker.phone)) : null;
  const showIdentity = card.showNamePhoto;
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        {showIdentity && <Avatar broker={broker} size={compact ? 44 : 56} className={compact ? "h-11 w-11" : "h-14 w-14"} />}
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[.18em] text-[#7C5CFF]">Listed by</div>
          <div className="truncate text-base font-semibold text-white">{showIdentity ? broker.name : "Channel Partner"}</div>
          {card.showAgency && broker.agencyName && <div className="truncate text-sm text-[#A9AFBC]">{broker.agencyName}</div>}
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#7D8391]">
            {broker.reraNumber && <span className="inline-flex items-center gap-1"><BadgeCheck size={12} className="text-[#22D3EE]" /> RERA {broker.reraNumber}</span>}
            {broker.responseTime && <span className="inline-flex items-center gap-1"><Clock size={12} /> Replies {broker.responseTime}</span>}
          </div>
        </div>
      </div>
      {!compact && (broker.yearsExperience || broker.dealsClosed || broker.activeListings) ? (
        <dl className="grid grid-cols-3 gap-2 text-center">
          {broker.yearsExperience ? <Stat v={`${broker.yearsExperience}+`} l="yrs exp" /> : null}
          {broker.dealsClosed ? <Stat v={String(broker.dealsClosed)} l="deals" /> : null}
          {broker.activeListings ? <Stat v={String(broker.activeListings)} l="live" /> : null}
        </dl>
      ) : null}
      {(wa || call) && (
        <div className="flex gap-2">
          {wa && (
            <TrackedLink event="WHATSAPP_TAP" listingId={listingId} href={wa} target="_blank" rel="noopener noreferrer" className={clsx(btnWa, "flex-1")}>
              <MessageCircle size={18} /> WhatsApp
            </TrackedLink>
          )}
          {call && (
            <TrackedLink event="CALL_TAP" listingId={listingId} href={call} className={clsx(btnGhost, "flex-1")}>
              <Phone size={18} /> Call
            </TrackedLink>
          )}
        </div>
      )}
      {card.showProfileLink && (
        <a href={broker.siteUrl} className="inline-flex items-center gap-1 self-start text-sm font-medium text-[#C4B5FF] hover:text-white">
          View all properties <ArrowUpRight size={14} />
        </a>
      )}
    </div>
  );
}

function Stat({ v, l }: { v: string; l: string }) {
  return (
    <div className="rounded-lg border border-white/5 bg-[#0F1216] px-2 py-2">
      <dd className="text-lg font-bold text-white">{v}</dd>
      <dt className="text-[10px] uppercase tracking-wider text-[#7D8391]">{l}</dt>
    </div>
  );
}
