import type { Metadata } from "next";
import Link from "next/link";
import { BRAND, ROOT_DOMAIN } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy",
  description: `How ${BRAND} handles data: we never collect buyer personal data, and channel partners can delete their account at any time.`,
};

export default function PrivacyPage() {
  return (
    <section className="mk-wrap py-6 md:py-10">
      <article className="mk-panel mk-prose mx-auto max-w-4xl">
        <p className="eyebrow mb-4">Legal</p>
        <h1 className="mk-h2">Privacy policy</h1>
        <p className="mk-muted mt-3">Last updated 26 September 2026 · Plain English, on purpose.</p>

        <h2>The short version</h2>
        <ul>
          <li>
            <strong>We never collect buyer personal data.</strong> Buyers who open a listing are never asked for a name, phone number
            or email, and there is no form on any public page.
          </li>
          <li>
            <strong>Public listing pages use the Meta pixel and one first-party cookie</strong> for aggregate analytics only, so a
            channel partner can see how many people opened a page and tapped WhatsApp or Call.
          </li>
          <li>
            <strong>Channel partners own their data</strong> and can delete their account, listings and analytics at any time from
            Settings.
          </li>
        </ul>

        <h2>Who this covers</h2>
        <p>
          {BRAND} is a free listing tool for real-estate channel partners. This policy covers two groups: channel partners (the
          people who sign up and publish listings) and buyers (anyone who opens a public listing, collection, project or storefront
          page on {ROOT_DOMAIN} or one of its subdomains).
        </p>

        <h2>Buyers: what we do and do not collect</h2>
        <p>
          We do not collect buyer names, phone numbers, email addresses or any other personal identifiers, and we never ask a buyer
          to sign up. A channel partner may add a buyer&rsquo;s first name to a link so the page can greet them. That first name is
          removed from the browser address before any analytics script loads, is never sent to Meta, is never written to our server
          logs, and is only ever shown back to the channel partner who added it.
        </p>
        <p>
          When you open a public page we record aggregate events: that a page was viewed, that a WhatsApp or Call button was tapped,
          or that a brochure was downloaded. These events carry the listing, its city and price band, and a random visitor
          identifier. They do not carry your name or contact details.
        </p>

        <h2>The pixel and the cookie</h2>
        <p>
          Public listing pages load the Meta pixel and mirror the same events server-side to Meta&rsquo;s Conversions API, using a
          shared event id so nothing is double-counted. Meta&rsquo;s own handling of that data is governed by Meta&rsquo;s privacy
          policy. We also set a single first-party cookie, <code>cd_vid</code>, containing a random id that lasts 180 days. It lets us
          count unique viewers and repeat visits; it contains nothing about who you are. You can clear it in your browser at any
          time.
        </p>

        <h2>Channel partners: what we store</h2>
        <p>
          When you sign up we store the phone number you used, plus whatever you choose to add to your profile: name, agency, city,
          RERA number, photo, bio, areas and languages. We store the listings, photos, documents, collections and projects you
          create, and the aggregate analytics for your pages. Login uses a one-time code sent to your phone; we never store a
          password.
        </p>
        <p>
          We use these details to run your site, generate brochures and story videos, send your daily WhatsApp report (which you can
          switch off in Settings), and reply to you on WhatsApp. We do not sell your details and we do not share them with other
          channel partners unless you join an agency and choose to share a storefront.
        </p>

        <h2>AI processing</h2>
        <p>
          The text and photos you send us are processed by an AI model to extract listing details and write descriptions. Only
          listing content is sent to the model — never buyer data, because we do not have any.
        </p>

        <h2>Deleting your account</h2>
        <p>
          You can delete your account from Settings at any time. Deleting removes your profile, listings, photos, documents,
          collections, analytics and daily reports, and takes your site offline. Aggregate events already sent to Meta cannot be
          recalled by us, but they contain no personal data.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? Message us on the same WhatsApp number you use to create listings, or write to us from the
          address in your account settings.
        </p>

        <p className="hairline mt-10 pt-6 text-sm">
          See also our <Link href="/terms" className="underline">terms of use</Link>.
        </p>
      </article>
    </section>
  );
}
