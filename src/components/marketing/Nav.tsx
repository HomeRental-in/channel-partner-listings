"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Eye, Menu, X } from "lucide-react";

const LINKS = [
  { id: "how-it-works", label: "How it works" },
  { id: "features", label: "Features" },
  { id: "themes", label: "Themes" },
  { id: "faq", label: "FAQ" },
];

export default function Nav({ brand }: { brand: string }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const anchor = (id: string) => (pathname === "/" ? `#${id}` : `/#${id}`);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="mk-nav" data-scrolled={scrolled}>
        <div className="mk-wrap flex items-center justify-between py-4 md:py-5">
          <Link href="/" className="flex items-center gap-2.5" aria-label={`${brand} home`}>
            <Image src="/marketing/mark.svg" alt="" width={36} height={36} />
            <span className="text-xl font-medium tracking-tight">{brand}</span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
            {LINKS.map((l) => (
              <a key={l.id} href={anchor(l.id)} className="mk-nav-link">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <Link href="/sample" className="icon-btn mk-white hidden md:inline-flex" aria-label="See a sample listing" title="See a sample listing">
              <Eye size={18} />
            </Link>
            <Link href="/login" className="btn btn-dark hidden md:inline-flex">
              Create a free listing <span aria-hidden>👋</span>
            </Link>
            <button type="button" className="icon-btn mk-white md:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div className="mk-menu md:hidden" data-open={open} aria-hidden={!open} inert={!open} data-lenis-prevent>
        <div className="flex items-center justify-between">
          <span className="text-xl font-medium tracking-tight">{brand}</span>
          <button type="button" className="icon-btn mk-white" aria-label="Close menu" onClick={() => setOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="mt-10 flex flex-col" aria-label="Mobile">
          {LINKS.map((l) => (
            <a key={l.id} href={anchor(l.id)} className="mk-menu-link" onClick={() => setOpen(false)}>
              {l.label} <ArrowUpRight size={28} className="mk-muted" />
            </a>
          ))}
          <Link href="/sample" className="mk-menu-link" onClick={() => setOpen(false)}>
            Sample listing <ArrowUpRight size={28} className="mk-muted" />
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <Link href="/login" className="btn btn-dark justify-center text-lg" onClick={() => setOpen(false)}>
            Create a free listing <span aria-hidden>👋</span>
          </Link>
          <Link href="/login" className="btn bg-white justify-center text-lg" onClick={() => setOpen(false)}>
            Log in
          </Link>
        </div>
      </div>
    </>
  );
}
