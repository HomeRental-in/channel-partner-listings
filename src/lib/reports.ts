import { db } from "./db";
import { getNamedViewers, type NamedViewer } from "./analytics";
import { qualityScore } from "./ai";
import { rootUrl } from "./site";

/**
 * Daily report (Flow E): built once per user per IST day, stored in DailyReport.payload,
 * shown under Notifications and sent via the WhatsApp provider as ≤5 lines + link.
 */

export const IST_OFFSET_MS = 330 * 60 * 1000;
const DAY_MS = 86400000;

/** IST midnight for the day containing `d` (returned as a UTC Date). */
export function istDayStart(d = new Date()) {
  return new Date(Math.floor((d.getTime() + IST_OFFSET_MS) / DAY_MS) * DAY_MS - IST_OFFSET_MS);
}
/** IST hour (0-23) of a Date. */
export function istHour(d: Date) {
  return Math.floor(((d.getTime() + IST_OFFSET_MS) % DAY_MS) / 3600000);
}
/** "2026-09-25" for the IST day containing `d`. */
export function istDateKey(d: Date) {
  return new Date(d.getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}
export function formatHour(h: number) {
  const suffix = h >= 12 ? "pm" : "am";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh} ${suffix}`;
}

export type NamedViewerJson = Omit<NamedViewer, "lastSeen"> & { lastSeen: string };
export type CallTomorrowRow = { listingId: string; listingTitle: string; name: string; opens: number; brochure: boolean };

export type DailyReportPayload = {
  date: string; // IST day, YYYY-MM-DD
  totals: { views: number; uniqueViewers: number; whatsappTaps: number; callTaps: number; brochureDownloads: number };
  deltaVsYesterday: { views: number; uniqueViewers: number; taps: number };
  topListing: { id: string; title: string; slug: string; views: number } | null;
  zeroViewListings: { id: string; title: string }[];
  viewerCities: { city: string; count: number }[];
  peakHour: number | null; // IST hour
  repeatViewers: number;
  namedViewers: Record<string, NamedViewerJson[]>; // listingId → viewers
  callTomorrow: CallTomorrowRow[];
  qualityHints: { listingId: string; title: string; score: number; hint: string }[];
  liveListings: number;
  hasEvents: boolean;
};

type Ev = { listingId: string | null; type: string; visitorId: string | null; city: string | null; createdAt: Date };

function summarise(events: Ev[]) {
  const views = events.filter((e) => e.type === "VIEW");
  const visitors = new Set(views.map((e) => e.visitorId ?? "anon"));
  const count = (t: string) => events.filter((e) => e.type === t).length;
  return {
    views: views.length,
    uniqueViewers: visitors.size,
    whatsappTaps: count("WHATSAPP_TAP"),
    callTaps: count("CALL_TAP"),
    brochureDownloads: count("BROCHURE_DOWNLOAD"),
  };
}

/** Build the report for the IST day containing `day`. */
export async function buildDailyReport(userId: string, day: Date): Promise<DailyReportPayload> {
  const start = istDayStart(day);
  const end = new Date(start.getTime() + DAY_MS);
  const prevStart = new Date(start.getTime() - DAY_MS);

  const [events, prevEvents, listings] = await Promise.all([
    db.analyticsEvent.findMany({ where: { ownerId: userId, createdAt: { gte: start, lt: end } }, select: { listingId: true, type: true, visitorId: true, city: true, createdAt: true } }),
    db.analyticsEvent.findMany({ where: { ownerId: userId, createdAt: { gte: prevStart, lt: start } }, select: { listingId: true, type: true, visitorId: true, city: true, createdAt: true } }),
    db.listing.findMany({
      where: { userId, status: "LIVE" },
      select: { id: true, title: true, slug: true, price: true, areaSqft: true, locality: true, city: true, description: true, highlights: true, amenities: true, bhk: true, furnishing: true, possession: true, mapUrl: true, qualityScore: true, _count: { select: { photos: true, documents: true } } },
      orderBy: { publishedAt: "desc" },
    }),
  ]);

  const totals = summarise(events);
  const prev = summarise(prevEvents);
  const deltaVsYesterday = {
    views: totals.views - prev.views,
    uniqueViewers: totals.uniqueViewers - prev.uniqueViewers,
    taps: totals.whatsappTaps + totals.callTaps - (prev.whatsappTaps + prev.callTaps),
  };

  // Per-listing views
  const viewsByListing = new Map<string, number>();
  const visitsByVisitor = new Map<string, number>();
  const hours = new Array<number>(24).fill(0);
  const cities = new Map<string, number>();
  for (const e of events) {
    if (e.type !== "VIEW") continue;
    if (e.listingId) viewsByListing.set(e.listingId, (viewsByListing.get(e.listingId) ?? 0) + 1);
    const vid = e.visitorId ?? "anon";
    visitsByVisitor.set(vid, (visitsByVisitor.get(vid) ?? 0) + 1);
    hours[istHour(e.createdAt)] += 1;
    if (e.city) cities.set(e.city, (cities.get(e.city) ?? 0) + 1);
  }
  const byId = new Map(listings.map((l) => [l.id, l]));
  let topListing: DailyReportPayload["topListing"] = null;
  for (const [id, v] of viewsByListing) {
    const l = byId.get(id);
    if (!l) continue;
    if (!topListing || v > topListing.views) topListing = { id, title: l.title, slug: l.slug, views: v };
  }
  const zeroViewListings = listings.filter((l) => !viewsByListing.get(l.id)).map((l) => ({ id: l.id, title: l.title }));
  const viewerCities = [...cities.entries()].map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const peakHour = totals.views ? hours.indexOf(Math.max(...hours)) : null;
  const repeatViewers = [...visitsByVisitor.entries()].filter(([k, n]) => k !== "anon" && n >= 2).length;

  // Named viewers per listing (since day start) + call-tomorrow list
  const namedViewers: Record<string, NamedViewerJson[]> = {};
  const callTomorrow: CallTomorrowRow[] = [];
  for (const l of listings) {
    const rows = await getNamedViewers(l.id, start);
    if (!rows.length) continue;
    namedViewers[l.id] = rows.map((r) => ({ ...r, lastSeen: r.lastSeen.toISOString() }));
    for (const r of rows) if (r.opens >= 2 || r.brochure) callTomorrow.push({ listingId: l.id, listingTitle: l.title, name: r.name, opens: r.opens, brochure: r.brochure });
  }
  callTomorrow.sort((a, b) => b.opens + (b.brochure ? 2 : 0) - (a.opens + (a.brochure ? 2 : 0)));

  const qualityHints = listings
    .filter((l) => l.qualityScore < 70)
    .map((l) => {
      const q = qualityScore({ ...l, photoCount: l._count.photos, documentsCount: l._count.documents });
      return { listingId: l.id, title: l.title, score: q.score, hint: q.hints[0] ?? "" };
    })
    .filter((h) => h.hint)
    .slice(0, 5);

  return {
    date: istDateKey(start),
    totals,
    deltaVsYesterday,
    topListing,
    zeroViewListings,
    viewerCities,
    peakHour,
    repeatViewers,
    namedViewers,
    callTomorrow,
    qualityHints,
    liveListings: listings.length,
    hasEvents: events.length > 0,
  };
}

function short(title: string, max = 40) {
  const t = title.trim() || "Untitled listing";
  return t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
}
function plural(n: number, one: string, many = one + "s") {
  return `${n} ${n === 1 ? one : many}`;
}
function delta(n: number) {
  if (n === 0) return "same as the day before";
  return `${n > 0 ? "▲" : "▼"} ${Math.abs(n)} vs day before`;
}

/** ≤5 short lines + dashboard link, ready to send on WhatsApp. */
export function formatReportMessage(p: DailyReportPayload): string {
  const lines: string[] = [];
  const t = p.totals;
  if (!p.hasEvents) {
    lines.push(`📊 Yesterday: no views on your ${plural(p.liveListings, "live listing")}.`);
    lines.push("Share a link on WhatsApp today — every open builds your audience.");
  } else {
    const parts = [plural(t.views, "view"), plural(t.uniqueViewers, "person", "people")];
    if (t.whatsappTaps) parts.push(plural(t.whatsappTaps, "WhatsApp tap"));
    if (t.callTaps) parts.push(plural(t.callTaps, "call"));
    if (t.brochureDownloads) parts.push(plural(t.brochureDownloads, "brochure"));
    lines.push(`📊 Yesterday: ${parts.join(" · ")} (${delta(p.deltaVsYesterday.views)})`);
    if (p.topListing) lines.push(`🔥 Top: ${short(p.topListing.title)} — ${plural(p.topListing.views, "view")}`);
    if (p.callTomorrow.length) {
      const names = p.callTomorrow.slice(0, 3).map((c) => `${c.name} (${c.opens} opens${c.brochure ? ", brochure" : ""})`);
      lines.push(`📞 Call today: ${names.join(", ")}${p.callTomorrow.length > 3 ? ` +${p.callTomorrow.length - 3} more` : ""}`);
    }
    const where = p.viewerCities.slice(0, 3).map((c) => c.city).join(", ");
    if (where || p.peakHour != null) {
      lines.push(`📍 ${where ? `Viewers from ${where}` : "Viewers"}${p.peakHour != null ? ` · peak ${formatHour(p.peakHour)}` : ""}${p.repeatViewers ? ` · ${p.repeatViewers} came back` : ""}`);
    }
  }
  if (lines.length < 5) {
    if (p.qualityHints[0]) lines.push(`💡 ${short(p.qualityHints[0].title, 28)}: ${p.qualityHints[0].hint.toLowerCase()}`);
    else if (p.zeroViewListings.length && p.hasEvents) lines.push(`💡 ${plural(p.zeroViewListings.length, "listing")} had no views — share ${p.zeroViewListings.length === 1 ? "it" : "them"} today`);
  }
  return [...lines.slice(0, 5), rootUrl("/dashboard/analytics")].join("\n");
}
