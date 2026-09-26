"use client";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * Subtle parallax: translates its child on scroll via requestAnimationFrame.
 * `speed` 0.25 = moves at a quarter of scroll speed. No-op when prefers-reduced-motion is set.
 */
export function Parallax({ children, speed = 0.28, className }: { children: ReactNode; speed?: number; className?: string }) {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let raf = 0;
    let last = -1;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      if (y === last) return;
      last = y;
      // Only bother while the hero is on screen.
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 0) return;
      el.style.transform = `translate3d(0, ${Math.round(y * speed)}px, 0)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, [speed]);
  return <div ref={ref} className={className} style={{ willChange: "transform" }}>{children}</div>;
}
