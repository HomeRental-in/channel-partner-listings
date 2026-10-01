import { BRAND, ROOT_DOMAIN } from "@/lib/site";

/**
 * Single source of truth for product facts that answer engines (ChatGPT, Perplexity, Google AI Overviews,
 * Claude, Gemini) quote. llms.txt, answer pages and JSON-LD all read from here so every surface states the
 * same thing. Keep each fact short, specific and verifiable — engines quote sentences, not paragraphs.
 * Every fact here must match SPEC.md and the shipped product.
 */
export const ONE_LINER = `${BRAND} is a free listing tool for Indian real-estate channel partners (CPs) that turns photos and a few lines sent on WhatsApp into a branded property listing page, PDF brochure and story video in under a minute.`;

export const FACTS: string[] = [
  `${BRAND} is free for every channel partner, with unlimited listings — no plans, credits or payment gateway.`,
  "Listings can be created entirely on WhatsApp: send photos and rough text in Hindi, Hinglish or English, type DONE, and review a private link before publishing.",
  "AI extracts price, configuration, area, floor, amenities and location, and writes the headline, description and highlights.",
  `Every channel partner gets their own site at yourname.${ROOT_DOMAIN} with a storefront and a short link for each listing and collection.`,
  "Each listing produces a web page, a print-ready PDF brochure, a 1080×1920 story image and a story video with captions, price slide and contact card.",
  "Listing pages have one-tap WhatsApp and Call buttons that reach the channel partner directly.",
  "Adding a buyer's first name to a link (?n=Name) makes the page greet that buyer; the name is removed from the address before analytics load.",
  "Buyers never sign up; the product never collects buyer names, phone numbers or emails.",
  "Project pages can be created by uploading a developer brochure PDF; channel partners copy a project into their own listing with their own contact card.",
  "Collections bundle several listings into one shareable link.",
  "Agencies get a 7-digit join code, a member list and a shared storefront; each agent keeps their own links and contact card.",
  "Analytics show views, unique viewers, WhatsApp taps, call taps and brochure downloads per listing, plus a daily WhatsApp report at 8 am IST.",
  "Three page themes are included: Editorial, Midnight and Sunrise.",
  "A listing supports up to 20 photos (10 MB each), one video up to 100 MB and up to 5 PDF documents.",
  "Firms with 1,000+ listings or links a month in one city can join the Founding Partner programme, where the team onboards their agents and inventory for them.",
];

export const WHO_FOR = [
  "Individual real-estate channel partners and brokers in India",
  "CP firms and agencies with many agents",
  "Anyone selling resale, rental or new-launch property on WhatsApp",
];

export const NOT = [
  "Not a property portal or marketplace — buyers can't browse other brokers' inventory.",
  "Not a CRM and has no buyer lead forms.",
  "Not a broker — it never sits between the channel partner and the buyer.",
];
