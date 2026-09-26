import Link from "next/link";
import { Plus, MessageCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getListingStats, getOwnerStats } from "@/lib/analytics";
import { formatINR, usernameFrom } from "@/lib/format";
import { ROOT_DOMAIN, siteUrl, waLink } from "@/lib/site";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { StatTiles } from "@/components/dashboard/StatTiles";
import { RecentListings } from "@/components/dashboard/RecentListings";
import { DailyReportCard } from "@/components/dashboard/DailyReportCard";

export const dynamic = "force-dynamic";

/** 00:00 IST of today, as a UTC Date (IST = UTC+5:30, no DST). */
function todayIST(): { start: Date; end: Date; label: string } {
  const IST = 5.5 * 60 * 60 * 1000;
  const nowIst = new Date(Date.now() + IST);
  const start = new Date(Date.UTC(nowIst.getUTCFullYear(), nowIst.getUTCMonth(), nowIst.getUTCDate()) - IST);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  const label = nowIst.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
  return { start, end, label };
}

function greeting() {
  const h = new Date(Date.now() + 5.5 * 60 * 60 * 1000).getUTCHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function daysAgo(days: number) {
  return new Date(Date.now() - days * 86400 * 1000);
}

export default async function DashboardHome() {
  const user = await requireUser();
  const since = daysAgo(30);
  const { start, end, label } = todayIST();

  const [stats, recent, report, counts] = await Promise.all([
    getOwnerStats(user.id, since),
    db.listing.findMany({ where: { userId: user.id, status: { not: "ARCHIVED" } }, orderBy: { updatedAt: "desc" }, take: 5, include: { photos: { orderBy: { order: "asc" }, take: 1 } } }),
    db.dailyReport.findFirst({ where: { userId: user.id, date: { gte: start, lt: end } } }),
    db.listing.groupBy({ by: ["status"], where: { userId: user.id }, _count: { _all: true } }),
  ]);
  const listingStats = await getListingStats(recent.map((l) => l.id));
  const live = counts.find((c) => c.status === "LIVE")?._count._all ?? 0;
  const drafts = counts.find((c) => c.status === "DRAFT")?._count._all ?? 0;
  const firstName = (user.name ?? "").trim().split(/\s+/)[0] || null;
  const intake = process.env.WHATSAPP_INTAKE_NUMBER ?? null;

  return (
    <div className="flex flex-col gap-5 pt-2">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 px-1">
        <div>
          <h1 className="text-3xl md:text-[38px]">
            {greeting()}
            {firstName ? `, ${firstName}` : ""} 👋
          </h1>
          <p className="mt-1 text-muted">
            {live} live · {drafts} draft{drafts === 1 ? "" : "s"}
            {!user.name && (
              <>
                {" "}
                · <Link href="/dashboard/settings" className="underline">Complete your profile</Link>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {intake && (
            <a href={waLink(intake, "Hi")} target="_blank" rel="noreferrer" className="btn btn-wa">
              <MessageCircle size={18} /> Send on WhatsApp
            </a>
          )}
          <Link href="/dashboard/listings/new" className="btn btn-dark !px-6 !py-4 text-base">
            <Plus size={20} /> Create a new listing
          </Link>
        </div>
      </div>

      {report && <DailyReportCard payload={report.payload} dateLabel={label} />}

      <SiteCard username={user.username} rootDomain={ROOT_DOMAIN} siteHref={user.username ? siteUrl(user.username) : null} suggested={usernameFrom(user.name ?? user.agencyName ?? "")} />

      <StatTiles stats={stats} />

      <RecentListings
        rows={recent.map((l) => ({
          id: l.id,
          title: l.title,
          priceDisplay: formatINR(l.price, { currency: l.currency }),
          locality: l.locality,
          bhk: l.bhk,
          status: l.status,
          cover: l.photos[0]?.url ?? null,
          views: listingStats[l.id]?.views ?? 0,
        }))}
      />
    </div>
  );
}
