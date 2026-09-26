"use client";
import { useState, type ReactNode } from "react";
import { ChevronUp } from "lucide-react";
import clsx from "clsx";

/**
 * Mobile bottom-sheet CTA. Collapsed: price + primary buttons. Tap the handle to expand the quick questions.
 * `primary` and `expanded` are server-rendered TrackedLinks passed in as children.
 */
export function MobileSheet({ price, sub, primary, expanded }: { price: string; sub?: string | null; primary: ReactNode; expanded: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {open && <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-black/60 lg:hidden" />}
      <div className={clsx("mn-sheet fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/10 bg-[#15181D]/95 shadow-[0_-12px_40px_rgba(0,0,0,.6)] backdrop-blur lg:hidden")} style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mn-sheet-more"
          className="flex w-full items-center justify-between px-4 pt-2.5 pb-1"
        >
          <span className="flex items-baseline gap-2 text-left">
            <span className="text-lg font-bold text-white">{price}</span>
            {sub && <span className="text-xs text-[#7D8391]">{sub}</span>}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-medium text-[#C4B5FF]">
            {open ? "Less" : "Quick questions"}
            <ChevronUp size={16} className={clsx("transition-transform", open && "rotate-180")} />
          </span>
        </button>
        <div className="flex gap-2 px-4 pb-3">{primary}</div>
        <div id="mn-sheet-more" className={clsx("grid transition-[grid-template-rows] duration-300", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
          <div className="overflow-hidden">
            <div className="border-t border-white/10 px-4 py-3">{expanded}</div>
          </div>
        </div>
      </div>
      {/* Spacer so page content is never hidden behind the sheet */}
      <div className="h-28 lg:hidden" aria-hidden />
    </>
  );
}
