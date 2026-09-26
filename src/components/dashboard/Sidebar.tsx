"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { Plus } from "lucide-react";
import { NAV, isActive } from "./nav";

export function Sidebar({ brand }: { brand: string }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex md:flex-col w-[248px] shrink-0 sticky top-0 h-dvh p-4">
      <div className="card flex-1 flex flex-col p-4">
        <Link href="/dashboard" className="px-2 py-2 text-lg font-semibold tracking-tight">
          {brand}
        </Link>
        <Link href="/dashboard/listings/new" className="btn btn-dark mt-3 justify-center !py-3">
          <Plus size={18} /> New Listing
        </Link>
        <nav className="mt-4 flex flex-col gap-0.5" aria-label="Dashboard">
          {NAV.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={clsx("flex items-center gap-3 rounded-2xl px-3 py-2.5 text-[15px] transition-colors", active ? "bg-black text-white" : "text-black/70 hover:bg-soft hover:text-black")}
              >
                <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-3 pt-4 text-xs text-muted leading-relaxed">Free forever. No plans, no credits.</div>
      </div>
    </aside>
  );
}
