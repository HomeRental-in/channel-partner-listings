import { MessageCircle, Phone, BadgeCheck, ArrowUpRight, Clock } from "lucide-react";
import clsx from "clsx";
import { TrackedLink } from "@/components/public/TrackedLink";
import { waLink, telLink } from "@/lib/site";
import type { PublicBroker } from "@/components/themes/types";
import { Img, btnWa, btnTeal } from "./ui";

export function Avatar({ broker, size = 64, className }: { broker: PublicBroker; size?: number; className?: string }) {
  const initials = broker.name.split(/\s+/).map((s) => s[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
  return broker.avatarUrl ? (
    <Img src={broker.avatarUrl} alt={broker.name} className={clsx("rounded-[22px] object-cover ring-4 ring-[#FFE4DB]", className)} />
  ) : (
    <div className={clsx("flex items-center justify-center rounded-[22px] bg-[#FF6B4A] font-extrabold text-white ring-4 ring-[#FFE4DB]", className)} style={{ width: size, height: size }} aria-hidden>
      {initials}
    </div>
  );
}

/** Broker card. Honours `broker.card` toggles. `big` renders the large bottom-of-page version with a big CTA. */
export function BrokerCard({ broker, listingId, waHref, callHref, big = false }: { broker: PublicBroker; listingId: string | null; waHref?: string; callHref?: string; big?: boolean }) {
  const { card } = broker;
  const wa = card.showWhatsApp && broker.whatsapp ? (waHref ?? waLink(broker.whatsapp, `Hi ${broker.name}, I found you on your property site.`)) : null;
  const call = card.showCall && broker.phone ? (callHref ?? telLink(broker.phone)) : null;
  const showIdentity = card.showNamePhoto;
  const stats = [
    broker.yearsExperience ? { v: `${broker.yearsExperience}+`, l: "yrs exp" } : null,
    broker.dealsClosed ? { v: String(broker.dealsClosed), l: "deals" } : null,
    broker.activeListings ? { v: String(broker.activeListings), l: "live" } : null,
  ].filter((s): s is { v: string; l: string } => !!s);
  return (
    <div className={clsx("flex flex-col gap-4", big && "sm:flex-row sm:items-center sm:gap-6")}>
      <div className="flex items-center gap-4">
        {showIdentity && <Avatar broker={broker} size={big ? 80 : 56} className={big ? "h-20 w-20" : "h-14 w-14"} />}
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-[.14em] text-[#C2411F]">Listed by</div>
          <div className={clsx("truncate font-extrabold text-[#123F3A]", big ? "text-2xl" : "text-base")}>{showIdentity ? broker.name : "Channel Partner"}</div>
          {card.showAgency && broker.agencyName && <div className="truncate text-sm text-[#2D5751]">{broker.agencyName}</div>}
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6E8A85]">
            {broker.reraNumber && <span className="inline-flex items-center gap-1"><BadgeCheck size={12} className="text-[#FF6B4A]" /> RERA {broker.reraNumber}</span>}
            {broker.responseTime && <span className="inline-flex items-center gap-1"><Clock size={12} /> Replies {broker.responseTime}</span>}
          </div>
          {big && stats.length > 0 && (
            <dl className="mt-2 flex gap-2">
              {stats.map((s) => (
                <div key={s.l} className="rounded-full bg-[#F1E6D8] px-3 py-1 text-xs"><dd className="inline font-extrabold">{s.v}</dd> <dt className="inline text-[#2D5751]">{s.l}</dt></div>
              ))}
            </dl>
          )}
        </div>
      </div>
      <div className={clsx("flex flex-col gap-2", big && "sm:ml-auto sm:min-w-64")}>
        {(wa || call) && (
          <div className="flex gap-2">
            {wa && (
              <TrackedLink event="WHATSAPP_TAP" listingId={listingId} href={wa} target="_blank" rel="noopener noreferrer" className={clsx(btnWa, "flex-1", big && "py-4 text-base")}>
                <MessageCircle size={18} /> WhatsApp
              </TrackedLink>
            )}
            {call && (
              <TrackedLink event="CALL_TAP" listingId={listingId} href={call} className={clsx(btnTeal, "flex-1", big && "py-4 text-base")}>
                <Phone size={18} /> Call
              </TrackedLink>
            )}
          </div>
        )}
        {card.showProfileLink && (
          <a href={broker.siteUrl} className="inline-flex items-center gap-1 self-start text-sm font-bold text-[#FF6B4A] hover:text-[#C2411F] sm:self-center">
            View all properties <ArrowUpRight size={14} />
          </a>
        )}
      </div>
    </div>
  );
}
