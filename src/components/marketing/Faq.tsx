"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "Is it really free?",
    a: "Yes, and unlimited. Publish 5 listings or 500 — there are no plans, credits, quotas or paid tiers, and there is no payment gateway anywhere in the product. Every feature on this page — AI writer, brochures, story videos, collections, project pages, analytics — is included for every channel partner.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. You can create and publish a listing entirely from WhatsApp. There is also a web dashboard for a bigger editor, analytics and settings, but it runs in your browser — nothing to download.",
  },
  {
    q: "Can I check the listing before it goes live?",
    a: "Always. After you type DONE we send you a private review link. You can reorder photos, pick the cover, fix any extracted field, rewrite the description and choose a theme. Nothing is public until you tap Publish.",
  },
  {
    q: "How fast is it?",
    a: "From your last WhatsApp message to a live link is usually under 60 seconds, including AI extraction. The page itself is built to open in about a second on a 4G phone.",
  },
  {
    q: "Do I get my own link?",
    a: "Yes. Every channel partner gets a site at yourname on our domain, with a storefront and a short link for each listing and collection. Add a buyer's first name to any link and the page greets them personally.",
  },
  {
    q: "What about my buyers' data?",
    a: "We never collect buyer names, phone numbers or emails — buyers never sign up for anything. The optional first name you add to a link is removed from the address before any analytics load and is only shown back to you in your own report. Your listing and contact details belong to you, and you can delete your account at any time.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="faq-title">
      <div className="mk-panel">
        <div className="mk-grid">
          <div>
            <p className="mk-label reveal">FAQ</p>
            <h2 id="faq-title" className="mk-h2 reveal mt-6 max-w-sm" data-delay="0.05">
              Questions channel partners ask us.
            </h2>
          </div>
          <div className="reveal" data-delay="0.1">
            {FAQS.map((f, i) => {
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
