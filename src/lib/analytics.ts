import { db } from "./db";
import type { EventType, Prisma } from "@prisma/client";

/** Record a public-page event. No PII: visitorId is a random cookie, viewerName is the CP-typed ?n= label. */
export async function recordEvent(e: {
  listingId?: string | null;
  ownerId: string;
  type: EventType;
  visitorId?: string | null;
  viewerName?: string | null;
  city?: string | null;
  device?: string | null;
  referrer?: string | null;
  path?: string | null;
  meta?: Prisma.InputJsonValue;
}) {
  return db.analyticsEvent.create({ data: { ...e, listingId: e.listingId ?? null } });
}

export type OwnerStats = { views: number; uniqueViewers: number; whatsappTaps: number; callTaps: number; brochureDownloads: number; conversion: number };

export async function getOwnerStats(ownerId: string, since?: Date): Promise<OwnerStats> {
  const where = { ownerId, ...(since ? { createdAt: { gte: since } } : {}) };
  const [byType, uniq] = await Promise.all([
    db.analyticsEvent.groupBy({ by: ["type"], where, _count: { _all: true } }),
    db.analyticsEvent.findMany({ where: { ...where, type: "VIEW" }, distinct: ["visitorId"], select: { visitorId: true } }),
  ]);
  const c = (t: EventType) => byType.find((b) => b.type === t)?._count._all ?? 0;
  const views = c("VIEW");
  const taps = c("WHATSAPP_TAP") + c("CALL_TAP");
  return { views, uniqueViewers: uniq.length, whatsappTaps: c("WHATSAPP_TAP"), callTaps: c("CALL_TAP"), brochureDownloads: c("BROCHURE_DOWNLOAD"), conversion: views ? Math.round((taps / views) * 1000) / 10 : 0 };
}

export type ListingStats = OwnerStats & { listingId: string };

export async function getListingStats(listingIds: string[], since?: Date): Promise<Record<string, ListingStats>> {
  if (!listingIds.length) return {};
  const where = { listingId: { in: listingIds }, ...(since ? { createdAt: { gte: since } } : {}) };
  const rows = await db.analyticsEvent.groupBy({ by: ["listingId", "type"], where, _count: { _all: true } });
  const uniq = await db.analyticsEvent.findMany({ where: { ...where, type: "VIEW" }, distinct: ["listingId", "visitorId"], select: { listingId: true } });
  const out: Record<string, ListingStats> = {};
  for (const id of listingIds) out[id] = { listingId: id, views: 0, uniqueViewers: 0, whatsappTaps: 0, callTaps: 0, brochureDownloads: 0, conversion: 0 };
  for (const r of rows) {
    const s = out[r.listingId!];
    if (!s) continue;
    if (r.type === "VIEW") s.views += r._count._all;
    if (r.type === "WHATSAPP_TAP") s.whatsappTaps += r._count._all;
    if (r.type === "CALL_TAP") s.callTaps += r._count._all;
    if (r.type === "BROCHURE_DOWNLOAD") s.brochureDownloads += r._count._all;
  }
  for (const u of uniq) if (u.listingId && out[u.listingId]) out[u.listingId].uniqueViewers += 1;
  for (const s of Object.values(out)) s.conversion = s.views ? Math.round(((s.whatsappTaps + s.callTaps) / s.views) * 1000) / 10 : 0;
  return out;
}

export type NamedViewer = { name: string; opens: number; lastSeen: Date; brochure: boolean; taps: number; repeat: boolean };

/** Per-listing table of ?n= named viewers. The "call tomorrow" list = rows with opens>=2 or brochure. */
export async function getNamedViewers(listingId: string, since?: Date): Promise<NamedViewer[]> {
  const rows = await db.analyticsEvent.findMany({
    where: { listingId, viewerName: { not: null }, ...(since ? { createdAt: { gte: since } } : {}) },
    select: { viewerName: true, type: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const map = new Map<string, NamedViewer>();
  for (const r of rows) {
    const key = r.viewerName!.trim().toLowerCase();
    const v = map.get(key) ?? { name: r.viewerName!.trim(), opens: 0, lastSeen: r.createdAt, brochure: false, taps: 0, repeat: false };
    if (r.type === "VIEW") v.opens += 1;
    if (r.type === "BROCHURE_DOWNLOAD" || r.type === "DOC_DOWNLOAD") v.brochure = true;
    if (r.type === "WHATSAPP_TAP" || r.type === "CALL_TAP") v.taps += 1;
    v.lastSeen = r.createdAt;
    v.repeat = v.opens >= 2;
    map.set(key, v);
  }
  return [...map.values()].sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime());
}
