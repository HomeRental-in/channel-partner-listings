import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { loadAnalytics, parseRange } from "./data";
import { RangeChips } from "@/components/analytics/RangeChips";
import { StatTiles } from "@/components/analytics/StatTiles";
import { ViewsChart } from "@/components/analytics/ViewsChart";
import { ListingTable } from "@/components/analytics/ListingTable";
import { CallTomorrow } from "@/components/analytics/CallTomorrow";
import { AudiencePanel } from "@/components/analytics/AudiencePanel";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

export default async function AnalyticsPage(props: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const { range: rangeParam } = await props.searchParams;
  const range = parseRange(rangeParam);
  const data = await loadAnalytics(user.id, range);
  const liveCount = data.listings.filter((l) => l.status === "LIVE").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Analytics</p>
          <h1 className="mt-1 text-3xl">How your listings are doing</h1>
          <p className="mt-1 text-sm text-muted">
            {liveCount} live listing{liveCount === 1 ? "" : "s"} · counts are per open, never tied to a buyer identity.
          </p>
        </div>
        <RangeChips active={range} />
      </header>

      {!data.hasAnyEvents && (
        <div className="panel mt-6 p-8 text-center">
          <h2 className="text-xl">No views yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Share a listing link on WhatsApp — the first open shows up here within seconds. Add <span className="font-mono text-xs">?n=Name</span> to a link to see who came back.
          </p>
        </div>
      )}

      <section className="mt-6">
        <StatTiles totals={data.totals} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <ViewsChart data={data.chart} />
        <CallTomorrow rows={data.callTomorrow} />
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div>
          <div className="mb-3 flex items-baseline justify-between px-1">
            <h2 className="text-lg">Per listing</h2>
            <span className="text-xs text-muted">Tap “Named” to see who opened a personalised link</span>
          </div>
          <ListingTable rows={data.listings} />
        </div>
        <AudiencePanel cities={data.cities} peakHour={data.peakHour} repeatViewers={data.repeatViewers} />
      </section>
    </main>
  );
}
