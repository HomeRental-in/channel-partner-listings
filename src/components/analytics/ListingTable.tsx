"use client";

import { useState } from "react";
import Link from "next/link";
import clsx from "clsx";
import { ChevronDown, Flame, FileDown, Repeat } from "lucide-react";
import type { ListingRow } from "@/app/dashboard/analytics/data";
import { relative } from "./format";

const fmt = (n: number) => n.toLocaleString("en-IN");

export function ListingTable({ rows }: { rows: ListingRow[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  if (!rows.length) {
    return (
      <div className="card p-10 text-center">
        <h3 className="text-lg font-medium">No listings yet</h3>
        <p className="mt-1 text-sm text-muted">Create a listing on WhatsApp or from the dashboard — stats appear here as soon as someone opens the link.</p>
        <Link href="/dashboard/listings/new" className="btn btn-dark mt-5 text-sm">Create a listing</Link>
      </div>
    );
  }
  return (
    <div className="card overflow-hidden">
      <div className="hidden grid-cols-[1fr_80px_80px_80px_90px] items-center gap-3 border-b border-[var(--line)] px-5 py-3 text-[11px] font-medium uppercase tracking-wider text-muted md:grid">
        <span>Listing</span>
        <span className="text-right">Views</span>
        <span className="text-right">Unique</span>
        <span className="text-right">Taps</span>
        <span className="text-right">Conversion</span>
      </div>
      <ul>
        {rows.map((r) => {
          const expanded = !!open[r.id];
          const hasNamed = r.named.length > 0;
          return (
            <li key={r.id} className="border-b border-[var(--line)] last:border-b-0">
              <div className="grid grid-cols-[1fr_auto] items-center gap-3 px-5 py-4 md:grid-cols-[1fr_80px_80px_80px_90px]">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-soft">
                    {r.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.cover} alt="" className="h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <Link href={`/dashboard/listings/${r.id}`} className="block truncate font-medium hover:underline">{r.title}</Link>
                    <div className={clsx("mt-0.5 flex items-center gap-1.5 text-xs", r.hot ? "text-orange-600" : "text-muted")}>
                      {r.hot && <Flame size={12} aria-hidden />}
                      <span className="truncate">{r.statusLine}</span>
                      {r.status !== "LIVE" && <span className="chip !py-0 !px-2 !text-[10px]">{r.status.toLowerCase()}</span>}
                    </div>
                    <div className="mt-1 text-xs text-muted md:hidden">
                      {fmt(r.views)} views · {fmt(r.uniqueViewers)} unique · {fmt(r.taps)} taps · {r.conversion}%
                    </div>
                  </div>
                </div>
                <Num className="hidden md:block">{fmt(r.views)}</Num>
                <Num className="hidden md:block">{fmt(r.uniqueViewers)}</Num>
                <Num className="hidden md:block" title={`${r.whatsappTaps} WhatsApp · ${r.callTaps} call`}>{fmt(r.taps)}</Num>
                <div className="flex items-center justify-end gap-2">
                  <span className="hidden text-right tabular-nums md:block">{r.conversion}%</span>
                  <button
                    type="button"
                    onClick={() => setOpen((o) => ({ ...o, [r.id]: !expanded }))}
                    className={clsx("chip !px-2 !py-1 text-xs transition-colors hover:bg-[#dde2e5]", expanded && "!bg-black !text-white")}
                    aria-expanded={expanded}
                    aria-controls={`named-${r.id}`}
                  >
                    {hasNamed ? `${r.named.length} named` : "Named"} <ChevronDown size={12} className={clsx("transition-transform", expanded && "rotate-180")} aria-hidden />
                  </button>
                </div>
              </div>
              {expanded && (
                <div id={`named-${r.id}`} className="bg-soft px-5 py-4">
                  <NamedViewers rows={r.named} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Num({ children, className, title }: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <span className={clsx("text-right tabular-nums", className)} title={title}>
      {children}
    </span>
  );
}

export function NamedViewers({ rows }: { rows: ListingRow["named"] }) {
  if (!rows.length) {
    return (
      <p className="text-sm text-muted">
        No named viewers yet. Share a personalised link (<span className="font-mono text-xs">?n=Rahul</span>) from the share menu and their opens show up here.
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="py-1.5 pr-3 font-medium">Name</th>
            <th className="py-1.5 pr-3 font-medium text-right">Opens</th>
            <th className="py-1.5 pr-3 font-medium">Last seen</th>
            <th className="py-1.5 pr-3 font-medium text-center">Brochure</th>
            <th className="py-1.5 font-medium text-center">Repeat</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => {
            const call = v.opens >= 2 || v.brochure;
            return (
              <tr key={v.name} className={clsx("border-t border-[var(--line)]", call && "font-medium")}>
                <td className="py-2 pr-3">
                  {v.name}
                  {call && <span className="chip ml-2 !bg-black !px-2 !py-0 !text-[10px] !text-white">call</span>}
                </td>
                <td className="py-2 pr-3 text-right tabular-nums">{v.opens}</td>
                <td className="py-2 pr-3 text-muted">{relative(v.lastSeen)}</td>
                <td className="py-2 pr-3 text-center">{v.brochure ? <FileDown size={14} className="inline" aria-label="Downloaded brochure" /> : <span className="text-muted">—</span>}</td>
                <td className="py-2 text-center">{v.repeat ? <Repeat size={14} className="inline" aria-label="Repeat viewer" /> : <span className="text-muted">—</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

