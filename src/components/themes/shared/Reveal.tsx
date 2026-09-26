"use client";
import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Scroll-triggered reveal via IntersectionObserver (no GSAP). Adds `is-in` once the element enters the viewport.
 * Styling is the theme's job: e.g. `.ed-reveal { opacity:0; transform:translateY(18px) } .ed-reveal.is-in { … }`.
 * Honours prefers-reduced-motion by revealing immediately.
 */
export function Reveal({ as: Tag = "div", className = "", delay = 0, children, ...rest }: { as?: ElementType; className?: string; delay?: number; children: ReactNode; id?: string; style?: React.CSSProperties }) {
  const ref = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("is-in");
            io.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Tag ref={ref} className={className} style={{ ...(rest.style ?? {}), transitionDelay: delay ? `${delay}ms` : undefined }} id={rest.id}>
      {children}
    </Tag>
  );
}
