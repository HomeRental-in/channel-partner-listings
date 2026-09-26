"use client";
import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import clsx from "clsx";

/**
 * Spring "pop" reveal: scale .96 → 1 with a slight overshoot once the element enters the viewport.
 * Styles live in the scoped Sunrise stylesheet (.sr-pop); disabled under prefers-reduced-motion.
 */
export function Pop({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { el.classList.add("is-in"); return; }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) { el.classList.add("is-in"); io.disconnect(); }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={clsx("sr-pop", className)} style={{ "--sr-delay": `${delay}ms` } as CSSProperties}>
      {children}
    </div>
  );
}
