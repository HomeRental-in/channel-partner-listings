"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { LayoutList, Plus, Search } from "lucide-react";
import type { Theme } from "@prisma/client";
import { Chip } from "@/components/ui/Chip";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingCard, type ListingCardData } from "./ListingCard";

type Filter = "ALL" | "LIVE" | "DRAFT" | "SOLD";
const FILTERS: { key: Filter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "LIVE", label: "Live" },
  { key: "DRAFT", label: "Draft" },
  { key: "SOLD", label: "Sold / Rented" },
];

export function ListingsGrid({ listings, username, defaultTheme }: { listings: ListingCardData[]; username: string | null; defaultTheme: Theme }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("ALL");

  const counts = useMemo(() => {
    const c: Record<Filter, number> = { ALL: listings.length, LIVE: 0, DRAFT: 0, SOLD: 0 };
    for (const l of listings) {
      if (l.status === "LIVE") c.LIVE++;
      else if (l.status === "DRAFT") c.DRAFT++;
      else if (l.status === "SOLD" || l.status === "RENTED") c.SOLD++;
    }
    return c;
  }, [listings]);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return listings.filter((l) => {
      if (filter === "LIVE" && l.status !== "LIVE") return false;
      if (filter === "DRAFT" && l.status !== "DRAFT") return false;
      if (filter === "SOLD" && l.status !== "SOLD" && l.status !== "RENTED") return false;
      if (!needle) return true;
      return [l.title, l.locality, l.city, l.bhk, l.propertyType, l.priceDisplay].some((v) => v?.toLowerCase().includes(needle));
    });
  }, [listings, q, filter]);

  if (listings.length === 0) {
    return (
      <EmptyState
        icon={<LayoutList size={22} />}
        title="No listings yet"
        description="Create your first listing on the web, or send photos and a few lines to our WhatsApp number."
        action={
          <Link href="/dashboard/listings/new" className="btn btn-dark">
            <Plus size={18} /> Create a listing
          </Link>
        }
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <label className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search title, locality, BHK…" className="input !pl-11 !bg-white" aria-label="Search listings" />
        </label>
        <div className="flex gap-1.5 overflow-x-auto">
          {FILTERS.map((f) => (
            <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
              {f.label} <span className="opacity-60 tabular-nums">{counts[f.key]}</span>
            </Chip>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No listings match.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((l) => (
            <ListingCard key={l.id} listing={l} username={username} defaultTheme={defaultTheme} />
          ))}
        </div>
      )}
    </div>
  );
}
