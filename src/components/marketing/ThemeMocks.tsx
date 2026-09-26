import { MessageCircle, Phone } from "lucide-react";

/* Stylised listing-page mocks for each theme (SPEC.md palettes). Pure divs — no images. */

export function EditorialMock() {
  return (
    <div className="mk-theme-mock bg-[#f5f1e8] text-[#1a1a1a]" aria-hidden>
      <div className="grid h-full grid-cols-[38%_1fr]">
        <div className="flex flex-col border-r border-black/10 p-5">
          <p className="text-[9px] uppercase tracking-[.16em] opacity-60">For sale · Koregaon Park</p>
          <p className="mt-2 font-serif text-[20px] leading-[1.05]">Corner 4 BHK with a garden deck</p>
          <p className="mt-4 text-[22px] font-medium leading-none">₹4.2 Cr</p>
          <p className="mt-1 text-[9px] opacity-60">Negotiable · ₹14,000 / sq ft</p>
          <div className="mt-4 border-t border-black/10 pt-3 text-[9px] leading-relaxed opacity-70">
            3,000 sq ft · 4 baths · 2 car parks
            <br />
            Ready to move · East facing
          </div>
          <div className="mt-auto flex flex-col gap-1.5">
            <span className="flex items-center justify-center gap-1 rounded-full bg-[#1a1a1a] py-1.5 text-[9px] font-medium text-[#f5f1e8]">
              <MessageCircle size={10} /> WhatsApp
            </span>
            <span className="flex items-center justify-center gap-1 rounded-full border border-black/30 py-1.5 text-[9px] font-medium">
              <Phone size={10} /> Call
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-4">
          <div className="mk-photo h-[58%] rounded-lg" />
          <div className="grid flex-1 grid-cols-3 gap-2">
            <div className="mk-photo rounded-lg" />
            <div className="mk-photo rounded-lg" />
            <div className="mk-photo rounded-lg" />
          </div>
          <div className="flex flex-col gap-1 pt-1">
            <span className="mk-skel w-full" />
            <span className="mk-skel w-2/3" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function MidnightMock() {
  return (
    <div className="mk-theme-mock bg-[#0b0b0f] text-white" aria-hidden>
      <div className="mk-photo absolute inset-x-0 top-0 h-[62%] !bg-[linear-gradient(160deg,#2b2f3a,#111318_60%,#0b0b0f)]" />
      <div className="absolute inset-x-0 top-0 h-[62%] bg-[radial-gradient(60%_60%_at_80%_20%,rgba(124,92,255,.45),transparent_70%)]" />
      <div className="absolute inset-x-5 top-5 flex items-center justify-between">
        <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[9px] font-medium tracking-wide backdrop-blur">
          NEW LAUNCH
        </span>
        <span className="text-[9px] uppercase tracking-[.16em] opacity-70">Worli, Mumbai</span>
      </div>
      <div className="absolute inset-x-5 top-[34%]">
        <p className="text-[24px] font-medium leading-[1.02] tracking-tight">Sea-facing 3 BHK, 41st floor</p>
        <p className="mt-2 text-[11px] opacity-70">2,100 sq ft · 3 baths · 3 car parks</p>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[38%] bg-[#16161d] px-5 pt-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-[9px] uppercase tracking-[.16em] opacity-60">Asking</p>
            <p className="text-[22px] font-medium leading-none">₹9.75 Cr</p>
          </div>
          <div className="flex gap-1.5">
            {["Sea view", "OC ready", "Vastu"].map((c) => (
              <span key={c} className="rounded-full bg-white/10 px-2 py-0.5 text-[8px]">
                {c}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-1.5">
          {[
            ["₹46,400", "/ sq ft"],
            ["2027", "Possession"],
            ["RERA", "Verified"],
          ].map(([v, l]) => (
            <div key={l} className="rounded-md bg-white/5 px-2 py-1.5">
              <p className="text-[10px] font-medium leading-none">{v}</p>
              <p className="mt-0.5 text-[8px] opacity-60">{l}</p>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-5 bottom-3 flex gap-2">
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#25d366] py-1.5 text-[9px] font-medium text-black shadow-[0_0_24px_rgba(37,211,102,.55)]">
            <MessageCircle size={10} /> WhatsApp
          </span>
          <span className="flex flex-1 items-center justify-center gap-1 rounded-full bg-[#7c5cff] py-1.5 text-[9px] font-medium text-white">
            <Phone size={10} /> Call
          </span>
        </div>
      </div>
    </div>
  );
}

export function SunriseMock() {
  return (
    <div className="mk-theme-mock bg-[#fbf3ea] p-4 text-[#2a1e18]" aria-hidden>
      <div className="grid h-full grid-cols-4 grid-rows-4 gap-2">
        <div className="mk-photo col-span-2 row-span-2 rounded-2xl !bg-[linear-gradient(135deg,#ffd7c2,#ff9f7d_60%,#ff6b4a)]" />
        <div className="col-span-2 row-span-1 flex flex-col justify-center rounded-2xl bg-white px-3">
          <p className="text-[9px] uppercase tracking-[.14em] text-[#ff6b4a]">Rent · Indiranagar</p>
          <p className="text-[15px] font-medium leading-tight">Bright 2 BHK near the metro</p>
        </div>
        <div className="col-span-1 row-span-1 flex flex-col justify-center rounded-2xl bg-[#ff6b4a] px-3 text-white">
          <p className="text-[15px] font-medium leading-none">₹58k</p>
          <p className="text-[8px] opacity-80">per month</p>
        </div>
        <div className="col-span-1 row-span-1 flex flex-col justify-center rounded-2xl bg-white px-3">
          <p className="text-[14px] font-medium leading-none">1,180</p>
          <p className="text-[8px] opacity-60">sq ft</p>
        </div>
        <div className="mk-photo col-span-1 row-span-1 rounded-2xl !bg-[linear-gradient(135deg,#ffe4d1,#ffb597)]" />
        <div className="mk-photo col-span-1 row-span-1 rounded-2xl !bg-[linear-gradient(135deg,#ffd0b8,#ff8f6b)]" />
        <div className="col-span-2 row-span-1 flex flex-wrap content-center gap-1 rounded-2xl bg-white px-3">
          {["Pet friendly", "Gym", "Power backup", "Semi-furnished"].map((c) => (
            <span key={c} className="rounded-full bg-[#fbf3ea] px-2 py-0.5 text-[8px] font-medium">
              {c}
            </span>
          ))}
        </div>
        <div className="col-span-4 row-span-1 flex items-center gap-2 rounded-2xl bg-white p-2">
          <span className="block h-7 w-7 flex-none rounded-full bg-[#ff6b4a]" />
          <div className="flex-1">
            <p className="text-[10px] font-medium leading-none">Arjun Nair · Nair Realty</p>
            <p className="mt-0.5 text-[8px] opacity-60">Replies in 15 min</p>
          </div>
          <span className="flex items-center gap-1 rounded-full bg-[#25d366] px-3 py-1.5 text-[9px] font-medium text-white">
            <MessageCircle size={10} /> WhatsApp
          </span>
          <span className="flex items-center gap-1 rounded-full bg-[#2a1e18] px-3 py-1.5 text-[9px] font-medium text-white">
            <Phone size={10} /> Call
          </span>
        </div>
      </div>
    </div>
  );
}
