import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import Faq from "@/components/marketing/Faq";
import { ANSWERS, answerBySlug } from "@/lib/seo/answers";
import { JsonLd, articleLd, breadcrumbLd, faqLd, howToLd } from "@/lib/seo/jsonld";
import { BRAND, rootUrl, whatsappStartUrl } from "@/lib/site";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ANSWERS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const a = answerBySlug((await params).slug);
  if (!a) return { title: "Not found", robots: { index: false } };
  const url = rootUrl(`/answers/${a.slug}`);
  return {
    title: { absolute: `${a.question} · ${BRAND}` },
    description: a.description,
    alternates: { canonical: url },
    openGraph: { title: a.question, description: a.description, url, type: "article", siteName: BRAND, modifiedTime: a.updated },
  };
}

/** Answer-first page: question → direct answer → steps/table/detail → FAQs. Built for AI answer engines and featured snippets. */
export default async function AnswerPage({ params }: Props) {
  const a = answerBySlug((await params).slug);
  if (!a) notFound();
  const path = `/answers/${a.slug}`;
  const faqs = [{ q: a.question, a: a.short }, ...a.faqs];
  const related = ANSWERS.filter((x) => x.slug !== a.slug).slice(0, 4);

  return (
    <>
      <JsonLd
        data={[
          articleLd({ ...a, path }),
          faqLd(faqs),
          ...(a.steps ? [howToLd(a.question, a.steps)] : []),
          breadcrumbLd([
            { name: BRAND, path: "/" },
            { name: "Answers", path: "/answers" },
            { name: a.question, path },
          ]),
        ]}
      />
      <section className="mk-wrap py-6 md:py-10">
        <article className="mk-panel mk-prose mx-auto max-w-4xl">
          <p className="eyebrow mb-4">
            <Link href="/answers">Answers</Link> · Updated <time dateTime={a.updated}>{new Date(a.updated).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>
          </p>
          <h1 className="mk-h2">{a.question}</h1>

          <div className="mt-8 rounded-[var(--radius-inner)] p-6 md:p-8" style={{ background: "var(--soft)" }}>
            <p className="eyebrow mb-2">Short answer</p>
            <p className="!mb-0 !text-lg !text-ink md:!text-xl">{a.short}</p>
          </div>

          {a.steps && (
            <>
              <h2>Steps</h2>
              <ol className="flex flex-col gap-4">
                {a.steps.map((s, i) => (
                  <li key={s.name} className="grid grid-cols-[40px_1fr] gap-3">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm text-white">{i + 1}</span>
                    <div>
                      <strong>{s.name}.</strong> {s.text}
                    </div>
                  </li>
                ))}
              </ol>
            </>
          )}

          {a.sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              {s.paras?.map((p) => <p key={p}>{p}</p>)}
              {s.bullets && (
                <ul>
                  {s.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}

          {a.table && (
            <>
              <h2>{a.table.caption}</h2>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-sm">
                  <thead>
                    <tr>
                      {a.table.head.map((h) => (
                        <th key={h} className="border-b border-[var(--line)] p-2 font-medium">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {a.table.rows.map((r) => (
                      <tr key={r[0]}>
                        {r.map((c, i) => (
                          <td key={i} className={`border-b border-[var(--line)] p-2 ${i === 0 ? "font-medium" : ""}`}>
                            {c}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            {a.cta === "partners" ? (
              <Link href="/partners#eoi" className="btn btn-dark">
                Register your firm <ArrowRight size={16} />
              </Link>
            ) : (
              <a href={whatsappStartUrl()} target="_blank" rel="noopener noreferrer" className="btn btn-dark">
                Create a free listing <span aria-hidden>👋</span>
              </a>
            )}
            <Link href="/sample" className="btn btn-light">
              See a sample listing
            </Link>
          </div>
        </article>
      </section>

      <Faq items={a.faqs} title="Related questions." />

      <section className="mk-wrap py-3 md:py-4" aria-labelledby="more-title">
        <div className="mk-panel">
          <p id="more-title" className="mk-label">
            More answers
          </p>
          <ul className="mt-6 flex flex-col">
            {related.map((r) => (
              <li key={r.slug} className="hairline">
                <Link href={`/answers/${r.slug}`} className="flex items-center justify-between gap-4 py-4 text-lg font-medium">
                  {r.question} <ArrowRight size={18} className="flex-none" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
