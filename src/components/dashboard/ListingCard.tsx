"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, Eye, EyeOff, ImageOff, MoreHorizontal, Palette, Pencil, Share2, Trash2 } from "lucide-react";
import type { ListingStatus, Theme } from "@prisma/client";
import { deleteListing, setListingHidden, setListingStatus, setListingTheme } from "@/app/dashboard/listings/actions";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { THEMES } from "@/lib/types";
import { StatusPill } from "./StatusPill";
import { ShareModal } from "./ShareModal";

export type ListingCardData = {
  id: string;
  slug: string;
  title: string;
  priceDisplay: string;
  locality: string | null;
  city: string | null;
  bhk: string | null;
  propertyType: string | null;
  status: ListingStatus;
  theme: Theme | null;
  hidden: boolean;
  cover: string | null;
  photoCount: number;
  views: number;
  updatedAt: string;
};

export function ListingCard({ listing, username, defaultTheme }: { listing: ListingCardData; username: string | null; defaultTheme: Theme }) {
  const [share, setShare] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [menu, setMenu] = useState<"status" | "more" | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menu) return;
    const onDoc = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenu(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  function run(fn: () => Promise<{ ok: boolean; error?: string }>, okMsg: string) {
    setMenu(null);
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(okMsg);
      else toast.error(r.error ?? "Something went wrong");
    });
  }

  const subtitle = [listing.locality ?? listing.city, listing.bhk ?? listing.propertyType].filter(Boolean).join(" · ");
  const isDraft = listing.status === "DRAFT";

  return (
    <article className={clsx("card overflow-hidden flex flex-col", pending && "opacity-60")}>
      <Link href={`/dashboard/listings/${listing.id}`} className="relative block aspect-[4/3] bg-soft">
        {listing.cover ? <Image src={listing.cover} alt="" fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized /> : <ImageOff size={28} className="absolute inset-0 m-auto text-muted" />}
        <div className="absolute left-3 top-3 flex gap-1.5">
          <StatusPill status={listing.status} />
          {listing.hidden && (
            <span className="inline-flex items-center gap-1 rounded-full bg-black/70 text-white px-2 py-0.5 text-[11px]">
              <EyeOff size={11} /> Hidden
            </span>
          )}
        </div>
        {listing.photoCount > 0 && <span className="absolute right-3 bottom-3 rounded-full bg-black/60 text-white px-2 py-0.5 text-[11px]">{listing.photoCount} photos</span>}
      </Link>

      <div className="p-4 flex flex-col gap-1 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-lg font-medium">{listing.priceDisplay}</p>
          <span className="inline-flex items-center gap-1 text-xs text-muted tabular-nums" title="Views">
            <Eye size={13} /> {listing.views}
          </span>
        </div>
        <Link href={`/dashboard/listings/${listing.id}`} className="font-medium leading-snug line-clamp-2 hover:underline">
          {listing.title || "Untitled listing"}
        </Link>
        {subtitle && <p className="text-sm text-muted truncate">{subtitle}</p>}
      </div>

      <div ref={menuRef} className="relative flex items-center gap-1.5 border-t border-line px-3 py-2.5">
        <button type="button" onClick={() => setShare(true)} disabled={isDraft} className="btn btn-light !py-2 !px-3 text-sm disabled:opacity-40" title={isDraft ? "Publish first to share" : "Share"}>
          <Share2 size={15} /> Share
        </button>
        <Link href={`/dashboard/listings/${listing.id}`} className="btn btn-light !py-2 !px-3 text-sm">
          <Pencil size={15} /> Edit
        </Link>
        <button type="button" onClick={() => setMenu(menu === "status" ? null : "status")} className="btn btn-ghost !py-2 !px-3 text-sm ml-auto" aria-haspopup="menu" aria-expanded={menu === "status"}>
          {isDraft ? "Publish" : listing.status === "LIVE" ? "Live" : listing.status === "SOLD" ? "Sold" : listing.status === "RENTED" ? "Rented" : "Status"} <ChevronDown size={14} />
        </button>
        <button type="button" onClick={() => setMenu(menu === "more" ? null : "more")} className="icon-btn !w-9 !h-9" aria-label="More actions" aria-haspopup="menu" aria-expanded={menu === "more"}>
          <MoreHorizontal size={16} />
        </button>

        {menu === "status" && (
          <Menu>
            {(["LIVE", "SOLD", "RENTED"] as const).map((s) => (
              <MenuItem key={s} active={listing.status === s} onClick={() => run(() => setListingStatus(listing.id, s), s === "LIVE" ? "Listing is live" : `Marked as ${s.toLowerCase()}`)}>
                {s === "LIVE" ? "Live" : s === "SOLD" ? "Sold" : "Rented"}
              </MenuItem>
            ))}
          </Menu>
        )}
        {menu === "more" && (
          <Menu>
            <MenuItem onClick={() => run(() => setListingHidden(listing.id, !listing.hidden), listing.hidden ? "Shown on storefront" : "Hidden from storefront")}>
              {listing.hidden ? <Eye size={15} /> : <EyeOff size={15} />} {listing.hidden ? "Show on storefront" : "Hide from storefront"}
            </MenuItem>
            <div className="px-3 pt-2 pb-1 text-[11px] uppercase tracking-wider text-muted flex items-center gap-1">
              <Palette size={12} /> Theme
            </div>
            <MenuItem active={listing.theme === null} onClick={() => run(() => setListingTheme(listing.id, null), "Theme follows your default")}>
              Default ({THEMES.find((t) => t.key === defaultTheme)?.name})
            </MenuItem>
            {THEMES.map((t) => (
              <MenuItem key={t.key} active={listing.theme === t.key} onClick={() => run(() => setListingTheme(listing.id, t.key), `Theme set to ${t.name}`)}>
                {t.name}
              </MenuItem>
            ))}
            <div className="my-1 border-t border-line" />
            <MenuItem danger onClick={() => { setMenu(null); setConfirm(true); }}>
              <Trash2 size={15} /> Delete
            </MenuItem>
          </Menu>
        )}
      </div>

      {!isDraft && <ShareModal listing={{ id: listing.id, slug: listing.slug, title: listing.title, priceDisplay: listing.priceDisplay }} username={username} open={share} onClose={() => setShare(false)} />}
      <ConfirmDialog
        open={confirm}
        onClose={() => setConfirm(false)}
        onConfirm={() => { setConfirm(false); run(() => deleteListing(listing.id), "Listing deleted"); }}
        title="Delete this listing?"
        description="Photos, documents and analytics for this listing will be removed. Shared links will stop working. This cannot be undone."
        confirmLabel="Delete listing"
        danger
      />
    </article>
  );
}

function Menu({ children }: { children: React.ReactNode }) {
  return (
    <div role="menu" className="absolute right-3 bottom-[calc(100%-4px)] z-20 w-56 card border border-line p-1.5 shadow-xl">
      {children}
    </div>
  );
}
function MenuItem({ children, onClick, active, danger }: { children: React.ReactNode; onClick: () => void; active?: boolean; danger?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} className={clsx("flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm", active ? "bg-black text-white" : danger ? "text-red-600 hover:bg-red-50" : "hover:bg-soft")}>
      {children}
    </button>
  );
}
