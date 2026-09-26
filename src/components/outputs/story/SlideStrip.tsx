"use client";

import { useState } from "react";
import { GripVertical, Check } from "lucide-react";
import clsx from "clsx";
import type { StorySlide } from "./types";

type Props = { slides: StorySlide[]; onChange: (slides: StorySlide[]) => void; activeId?: string | null; onSelect?: (id: string) => void };

/** Drag-reorder slide strip: toggle include, tap the caption to edit. */
export function SlideStrip({ slides, onChange, activeId, onSelect }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [editing, setEditing] = useState<string | null>(null);

  const update = (id: string, patch: Partial<StorySlide>) => onChange(slides.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const move = (from: string, to: string) => {
    if (from === to) return;
    const a = slides.findIndex((s) => s.id === from), b = slides.findIndex((s) => s.id === to);
    if (a < 0 || b < 0) return;
    const next = [...slides];
    const [item] = next.splice(a, 1);
    next.splice(b, 0, item);
    onChange(next);
  };

  return (
    <ul className="flex flex-col gap-2">
      {slides.map((s, i) => (
        <li
          key={s.id}
          draggable
          onDragStart={() => setDragId(s.id)}
          onDragOver={(e) => {
            e.preventDefault();
            if (dragId && dragId !== s.id) move(dragId, s.id);
          }}
          onDragEnd={() => setDragId(null)}
          onClick={() => onSelect?.(s.id)}
          className={clsx("card flex items-center gap-3 p-2 pr-3 border transition", activeId === s.id ? "border-black/40" : "border-transparent", dragId === s.id && "opacity-50", !s.include && "opacity-60")}
        >
          <span className="cursor-grab text-black/40" aria-hidden>
            <GripVertical size={18} />
          </span>
          <div className="relative w-12 h-[84px] rounded-lg overflow-hidden bg-soft shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.url} alt="" className="w-full h-full object-cover" />
            <span className="absolute left-1 top-1 text-[10px] px-1.5 rounded-full bg-black/60 text-white">{i + 1}</span>
          </div>
          <div className="flex-1 min-w-0">
            {editing === s.id ? (
              <input
                autoFocus
                className="input !py-2 text-sm"
                value={s.caption}
                maxLength={90}
                placeholder="Caption for this slide"
                onChange={(e) => update(s.id, { caption: e.target.value })}
                onBlur={() => setEditing(null)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === "Escape") && setEditing(null)}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <button
                type="button"
                className="text-left w-full text-sm leading-snug truncate"
                onClick={(e) => {
                  e.stopPropagation();
                  setEditing(s.id);
                }}
                title="Tap to edit caption"
              >
                {s.caption || <span className="text-black/40">Add a caption…</span>}
              </button>
            )}
          </div>
          <button
            type="button"
            aria-label={s.include ? "Exclude slide" : "Include slide"}
            onClick={(e) => {
              e.stopPropagation();
              update(s.id, { include: !s.include });
            }}
            className={clsx("w-7 h-7 rounded-full flex items-center justify-center border transition", s.include ? "bg-black text-white border-black" : "bg-transparent border-black/30 text-transparent")}
          >
            <Check size={14} />
          </button>
        </li>
      ))}
    </ul>
  );
}
