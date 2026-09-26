import { MessageCircle, Phone, Download, ClipboardList, CheckCircle2, CalendarDays, BadgeIndianRupee } from "lucide-react";
import clsx from "clsx";
import { TrackedLink } from "@/components/public/TrackedLink";
import { ShareButton } from "@/components/public/ShareButton";
import { listingCtas } from "@/components/public/cta";
import type { PublicListing } from "@/components/themes/types";
import { btnWa, btnGhost, btnAccent, btnQuiet } from "./ui";

export function canWhatsApp(l: PublicListing) { return l.broker.card.showWhatsApp && !!l.broker.whatsapp; }
export function canCall(l: PublicListing) { return l.broker.card.showCall && !!l.broker.phone; }

/** WhatsApp (glowing) + Call. */
export function PrimaryCtas({ data, size = "md", className }: { data: PublicListing; size?: "md" | "lg"; className?: string }) {
  const c = listingCtas(data);
  const big = size === "lg" ? "py-3.5 text-base" : "";
  const wa = canWhatsApp(data), call = canCall(data);
  if (!wa && !call) return null;
  return (
    <div className={clsx("flex gap-2", className)}>
      {wa && (
        <TrackedLink event="WHATSAPP_TAP" listingId={data.id} href={c.whatsapp} target="_blank" rel="noopener noreferrer" className={clsx(btnWa, "mn-glow flex-1", big)}>
          <MessageCircle size={18} /> WhatsApp
        </TrackedLink>
      )}
      {call && (
        <TrackedLink event="CALL_TAP" listingId={data.id} href={c.call} className={clsx(btnGhost, wa ? "flex-1" : "flex-1", big)}>
          <Phone size={18} /> Call
        </TrackedLink>
      )}
    </div>
  );
}

/** Still available? / Schedule a visit / Best price? */
export function QuickQuestions({ data, layout = "col", className }: { data: PublicListing; layout?: "col" | "row"; className?: string }) {
  if (!canWhatsApp(data)) return null;
  const c = listingCtas(data);
  const items = [
    { label: "Still available?", href: c.stillAvailable, Icon: CheckCircle2, q: "still_available" },
    { label: "Schedule a visit", href: c.scheduleVisit, Icon: CalendarDays, q: "schedule_visit" },
    { label: "Best price?", href: c.bestPrice, Icon: BadgeIndianRupee, q: "best_price" },
  ];
  return (
    <div className={clsx(layout === "col" ? "flex flex-col gap-2" : "flex flex-wrap gap-2", className)}>
      {items.map(({ label, href, Icon, q }) => (
        <TrackedLink key={q} event="WHATSAPP_TAP" listingId={data.id} meta={{ quick: q }} href={href} target="_blank" rel="noopener noreferrer"
          className={clsx(btnGhost, "justify-start text-[13px]", layout === "row" && "flex-1 justify-center")}>
          <Icon size={16} className="text-[#25D366]" /> {label}
        </TrackedLink>
      ))}
    </div>
  );
}

/** Brochure, share, requirement form. */
export function SecondaryActions({ data, className }: { data: PublicListing; className?: string }) {
  const c = listingCtas(data);
  return (
    <div className={clsx("flex flex-wrap gap-2", className)}>
      <TrackedLink event="BROCHURE_DOWNLOAD" listingId={data.id} href={`/api/listings/${data.id}/brochure.pdf`} target="_blank" rel="noopener" className={btnQuiet}>
        <Download size={14} /> Brochure PDF
      </TrackedLink>
      <ShareButton url={data.url} title={data.title} text={c.share} listingId={data.id} className={btnQuiet} />
      {data.formUrl && (
        <TrackedLink event="FORM_OPEN" listingId={data.id} href={data.formUrl} target="_blank" rel="noopener noreferrer" className={btnQuiet}>
          <ClipboardList size={14} /> Share your requirement
        </TrackedLink>
      )}
    </div>
  );
}

/** Accent-coloured requirement form button used in the body. */
export function FormButton({ data }: { data: PublicListing }) {
  if (!data.formUrl) return null;
  return (
    <TrackedLink event="FORM_OPEN" listingId={data.id} href={data.formUrl} target="_blank" rel="noopener noreferrer" className={btnAccent}>
      <ClipboardList size={18} /> Share your requirement
    </TrackedLink>
  );
}
