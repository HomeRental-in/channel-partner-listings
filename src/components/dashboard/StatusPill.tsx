import clsx from "clsx";

export type ListingStatusKey = "DRAFT" | "LIVE" | "SOLD" | "RENTED" | "ARCHIVED";

const STYLE: Record<ListingStatusKey, string> = {
  DRAFT: "bg-amber-100 text-amber-900",
  LIVE: "bg-emerald-100 text-emerald-800",
  SOLD: "bg-black text-white",
  RENTED: "bg-sky-100 text-sky-900",
  ARCHIVED: "bg-black/10 text-black/60",
};
const LABEL: Record<ListingStatusKey, string> = { DRAFT: "Draft", LIVE: "Live", SOLD: "Sold", RENTED: "Rented", ARCHIVED: "Archived" };

export function StatusPill({ status, className }: { status: ListingStatusKey; className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", STYLE[status], className)}>
      {status === "LIVE" && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />}
      {LABEL[status]}
    </span>
  );
}
