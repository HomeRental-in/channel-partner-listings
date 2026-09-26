import { db } from "@/lib/db";
import { getListingStats, getNamedViewers, getOwnerStats, type OwnerStats } from "@/lib/analytics";
import { istDateKey, istDayStart, istHour } from "@/lib/reports";
import type { NamedViewerJson } from "@/lib/reports";

export type Range = "7d" | "30d" | "all";
export const RANGES: { key: Range; label: string }[] = [
  { key: "7d", label: "Last 7 days" },
  { key: "30d", label: "Last 30 days" },
  { key: "all", label: "All time" },
];
const DAY_MS = 86400000;
const CHART_DAYS = 30;

export type ListingRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  cover: string | null;
  locality: string | null;
  city: string | null;
  views: number;
  uniqueViewers: number;
  taps: number;
  whatsappTaps: number;
  callTaps: number;
  brochureDownloads: number;
  conversion: number;
  statusLine: string;
  hot: boolean;
  named: NamedViewerJson[];
};

export type CallRow = { listingId: string; listingTitle: string; name: string; opens: number; brochure: boolean; lastSeen: string };

export type AnalyticsData = {
  range: Range;
  since: Date | null;
  totals: OwnerStats;
  chart: { day: string; label: string; views: number }[];
  listings: ListingRow[];
  callTomorrow: CallRow[];
  cities: { city: string; count: number }[];
  peakHour: number | null;
  repeatViewers: number;
  hasAnyEvents: boolean;
};

export function parseRange(v: string | undefined): Range {
  return v === "7d" || v === "all" ? v : "30d";
}

export function sinceFor(range: Range): Date | null {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(istDayStart().getTime() - (days - 1) * DAY_MS);
}

export function statusLine(l: { status: string; views: number; conversion: number; named: NamedViewerJson[] }): { text: string; hot: boolean } {
  if (l.status === "DRAFT") return { text: "Draft — publish to start tracking", hot: false };
  if (l.status === "SOLD" || l.status === "RENTED") return { text: `${l.status === "SOLD" ? "Sold" : "Rented"} — nice work`, hot: false };
  if (l.status === "ARCHIVED") return { text: "Archived", hot: false };
  const back = l.named.filter((n) => n.repeat).length;
  if (back >= 1) return { text: `Hot — ${back} named viewer${back === 1 ? "" : "s"} came back`, hot: true };
  if (l.views === 0) return { text: "Quiet — share this link today", hot: false };
  if (l.conversion >= 10) return { text: "Converting — buyers are tapping", hot: true };
  if (l.views >= 25) return { text: "Busy — lots of eyes on this", hot: false };
  return { text: "Steady — keep sharing", hot: false };
}

export async function loadAnalytics(userId: string, range: Range): Promise<AnalyticsData> {
  const since = sinceFor(range);
  const chartStart = new Date(istDayStart().getTime() - (CHART_DAYS - 1) * DAY_MS);
  const viewsSince = since && since < chartStart ? since : since ? chartStart : null;

  const [totals, listings, viewEvents, anyEvent] = await Promise.all([
    getOwnerStats(userId, since ?? undefined),
    db.listing.findMany({
      where: { userId, status: { not: "ARCHIVED" } },
      select: { id: true, title: true, slug: true, status: true, locality: true, city: true, photos: { orderBy: { order: "asc" }, take: 1, select: { url: true } } },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
    db.analyticsEvent.findMany({
      where: { ownerId: userId, type: "VIEW", ...(viewsSince ? { createdAt: { gte: viewsSince } } : {}) },
      select: { createdAt: true, city: true, visitorId: true },
      orderBy: { createdAt: "desc" },
      take: 50000,
    }),
    db.analyticsEvent.findFirst({ where: { ownerId: userId }, select: { id: true } }),
  ]);

  const ids = listings.map((l) => l.id);
  const [stats, namedPerListing] = await Promise.all([
    getListingStats(ids, since ?? undefined),
    Promise.all(ids.map((id) => getNamedViewers(id, since ?? undefined))),
  ]);

  // Chart: last 30 days of views by IST day
  const byDay = new Map<string, number>();
  for (let i = 0; i < CHART_DAYS; i++) byDay.set(istDateKey(new Date(chartStart.getTime() + i * DAY_MS)), 0);
  const hours = new Array<number>(24).fill(0);
  const cities = new Map<string, number>();
  const visits = new Map<string, number>();
  for (const e of viewEvents) {
    if (e.createdAt >= chartStart) {
      const k = istDateKey(e.createdAt);
      if (byDay.has(k)) byDay.set(k, (byDay.get(k) ?? 0) + 1);
    }
    if (!since || e.createdAt >= since) {
      hours[istHour(e.createdAt)] += 1;
      if (e.city) cities.set(e.city, (cities.get(e.city) ?? 0) + 1);
      if (e.visitorId) visits.set(e.visitorId, (visits.get(e.visitorId) ?? 0) + 1);
    }
  }
  const chart = [...byDay.entries()].map(([day, views]) => ({ day, label: new Date(`${day}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "short" }), views }));
  const inRangeViews = hours.reduce((a, b) => a + b, 0);
  const peakHour = inRangeViews ? hours.indexOf(Math.max(...hours)) : null;
  const repeatViewers = [...visits.values()].filter((n) => n >= 2).length;

  const rows: ListingRow[] = listings.map((l, i) => {
    const s = stats[l.id];
    const named = namedPerListing[i].map((n) => ({ ...n, lastSeen: n.lastSeen.toISOString() }));
    const base = { status: l.status, views: s?.views ?? 0, conversion: s?.conversion ?? 0, named };
    const line = statusLine(base);
    return {
      id: l.id,
      title: l.title || "Untitled listing",
      slug: l.slug,
      status: l.status,
      cover: l.photos[0]?.url ?? null,
      locality: l.locality,
      city: l.city,
      views: s?.views ?? 0,
      uniqueViewers: s?.uniqueViewers ?? 0,
      taps: (s?.whatsappTaps ?? 0) + (s?.callTaps ?? 0),
      whatsappTaps: s?.whatsappTaps ?? 0,
      callTaps: s?.callTaps ?? 0,
      brochureDownloads: s?.brochureDownloads ?? 0,
      conversion: s?.conversion ?? 0,
      statusLine: line.text,
      hot: line.hot,
      named,
    };
  });
  rows.sort((a, b) => b.views - a.views || (a.status === "LIVE" ? 0 : 1) - (b.status === "LIVE" ? 0 : 1));

  const callTomorrow: CallRow[] = rows
    .flatMap((r) => r.named.filter((n) => n.opens >= 2 || n.brochure).map((n) => ({ listingId: r.id, listingTitle: r.title, name: n.name, opens: n.opens, brochure: n.brochure, lastSeen: n.lastSeen })))
    .sort((a, b) => b.opens + (b.brochure ? 2 : 0) - (a.opens + (a.brochure ? 2 : 0)))
    .slice(0, 20);

  return {
    range,
    since,
    totals,
    chart,
    listings: rows,
    callTomorrow,
    cities: [...cities.entries()].map(([city, count]) => ({ city, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    peakHour,
    repeatViewers,
    hasAnyEvents: !!anyEvent,
  };
}
