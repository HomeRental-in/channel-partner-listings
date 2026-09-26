"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import clsx from "clsx";
import { Bell, CheckCheck } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
import { markAllNotificationsRead, markNotificationRead } from "@/app/dashboard/actions";

export type NotificationItem = { id: string; type: string; title: string; body: string | null; href: string | null; readAt: string | null; createdAt: string };

export function NotificationsBell({ initial, unreadCount }: { initial: NotificationItem[]; unreadCount: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(initial);
  const [unread, setUnread] = useState(unreadCount);
  const [, start] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Re-sync local optimistic state when the server sends fresh props (layout re-render).
  const [prevInitial, setPrevInitial] = useState(initial);
  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setItems(initial);
    setUnread(unreadCount);
  }

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

  function readOne(id: string) {
    const item = items.find((i) => i.id === id);
    if (!item || item.readAt) return;
    setItems((list) => list.map((i) => (i.id === id ? { ...i, readAt: new Date().toISOString() } : i)));
    setUnread((u) => Math.max(0, u - 1));
    start(() => {
      void markNotificationRead(id);
    });
  }
  function readAll() {
    setItems((list) => list.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })));
    setUnread(0);
    start(() => {
      void markAllNotificationsRead();
    });
  }

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} className="icon-btn relative !w-10 !h-10" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`} aria-expanded={open} aria-haspopup="true">
        <Bell size={18} />
        {unread > 0 && <span className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">{unread > 9 ? "9+" : unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-[min(92vw,360px)] card shadow-xl border border-line z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-line">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 && (
              <button type="button" onClick={readAll} className="inline-flex items-center gap-1 text-xs text-muted hover:text-black">
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-muted">Nothing here yet. Your daily report will appear here.</li>}
            {items.map((n) => {
              const inner = (
                <>
                  <div className="flex items-start gap-2">
                    <span className={clsx("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-black")} aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className={clsx("text-sm leading-snug", !n.readAt && "font-medium")}>{n.title}</p>
                      {n.body && <p className="mt-0.5 text-xs text-muted line-clamp-3 whitespace-pre-line">{n.body}</p>}
                      <p className="mt-1 text-[11px] text-muted">{formatDistanceToNowStrict(new Date(n.createdAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                </>
              );
              const cls = "block w-full text-left px-4 py-3 hover:bg-soft border-b border-line last:border-0";
              return (
                <li key={n.id}>
                  {n.href ? (
                    <Link href={n.href} className={cls} onClick={() => { readOne(n.id); setOpen(false); }}>
                      {inner}
                    </Link>
                  ) : (
                    <button type="button" className={cls} onClick={() => readOne(n.id)}>
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
          <Link href="/dashboard/notifications" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-center text-xs font-medium text-muted hover:text-black border-t border-line">
            See all
          </Link>
        </div>
      )}
    </div>
  );
}
