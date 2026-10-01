import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ANSWERS } from "@/lib/seo/answers";
import { JsonLd, breadcrumbLd } from "@/lib/seo/jsonld";
import { BRAND, rootUrl } from "@/lib/site";

const DESCRIPTION = "Straight answers to the questions Indian channel partners ask about listing tools, WhatsApp sharing, brochures and managing inventory.";

export const metadata: Metadata = {
  title: "Answers for channel partners",
  description: DESCRIPTION,
  alternates: { canonical: rootUrl("/answers") },
};

export default function AnswersIndex() {
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: BRAND, path: "/" }, { name: "Answers", path: "/answers" }])} />
      <section className="mk-hero mk-wrap">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow mk-fade mb-6">Answers</p>
          <h1 className="mk-h1 mk-fade mx-auto max-w-4xl">Questions channel partners ask.</h1>
          <p className="mk-body mk-muted mk-fade mx-auto mt-6 max-w-2xl">{DESCRIPTION}</p>
        </div>
      </section>
      <section className="mk-wrap py-3 md:py-4">
        <div className="mk-panel">
          <ol>
            {ANSWERS.map((a, i) => (
              <li key={a.slug}>
                <Link href={`/answers/${a.slug}`} className="mk-row group">
                  <span className="mk-row-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0">
                    <span className="mk-h3 block">{a.question}</span>
                    <span className="mk-muted mt-1.5 block text-base">{a.description}</span>
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
    </>
  );
}
