import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/lib/db";
import { getProvider } from "@/lib/whatsapp/provider";
import { buildDailyReport, formatReportMessage, istDayStart, type DailyReportPayload } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/cron/daily-report — run at 08:00 IST. Header `x-cron-secret` must equal CRON_SECRET.
 * Builds yesterday's (IST) report for every user with dailyReport=true and ≥1 LIVE listing,
 * upserts DailyReport, creates a Notification and sends it via the WhatsApp provider.
 *   ?userId=<id>  — only that user (dev / re-run)
 *   ?dryRun=1     — build and return payloads without storing or sending
 *   ?date=YYYY-MM-DD — report for that IST day instead of yesterday
 */
export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  if (req.headers.get("x-cron-secret") !== secret) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const params = req.nextUrl.searchParams;
  const userId = params.get("userId");
  const dryRun = params.get("dryRun") === "1" || params.get("dryRun") === "true";
  const day = resolveDay(params.get("date"));

  const users = await db.user.findMany({
    where: { dailyReport: true, ...(userId ? { id: userId } : {}), listings: { some: { status: "LIVE" } } },
    select: { id: true, phone: true, whatsappNumber: true, name: true },
  });

  const provider = getProvider();
  const results: { userId: string; date: string; sent: boolean; hasEvents: boolean; error?: string; message?: string; payload?: DailyReportPayload }[] = [];

  for (const u of users) {
    let payload: DailyReportPayload;
    try {
      payload = await buildDailyReport(u.id, day);
    } catch (err) {
      results.push({ userId: u.id, date: "", sent: false, hasEvents: false, error: err instanceof Error ? err.message : "build failed" });
      continue;
    }
    const message = formatReportMessage(payload);
    if (dryRun) {
      results.push({ userId: u.id, date: payload.date, sent: false, hasEvents: payload.hasEvents, message, payload });
      continue;
    }

    let sent = false;
    let error: string | undefined;
    try {
      const date = istDayStart(day);
      const existing = await db.dailyReport.findUnique({ where: { userId_date: { userId: u.id, date } }, select: { sentAt: true } });
      const report = await db.dailyReport.upsert({
        where: { userId_date: { userId: u.id, date } },
        update: { payload },
        create: { userId: u.id, date, payload },
      });
      if (!existing) {
        await db.notification.create({
          data: {
            userId: u.id,
            type: "daily_report",
            title: payload.hasEvents ? `Daily report · ${payload.totals.views} views yesterday` : "Daily report · quiet day",
            body: message,
            href: "/dashboard/analytics",
          },
        });
      }
      if (payload.hasEvents && !report.sentAt) {
        await provider.sendText(u.phone, message); // phone = the CP's WhatsApp identity (whatsappNumber is the buyer-facing one)
        await db.dailyReport.update({ where: { id: report.id }, data: { sentAt: new Date() } });
        sent = true;
      }
    } catch (err) {
      error = err instanceof Error ? err.message : "send failed";
      console.error("[cron:daily-report]", u.id, err);
    }
    results.push({ userId: u.id, date: payload.date, sent, hasEvents: payload.hasEvents, error, message });
  }

  return NextResponse.json({ ok: true, day: istDayStart(day).toISOString(), users: users.length, dryRun, results });
}

/** Default: yesterday (IST). `date=YYYY-MM-DD` overrides. */
function resolveDay(date: string | null): Date {
  if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const d = new Date(`${date}T00:00:00+05:30`);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return new Date(istDayStart().getTime() - 86400000);
}
