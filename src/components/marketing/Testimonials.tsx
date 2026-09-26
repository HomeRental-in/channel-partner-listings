"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const QUOTES = [
  {
    quote:
      "I used to forward the same eight photos to every enquiry. Now I send one link, the buyer sees my face and my RERA number, and I know who opened it twice before I call.",
    name: "Priya D.",
    role: "Channel partner, Pune · resale & rentals",
  },
  {
    quote:
      "The project page is the part I didn't expect. I uploaded the developer's brochure once, and every unit I push from that tower has the right facts and my number on it.",
    name: "Arjun N.",
    role: "Channel partner, Bengaluru · new launches",
  },
  {
    quote:
      "The 8 a.m. report is the first thing I read. Five lines, who to call, done. My team of three shares one storefront and everyone's listings are in one place.",
    name: "Sameer K.",
    role: "Agency owner, Mumbai · 3 partners",
  },
];

export default function Testimonials() {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".mk-tcard");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 380) + 20), behavior: "smooth" });
  };

  return (
    <section className="mk-wrap py-3 md:py-4" aria-labelledby="quotes-title">
      <div className="mb-6 flex items-end justify-between gap-6 px-2 md:px-6">
        <div>
          <p className="mk-label reveal">What partners say</p>
          <h2 id="quotes-title" className="mk-h2 reveal mt-4 max-w-lg" data-delay="0.05">
            Less forwarding. More calls that convert.
          </h2>
        </div>
        <div className="reveal hidden gap-2 md:flex" data-delay="0.1">
          <button type="button" className="icon-btn mk-white" aria-label="Previous testimonial" onClick={() => scrollBy(-1)}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" className="icon-btn mk-white" aria-label="Next testimonial" onClick={() => scrollBy(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div ref={ref} className="mk-scroller reveal px-2 md:px-6" data-delay="0.15" data-lenis-prevent-wheel>
        {QUOTES.map((q) => (
          <figure key={q.name} className="mk-tcard">
            <div className="flex items-center justify-between">
              <Quote size={22} className="mk-muted" />
              <span className="chip text-xs">Sample</span>
            </div>
            <blockquote className="mk-body flex-1">&ldquo;{q.quote}&rdquo;</blockquote>
            <figcaption className="flex items-center gap-3">
              <span className="block h-11 w-11 rounded-full bg-bg" aria-hidden />
              <span>
                <span className="block font-medium">{q.name}</span>
                <span className="mk-muted block text-sm">{q.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <p className="mk-muted mt-3 px-2 text-xs md:px-6">Sample quotes for illustration — not yet from named customers.</p>
    </section>
  );
}
