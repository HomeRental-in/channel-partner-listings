import type { ReactNode } from "react";
import { EditorialMock, MidnightMock, SunriseMock } from "./ThemeMocks";

type Theme = {
  name: string;
  tag: string;
  blurb: string;
  stats: [string, string][];
  mock: ReactNode;
};

const THEMES: Theme[] = [
  {
    name: "Editorial",
    tag: "Cream & ink · serif headlines",
    blurb:
      "A magazine layout with a sticky price column, large hero photo and hairline dividers. Slow fade-up reveals make premium resale feel premium.",
    stats: [
      ["Fraunces", "Display font"],
      ["Sticky", "Price + CTA column"],
      ["Fade-up", "Reveal motion"],
    ],
    mock: <EditorialMock />,
  },
  {
    name: "Midnight",
    tag: "Near-black · electric accent",
    blurb:
      "Full-bleed parallax hero, slide-in fact cards and a glowing WhatsApp button. Built for new launches and sea-facing towers that photograph at night.",
    stats: [
      ["Space Grotesk", "Display font"],
      ["Parallax", "Hero motion"],
      ["Bottom sheet", "Mobile CTA"],
    ],
    mock: <MidnightMock />,
  },
  {
    name: "Sunrise",
    tag: "Warm sand · coral",
    blurb:
      "A bento grid of photos and facts with pill chips and spring pop reveals. Friendly and fast — ideal for rentals and first-home buyers.",
    stats: [
      ["Outfit", "Display font"],
      ["Bento", "Photo + fact grid"],
      ["Spring", "Pop reveals"],
    ],
    mock: <SunriseMock />,
  },
];

export default function ThemeCards() {
  return (
    <section id="themes" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="themes-title">
      <div className="mk-panel">
        <div className="mk-grid mb-10 md:mb-14">
          <p className="mk-label reveal">What buyers receive</p>
          <div>
            <h2 id="themes-title" className="mk-h2 reveal max-w-2xl">
              One listing. Three themes. Every one built to be opened on a phone.
            </h2>
            <p className="mk-body mk-muted reveal mt-5 max-w-2xl" data-delay="0.1">
              Pick a theme per listing with a live preview. Each one ships with a gallery and lightbox, price per sq ft,
              quick-question WhatsApp buttons, a map, your broker card and a sticky call-to-action bar.
            </p>
          </div>
        </div>

        <div className="mk-stack" style={{ "--stack-top": "96px" } as React.CSSProperties}>
          {THEMES.map((t, i) => (
            <article
              key={t.name}
              className="mk-stack-card rounded-[var(--radius-card)] border border-line bg-soft p-4 shadow-[0_24px_60px_-40px_rgba(0,0,0,.35)] md:p-6"
              style={{ "--stack-i": i } as React.CSSProperties}
            >
              <div className="grid gap-6 md:grid-cols-[minmax(0,55fr)_minmax(0,45fr)] md:gap-10">
                {t.mock}
                <div className="flex flex-col">
                  <p className="eyebrow">{t.tag}</p>
                  <h3 className="mk-h3 mt-3">{t.name}</h3>
                  <p className="mk-muted mt-3 text-base leading-snug md:text-lg">{t.blurb}</p>
                  <div className="mt-auto grid grid-cols-3 gap-2 pt-6 md:gap-3">
                    {t.stats.map(([v, l]) => (
                      <div key={l} className="mk-stat bg-white">
                        <strong className="text-base md:text-xl">{v}</strong>
                        <span>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
