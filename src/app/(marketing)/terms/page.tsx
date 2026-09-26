import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, ROOT_DOMAIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms",
  description: `Terms of use for ${BRAND}, the free listing tool for channel partners.`,
};

export default function TermsPage() {
  return (
    <section className="mk-wrap py-6 md:py-10">
      <article className="mk-panel mk-prose mx-auto max-w-4xl">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="mk-h2">Terms of use</h1>
        <p className="mk-muted mt-3">Last updated 26 September 2026 · Plain English, on purpose.</p>

        <h2>What {BRAND} is</h2>
        <p>
          {BRAND} is free listing software for real-estate channel partners. It turns the photos and text you send us into a
          public listing page on a subdomain of {ROOT_DOMAIN}, plus a PDF brochure, story image and story video. We are a tool.
          We are not a broker, an agent, a marketplace or a party to any transaction between you and a buyer.
        </p>

        <h2>Free, with no catch</h2>
        <p>
          The product is free. There are no plans, credits, trials or paid features, and we will not ask you for a card. If that
          ever changes we will tell you in advance and you will be able to export your listings first.
        </p>

        <h2>Your account</h2>
        <ul>
          <li>You must be at least 18 and using the product for your own real-estate business.</li>
          <li>Your login is a one-time code sent to your phone. Keep your phone secure; you are responsible for what is published from your account.</li>
          <li>One username per person. Usernames that impersonate a developer, a brand or another channel partner may be reclaimed.</li>
        </ul>

        <h2>Your listings</h2>
        <ul>
          <li>You keep ownership of the photos, documents and text you upload. You give us a licence to store, process, display and format them so we can run your pages and generate your brochures and videos.</li>
          <li>You confirm you have the right to publish every photo and document you upload, and that the details you publish are accurate to the best of your knowledge.</li>
          <li>AI-written descriptions are drafts. Review them before publishing; you are responsible for the final content.</li>
          <li>Project templates are shared facts about a development. Do not upload brochures you are not permitted to distribute.</li>
        </ul>

        <h2>Buyers and their data</h2>
        <p>
          We never collect buyer names, phone numbers or emails and neither should you through our pages. Do not attempt to add
          forms, trackers or scripts to a listing, and do not use the first-name personalisation to store anything other than a
          first name. See the <Link href="/privacy" className="underline">privacy policy</Link> for how aggregate analytics work.
        </p>

        <h2>Analytics and the pixel</h2>
        <p>
          Public pages run the Meta pixel and a first-party cookie for aggregate analytics. By publishing a listing you agree to
          this. The audience built from those events belongs to {BRAND}; the counts and reports for your own pages are shown to you
          in your dashboard and daily report.
        </p>

        <h2>Things you must not do</h2>
        <ul>
          <li>Publish listings for properties you are not authorised to market, or that do not exist.</li>
          <li>Publish misleading prices, fake RERA numbers or false possession dates.</li>
          <li>Upload content that is unlawful, defamatory, or that infringes someone else&rsquo;s rights.</li>
          <li>Scrape, resell or bulk-export other channel partners&rsquo; listings.</li>
          <li>Send spam from links created with the product.</li>
        </ul>
        <p>We may take down a listing or suspend an account that breaks these rules, and will tell you why.</p>

        <h2>Availability</h2>
        <p>
          We work hard to keep pages fast and online, but the product is provided as-is and we cannot promise uninterrupted
          service. We are not liable for lost deals, lost profits or indirect losses arising from use of the product.
        </p>

        <h2>Ending things</h2>
        <p>
          You can delete your account at any time from Settings; that removes your data and takes your site offline. We can end
          these terms with notice if the product is discontinued, and will give you time to export your listings first.
        </p>

        <h2>Changes and law</h2>
        <p>
          We may update these terms; material changes will be announced in your dashboard. These terms are governed by the laws of
          India.
        </p>

        <p className="hairline mt-10 pt-6 text-sm">
          See also our <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </article>
    </section>
  );
}
