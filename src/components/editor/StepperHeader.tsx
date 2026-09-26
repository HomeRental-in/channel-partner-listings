"use client";
import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "./schema";

export type EditorStep = "photos" | "details" | "done";
export type ListingStatus = "DRAFT" | "LIVE" | "SOLD" | "RENTED" | "ARCHIVED";
const STEPS: { key: EditorStep; label: string }[] = [
  { key: "photos", label: "Photos" },
  { key: "details", label: "Details" },
  { key: "done", label: "Done" },
];
const PILL: Record<ListingStatus, string> = { DRAFT: "bg-amber-100 text-amber-800", LIVE: "bg-green-100 text-green-800", SOLD: "bg-slate-200 text-slate-700", RENTED: "bg-slate-200 text-slate-700", ARCHIVED: "bg-slate-100 text-slate-500" };

/** Editor header: title, price, status pill, Live/Sold/Rented toggle, "View public page", 3-step nav. */
export function StepperHeader({ listingId, title, priceDisplay, status, step, publicUrl, transaction, setStatus }: { listingId: string; title: string; priceDisplay: string; status: ListingStatus; step: EditorStep; publicUrl: string; transaction: "SALE" | "RENT" | "LEASE"; setStatus: (status: "LIVE" | "SOLD" | "RENTED") => Promise<ActionResult> }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  const closed = transaction === "SALE" ? "SOLD" : "RENTED";
  const change = (s: "LIVE" | "SOLD" | "RENTED") =>
    start(async () => {
      const r = await setStatus(s);
      if (r.ok) router.refresh();
      else alert(r.error);
    });

  return (
    <header className="card p-4 md:p-6 space-y-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Link href="/dashboard/listings" className="text-sm text-muted hover:text-ink">
              ← My listings
            </Link>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PILL[status]}`}>{status === "DRAFT" ? "Draft" : status[0] + status.slice(1).toLowerCase()}</span>
          </div>
          <h1 className="text-2xl md:text-3xl mt-1 truncate">{title || "Untitled listing"}</h1>
          <p className="text-muted">{priceDisplay}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {status !== "DRAFT" && (
            <div className="inline-flex rounded-full bg-bg p-1 text-sm">
              {(["LIVE", closed] as const).map((s) => (
                <button key={s} type="button" disabled={pending} onClick={() => change(s)} className={`px-3 py-1.5 rounded-full transition-colors ${status === s ? "bg-ink text-white" : "hover:bg-white"}`}>
                  {s === "LIVE" ? "Live" : s === "SOLD" ? "Sold" : "Rented"}
                </button>
              ))}
            </div>
          )}
          <a href={publicUrl} target="_blank" rel="noreferrer" className="btn btn-light !py-2.5 text-sm">
            View public page ↗
          </a>
        </div>
      </div>
      <nav className="flex gap-1 bg-bg rounded-full p-1 w-full sm:w-auto">
        {STEPS.map((s, i) => (
          <Link key={s.key} href={`/dashboard/listings/${listingId}?step=${s.key}`} className={`flex-1 sm:flex-none text-center px-4 py-2 rounded-full text-sm transition-colors ${step === s.key ? "bg-white shadow-sm font-medium" : "text-muted hover:text-ink"}`}>
            <span className="text-xs mr-1.5 opacity-60">{i + 1}</span>
            {s.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
