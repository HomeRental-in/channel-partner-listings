"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { HOME_FAQS, type FaqItem } from "./faqs";

export default function Faq({ items = HOME_FAQS, title = "Questions channel partners ask us." }: { items?: FaqItem[]; title?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="faq-title">
      <div className="mk-panel">
        <div className="mk-grid">
          <div>
            <p className="mk-label reveal">FAQ</p>
            <h2 id="faq-title" className="mk-h2 reveal mt-6 max-w-sm" data-delay="0.05">
              {title}
            </h2>
          </div>
          <div className="reveal" data-delay="0.1">
            {items.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q} className="mk-faq-item">
                  <button
                    type="button"
                    className="mk-faq-q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${i}`}
                    id={`faq-button-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    <span className="mk-h3">{f.q}</span>
                    <span className="mk-faq-plus" aria-hidden>
                      <Plus size={20} />
                    </span>
                  </button>
                  <div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-button-${i}`} className="mk-faq-a" data-open={isOpen}>
                    <div>
                      <p className="mk-muted text-base leading-snug md:text-lg">{f.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
