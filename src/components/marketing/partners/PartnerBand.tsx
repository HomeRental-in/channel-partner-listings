import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

/** Homepage band that routes large CP firms to the Founding Partner EOI. */
export default function PartnerBand() {
  return (
    <section id="partners" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="partners-title">
      <div className="mk-panel reveal">
        <div className="grid items-end gap-10 md:grid-cols-[minmax(0,65fr)_minmax(0,35fr)]">
          <div>
            <p className="mk-label">For CP firms &amp; agencies</p>
            <h2 id="partners-title" className="mk-h2 mt-6 max-w-2xl">
              Sharing 1,000+ property links a month from one location?
            </h2>
            <p className="mk-body mk-muted mt-5 max-w-xl">
              Become a Founding Partner. We onboard your agents and build your whole inventory for you — every unit on its own link,
              under your brand. Still free.
            </p>
          </div>
          <div className="flex flex-col gap-3 md:items-end">
            <Link href="/partners#eoi" className="btn btn-dark text-base md:text-lg">
              Register your firm <span aria-hidden>👋</span>
            </Link>
            <Link href="/partners" className="btn bg-[var(--bg)] text-base md:text-lg">
              How the programme works <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
