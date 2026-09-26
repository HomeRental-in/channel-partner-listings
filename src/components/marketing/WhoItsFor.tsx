import { Check } from "lucide-react";
import PhoneMock from "./PhoneMock";

const POINTS = [
  "You work resale, rentals and new launches across a city",
  "Buyers reach you on WhatsApp and decide on WhatsApp",
  "You forward the same 8 photos and a paragraph twenty times a day",
];

export default function WhoItsFor() {
  return (
    <section id="who" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="who-title">
      <div className="mk-panel reveal">
        <div className="grid items-center gap-10 md:grid-cols-[minmax(0,38fr)_minmax(0,62fr)] md:gap-16">
          <div className="order-2 md:order-1">
            <PhoneMock />
          </div>
          <div className="order-1 md:order-2">
            <p className="mk-label mb-6">Who it&apos;s for</p>
            <h2 id="who-title" className="mk-h2 max-w-xl">
              Built for channel partners who sell on WhatsApp, not on portals.
            </h2>
            <p className="mk-body mk-muted mt-6 max-w-xl">
              Every listing becomes a fast, branded page on <em className="not-italic font-medium text-ink">yourname</em>&rsquo;s
              own site, with your photo, RERA number and one-tap WhatsApp and Call buttons. Buyers open it in a second and
              never have to sign up for anything.
            </p>
            <ul className="mt-8 flex flex-col gap-3">
              {POINTS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-base md:text-lg">
                  <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-ink text-white">
                    <Check size={14} />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
            <a href="#how-it-works" className="btn btn-dark mt-10 text-base md:text-lg">
              See how it works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
