import Link from "next/link";
import { PhoneCall, FileDown } from "lucide-react";
import type { CallRow } from "@/app/dashboard/analytics/data";
import { relative } from "./format";

/** Highlighted list of named viewers worth a call: ≥2 opens or a brochure download. */
export function CallTomorrow({ rows }: { rows: CallRow[] }) {
  return (
    <div className="card border border-black/90 bg-black p-5 text-white">
      <div className="flex items-center gap-2">
        <PhoneCall size={16} aria-hidden />
        <h3 className="text-base font-medium">Call tomorrow</h3>
        <span className="ml-auto text-xs text-white/60">{rows.length ? `${rows.length} ${rows.length === 1 ? "person" : "people"}` : "none yet"}</span>
      </div>
      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-white/70">Named viewers who open a link twice or download the brochure land here. Share personalised links to fill this list.</p>
      ) : (
        <ul className="mt-3 divide-y divide-white/10">
          {rows.map((r) => (
            <li key={`${r.listingId}-${r.name}`} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{r.name}</span>
                  {r.brochure && <FileDown size={13} className="text-white/70" aria-label="Downloaded brochure" />}
                </div>
                <Link href={`/dashboard/listings/${r.listingId}`} className="block truncate text-xs text-white/60 hover:text-white hover:underline">{r.listingTitle}</Link>
              </div>
              <div className="text-right text-xs text-white/70">
                <div className="text-sm font-medium text-white">{r.opens} open{r.opens === 1 ? "" : "s"}</div>
                <div>{relative(r.lastSeen)}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
