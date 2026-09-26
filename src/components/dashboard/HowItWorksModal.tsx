"use client";
import { useState } from "react";
import { CircleHelp, FolderOpen, Globe, Link2, MessageCircle, Building2 } from "lucide-react";
import { Dialog } from "@/components/ui/Dialog";
import { waLink } from "@/lib/site";

export function HowItWorksButton({ intakeNumber, siteHost }: { intakeNumber: string | null; siteHost: string | null }) {
  const [open, setOpen] = useState(false);
  const pretty = intakeNumber ? intakeNumber.replace(/^(\+91)(\d{5})(\d{5})$/, "$1 $2 $3") : null;
  const steps = [
    {
      icon: MessageCircle,
      title: "Send on WhatsApp",
      body: intakeNumber ? (
        <>
          Message <a href={waLink(intakeNumber, "Hi")} target="_blank" rel="noreferrer" className="font-medium underline">{pretty}</a> with photos and a few lines about the property. Type <b>DONE</b> when finished — the AI builds a draft and sends you a review link.
        </>
      ) : (
        <>Message our WhatsApp number with photos and a few lines about the property. Type <b>DONE</b> and the AI builds a draft and sends you a review link.</>
      ),
    },
    {
      icon: Globe,
      title: "Your website",
      body: <>Every listing you publish appears on your own site{siteHost ? <> at <span className="font-medium">{siteHost}</span></> : null}. Buyers see your name, photo and WhatsApp/Call buttons on every page.</>,
    },
    { icon: FolderOpen, title: "Collections", body: <>Group a few listings for one buyer — “3 BHKs under 3 Cr in Sector 63” — and share a single link.</> },
    { icon: Building2, title: "Projects for CPs", body: <>Pick a developer project from the library; its facts, floor plans and payment plan are copied into a listing that carries your contact card.</> },
    { icon: Link2, title: "Personalised links", body: <>Add <code className="rounded bg-soft px-1">?n=Rahul</code> to any link (Share → Personalise). The page greets Rahul by name and your analytics show who opened it and how many times.</> },
  ];
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-light !py-2.5 !px-4 text-sm">
        <CircleHelp size={16} /> <span className="hidden sm:inline">How it works</span>
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="How it works" description="Five steps from a WhatsApp message to a buyer who calls you back." size="lg">
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li key={s.title} className="flex gap-4 rounded-2xl bg-soft p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-muted">Step {i + 1}</p>
                  <h3 className="text-base font-medium">{s.title}</h3>
                  <p className="mt-1 text-sm text-black/70 leading-relaxed">{s.body}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </Dialog>
    </>
  );
}
