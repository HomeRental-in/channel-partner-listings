/**
 * City landing pages for channel-partner acquisition SEO (/channel-partners/[city]).
 * Each city carries its own micro-markets and a market note so pages are genuinely distinct,
 * not name-swapped templates. `match` lists the spellings CPs and developers use in data
 * (User.city / Listing.city / Project.city) so live stats line up.
 */
export type SeoCity = {
  slug: string;
  name: string;
  state: string;
  match: string[];
  localities: string[];
  /** One or two sentences on how CPs in this market sell — shown on the page. */
  market: string;
};

export const CITIES: SeoCity[] = [
  {
    slug: "gurugram",
    name: "Gurugram",
    state: "Haryana",
    match: ["gurugram", "gurgaon"],
    localities: ["Golf Course Road", "Golf Course Extension Road", "Dwarka Expressway", "Sohna Road", "New Gurgaon", "DLF Phase 1–5", "Southern Peripheral Road", "Sector 65", "MG Road", "Sushant Lok"],
    market: "Gurugram is a new-launch and luxury market where channel partners carry dozens of developer projects at once and buyers compare three or four on WhatsApp before a site visit.",
  },
  {
    slug: "noida",
    name: "Noida",
    state: "Uttar Pradesh",
    match: ["noida"],
    localities: ["Noida Expressway", "Sector 150", "Sector 128", "Sector 62", "Sector 137", "Sector 75", "Sector 18", "Sector 144"],
    market: "Noida CPs work expressway launches alongside ready-to-move resale, so the same broker is sharing RERA-registered project pages and owner inventory in one day.",
  },
  {
    slug: "greater-noida",
    name: "Greater Noida",
    state: "Uttar Pradesh",
    match: ["greater noida", "greater noida west", "noida extension"],
    localities: ["Greater Noida West", "Noida Extension", "Pari Chowk", "Yamuna Expressway", "Knowledge Park", "Techzone 4", "Gaur City"],
    market: "Greater Noida West is a volume market: large CP networks move hundreds of mid-segment units a month and need a link per unit, not a PDF per project.",
  },
  {
    slug: "delhi",
    name: "Delhi",
    state: "Delhi",
    match: ["delhi", "new delhi", "south delhi"],
    localities: ["South Delhi", "Greater Kailash", "Vasant Vihar", "Dwarka", "Rohini", "Saket", "Defence Colony", "Punjabi Bagh"],
    market: "Delhi is builder-floor and resale country — inventory changes weekly and buyers expect photos, floor, facing and price on one page before they call.",
  },
  {
    slug: "mumbai",
    name: "Mumbai",
    state: "Maharashtra",
    match: ["mumbai", "bombay"],
    localities: ["Andheri", "Bandra", "Powai", "Worli", "Goregaon", "Malad", "Borivali", "Chembur", "Lower Parel", "Kandivali"],
    market: "Mumbai brokers juggle redevelopment launches, resale and rentals across tight micro-markets, and the carpet-area and per-sq-ft figures on a listing decide whether a buyer calls back.",
  },
  {
    slug: "thane",
    name: "Thane",
    state: "Maharashtra",
    match: ["thane"],
    localities: ["Ghodbunder Road", "Majiwada", "Kolshet Road", "Pokhran Road", "Hiranandani Estate", "Balkum", "Kasarvadavali"],
    market: "Thane CPs sell township launches along Ghodbunder Road at volume, often representing one developer across several towers and payment plans.",
  },
  {
    slug: "navi-mumbai",
    name: "Navi Mumbai",
    state: "Maharashtra",
    match: ["navi mumbai"],
    localities: ["Kharghar", "Panvel", "Ulwe", "Vashi", "Nerul", "Airoli", "Taloja", "Seawoods"],
    market: "Airport-corridor launches in Ulwe, Panvel and Kharghar are driving a wave of new CP networks who need project pages that carry their own contact card.",
  },
  {
    slug: "pune",
    name: "Pune",
    state: "Maharashtra",
    match: ["pune"],
    localities: ["Baner", "Hinjewadi", "Wakad", "Kharadi", "Hadapsar", "Wagholi", "Balewadi", "Viman Nagar", "Undri", "Tathawade"],
    market: "Pune is one of the most CP-driven markets in India — developers route a large share of launch sales through channel partners, and buyers shortlist on WhatsApp before a weekend visit.",
  },
  {
    slug: "bengaluru",
    name: "Bengaluru",
    state: "Karnataka",
    match: ["bengaluru", "bangalore"],
    localities: ["Whitefield", "Sarjapur Road", "North Bengaluru", "Hebbal", "Electronic City", "Devanahalli", "HSR Layout", "Yelahanka", "Kanakapura Road", "Bannerghatta Road"],
    market: "Bengaluru buyers are tech-savvy and remote-first: many shortlist entirely from links, so page speed, floor plans and a clear price line matter more than the brochure.",
  },
  {
    slug: "hyderabad",
    name: "Hyderabad",
    state: "Telangana",
    match: ["hyderabad", "secunderabad"],
    localities: ["Gachibowli", "Kokapet", "Kondapur", "Tellapur", "Narsingi", "Financial District", "Kompally", "Miyapur", "Shamshabad"],
    market: "Hyderabad's west-corridor launches are high-rise and high-volume, and CP firms routinely represent ten or more projects in the same micro-market.",
  },
  {
    slug: "chennai",
    name: "Chennai",
    state: "Tamil Nadu",
    match: ["chennai", "madras"],
    localities: ["OMR", "ECR", "Porur", "Perungudi", "Sholinganallur", "Pallavaram", "Anna Nagar", "Velachery"],
    market: "Chennai CPs split between OMR launches and established-city resale, and bilingual listings in English and Tamil help buyers forward pages to family.",
  },
  {
    slug: "kolkata",
    name: "Kolkata",
    state: "West Bengal",
    match: ["kolkata", "calcutta"],
    localities: ["New Town", "Rajarhat", "EM Bypass", "Joka", "Salt Lake", "Behala", "Tollygunge", "Madhyamgram"],
    market: "Kolkata's New Town and EM Bypass launches are sold heavily through channel partners who need clean per-project pages to share with NRI and local buyers alike.",
  },
  {
    slug: "ahmedabad",
    name: "Ahmedabad",
    state: "Gujarat",
    match: ["ahmedabad", "gandhinagar"],
    localities: ["SG Highway", "Shela", "South Bopal", "Gota", "Science City", "GIFT City", "Satellite", "Prahlad Nagar"],
    market: "Ahmedabad and GIFT City CPs sell plotted, residential and commercial inventory side by side, so one tool has to handle all six property categories.",
  },
  {
    slug: "mohali",
    name: "Mohali & Tricity",
    state: "Punjab",
    match: ["mohali", "chandigarh", "zirakpur", "panchkula", "kharar", "tricity"],
    localities: ["Airport Road", "Sector 66–82", "Zirakpur", "Kharar", "New Chandigarh", "Aerocity", "Panchkula"],
    market: "Tricity CPs work plots, builder floors and township flats, often for buyers abroad who decide from a WhatsApp link without visiting first.",
  },
  {
    slug: "jaipur",
    name: "Jaipur",
    state: "Rajasthan",
    match: ["jaipur"],
    localities: ["Jagatpura", "Ajmer Road", "Vaishali Nagar", "Mansarovar", "Tonk Road", "Sirsi Road", "Malviya Nagar"],
    market: "Jaipur is a plotted and villa-heavy market where a well-shot page with location advantages does the first site visit for you.",
  },
  {
    slug: "lucknow",
    name: "Lucknow",
    state: "Uttar Pradesh",
    match: ["lucknow"],
    localities: ["Gomti Nagar Extension", "Sultanpur Road", "Shaheed Path", "Raebareli Road", "Faizabad Road", "Kanpur Road"],
    market: "Lucknow's growth corridors are drawing national developers, and the CP networks that onboard first become the default partners for every new launch.",
  },
  {
    slug: "indore",
    name: "Indore",
    state: "Madhya Pradesh",
    match: ["indore"],
    localities: ["Super Corridor", "Bypass Road", "Vijay Nagar", "Nipania", "Rau", "AB Road"],
    market: "Indore's Super Corridor and bypass townships are sold through tight CP networks that share inventory with each other daily on WhatsApp groups.",
  },
  {
    slug: "goa",
    name: "Goa",
    state: "Goa",
    match: ["goa", "north goa", "south goa", "panjim", "panaji"],
    localities: ["Assagao", "Anjuna", "Siolim", "Porvorim", "Dona Paula", "Candolim", "Margao"],
    market: "Goa is a second-home and villa market where most buyers live in another city — the listing page is the site visit until they fly in.",
  },
];

export function cityBySlug(slug: string) {
  return CITIES.find((c) => c.slug === slug) ?? null;
}

/** Case-insensitive match of a stored free-text city against a SEO city. */
export function cityFromText(text: string | null | undefined) {
  const t = (text ?? "").trim().toLowerCase();
  if (!t) return null;
  return CITIES.find((c) => c.match.includes(t) || c.slug === t) ?? null;
}
