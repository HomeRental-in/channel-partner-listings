import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { HowItWorksButton } from "./HowItWorksModal";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationsBell, type NotificationItem } from "./NotificationsBell";

export function TopBar({
  brand,
  user,
  siteHref,
  siteHost,
  intakeNumber,
  notifications,
  unreadCount,
}: {
  brand: string;
  user: { name: string | null; avatarUrl: string | null; phone: string };
  siteHref: string | null;
  siteHost: string | null;
  intakeNumber: string | null;
  notifications: NotificationItem[];
  unreadCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 px-4 md:px-6 py-3 bg-bg/90 backdrop-blur">
      <Link href="/dashboard" className="md:hidden text-base font-semibold tracking-tight mr-auto">
        {brand}
      </Link>
      <div className="hidden md:block mr-auto" />
      <HowItWorksButton intakeNumber={intakeNumber} siteHost={siteHost} />
      {siteHref ? (
        <a href={siteHref} target="_blank" rel="noreferrer" className="btn btn-light !py-2.5 !px-4 text-sm">
          <ExternalLink size={16} /> <span className="hidden sm:inline">View site</span>
        </a>
      ) : (
        <Link href="/dashboard#address" className="btn btn-light !py-2.5 !px-4 text-sm">
          <ExternalLink size={16} /> <span className="hidden sm:inline">Claim address</span>
        </Link>
      )}
      <NotificationsBell initial={notifications} unreadCount={unreadCount} />
      <ProfileMenu name={user.name} avatarUrl={user.avatarUrl} phone={user.phone} />
    </header>
  );
}
