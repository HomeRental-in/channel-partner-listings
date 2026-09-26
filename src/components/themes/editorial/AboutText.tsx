"use client";
import { useId, useState } from "react";

/** Description with a "Show more" toggle when long. */
export function AboutText({ text }: { text: string }) {
  const long = text.length > 480 || text.split("\n").length > 6;
  const [open, setOpen] = useState(!long);
  const id = useId();
  return (
    <div>
      <p id={id} className={`ed-prose ${open ? "" : "is-clamped"}`}>{text}</p>
      {long && (
        <button type="button" className="ed-showmore" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
