import { MessageCircle, Sparkles, Link2 } from "lucide-react";
import { WHATSAPP_DISPLAY, whatsappStartUrl } from "@/lib/site";

const STEPS = [
  {
    n: "01",
    icon: MessageCircle,
    title: "Send it on WhatsApp",
    body: `Say Hi to ${WHATSAPP_DISPLAY} on WhatsApp, then send photos and a few rough lines — Hindi, Hinglish or English, in any order. Type DONE when you're finished. No app to install, no forms to fill.`,
  },
  {
    n: "02",
    icon: Sparkles,
    title: "AI builds the page",
    body: "We extract the price, configuration, area, floor, amenities and location, write a clean description and lay it out in your theme. You get a private review link to fix anything before it goes live.",
  },
  {
    n: "03",
    icon: Link2,
    title: "Share one link",
    body: "Publish and forward the link on WhatsApp, add a buyer's first name so the page greets them, or download the PDF brochure and story video. Every open, WhatsApp tap and call shows up in your daily report.",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="how-title">
      <div className="mk-panel">
        <div className="mk-grid">
          <div>
            <p className="mk-label reveal">How it works</p>
            <h2 id="how-title" className="mk-h2 reveal mt-6 max-w-sm" data-delay="0.05">
              From a chat to a live listing in under a minute.
            </h2>
            <a href={whatsappStartUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-dark reveal mt-8 text-base md:text-lg" data-delay="0.1">
              Create a free listing <span aria-hidden>👋</span>
            </a>
            <p className="mk-muted reveal mt-4 text-base" data-delay="0.15">
              WhatsApp <span className="font-medium text-ink">{WHATSAPP_DISPLAY}</span>
            </p>
          </div>
          <ol className="flex flex-col">
            {STEPS.map((s, i) => (
              <li key={s.n} className="mk-step reveal" data-delay={i * 0.08}>
                <span className="mk-step-num">{s.n}</span>
                <div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg">
                      <s.icon size={18} />
                    </span>
                    <h3 className="mk-h3">{s.title}</h3>
                  </div>
                  <p className="mk-muted mt-3 max-w-xl text-base leading-snug md:text-lg">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
