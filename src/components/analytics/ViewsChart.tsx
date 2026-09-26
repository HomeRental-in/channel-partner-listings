/** 30-day bar chart of views. Pure SVG — no chart library. */
export function ViewsChart({ data, title = "Views · last 30 days" }: { data: { day: string; label: string; views: number }[]; title?: string }) {
  const W = 720;
  const H = 200;
  const padL = 36;
  const padR = 8;
  const padT = 14;
  const padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const max = Math.max(1, ...data.map((d) => d.views));
  const niceMax = niceCeil(max);
  const n = Math.max(1, data.length);
  const slot = innerW / n;
  const barW = Math.max(4, slot * 0.62);
  const total = data.reduce((a, d) => a + d.views, 0);
  const ticks = [0, niceMax / 2, niceMax];

  return (
    <div className="card p-5">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-medium">{title}</h3>
        <span className="text-sm text-muted">{total.toLocaleString("en-IN")} total</span>
      </div>
      {total === 0 ? (
        <div className="mt-4 flex h-40 items-center justify-center rounded-[var(--radius-inner)] bg-soft text-sm text-muted">No views in the last 30 days yet.</div>
      ) : (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-3 h-auto w-full" role="img" aria-label={`Bar chart of daily views over the last ${data.length} days`}>
          {ticks.map((t) => {
            const y = padT + innerH - (t / niceMax) * innerH;
            return (
              <g key={t}>
                <line x1={padL} x2={W - padR} y1={y} y2={y} stroke="var(--line)" strokeWidth={1} />
                <text x={padL - 6} y={y + 4} textAnchor="end" fontSize={10} fill="var(--muted)">
                  {t}
                </text>
              </g>
            );
          })}
          {data.map((d, i) => {
            const h = (d.views / niceMax) * innerH;
            const x = padL + i * slot + (slot - barW) / 2;
            const y = padT + innerH - h;
            const showLabel = n <= 10 || i % Math.ceil(n / 6) === 0 || i === n - 1;
            return (
              <g key={d.day}>
                <rect x={x} y={y} width={barW} height={Math.max(h, d.views ? 2 : 0)} rx={3} fill={d.views ? "var(--ink)" : "transparent"} opacity={d.views ? 0.85 : 1}>
                  <title>{`${d.label}: ${d.views} view${d.views === 1 ? "" : "s"}`}</title>
                </rect>
                {showLabel && (
                  <text x={x + barW / 2} y={H - 8} textAnchor="middle" fontSize={10} fill="var(--muted)">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      )}
    </div>
  );
}

function niceCeil(n: number) {
  if (n <= 5) return 5;
  if (n <= 10) return 10;
  const p = Math.pow(10, Math.floor(Math.log10(n)));
  const m = n / p;
  const nice = m <= 2 ? 2 : m <= 5 ? 5 : 10;
  return nice * p;
}
