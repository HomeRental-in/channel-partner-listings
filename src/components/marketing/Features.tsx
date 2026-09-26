import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROOT_DOMAIN } from "@/lib/site";

const FEATURES = [
  { title: "Unlimited listings, free forever", body: "Publish as many properties as you sell. No credit packs, no monthly quota, no card — the competitors charge ₹20–35 a listing; here it is ₹0." },
  { title: "AI listing writer", body: "Turns rough notes into a clean headline, description and highlights. Regenerate from the details any time." },
  { title: "WhatsApp-first", body: "Create, review and publish from the chat you already live in. Web editor available too." },
  { title: `Your own site — yourname.${ROOT_DOMAIN}`, body: "A storefront with your photo, agency, RERA number and every live listing, grouped the way you sell." },
  { title: "PDF brochure", body: "A print-ready brochure generated from the same page, with your contact card on every one." },
  { title: "Story image & video", body: "1080×1920 story image plus a slide video with captions, price slide and contact card for status updates." },
  { title: "Collections", body: "Bundle listings into one link — '3 BHKs under 2 Cr in Baner' — for buyers who want options." },
  { title: "Project pages for channel partners", body: "Add a developer project from its brochure, keep the facts, override anything, and the contact card is always yours." },
  { title: "Daily WhatsApp report", body: "Five lines every morning at 8: views, WhatsApp taps, calls, brochure downloads and who to call back today." },
];

export default function Features() {
  return (
    <section id="features" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="features-title">
      <div className="mk-panel">
        <div className="mk-grid mb-8 md:mb-12">
          <p className="mk-label reveal">Everything included</p>
          <div>
            <h2 id="features-title" className="mk-h2 reveal max-w-2xl">
              Feature for feature with the paid tools. Free, with no credits to run out of.
            </h2>
          </div>
        </div>
        <ol className="reveal" data-delay="0.1">
          {FEATURES.map((f, i) => (
            <li key={f.title}>
              <Link href="/login" className="mk-row group">
                <span className="mk-row-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0">
                  <span className="mk-h3 block">{f.title}</span>
                  <span className="mk-muted mt-1.5 block max-w-2xl text-base leading-snug md:text-lg">{f.body}</span>
                </span>
                <span className="mk-row-arrow" aria-hidden>
                  <ArrowRight size={18} />
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
