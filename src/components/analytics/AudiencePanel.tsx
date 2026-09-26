import { MapPin, Clock, Repeat } from "lucide-react";
import { formatHour } from "@/lib/reports";

/** Viewer cities (coarse, from IP geolocation) + peak hour + repeat viewers. No PII. */
export function AudiencePanel({ cities, peakHour, repeatViewers }: { cities: { city: string; count: number }[]; peakHour: number | null; repeatViewers: number }) {
  const max = Math.max(1, ...cities.map((c) => c.count));
  return (
    <div className="card p-5">
      <h3 className="text-base font-medium">Audience</h3>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-[var(--radius-inner)] bg-soft p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted"><Clock size={13} aria-hidden /> Peak hour</div>
          <div className="mt-1 text-xl font-medium">{peakHour == null ? "—" : formatHour(peakHour)}</div>
          <div className="text-[11px] text-muted">{peakHour == null ? "no views yet" : "best time to share"}</div>
        </div>
        <div className="rounded-[var(--radius-inner)] bg-soft p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted"><Repeat size={13} aria-hidden /> Came back</div>
          <div className="mt-1 text-xl font-medium">{repeatViewers.toLocaleString("en-IN")}</div>
          <div className="text-[11px] text-muted">viewers with 2+ visits</div>
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted"><MapPin size={13} aria-hidden /> Viewer cities</div>
        {cities.length === 0 ? (
          <p className="mt-2 text-sm text-muted">City breakdown appears once buyers start opening your links.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {cities.map((c) => (
              <li key={c.city} className="text-sm">
                <div className="flex items-baseline justify-between">
                  <span>{c.city}</span>
                  <span className="tabular-nums text-muted">{c.count.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-soft">
                  <div className="h-full rounded-full bg-[var(--ink)]/80" style={{ width: `${Math.max(4, (c.count / max) * 100)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
