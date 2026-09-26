import Link from "next/link";
import clsx from "clsx";
import { RANGES, type Range } from "@/app/dashboard/analytics/data";

export function RangeChips({ active, basePath = "/dashboard/analytics" }: { active: Range; basePath?: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Date range">
      {RANGES.map((r) => (
        <Link
          key={r.key}
          href={`${basePath}?range=${r.key}`}
          role="tab"
          aria-selected={r.key === active}
          className={clsx("chip transition-colors", r.key === active ? "!bg-black !text-white" : "hover:bg-[#dde2e5]")}
        >
          {r.label}
        </Link>
      ))}
    </div>
  );
}
