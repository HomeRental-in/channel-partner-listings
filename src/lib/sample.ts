import type { PublicListing } from "@/components/themes/types";
import { DEFAULT_BROKER_CARD, type ThemeKey } from "@/lib/types";
import { WHATSAPP_NUMBER, rootUrl } from "@/lib/site";
import { formatINR, perSqft } from "@/lib/format";

/**
 * The public sample listing at /sample. Pure fixture — no database — so the "see a sample" links on the
 * marketing site always work. The contact buttons open our own WhatsApp bot, so a CP who likes what they see
 * is one tap from creating their own.
 */
const PHOTOS: [file: string, roomTag: string][] = [
  ["01-villa-pool.jpg", "Exterior"],
  ["02-living.jpg", "Living room"],
  ["03-lounge.jpg", "Family lounge"],
  ["04-kitchen.jpg", "Kitchen"],
  ["05-dining.jpg", "Dining"],
  ["06-deck.jpg", "Pool deck"],
  ["07-evening.jpg", "Garden"],
  ["08-study.jpg", "Study"],
];

export const SAMPLE_ID = "sample";

export function sampleListing(theme: ThemeKey = "EDITORIAL"): PublicListing {
  const price = 78500000;
  const areaSqft = 5200;
  const photos = PHOTOS.map(([file, roomTag], i) => ({ id: `sample-${i}`, url: `/sample/${file}`, width: 1600, height: 1200, roomTag }));
  return {
    id: SAMPLE_ID,
    slug: "sample",
    url: rootUrl("/sample"),
    status: "LIVE",
    theme,
    title: "4 BHK Villa with Private Pool in Golf Course Extension",
    category: "RESIDENTIAL",
    propertyType: "Villa",
    transaction: "SALE",
    bhk: "4 BHK + Staff",
    areaSqft,
    areaLabel: "5,200 sq ft built-up on a 400 sq yd plot",
    furnishing: "Semi-furnished",
    floor: "Ground + 2",
    totalFloors: "3",
    facing: "North-East",
    ageOfProperty: "2 years",
    bathrooms: 5,
    balconies: 3,
    ownership: "Freehold",
    parking: "3 covered",
    possession: "Ready to move",
    currency: "INR",
    price,
    priceDisplay: formatINR(price),
    perSqft: perSqft(price, areaSqft),
    priceLines: [
      { label: "Asking price", amount: price, unit: null, note: "Registry extra" },
      { label: "Maintenance", amount: 22000, unit: "month", note: null },
    ],
    negotiable: true,
    loanAvailable: true,
    electricity: "Metered, solar offset",
    waterCharges: "Included in maintenance",
    priceHistoryNote: null,
    locality: "Sector 65, Golf Course Extension Road",
    city: "Gurgaon",
    landmark: "5 min from Sector 55-56 metro",
    pincode: "122102",
    mapUrl: "https://www.google.com/maps/search/?api=1&query=Sector+65+Golf+Course+Extension+Road+Gurgaon",
    mapEmbedUrl: "https://maps.google.com/maps?q=Sector%2065%20Golf%20Course%20Extension%20Road%20Gurgaon&z=14&output=embed",
    formUrl: null,
    description:
      "A corner villa on a 400 sq yd plot with a private pool, set inside a gated community on Golf Course Extension Road. The ground floor opens the living and dining rooms onto the deck; four bedrooms sit across the upper two floors, each with its own bath, and the master has a walk-in wardrobe and a terrace.\n\nThe kitchen is fully fitted, there is a separate staff room with its own entry, and the home runs partly on rooftop solar. The Sector 55-56 metro is five minutes away, the airport twenty-five. Freehold, ready to move, with clear papers.",
    highlights: ["Private pool and deck", "Corner plot, three sides open", "Rooftop solar", "Four ensuite bedrooms", "5 min to the metro", "Gated community"],
    features: [
      {
        title: "Space & layout",
        items: [
          { label: "Plot", value: "400 sq yd" },
          { label: "Built-up", value: "5,200 sq ft" },
          { label: "Bedrooms", value: "4 ensuite" },
          { label: "Staff room", value: "Separate entry" },
        ],
      },
      {
        title: "Interiors",
        items: [
          { label: "Flooring", value: "Italian marble" },
          { label: "Kitchen", value: "Modular, fitted" },
          { label: "Wardrobes", value: "All bedrooms" },
          { label: "Air conditioning", value: "VRV" },
        ],
      },
      {
        title: "Outdoors",
        items: [
          { label: "Pool", value: "Private, heated" },
          { label: "Garden", value: "Front and rear" },
          { label: "Terrace", value: "Master and top floor" },
          { label: "Parking", value: "3 covered" },
        ],
      },
    ],
    amenities: ["Swimming Pool", "Gated Community", "Security/CCTV", "Power Backup", "Clubhouse", "Gymnasium", "Kids Play Area", "Solar Panels", "EV Charging", "Servant Room", "Modular Kitchen", "Vastu Compliant"],
    neighbourhood: [
      { label: "Sector 55-56 Metro", value: "5 min" },
      { label: "The Heritage School", value: "8 min" },
      { label: "Artemis Hospital", value: "12 min" },
      { label: "Cyber City", value: "20 min" },
      { label: "IGI Airport", value: "25 min" },
    ],
    urgencyBadge: "Open for visits this weekend",
    videoUrl: null,
    videoTourUrl: null,
    videoTourEmbedUrl: null,
    documentsTitle: null,
    documents: [],
    photos,
    cover: photos[0],
    project: null,
    broker: {
      id: "sample-broker",
      username: null,
      name: "Aarav Mehta",
      hasName: true,
      headerLabel: "Mehta Realty",
      agencyName: "Mehta Realty",
      avatarUrl: null,
      logoUrl: "/sample/logo.svg",
      phone: WHATSAPP_NUMBER,
      whatsapp: WHATSAPP_NUMBER,
      reraNumber: "HRERA-GGM-REA-0000-2026",
      city: "Gurgaon",
      bio: "Twelve years on Golf Course Extension Road. I list only what I have walked through myself.",
      yearsExperience: 12,
      dealsClosed: 180,
      activeListings: 14,
      responseTime: "1h",
      languages: ["English", "Hindi"],
      areas: ["Golf Course Extension", "Sector 65", "Sohna Road"],
      testimonials: [],
      awards: [],
      card: DEFAULT_BROKER_CARD,
      siteUrl: rootUrl("/sample"),
    },
    publishedAt: null,
  };
}
