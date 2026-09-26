/**
 * Idempotent seed: demo user + three LIVE listings (one per theme) + a week of analytics events.
 * Run: npx tsx prisma/seed.ts   (or npm run db:seed)
 */
import { PrismaClient, type EventType, type Prisma } from "@prisma/client";

const db = new PrismaClient();

const DEMO_PHONE = "+919999999999";
const pic = (seed: string) => `https://picsum.photos/seed/${seed}/1600/1200`;

type SeedListing = {
  slug: string;
  theme: "EDITORIAL" | "MIDNIGHT" | "SUNRISE";
  photoSeeds: string[];
  data: Omit<Prisma.ListingUncheckedCreateInput, "userId" | "slug" | "theme" | "status" | "photos">;
};

const LISTINGS: SeedListing[] = [
  {
    slug: "sample-editorial-listing",
    theme: "EDITORIAL",
    photoSeeds: ["aureva-hero", "aureva-living", "aureva-kitchen", "aureva-master", "aureva-balcony", "aureva-pool", "aureva-lobby", "aureva-night"],
    data: {
      title: "4 BHK + Servant in DLF The Aureva, Sector 63",
      category: "RESIDENTIAL",
      propertyType: "Apartment",
      transaction: "SALE",
      bhk: "4 BHK + Servant",
      areaSqft: 4200,
      areaLabel: "4200 sq ft super built-up",
      furnishing: "Semi-furnished",
      floor: "18",
      totalFloors: "36",
      facing: "North-East",
      ageOfProperty: "New construction",
      bathrooms: 5,
      balconies: 3,
      ownership: "Freehold",
      parking: "3 covered",
      possession: "Ready to move",
      price: 10_00_00_000,
      priceLines: [
        { label: "Asking price", amount: 10_00_00_000, note: "All-inclusive, slightly negotiable" },
        { label: "Per sq ft", amount: 23810, unit: "sq ft" },
        { label: "Maintenance", amount: 18000, unit: "month" },
      ],
      negotiable: true,
      loanAvailable: true,
      locality: "Sector 63, Golf Course Extension Road",
      city: "Gurgaon",
      landmark: "Opposite Paras Trinity",
      pincode: "122102",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=DLF+The+Aureva+Sector+63+Gurgaon",
      description:
        "A rare north-east facing 4 BHK on the 18th floor of DLF The Aureva, with an uninterrupted Aravalli view from the 40-foot living room deck. Italian marble through the living and dining, a fully fitted modular kitchen with Siemens appliances, and a separate servant quarter with its own entry.\n\nThe tower sits on the Golf Course Extension Road with a 5-minute drive to Sector 55-56 metro and 25 minutes to IGI Airport. The club has an Olympic-length pool, squash courts and a co-working lounge. Two owners, both papers clear, ready to move.",
      highlights: ["Aravalli-facing 18th floor", "4200 sq ft, 3 balconies", "3 covered car parks", "Ready to move, freehold", "5 min to Sector 55-56 metro", "Bank loan pre-approved"],
      features: [
        {
          id: "interiors",
          title: "Interiors",
          items: [
            { label: "Flooring", value: "Italian marble" },
            { label: "Kitchen", value: "Modular, Siemens appliances" },
            { label: "Wardrobes", value: "All 4 bedrooms" },
            { label: "Air conditioning", value: "VRV throughout" },
          ],
        },
        {
          id: "building",
          title: "Building",
          items: [
            { label: "Lifts", value: "4 high-speed" },
            { label: "Power backup", value: "100%" },
            { label: "Security", value: "3-tier, CCTV" },
            { label: "Fire safety", value: "Sprinklers on every floor" },
          ],
        },
      ],
      amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Kids Play Area", "Jogging Track", "Power Backup", "Security/CCTV", "Gated Community", "Covered Parking", "EV Charging", "Servant Room", "Vastu Compliant"],
      neighbourhood: [
        { label: "Sector 55-56 Metro", value: "5 min" },
        { label: "IGI Airport", value: "25 min" },
        { label: "Cyber City", value: "20 min" },
        { label: "The Heritage School", value: "8 min" },
        { label: "Artemis Hospital", value: "12 min" },
      ],
      urgencyBadge: "Only 2 units on this floor plan",
      priceHistoryNote: "Launched at ₹ 8.4 Cr in 2022; resale demand has been steady.",
      videoTourUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      originalMessage: "4bhk aureva sector 63 18th floor aravalli view 4200 sqft 10cr negotiable ready to move 3 parking",
      qualityScore: 92,
      source: "WHATSAPP",
    },
  },
  {
    slug: "sample-midnight-listing",
    theme: "MIDNIGHT",
    photoSeeds: ["godrej-woods-hero", "godrej-woods-living", "godrej-woods-bedroom", "godrej-woods-kitchen", "godrej-woods-view", "godrej-woods-club", "godrej-woods-garden"],
    data: {
      title: "3 BHK in Godrej Woods, Sector 43 Noida",
      category: "RESIDENTIAL",
      propertyType: "Apartment",
      transaction: "SALE",
      bhk: "3 BHK",
      areaSqft: 2100,
      areaLabel: "2100 sq ft carpet",
      furnishing: "Unfurnished",
      floor: "11",
      totalFloors: "32",
      facing: "East",
      ageOfProperty: "Under construction · possession Dec 2026",
      bathrooms: 3,
      balconies: 2,
      ownership: "Freehold",
      parking: "2 covered",
      possession: "Dec 2026",
      price: 3_20_00_000,
      priceLines: [
        { label: "Asking price", amount: 3_20_00_000, note: "Builder transfer charges extra" },
        { label: "Per sq ft", amount: 15238, unit: "sq ft" },
        { label: "Booking amount", amount: 10_00_000 },
      ],
      negotiable: false,
      loanAvailable: true,
      locality: "Sector 43",
      city: "Noida",
      landmark: "Next to Botanical Garden metro",
      pincode: "201303",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Godrej+Woods+Sector+43+Noida",
      description:
        "Forest-facing 3 BHK in Godrej Woods, the 12-acre low-density project beside the Botanical Garden in Sector 43. Tower C, 11th floor, east-facing with morning light in every bedroom. 2100 sq ft carpet with a 200 sq ft deck facing the central 6-acre woodland.\n\nOriginal allottee, all payments up to date with the builder, transfer possible in two weeks. Botanical Garden metro is a 3-minute walk; DND flyway 8 minutes.",
      highlights: ["Forest-facing deck", "3 min walk to Botanical Garden metro", "Low-density, 12 acres", "Original allottee, clean transfer", "East-facing, 11th floor"],
      features: [
        {
          id: "unit",
          title: "Unit",
          items: [
            { label: "Carpet area", value: "2100 sq ft" },
            { label: "Deck", value: "200 sq ft, woodland view" },
            { label: "Ceiling height", value: "10.5 ft" },
            { label: "Bathrooms", value: "3, Kohler fittings" },
          ],
        },
        {
          id: "project",
          title: "Project",
          items: [
            { label: "Developer", value: "Godrej Properties" },
            { label: "RERA", value: "UPRERAPRJ442214" },
            { label: "Towers", value: "9 towers, 32 floors" },
            { label: "Open area", value: "80%" },
          ],
        },
      ],
      amenities: ["Swimming Pool", "Gymnasium", "Clubhouse", "Kids Play Area", "Jogging Track", "Tennis Court", "Amphitheatre", "Garden / Park", "Metro Nearby", "Power Backup", "Security/CCTV", "Rainwater Harvesting", "EV Charging"],
      neighbourhood: [
        { label: "Botanical Garden Metro", value: "3 min walk" },
        { label: "DND Flyway", value: "8 min" },
        { label: "Amity University", value: "10 min" },
        { label: "Fortis Hospital", value: "12 min" },
        { label: "DLF Mall of India", value: "9 min" },
      ],
      urgencyBadge: "Transfer window closes this month",
      originalMessage: "godrej woods sec 43 noida 3bhk tower c 11th floor forest facing 2100 carpet 3.2cr",
      qualityScore: 88,
      source: "WEB",
    },
  },
  {
    slug: "sample-sunrise-listing",
    theme: "SUNRISE",
    photoSeeds: ["cybercity-hero", "cybercity-floor", "cybercity-reception", "cybercity-cabin", "cybercity-boardroom", "cybercity-cafeteria", "cybercity-lobby", "cybercity-skyline"],
    data: {
      title: "Furnished office, 8,500 sq ft in DLF Cyber City",
      category: "COMMERCIAL_OFFICE",
      propertyType: "Office Space",
      transaction: "LEASE",
      areaSqft: 8500,
      areaLabel: "8,500 sq ft super area",
      furnishing: "Fully furnished · 96 workstations",
      floor: "9",
      totalFloors: "14",
      facing: "West",
      ageOfProperty: "Building 2012, fit-out 2023",
      bathrooms: 4,
      ownership: "Leasehold",
      parking: "12 reserved",
      possession: "Immediate",
      price: 14_45_000,
      priceLines: [
        { label: "Monthly rent", amount: 14_45_000, unit: "month", note: "₹ 170 / sq ft" },
        { label: "CAM", amount: 1_70_000, unit: "month" },
        { label: "Security deposit", amount: 86_70_000, note: "6 months" },
      ],
      negotiable: true,
      electricity: "Actuals, metered",
      locality: "DLF Cyber City, Building 10",
      city: "Gurgaon",
      landmark: "Cyber Hub, 2 min walk",
      pincode: "122002",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=DLF+Cyber+City+Building+10+Gurgaon",
      description:
        "Plug-and-play office on the 9th floor of Building 10, DLF Cyber City. 8,500 sq ft with 96 workstations, 6 cabins, 2 boardrooms (12 and 20 seats), a phone-booth row and a 30-seat cafeteria. Fit-out done in 2023 with raised flooring and 2×N power.\n\nGrade-A building with dual-feed power, 24×7 access and a lobby right on the Cyber Hub promenade. Rapid Metro Cyber City station is a 4-minute walk. Minimum 3-year lock-in; available immediately.",
      highlights: ["96 workstations, move in Monday", "2 boardrooms + 6 cabins", "12 reserved car parks", "Grade-A, dual-feed power", "4 min to Rapid Metro", "Cyber Hub at the doorstep"],
      features: [
        {
          id: "layout",
          title: "Layout",
          items: [
            { label: "Workstations", value: "96" },
            { label: "Cabins", value: "6" },
            { label: "Boardrooms", value: "12-seat and 20-seat" },
            { label: "Cafeteria", value: "30 seats, pantry" },
          ],
        },
        {
          id: "building",
          title: "Building",
          items: [
            { label: "Grade", value: "A" },
            { label: "Power", value: "Dual feed, 100% backup" },
            { label: "Access", value: "24×7, card controlled" },
            { label: "Floor loading", value: "350 kg/sq m" },
          ],
        },
      ],
      amenities: ["Lift", "Power Backup", "Security/CCTV", "Covered Parking", "Visitor Parking", "Fire Safety", "Air Conditioning", "Intercom", "Metro Nearby", "Shopping Centre"],
      neighbourhood: [
        { label: "Rapid Metro Cyber City", value: "4 min walk" },
        { label: "Cyber Hub", value: "2 min walk" },
        { label: "IGI Airport", value: "20 min" },
        { label: "NH-48", value: "3 min" },
        { label: "Ambience Mall", value: "6 min" },
      ],
      documentsTitle: "Floor plan and fit-out drawings",
      originalMessage: "cyber city bldg 10 9th floor 8500 sqft furnished 96 ws 170/sqft lease immediate",
      qualityScore: 85,
      source: "WEB",
    },
  },
];

