const REASONS = [
  { title: "No per-listing cost, at any volume", body: "Paid tools charge per listing or per credit. A firm sharing 5,000 links a month pays the same as a solo broker here: nothing." },
  { title: "Every agent gets their own link", body: "One agency, one join code. Each agent gets a site and listing links with their own photo, RERA number and WhatsApp button, and the agency gets a shared storefront." },
  { title: "Project pages from a brochure", body: "Upload a developer brochure once. AI extracts configurations, payment plan, floor plans and amenities; your agents copy it into their own listing in one tap." },
  { title: "Built for WhatsApp, where your buyers already are", body: "Agents create and share from WhatsApp. Pages open in about a second on 4G and never ask buyers to sign up." },
  { title: "Know which buyers are warm", body: "Views, WhatsApp taps, calls and brochure downloads per listing and per agent, plus a five-line report every morning at 8." },
];

export default function WhyFirms() {
  return (
    <section id="why" className="mk-wrap scroll-mt-24 py-3 md:py-4" aria-labelledby="why-title">
      <div className="mk-panel">
        <div className="mk-grid mb-8 md:mb-12">
          <p className="mk-label reveal">Why large CP firms join</p>
          <h2 id="why-title" className="mk-h2 reveal max-w-2xl">
            Your inventory, on a link per unit, under your brand.
          </h2>
        </div>
        <ol className="reveal" data-delay="0.1">
          {REASONS.map((r, i) => (
            <li key={r.title} className="mk-row">
              <span className="mk-row-num">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="mk-h3">{r.title}</h3>
                <p className="mk-muted mt-2 max-w-2xl text-base md:text-lg">{r.body}</p>
              </div>
              <span />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
