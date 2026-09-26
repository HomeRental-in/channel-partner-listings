import { MessageCircle, Phone, Download, ClipboardList, CheckCircle2, CalendarDays, BadgeIndianRupee } from "lucide-react";
import clsx from "clsx";
import { TrackedLink } from "@/components/public/TrackedLink";
import { ShareButton } from "@/components/public/ShareButton";
import { listingCtas } from "@/components/public/cta";
import type { PublicListing } from "@/components/themes/types";
import { btnWa, btnTeal, btnSoft, btnCoral } from "./ui";

export function canWhatsApp(l: PublicListing) { return l.broker.card.showWhatsApp && !!l.broker.whatsapp; }
export function canCall(l: PublicListing) { return l.broker.card.showCall && !!l.broker.phone; }

/** WhatsApp + Call. */
export function PrimaryCtas({ data, size = "md", className }: { data: PublicListing; size?: "md" | "lg"; className?: string }) {
  const c = listingCtas(data);
  const big = size === "lg" ? "py-4 text-base" : "";
  const wa = canWhatsApp(data), call = canCall(data);
  if (!wa && !call) return null;
  return (
    <div className={clsx("flex gap-2", className)}>
      {wa && (
        <TrackedLink event="WHATSAPP_TAP" listingId={data.id} href={c.whatsapp} target="_blank" rel="noopener noreferrer" className={clsx(btnWa, "flex-1", big)}>
          <MessageCircle size={18} /> WhatsApp
        </TrackedLink>
      )}
      {call && (
        <TrackedLink event="CALL_TAP" listingId={data.id} href={c.call} className={clsx(btnTeal, "flex-1", big)}>
          <Phone size={18} /> Call
        </TrackedLink>
      )}
    </div>
  );
}

/** Bento tile: "Chat on WhatsApp". Returns null when WhatsApp is hidden for this listing. */
export function WhatsAppTile({ data }: { data: PublicListing }) {
  if (!canWhatsApp(data)) return null;
  const c = listingCtas(data);
  return (
    <TrackedLink event="WHATSAPP_TAP" listingId={data.id} href={c.whatsapp} target="_blank" rel="noopener noreferrer"
      className="sr-press flex h-full w-full flex-col justify-between bg-[#25D366] p-4 text-[#052B14] hover:bg-[#2EE374]">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/60"><MessageCircle size={20} /></span>
      <span>
        <span className="block text-[11px] font-bold uppercase tracking-wider opacity-70">Chat now</span>
        <span className="block text-lg font-extrabold leading-tight">on WhatsApp</span>
      </span>
    </TrackedLink>
  );
}

/** Still available? / Schedule a visit / Best price? — pill buttons. */
export function QuickQuestions({ data, className }: { data: PublicListing; className?: string }) {
  if (!canWhatsApp(data)) return null;
  const c = listingCtas(data);
  const items = [
    { label: "Still available?", href: c.stillAvailable, Icon: CheckCircle2, q: "still_available" },
    { label: "Schedule a visit", href: c.scheduleVisit, Icon: CalendarDays, q: "schedule_visit" },
    { label: "Best price?", href: c.bestPrice, Icon: BadgeIndianRupee, q: "best_price" },
  ];
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      {items.map(({ label, href, Icon, q }) => (
        <TrackedLink key={q} event="WHATSAPP_TAP" listingId={data.id} meta={{ quick: q }} href={href} target="_blank" rel="noopener noreferrer" className={clsx(btnSoft, "text-[13px]")}>
          <Icon size={16} className="text-[#FF6B4A]" /> {label}
        </TrackedLink>
      ))}
    </div>
  );
}

/** Brochure, share, requirement form. */
export function SecondaryActions({ data, className }: { data: PublicListing; className?: string }) {
  const c = listingCtas(data);
  const quiet = "sr-press inline-flex items-center gap-1.5 rounded-full border-2 border-[#123F3A]/10 bg-white px-4 py-2 text-xs font-bold text-[#123F3A] hover:border-[#123F3A]/30";
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      <TrackedLink event="BROCHURE_DOWNLOAD" listingId={data.id} href={`/api/listings/${data.id}/brochure.pdf`} target="_blank" rel="noopener" className={quiet}>
        <Download size={14} /> Brochure PDF
      </TrackedLink>
      <ShareButton url={data.url} title={data.title} text={c.share} listingId={data.id} className={quiet} />
      {data.formUrl && (
        <TrackedLink event="FORM_OPEN" listingId={data.id} href={data.formUrl} target="_blank" rel="noopener noreferrer" className={quiet}>
          <ClipboardList size={14} /> Share your requirement
        </TrackedLink>
      )}
    </div>
  );
}

/** Coral requirement-form button used in the body. */
export function FormButton({ data }: { data: PublicListing }) {
  if (!data.formUrl) return null;
  return (
    <TrackedLink event="FORM_OPEN" listingId={data.id} href={data.formUrl} target="_blank" rel="noopener noreferrer" className={btnCoral}>
      <ClipboardList size={18} /> Share your requirement
    </TrackedLink>
  );
}