async function main() {
  const user = await db.user.upsert({
    where: { phone: DEMO_PHONE },
    update: {},
    create: {
      phone: DEMO_PHONE,
      whatsappNumber: DEMO_PHONE,
      name: "Demo Partner",
      agencyName: "Demo Realty",
      email: "demo@example.com",
      city: "Gurgaon",
      username: "demo",
      avatarUrl: "https://picsum.photos/seed/demo-partner-avatar/400/400",
      reraNumber: "HRERA-PKL-REA-1188-2023",
      bio: "Fifteen years selling on the Golf Course Extension and Noida Expressway. I only list what I have walked through myself, and I reply within the hour.",
      yearsExperience: 15,
      dealsClosed: 240,
      areas: ["Sector 63", "Golf Course Extension Road", "Sector 43 Noida", "Cyber City", "Noida Expressway"],
      propertyTypes: ["Residential", "Luxury", "Commercial", "New Projects"],
      languages: ["English", "Hindi", "Punjabi"],
      responseTime: "1h",
      testimonials: [
        { quote: "Found us a forest-facing 3 BHK in two weekends and handled the builder transfer end to end.", author: "Priya Mehra", role: "Buyer, Noida" },
        { quote: "Straight talk on pricing. Sold our Aureva flat in 5 weeks at the number he said we'd get.", author: "Rahul Khanna", role: "Seller, Gurgaon" },
        { quote: "Moved our 90-person team into Cyber City with zero downtime.", author: "Sneha Iyer", role: "Ops Head, fintech" },
      ],
      awards: [
        { title: "Top Channel Partner, DLF Homes", year: "2024", by: "DLF" },
        { title: "Platinum Circle", year: "2023", by: "Godrej Properties" },
        { title: "NAR-India Certified Realtor", year: "2021", by: "NAR India" },
      ],
      brokerCard: { showNamePhoto: true, showAgency: true, showProfileLink: true, showWhatsApp: true, showCall: true },
      defaultTheme: "EDITORIAL",
      dailyReport: true,
      onboardedAt: new Date(),
    },
  });
  console.log(`user ${user.username} (${user.id})`);

  const listingIds: string[] = [];
  for (const s of LISTINGS) {
    const base = { ...s.data, userId: user.id, theme: s.theme, status: "LIVE" as const, publishedAt: new Date(Date.now() - 9 * 86400 * 1000) };
    const listing = await db.listing.upsert({ where: { slug: s.slug }, update: base, create: { ...base, slug: s.slug } });
    await db.photo.deleteMany({ where: { listingId: listing.id } });
    await db.photo.createMany({
      data: s.photoSeeds.map((seed, i) => ({ listingId: listing.id, url: pic(seed), width: 1600, height: 1200, order: i, roomTag: ROOM_TAGS[i % ROOM_TAGS.length] })),
    });
    listingIds.push(listing.id);
    console.log(`listing ${s.slug} (${listing.id}) · ${s.photoSeeds.length} photos`);
  }

  // Analytics: wipe and regenerate a deterministic week of events for these listings.
  await db.analyticsEvent.deleteMany({ where: { ownerId: user.id } });
  const events: Prisma.AnalyticsEventCreateManyInput[] = [];
  const names = ["Rahul", "Priya", "Amit", "Sneha", null, null, null];
  const cities = ["Gurgaon", "Delhi", "Noida", "Mumbai", "Bengaluru"];
  let n = 0;
  for (let day = 6; day >= 0; day--) {
    for (const [li, listingId] of listingIds.entries()) {
      const views = 4 + ((day * 3 + li * 5) % 7);
      for (let v = 0; v < views; v++) {
        n++;
        const visitorId = `seed-visitor-${(n * 7 + li) % 23}`;
        const viewerName = names[(n + li) % names.length];
        const at = new Date(Date.now() - day * 86400 * 1000 - ((n * 37) % 14) * 3600 * 1000 - (n % 60) * 60000);
        const common = { listingId, ownerId: user.id, visitorId, viewerName, city: cities[n % cities.length], device: n % 3 === 0 ? "desktop" : "mobile", referrer: n % 4 === 0 ? "https://l.wl.co/" : null, path: `/l/${LISTINGS[li].slug}` };
        events.push({ ...common, type: "VIEW", createdAt: at });
        if (n % 4 === 0) events.push({ ...common, type: "WHATSAPP_TAP" as EventType, createdAt: new Date(at.getTime() + 90_000) });
        if (n % 9 === 0) events.push({ ...common, type: "CALL_TAP" as EventType, createdAt: new Date(at.getTime() + 120_000) });
        if (n % 11 === 0) events.push({ ...common, type: "BROCHURE_DOWNLOAD" as EventType, createdAt: new Date(at.getTime() + 200_000) });
      }
    }
  }
  await db.analyticsEvent.createMany({ data: events });
  console.log(`analytics: ${events.length} events over 7 days`);

  // A welcome notification (only once).
  const hasWelcome = await db.notification.findFirst({ where: { userId: user.id, type: "welcome" } });
  if (!hasWelcome) {
    await db.notification.create({ data: { userId: user.id, type: "welcome", title: "Welcome to your dashboard", body: "Three sample listings are live on demo.localhost:3000. Share one, or send photos on WhatsApp to create your own.", href: "/dashboard/listings" } });
  }
}

const ROOM_TAGS = ["Exterior", "Living room", "Kitchen", "Master bedroom", "Balcony", "Amenities", "Lobby", "View"];

main()
  .then(async () => {
    await db.$disconnect();
    console.log("seed complete");
  })
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
