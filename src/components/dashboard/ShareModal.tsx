"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Check, Copy, Download, FileText, Image as ImageIcon, MessageCircle, Share2, Sparkles, Video } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { listingUrl, waLink } from "@/lib/site";
import { copyText } from "./CopyButton";

export type ShareModalListing = { id: string; slug: string; title: string; priceDisplay: string };

export type ShareModalProps = {
  listing: ShareModalListing;
  username: string | null;
  open: boolean;
  onClose: () => void;
};

function shareText(l: ShareModalListing, url: string, name?: string) {
  const hi = name ? `Hi ${name}, ` : "";
  return `${hi}${l.title}\n${l.priceDisplay}\n${url}`;
}

/** Share options for a listing: copy, WhatsApp, personalise (?n=), PDF brochure, story image, story video. */
export function ShareModal({ listing, username, open, onClose }: ShareModalProps) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [copied, setCopied] = useState<string | null>(null);
  const url = useMemo(() => listingUrl(username, listing.slug), [username, listing.slug]);
  const personal = name.trim() ? listingUrl(username, listing.slug, name) : null;

  async function copy(key: string, text: string) {
    if (await copyText(text)) {
      setCopied(key);
      toast.success("Copied");
      setTimeout(() => setCopied(null), 1500);
    } else toast.error("Could not copy");
  }

  return (
    <Dialog open={open} onClose={onClose} title="Share listing" description={listing.title} size="md">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 rounded-2xl bg-soft p-2 pl-4">
          <span className="flex-1 truncate text-sm text-black/70">{url}</span>
          <button type="button" onClick={() => copy("link", url)} className="btn btn-dark !py-2 !px-3.5 text-sm">
            {copied === "link" ? <Check size={15} /> : <Copy size={15} />} Copy link
          </button>
        </div>
        <Row icon={<MessageCircle size={18} />} title="Share on WhatsApp" hint="Opens WhatsApp with the title, price and link" href={waLink(null, shareText(listing, url))} external />

        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center gap-2">
            <Sparkles size={18} />
            <div>
              <p className="text-sm font-medium">Personalise for a buyer</p>
              <p className="text-xs text-muted">The page greets them by name; you see who opened it.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            <Input placeholder="Buyer's first name, e.g. Rahul" value={name} onChange={(e) => setName(e.target.value)} maxLength={30} wrapperClassName="flex-1" />
            <div className="flex gap-2">
              <button type="button" disabled={!personal} onClick={() => personal && copy("personal", personal)} className="btn btn-light !py-2.5 !px-4 text-sm disabled:opacity-40">
                {copied === "personal" ? <Check size={15} /> : <Copy size={15} />} Copy
              </button>
              <a
                href={personal ? waLink(null, shareText(listing, personal, name.trim())) : undefined}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!personal}
                className={`btn btn-wa !py-2.5 !px-4 text-sm ${!personal ? "opacity-40 pointer-events-none" : ""}`}
              >
                <MessageCircle size={15} /> WhatsApp
              </a>
            </div>
          </div>
          {personal && <p className="mt-2 truncate text-xs text-muted">{personal}</p>}
        </div>

        <Row icon={<FileText size={18} />} title="Download PDF brochure" hint="Branded A4 brochure with photos and your contact card" href={`/api/listings/${listing.id}/brochure.pdf`} external download />
        <Row icon={<ImageIcon size={18} />} title="Story image" hint="1080×1920 PNG for WhatsApp status and Instagram" href={`/api/listings/${listing.id}/story.png`} external download />
        <Row icon={<Video size={18} />} title="Story video" hint="Build a short slideshow video from the photos" href={`/dashboard/listings/${listing.id}/story`} />
      </div>
    </Dialog>
  );
}

function Row({ icon, title, hint, href, external, download }: { icon: React.ReactNode; title: string; hint: string; href: string; external?: boolean; download?: boolean }) {
  const cls = "flex items-center gap-3 rounded-2xl border border-line p-3.5 hover:bg-soft transition-colors";
  const inner = (
    <>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-soft">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      {download ? <Download size={16} className="text-muted" /> : <Share2 size={16} className="text-muted" />}
    </>
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}

/** Convenience: a button that opens the ShareModal. */
export function ShareTrigger({ listing, username, className = "btn btn-light !py-2 !px-3.5 text-sm", children }: { listing: ShareModalListing; username: string | null; className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        {children ?? (
          <>
            <Share2 size={15} /> Share
          </>
        )}
      </button>
      <ShareModal listing={listing} username={username} open={open} onClose={() => setOpen(false)} />
    </>
  );
}
