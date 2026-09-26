import { Sun } from "lucide-react";

/** Renders a DailyReport payload defensively: prefers `lines`/`summary`, falls back to primitive key/values. */
export function DailyReportCard({ payload, dateLabel }: { payload: unknown; dateLabel: string }) {
  const p = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const lines: string[] = Array.isArray(p.lines) ? p.lines.filter((x): x is string => typeof x === "string") : [];
  const summary = typeof p.summary === "string" ? p.summary : typeof p.text === "string" ? p.text : null;
  const kv = Object.entries(p).filter(([k, v]) => !["lines", "summary", "text", "link", "url"].includes(k) && (typeof v === "number" || typeof v === "string" || typeof v === "boolean"));
  const link = typeof p.link === "string" ? p.link : typeof p.url === "string" ? p.url : null;

  return (
    <section className="card p-5 md:p-6 border border-amber-200 bg-amber-50/40">
      <div className="flex items-center gap-2 mb-2">
        <Sun size={18} className="text-amber-600" />
        <h2 className="text-lg">Today&apos;s report</h2>
        <span className="ml-auto text-xs text-muted">{dateLabel}</span>
      </div>
      {summary && <p className="text-[15px] whitespace-pre-line leading-relaxed">{summary}</p>}
      {lines.length > 0 && (
        <ul className="mt-1 flex flex-col gap-1 text-[15px]">
          {lines.map((l, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-muted">•</span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
      )}
      {!summary && lines.length === 0 && kv.length > 0 && (
        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
          {kv.map(([k, v]) => (
            <div key={k} className="rounded-xl bg-white/70 p-3">
              <dt className="text-xs text-muted capitalize">{k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}</dt>
              <dd className="text-lg font-medium tabular-nums">{String(v)}</dd>
            </div>
          ))}
        </dl>
      )}
      {link && (
        <a href={link} className="mt-3 inline-block text-sm underline">
          Open details
        </a>
      )}
    </section>
  );
}
