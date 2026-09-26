"use client";

/** Listing Quality meter: score 0-100 + hints from `qualityScore()` (server computed, refreshed on save). */
export function QualityMeter({ score, hints, compact = false }: { score: number; hints: string[]; compact?: boolean }) {
  const tone = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Needs work" : "Just started";
  const color = score >= 80 ? "#16a34a" : score >= 60 ? "#0ea5e9" : score >= 40 ? "#f59e0b" : "#ef4444";
  return (
    <div className={`card ${compact ? "p-4" : "p-5 md:p-6"} space-y-3`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="eyebrow">Listing quality</span>
          <div className="text-2xl md:text-3xl font-medium leading-none mt-1">
            {score}
            <span className="text-base text-muted">/100</span>
            <span className="text-sm ml-2 font-normal" style={{ color }}>
              {tone}
            </span>
          </div>
        </div>
        <div className="relative w-14 h-14 shrink-0" aria-hidden>
          <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--line)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke={color} strokeWidth="3" strokeDasharray={`${(score / 100) * 97.4} 97.4`} strokeLinecap="round" />
          </svg>
        </div>
      </div>
      <div className="h-1.5 rounded-full bg-line overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${score}%`, background: color }} />
      </div>
      {hints.length > 0 ? (
        <ul className="text-sm space-y-1">
          {hints.slice(0, compact ? 3 : 6).map((h) => (
            <li key={h} className="flex gap-2">
              <span className="text-muted">•</span>
              {h}
            </li>
          ))}
          {compact && hints.length > 3 && <li className="text-xs text-muted">+{hints.length - 3} more</li>}
        </ul>
      ) : (
        <p className="text-sm text-muted">Everything buyers look for is here. Nice.</p>
      )}
    </div>
  );
}
