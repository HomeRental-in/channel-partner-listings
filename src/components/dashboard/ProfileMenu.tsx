"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, LogOut, Settings, UserRound } from "lucide-react";

export function ProfileMenu({ name, avatarUrl, phone }: { name: string | null; avatarUrl: string | null; phone: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  const initial = (name ?? "").trim().charAt(0).toUpperCase() || "•";
  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex items-center gap-2 rounded-full bg-bg pl-1 pr-2.5 py-1 hover:bg-[#dde2e5]">
        {avatarUrl ? (
          <Image src={avatarUrl} alt="" width={32} height={32} className="h-8 w-8 rounded-full object-cover" unoptimized />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white text-sm font-medium">{initial}</span>
        )}
        <span className="hidden sm:block max-w-[120px] truncate text-sm font-medium">{name ?? phone}</span>
        <ChevronDown size={14} className="text-muted" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 mt-2 w-56 card p-2 shadow-xl border border-line z-50">
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium">{name ?? "Set up your profile"}</p>
            <p className="truncate text-xs text-muted">{phone}</p>
          </div>
          <MenuLink href="/dashboard/settings" icon={<UserRound size={16} />} onClick={() => setOpen(false)}>
            My profile
          </MenuLink>
          <MenuLink href="/dashboard/settings#preferences" icon={<Settings size={16} />} onClick={() => setOpen(false)}>
            Settings
          </MenuLink>
          <form action="/api/auth/logout" method="post" className="mt-1 border-t border-line pt-1">
            <button type="submit" role="menuitem" className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuLink({ href, icon, children, onClick }: { href: string; icon: React.ReactNode; children: React.ReactNode; onClick: () => void }) {
  return (
    <Link href={href} role="menuitem" onClick={onClick} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm hover:bg-soft">
      {icon} {children}
    </Link>
  );
}
