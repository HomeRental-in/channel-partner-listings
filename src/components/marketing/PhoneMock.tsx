import { MessageCircle, Phone, Share2 } from "lucide-react";

/** CSS-only phone frame containing a stylised Editorial-theme listing page (divs only, no images). */
export default function PhoneMock() {
  return (
    <div className="mk-phone" aria-hidden>
      <div className="mk-phone-notch" />
      <div className="mk-phone-screen text-[#1a1a1a]">
        {/* status bar */}
        <div className="flex items-center justify-between px-6 pb-1 pt-4 text-[10px] font-medium">
          <span>9:41</span>
          <span className="flex gap-1">
            <i className="block h-2 w-2 rounded-full bg-current opacity-60" />
            <i className="block h-2 w-2 rounded-full bg-current opacity-60" />
            <i className="block h-2 w-3 rounded-sm bg-current opacity-80" />
          </span>
        </div>
        {/* personalised strip */}
        <div className="mx-4 mt-1 rounded-full bg-[#1a1a1a] px-3 py-1.5 text-center text-[10px] font-medium text-white">
          Hi Rahul 👋 this one&apos;s for you
        </div>
        {/* hero photo */}
        <div className="mk-photo mx-4 mt-3 h-[38%] rounded-2xl">
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-medium">1 / 12</span>
          <span className="absolute right-2 top-2 rounded-full bg-[#1a1a1a] px-2 py-0.5 text-[9px] font-medium text-white">NEW</span>
        </div>
        {/* title + price */}
        <div className="px-5 pt-3">
          <p className="text-[9px] uppercase tracking-[.14em] opacity-60">3 BHK · Baner, Pune</p>
          <p className="mt-1 font-serif text-[15px] leading-tight">Sunlit 3 BHK with a private terrace</p>
          <div className="mt-2 flex items-end justify-between">
            <p className="text-[17px] font-medium leading-none">₹1.85 Cr</p>
            <p className="text-[9px] opacity-60">₹11,900 / sq ft</p>
          </div>
        </div>
        {/* fact tiles */}
        <div className="mx-4 mt-3 grid grid-cols-3 gap-1.5">
          {[
            ["1,550", "sq ft"],
            ["3", "Baths"],
            ["12th", "Floor"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-lg bg-white/80 px-2 py-1.5">
              <p className="text-[11px] font-medium leading-none">{v}</p>
              <p className="mt-0.5 text-[8px] opacity-60">{l}</p>
            </div>
          ))}
        </div>
        {/* description skeleton */}
        <div className="mx-5 mt-3 flex flex-col gap-1.5">
          <span className="mk-skel w-full" />
          <span className="mk-skel w-11/12" />
          <span className="mk-skel w-3/4" />
        </div>
        {/* broker card */}
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl bg-white/80 p-2">
          <span className="block h-7 w-7 rounded-full bg-[#1a1a1a]" />
          <div className="flex-1">
            <p className="text-[10px] font-medium leading-none">Priya Deshmukh</p>
            <p className="mt-0.5 text-[8px] opacity-60">RERA A5210000123 · replies in 10 min</p>
          </div>
          <Share2 size={12} className="opacity-60" />
        </div>
        {/* sticky CTA bar */}
        <div className="mt-auto flex gap-2 border-t border-black/10 bg-white/90 p-3">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#25d366] py-2 text-[10px] font-medium text-white">
            <MessageCircle size={12} /> WhatsApp
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#1a1a1a] py-2 text-[10px] font-medium text-white">
            <Phone size={12} /> Call
          </span>
        </div>
      </div>
    </div>
  );
}
