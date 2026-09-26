"use client";

import { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialises Lenis smooth scroll + every GSAP animation used on the marketing site, once.
 * Initial hidden states live in marketing.css under `.mk-motion` so there is no flash before
 * hydration; `prefers-reduced-motion` short-circuits everything (CSS shows content immediately).
 */
export default function Motion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    // ── Smooth scroll ──
    const lenis = new Lenis({ autoRaf: false, lerp: 0.1, anchors: { offset: -96 } });
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const ctx = gsap.context(() => {
      // ── Hero: words one by one, then sub-line + CTAs ──
      const words = gsap.utils.toArray<HTMLElement>(".mk-word");
      const fades = gsap.utils.toArray<HTMLElement>(".mk-fade");
      const intro = gsap.timeline({ delay: 0.15 });
      if (words.length) {
        intro.to(words, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9, stagger: 0.07, ease: "power3.out" });
      }
      if (fades.length) {
        intro.to(fades, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power2.out" }, words.length ? "-=0.5" : 0);
      }

      // ── Sections fade-up on scroll ──
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        });
      });

      // ── Stacked theme cards: earlier cards shrink slightly as the next one slides over ──
      const cards = gsap.utils.toArray<HTMLElement>(".mk-stack-card");
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card, {
          scale: 0.94,
          opacity: 0.85,
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top top+=160", scrub: true },
        });
      });
    });

    // Layout can shift once fonts/images settle
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      window.removeEventListener("load", refresh);
      ctx.revert();
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  return null;
}
