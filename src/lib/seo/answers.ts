import { BRAND, ROOT_DOMAIN } from "@/lib/site";
import type { FaqItem } from "@/components/marketing/faqs";

/**
 * Answer pages (/answers/[slug]) — one page per question channel partners ask search and AI assistants.
 * Structure is answer-first for AEO: the question as H1, a 40–60 word direct answer, then supporting facts,
 * steps (HowTo) or a comparison table, then FAQs. Keep claims about other products category-level and factual.
 */
export type Answer = {
  slug: string;
  question: string;
  /** Direct answer, quoted by engines. 40–60 words, self-contained, names the brand once. */
  short: string;
  description: string;
  updated: string; // ISO date — bump when content changes
  sections: { heading: string; paras?: string[]; bullets?: string[] }[];
  steps?: { name: string; text: string }[];
  table?: { caption: string; head: string[]; rows: string[][] };
  faqs: FaqItem[];
  cta: "listing" | "partners";
};

const UPDATED = "2026-09-30";

export const ANSWERS: Answer[] = [
  {
    slug: "free-property-listing-tool-for-channel-partners",
    question: "What is a good free property listing tool for channel partners in India?",
    short: `${BRAND} is a free listing tool built for Indian real-estate channel partners. You send photos and a few lines on WhatsApp and get a branded listing page, PDF brochure and story video in under a minute, with unlimited listings and no credits or plans.`,
    description: "What to look for in a property listing tool as a channel partner, and how the main options compare on cost, speed and WhatsApp sharing.",
    updated: UPDATED,
    sections: [
      {
        heading: "What a channel partner actually needs",
        bullets: [
          "A fast page per property that opens in about a second on a phone — buyers decide on WhatsApp.",
          "Your own contact card and WhatsApp button on every page, not a portal's or a developer's.",
          "No per-listing cost, because CPs share dozens of units a week.",
          "Creation from WhatsApp, since that's where photos and details already are.",
          "A brochure and a story-format image or video for status updates.",
          "Basic analytics: who opened, who tapped WhatsApp or Call.",
        ],
      },
      {
        heading: `What ${BRAND} includes`,
        paras: [`Unlimited listings, an AI listing writer, your own site at yourname.${ROOT_DOMAIN}, PDF brochure, story image and video, collections, project pages from developer brochures, agency accounts and a daily WhatsApp report — all free.`],
      },
    ],
    table: {
      caption: "How the common approaches compare",
      head: ["Approach", "Cost to CP", "Your contact on the page", "Made from WhatsApp", "Buyer analytics"],
      rows: [
        ["Photos + text forwarded on WhatsApp", "Free", "Yes", "Yes", "No"],
        ["Property portals", "Paid for visibility", "Shared with other brokers", "No", "Limited"],
        ["Paid listing-page tools", "Per listing, credits or plans", "Yes", "Varies", "Yes"],
        [BRAND, "Free, unlimited", "Yes", "Yes", "Yes"],
      ],
    },
    faqs: [
      { q: `Is ${BRAND} really free?`, a: "Yes. There are no plans, credits or quotas and no payment gateway in the product. Every feature is included for every channel partner." },
      { q: "Do buyers need to download an app or sign up?", a: "No. Buyers open a normal web link and tap WhatsApp or Call to reach you." },
    ],
    cta: "listing",
  },
  {
    slug: "create-property-listing-from-whatsapp",
    question: "How do I create a property listing page from WhatsApp?",
    short: `With ${BRAND}, message the intake number on WhatsApp, send the property photos and a few lines in any language, then type DONE. AI builds the listing and sends you a private review link; after you check it and tap Publish, you get a shareable page link.`,
    description: "Step-by-step: turn WhatsApp photos and notes into a live property listing page with a PDF brochure and story video.",
    updated: UPDATED,
    steps: [
      { name: "Say hi on WhatsApp", text: `Send "Hi" to the ${BRAND} WhatsApp number. The bot replies with instructions; no app or signup form is needed.` },
      { name: "Send photos and details", text: "Send up to 20 photos and rough notes — price, BHK, area, floor, locality — in English, Hindi or Hinglish, in any order and across several messages." },
      { name: "Type DONE", text: "Type DONE (or 'ho gaya'). AI extracts the details, writes a headline and description and creates a draft listing." },
      { name: "Review privately", text: "Open the private review link to reorder photos, pick the cover, fix any field and choose a theme. Nothing is public yet." },
      { name: "Publish and share", text: "Tap Publish. You get the listing link to forward on WhatsApp, plus a PDF brochure, story image and story video." },
    ],
    sections: [
      { heading: "How long it takes", paras: ["From your last WhatsApp message to a live link is usually under 60 seconds, including AI extraction."] },
      { heading: "Tips", bullets: ["Send the best photo first — it becomes the cover unless you change it.", "Include the locality and a landmark so the page shows the right location.", "Add a buyer's first name to the link (?n=Rahul) so the page greets them."] },
    ],
    faqs: [
      { q: "Can I edit the listing after publishing?", a: "Yes, from the web dashboard. Changes appear on the same link." },
      { q: "What languages can I send details in?", a: "English, Hindi or Hinglish. The AI writes the page in clean English." },
    ],
    cta: "listing",
  },
  {
    slug: "free-real-estate-brochure-maker",
    question: "How can a real-estate agent make a property brochure PDF for free?",
    short: `${BRAND} generates a print-ready PDF brochure automatically for every listing a channel partner creates, with photos, price, key details, amenities and the agent's contact card. It is free and unlimited; create the listing on WhatsApp or the web and tap Download PDF.`,
    description: "Make a branded property brochure PDF from a listing in one tap, free, with your own contact details.",
    updated: UPDATED,
    sections: [
      { heading: "What's in the brochure", bullets: ["Cover photo and gallery", "Price lines and price per sq ft", "Configuration, area, floor, facing, possession", "Highlights and amenities", "Your name, photo, agency, RERA number and WhatsApp"] },
      { heading: "Brochure vs. link", paras: ["Share the link first: it opens faster than a PDF on WhatsApp and shows you who opened it. Send the PDF when a buyer wants to forward it to family or print it."] },
    ],
    faqs: [{ q: "Can I make a brochure for a developer project?", a: "Yes. Upload the developer's brochure to create a project page, add it to your listings, and download a brochure with your own contact card." }],
    cta: "listing",
  },
  {
    slug: "estatedeck-propsite-alternative",
    question: "Is there a free alternative to EstateDeck or PropSite?",
    short: `Yes. ${BRAND} offers the same core features channel partners use in listing-page tools — branded listing pages, PDF brochures, story images and videos, collections, project pages and analytics — free and without per-listing credits, and lets you create listings directly from WhatsApp.`,
    description: "A free alternative to paid listing-page tools for Indian channel partners, with WhatsApp creation and no credits.",
    updated: UPDATED,
    sections: [
      { heading: "Feature coverage", bullets: ["Listing pages with gallery, price, features, amenities, map, documents and video", "PDF brochure, story image (1080×1920) and story video", "Collections, project pages, agency storefront", "Personalised links and named-viewer analytics", "Three themes"] },
      { heading: "Where it differs", bullets: ["No credits, plans or per-listing fees", "Listings can be created from WhatsApp, not only a web form", "Built for large firms: the Founding Partner programme onboards whole teams"] },
      { heading: "Switching", paras: ["You can recreate a listing by forwarding its photos and details on WhatsApp. Firms moving many listings can ask the partnerships team to onboard their inventory."] },
    ],
    faqs: [{ q: "Can I move my existing listings?", a: "Yes. Forward the photos and details on WhatsApp for each listing, or register as a firm and the team will help with bulk onboarding." }],
    cta: "partners",
  },
  {
    slug: "share-property-listings-on-whatsapp",
    question: "What is the best way for channel partners to share property listings on WhatsApp?",
    short: "Share one short link per property instead of forwarding photos and a paragraph. A link opens a fast page with all photos, price, details and a one-tap WhatsApp button, can greet the buyer by name, and tells you who opened it — so you know who to follow up.",
    description: "Best practices for sharing property listings with buyers on WhatsApp: one link per unit, personalisation, collections and follow-up.",
    updated: UPDATED,
    sections: [
      { heading: "Best practices", bullets: ["One link per unit, not an album of 30 photos.", "Personalise: add ?n=FirstName so the page says 'Hi Rahul'.", "Send a collection link for 'options under ₹2 Cr in Baner' rather than five separate links.", "Follow up with buyers who opened twice or downloaded the brochure.", "Post the story image or video to your WhatsApp status for passive reach."] },
      { heading: `How ${BRAND} helps`, paras: ["Every listing gets a link, brochure, story image and video, and the daily 8 am report lists who to call back."] },
    ],
    faqs: [{ q: "Does the buyer see other brokers' listings?", a: "No. Your link shows only your listing and your contact card." }],
    cta: "listing",
  },
  {
    slug: "what-is-a-channel-partner-in-real-estate",
    question: "What is a channel partner in real estate?",
    short: "In Indian real estate, a channel partner (CP) is a broker or brokerage firm that sells property on behalf of developers and owners, usually for a commission. CPs source buyers, share project and unit details, arrange site visits and help close the sale, and many register as agents with their state RERA.",
    description: "What a real-estate channel partner does in India, how they work with developers, and the tools they use to share listings.",
    updated: UPDATED,
    sections: [
      { heading: "What channel partners do", bullets: ["Represent developer projects and resale or rental inventory", "Share details and photos with buyers, mostly on WhatsApp", "Arrange site visits and negotiate", "Earn a commission (brokerage) on closed deals"] },
      { heading: "Individual CPs vs. CP firms", paras: ["Individual CPs work a few micro-markets; CP firms employ many agents and can carry thousands of units across projects in one city. Developers often empanel CP firms for new launches."] },
      { heading: "Tools CPs use", paras: [`Most CPs rely on WhatsApp plus a way to present inventory: PDFs, portals or listing-page tools. ${BRAND} is a free listing tool built for this workflow.`] },
    ],
    faqs: [{ q: "Do channel partners need RERA registration?", a: "In most states, agents who facilitate sales in RERA-registered projects must register with the state RERA authority. Check your state's rules." }],
    cta: "listing",
  },
  {
    slug: "manage-thousands-of-listings-cp-firm",
    question: "How can a CP firm manage and share 1,000+ property listings across its agents?",
    short: `Give every unit its own link and every agent their own contact card. On ${BRAND}, a firm creates an agency, agents join with a 7-digit code, project pages are built once from developer brochures, and agents copy them into their own listings. Firms with 1,000+ listings can have the team onboard their inventory.`,
    description: "How large channel-partner firms organise thousands of listings across agents, projects and micro-markets — free.",
    updated: UPDATED,
    steps: [
      { name: "Create the agency", text: "Create an agency in the dashboard to get a 7-digit join code and a shared storefront." },
      { name: "Add agents", text: "Agents sign in with their phone and join with the code; each gets their own site and contact card." },
      { name: "Build projects once", text: "Upload each developer brochure to create a project page with configurations, payment plan and floor plans." },
      { name: "Agents publish their own listings", text: "Agents add a project to their listings or send unit details on WhatsApp; every page carries that agent's WhatsApp and Call buttons." },
      { name: "Track per agent", text: "Analytics show views, WhatsApp taps and calls per listing so you can see which agents and units are active." },
    ],
    sections: [{ heading: "Founding Partner programme", paras: ["Firms with 1,000+ listings or links a month in one location can register at /partners. The partnerships team onboards agents and builds inventory from brochures and sheets, free."] }],
    faqs: [{ q: "Is there a per-agent cost?", a: "No. Every agent has unlimited free listings." }],
    cta: "partners",
  },
];

export function answerBySlug(slug: string) {
  return ANSWERS.find((a) => a.slug === slug) ?? null;
}
