"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import clsx from "clsx";

/** Description with "Show more" — collapsed until expanded. */
export function Description({ text, limit = 420 }: { text: string; limit?: number }) {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  const paragraphs = text.split(/\n{2,}|\r\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div>
      <div className={clsx("space-y-3 text-[15px] leading-relaxed text-[#2D5751]", !open && long && "relative max-h-44 overflow-hidden")}>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
        {!open && long && <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />}
      </div>
      {long && (
        <button type="button" onClick={() => setOpen((v) => !v)} className="sr-press mt-3 inline-flex items-center gap-1 rounded-full bg-[#F1E6D8] px-4 py-2 text-sm font-bold text-[#123F3A] hover:bg-[#EADCCB]" aria-expanded={open}>
          {open ? <>Show less <ChevronUp size={16} /></> : <>Show more <ChevronDown size={16} /></>}
        </button>
      )}
    </div>
  );
}
