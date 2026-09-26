"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { FolderOpen, Home, LayoutList, MoreHorizontal, Plus } from "lucide-react";

const TABS = [
  { href: "/dashboard", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/listings", label: "Listings", icon: LayoutList },
  { href: "/dashboard/listings/new", label: "New", icon: Plus, primary: true },
  { href: "/dashboard/collections", label: "Collections", icon: FolderOpen },
  { href: "/dashboard/settings", label: "More", icon: MoreHorizontal },
];

export function MobileTabBar() {
  const pathname = usePathname();
  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-40 bg-panel/95 backdrop-blur border-t border-line pb-[env(safe-area-inset-bottom)]" aria-label="Dashboard">
      <ul className="grid grid-cols-5">
        {TABS.map((t) => {
          const active = t.exact ? pathname === t.href : pathname.startsWith(t.href) && !(t.href === "/dashboard/listings" && pathname.startsWith("/dashboard/listings/new"));
          const Icon = t.icon;
          return (
            <li key={t.href}>
              <Link href={t.href} aria-current={active ? "page" : undefined} className={clsx("flex flex-col items-center gap-0.5 py-2 text-[11px]", active ? "text-black font-medium" : "text-black/55")}>
                {t.primary ? (
                  <span className="-mt-5 mb-0.5 flex h-11 w-11 items-center justify-center rounded-full bg-black text-white shadow-lg">
                    <Icon size={22} />
                  </span>
                ) : (
                  <Icon size={20} strokeWidth={active ? 2.2 : 1.8} />
                )}
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
