import type { Metadata } from "next";
import Link from "next/link";
import clsx from "clsx";
import { Bell, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { markAllNotificationsRead } from "@/app/dashboard/actions";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  const user = await requireUser();
  const rows = await db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 100 });
  const unread = rows.filter((r) => !r.readAt).length;
  async function readAll() {
    "use server";
    await markAllNotificationsRead();
  }

  return (
    <div className="pt-2 flex flex-col gap-4">
      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h1 className="text-3xl">Notifications</h1>
          <p className="text-muted mt-1">Daily reports and updates about your listings.</p>
        </div>
        {unread > 0 && (
          <form action={readAll}>
            <button type="submit" className="btn btn-light !py-2.5 !px-4 text-sm">
              <CheckCheck size={16} /> Mark all read
            </button>
          </form>
        )}
      </div>
      {rows.length === 0 ? (
        <EmptyState icon={<Bell size={22} />} title="No notifications yet" description="Your daily report arrives at 8:00 IST when you have activity. Turn it on in Settings." action={<Link href="/dashboard/settings#preferences" className="btn btn-dark">Settings</Link>} />
      ) : (
        <ul className="card divide-y divide-line">
          {rows.map((n) => {
            const inner = (
              <div className="flex gap-3 px-5 py-4">
                <span className={clsx("mt-2 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-black")} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className={clsx("text-[15px]", !n.readAt && "font-medium")}>{n.title}</p>
                  {n.body && <p className="mt-1 text-sm text-muted whitespace-pre-line">{n.body}</p>}
                  <p className="mt-1 text-xs text-muted">{format(n.createdAt, "d MMM yyyy, h:mm a")}</p>
                </div>
              </div>
            );
            return <li key={n.id}>{n.href ? <Link href={n.href} className="block hover:bg-soft">{inner}</Link> : inner}</li>;
          })}
        </ul>
      )}
    </div>
  );
}
