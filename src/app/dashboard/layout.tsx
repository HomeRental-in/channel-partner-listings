import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { WHATSAPP_NUMBER, BRAND, ROOT_DOMAIN, siteUrl } from "@/lib/site";
import { ToastProvider } from "@/components/ui/Toast";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { MobileTabBar } from "@/components/dashboard/MobileTabBar";

export const metadata: Metadata = { title: { default: "Dashboard", template: `%s · ${BRAND}` } };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 10 }),
    db.notification.count({ where: { userId: user.id, readAt: null } }),
  ]);
  const items = notifications.map((n) => ({ id: n.id, type: n.type, title: n.title, body: n.body, href: n.href, readAt: n.readAt?.toISOString() ?? null, createdAt: n.createdAt.toISOString() }));
  const intake = process.env.WHATSAPP_INTAKE_NUMBER ?? WHATSAPP_NUMBER;

  return (
    <ToastProvider>
      <div className="flex min-h-dvh">
        <Sidebar brand={BRAND} />
        <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
          <TopBar
            brand={BRAND}
            user={{ name: user.name, avatarUrl: user.avatarUrl, phone: user.phone }}
            siteHref={user.username ? siteUrl(user.username) : null}
            siteHost={user.username ? `${user.username}.${ROOT_DOMAIN}` : null}
            intakeNumber={intake}
            notifications={items}
            unreadCount={unreadCount}
          />
          <main className="flex-1 px-4 md:px-6 pb-8 max-w-[1200px] w-full">{children}</main>
        </div>
      </div>
      <MobileTabBar />
    </ToastProvider>
  );
}
