import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function FinalCta() {
  return (
    <section className="mk-wrap py-3 md:py-4" aria-labelledby="cta-title">
      <div className="mk-panel reveal text-white" style={{ background: "var(--ink)" }}>
        <div className="grid items-end gap-10 md:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
          <div>
            <p className="eyebrow !text-white/60">Ready when you are</p>
            <h2 id="cta-title" className="mk-h2 mt-5 max-w-2xl">
              Your next enquiry deserves a page, not a paragraph.
            </h2>
            <p className="mk-body mt-5 max-w-xl text-white/70">
              Create your first listing on WhatsApp or the web. No card, no trial, no credits. Just a link buyers trust.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link href="/login" className="btn bg-white text-base text-ink md:text-lg">
              Create a free listing <span aria-hidden>👋</span>
            </Link>
            <Link href="/sample" className="btn border border-white/25 text-base text-white md:text-lg">
              See a sample listing <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
