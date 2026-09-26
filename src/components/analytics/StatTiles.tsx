import { Eye, Users, MessageCircle, Phone, FileDown, Percent } from "lucide-react";
import type { OwnerStats } from "@/lib/analytics";

const fmt = (n: number) => n.toLocaleString("en-IN");

export function StatTiles({ totals }: { totals: OwnerStats }) {
  const tiles = [
    { label: "Views", value: fmt(totals.views), icon: Eye },
    { label: "Unique viewers", value: fmt(totals.uniqueViewers), icon: Users },
    { label: "WhatsApp taps", value: fmt(totals.whatsappTaps), icon: MessageCircle, accent: true },
    { label: "Call taps", value: fmt(totals.callTaps), icon: Phone },
    { label: "Brochure downloads", value: fmt(totals.brochureDownloads), icon: FileDown },
    { label: "Conversion", value: `${totals.conversion}%`, icon: Percent, hint: "taps ÷ views" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
      {tiles.map((t) => (
        <div key={t.label} className="card p-4">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-medium uppercase tracking-wider">{t.label}</span>
            <t.icon size={16} className={t.accent ? "text-[var(--wa)]" : undefined} aria-hidden />
          </div>
          <div className="mt-2 text-3xl leading-none tracking-tight">{t.value}</div>
          {t.hint && <div className="mt-1 text-[11px] text-muted">{t.hint}</div>}
        </div>
      ))}
    </div>
  );
}
