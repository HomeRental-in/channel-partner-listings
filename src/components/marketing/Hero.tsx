import Link from "next/link";
import { ArrowDown } from "lucide-react";

const HEADLINE = "Turn a WhatsApp message into a listing buyers trust.";
const MARQUEE = ["/ UNLIMITED LISTINGS, FREE", "/ < 60 SEC TO A LINK", "/ 3 THEMES", "/ PDF + STORY VIDEO", "/ PROJECT PAGES FOR CPS"];

export default function Hero() {
  const words = HEADLINE.split(" ");
  return (
    <section className="mk-hero mk-wrap" aria-labelledby="hero-title">
      <div className="mx-auto max-w-5xl text-center">
        <p className="eyebrow mk-fade mb-6">Free listing tool for channel partners · unlimited listings</p>
        <h1 id="hero-title" className="mk-h1 mx-auto max-w-4xl">
          {words.map((w, i) => (
            <span key={i} className="mk-word">
              {w}
              {i < words.length - 1 ? " " : ""}
            </span>
          ))}
        </h1>
        <p className="mk-body mk-muted mk-fade mx-auto mt-6 max-w-2xl">
          Send photos and a few lines on WhatsApp. In under a minute you get a branded page on your own site,
          a PDF brochure and a story video — ready to forward to every buyer. Unlimited listings, free forever. No credits, no plans.
        </p>
        <div className="mk-fade mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/login" className="btn btn-dark text-base md:text-lg">
            Create a free listing <span aria-hidden>👋</span>
          </Link>
          <Link href="/login" className="btn bg-white text-base md:text-lg">
            Log in
          </Link>
        </div>
        <div className="mk-fade mt-12 flex justify-center md:mt-16">
          <a href="#who" className="mk-scroll-btn" aria-label="Scroll down">
            <ArrowDown size={22} />
          </a>
        </div>
      </div>

      <div className="mk-marquee mk-fade mt-14 md:mt-20" aria-label="Highlights">
        {[0, 1].map((dup) => (
          <div key={dup} className="mk-marquee-track" aria-hidden={dup === 1}>
            {MARQUEE.map((item) => (
              <span key={item} className="mk-marquee-item">
                {item}
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
