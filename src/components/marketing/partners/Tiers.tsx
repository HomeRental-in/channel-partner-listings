import { Check } from "lucide-react";
import { TIERS } from "@/lib/partners";

const PERKS: Record<keyof typeof TIERS, string[]> = {
  FOUNDING: [
    "Dedicated partnerships manager on WhatsApp",
    "We build your inventory for you — brochures, sheets, photo folders",
    "Agency storefront plus a site and links for every agent",
    "Founding Partner badge on your pages and our city page",
    "First access to Co-Agent links and new features",
    "Quarterly review of what your buyers open and tap",
  ],
  GROWTH: [
    "Onboarding call for your whole team",
    "Project pages built from your developer brochures",
    "Agency storefront and per-agent analytics",
    "Priority support on WhatsApp",
  ],
  PARTNER: ["Unlimited listings from WhatsApp or web", "Your own site, PDF brochure and story video", "Daily WhatsApp report at 8 am"],
};

export default function Tiers() {
  const order = ["FOUNDING", "GROWTH", "PARTNER"] as const;
  return (
    <section id="tiers" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="tiers-title">
      <div className="mk-panel">
        <div className="mk-grid mb-8 md:mb-12">
          <p className="mk-label reveal">Programme</p>
          <div>
            <h2 id="tiers-title" className="mk-h2 reveal max-w-2xl">
              Free for everyone. Hands-on onboarding for the firms that move the most inventory.
            </h2>
            <p className="mk-body mk-muted reveal mt-5 max-w-2xl" data-delay="0.05">
              There are no plans or credits. Tiers decide how much of the setup our team does for you. We take a limited number
              of Founding Partners per city so each one is onboarded properly.
            </p>
          </div>
        </div>
        <div className="reveal grid gap-4 md:grid-cols-3" data-delay="0.1">
          {order.map((t) => {
            const dark = t === "FOUNDING";
            return (
              <article
                key={t}
                className="flex flex-col gap-5 rounded-[var(--radius-card)] p-7 md:p-9"
                style={{ background: dark ? "var(--ink)" : "var(--soft)", color: dark ? "#fff" : undefined }}
              >
                <div>
                  <p className={dark ? "eyebrow !text-white/60" : "eyebrow"}>{dark ? "Limited per city" : "Open to all"}</p>
                  <h3 className="mk-h3 mt-3">{TIERS[t].label}</h3>
                  <p className={dark ? "mt-2 text-white/70" : "mk-muted mt-2"}>{TIERS[t].blurb}</p>
                </div>
                <ul className="flex flex-col gap-3">
                  {PERKS[t].map((p) => (
                    <li key={p} className="flex items-start gap-3 text-base">
                      <span className={`mt-0.5 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
                        <Check size={12} />
                      </span>
                      {p}
                    </li>
                  ))}
                </ul>
                <a href="#eoi" className={`btn mt-auto justify-center ${dark ? "bg-white text-ink" : "btn-dark"}`}>
                  {dark ? "Apply as a Founding Partner" : "Register interest"}
                </a>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
