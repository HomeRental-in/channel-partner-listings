"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Slide-in-from-the-side reveal. Adds `.is-in` once the element enters the viewport (IntersectionObserver).
 * Styles live in the scoped Midnight stylesheet (.mn-reveal) and are disabled under prefers-reduced-motion.
 */
export function Reveal({ children, from = "left", delay = 0, className }: { children: ReactNode; from?: "left" | "right" | "up"; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const style = {
    "--mn-dx": from === "left" ? "-48px" : from === "right" ? "48px" : "0px",
    "--mn-dy": from === "up" ? "28px" : "0px",
    "--mn-delay": `${delay}ms`,
  } as CSSProperties;
  return (
    <div ref={ref} className={clsx("mn-reveal", className)} style={style}>
      {children}
    </div>
  );
}
