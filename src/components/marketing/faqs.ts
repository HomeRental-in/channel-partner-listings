/** FAQ copy lives outside the client component so server pages can also emit it as FAQPage JSON-LD. */
export type FaqItem = { q: string; a: string };

export const HOME_FAQS: FaqItem[] = [
  {
    q: "Is it really free?",
    a: "Yes, and unlimited. Publish 5 listings or 500 — there are no plans, credits, quotas or paid tiers, and there is no payment gateway anywhere in the product. Every feature on this page — AI writer, brochures, story videos, collections, project pages, analytics — is included for every channel partner.",
  },
  {
    q: "Do I need to install an app?",
    a: "No. You can create and publish a listing entirely from WhatsApp. There is also a web dashboard for a bigger editor, analytics and settings, but it runs in your browser — nothing to download.",
  },
  {
    q: "Can I check the listing before it goes live?",
    a: "Always. After you type DONE we send you a private review link. You can reorder photos, pick the cover, fix any extracted field, rewrite the description and choose a theme. Nothing is public until you tap Publish.",
  },
  {
    q: "How fast is it?",
    a: "From your last WhatsApp message to a live link is usually under 60 seconds, including AI extraction. The page itself is built to open in about a second on a 4G phone.",
  },
  {
    q: "Do I get my own link?",
    a: "Yes. Every channel partner gets a site at yourname on our domain, with a storefront and a short link for each listing and collection. Add a buyer's first name to any link and the page greets them personally.",
  },
  {
    q: "What about my buyers' data?",
    a: "We never collect buyer names, phone numbers or emails — buyers never sign up for anything. The optional first name you add to a link is removed from the address before any analytics load and is only shown back to you in your own report. Your listing and contact details belong to you, and you can delete your account at any time.",
  },
];

export const PARTNER_FAQS: FaqItem[] = [
  {
    q: "Is the Founding Partner programme paid?",
    a: "No. The product is free for every channel partner and every member of your team, with unlimited listings. The programme is about onboarding: firms with large inventory get a partnerships manager and we build their pages for them.",
  },
  {
    q: "We have 1,000+ units across projects. Do we have to enter them one by one?",
    a: "No. Share your developer brochures, inventory sheets or a folder of photos. Our team turns project brochures into project pages and bulk-creates listings for your agents, who then share their own links with their own contact card.",
  },
  {
    q: "Can every agent in my firm have their own link and contact card?",
    a: "Yes. Create an agency, share the 7-digit join code with your team, and every agent gets their own site and listing links while the agency gets a shared storefront. Each page shows the contact card of the agent who shared it.",
  },
  {
    q: "Who owns the buyer enquiries?",
    a: "You do. Buyers tap WhatsApp or Call and reach the agent directly — we never sit in between, never ask buyers for their details and never pass enquiries to anyone else.",
  },
  {
    q: "How is this different from EstateDeck or PropSite?",
    a: "Feature for feature it covers listing pages, PDF brochures, story images and video, collections, project pages and analytics — without per-listing credits, so a firm sharing thousands of links a month pays nothing.",
  },
  {
    q: "How quickly can we go live?",
    a: "Individual agents can publish their first listing from WhatsApp in under a minute today. For large firms, the partnerships team plans onboarding on the first call, starting with the projects and micro-markets you sell most.",
  },
];

/** City-page FAQs: same questions every CP asks, answered with local specifics. */
export function cityFaqs(city: { name: string; localities: string[] }): FaqItem[] {
  const some = city.localities.slice(0, 3).join(", ");
  return [
    {
      q: `Is there a free property listing tool for channel partners in ${city.name}?`,
      a: `Yes. Channel partners in ${city.name} can create unlimited listing pages free — send photos and a few lines on WhatsApp and get a branded page with your WhatsApp and Call buttons, a PDF brochure and a story video.`,
    },
    {
      q: `Can I create pages for new launches in ${some} with my own contact details?`,
      a: `Yes. Add a developer project from its brochure once, then create your own listing from it. The developer facts stay, and the contact card on every page is yours, not the developer's or another broker's.`,
    },
    {
      q: `We are a large CP firm in ${city.name}. Can you onboard our whole team?`,
      a: `Yes — that is what the Founding Partner programme is for. Register interest and our partnerships team will plan onboarding for your agents and inventory across ${city.name}.`,
    },
    {
      q: "Do buyers need to sign up to see a listing?",
      a: "Never. Buyers open the link, browse photos and details, and tap WhatsApp or Call to reach you. We do not collect buyer names, numbers or emails.",
    },
  ];
}
