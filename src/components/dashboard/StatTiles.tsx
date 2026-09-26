import Link from "next/link";
import { Eye, MessageCircle, Phone, Users } from "lucide-react";
import type { OwnerStats } from "@/lib/analytics";

const fmt = (n: number) => n.toLocaleString("en-IN");

export function StatTiles({ stats, periodLabel = "Last 30 days" }: { stats: OwnerStats; periodLabel?: string }) {
  const tiles = [
    { label: "Views", value: stats.views, icon: Eye },
    { label: "Unique viewers", value: stats.uniqueViewers, icon: Users },
    { label: "WhatsApp taps", value: stats.whatsappTaps, icon: MessageCircle },
    { label: "Call taps", value: stats.callTaps, icon: Phone },
  ];
  return (
    <section aria-label="Stats">
      <div className="flex items-baseline justify-between px-1 mb-2">
        <p className="eyebrow">{periodLabel}</p>
        <Link href="/dashboard/analytics" className="text-sm text-muted hover:text-black">
          Full analytics →
        </Link>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.label} className="card p-5">
              <div className="flex items-center justify-between text-muted">
                <span className="text-sm">{t.label}</span>
                <Icon size={16} />
              </div>
              <p className="mt-3 text-3xl font-medium tabular-nums tracking-tight">{fmt(t.value)}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
