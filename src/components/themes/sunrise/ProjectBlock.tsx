import { Building2, BadgeCheck, CalendarCheck, Layers } from "lucide-react";
import { asArray, type Configuration, type PaymentMilestone, type FloorPlan } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { projectUrl } from "@/lib/site";
import type { PublicListing } from "@/components/themes/types";
import { Img, Card, SectionTitle, Pill, btnSoft } from "./ui";

/** Project block: configurations table, payment plan, floor plans. Only rendered when `data.project` is set. */
export function ProjectBlock({ project, currency }: { project: NonNullable<PublicListing["project"]>; currency: string }) {
  const configs = asArray<Configuration>(project.configurations);
  const plan = asArray<PaymentMilestone>(project.paymentPlan);
  const plans = asArray<FloorPlan>(project.floorPlans).filter((p) => p && p.url);
  const price = (n: number | null | undefined) => (n == null ? "—" : formatINR(n, { currency }));
  return (
    <Card id="project">
      <SectionTitle eyebrow="Part of a project">{project.name}</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {project.developer && <Pill tone="sand"><Building2 size={13} /> {project.developer}</Pill>}
        {project.reraNumber && <Pill tone="sand"><BadgeCheck size={13} className="text-[#FF6B4A]" /> RERA {project.reraNumber}</Pill>}
        {project.possessionDate && <Pill tone="honey"><CalendarCheck size={13} /> Possession {project.possessionDate}</Pill>}
      </div>

      {configs.length > 0 && (
        <div className="sr-scroll mt-5 overflow-x-auto rounded-3xl bg-[#FBF4EC] p-2">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[11px] font-bold uppercase tracking-wider text-[#6E8A85]">
                <th className="px-3 py-2">Configuration</th>
                <th className="px-3 py-2">Size</th>
                <th className="px-3 py-2">Price</th>
                <th className="px-3 py-2">Note</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c, i) => (
                <tr key={i} className="rounded-2xl bg-white">
                  <td className="rounded-l-2xl px-3 py-2.5 font-extrabold text-[#123F3A]">{c.type}</td>
                  <td className="px-3 py-2.5 text-[#2D5751]">{c.sizeSqft ? `${c.sizeSqft.toLocaleString("en-IN")} sq ft` : "—"}</td>
                  <td className="px-3 py-2.5 font-bold text-[#C2411F]">{c.priceFrom != null || c.priceTo != null ? `${price(c.priceFrom)}${c.priceTo != null ? ` – ${price(c.priceTo)}` : "+"}` : "—"}</td>
                  <td className="rounded-r-2xl px-3 py-2.5 text-[#6E8A85]">{c.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {plan.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-extrabold text-[#123F3A]">Payment plan</h3>
          <ol className="grid gap-2 sm:grid-cols-2">
            {plan.map((m, i) => (
              <li key={i} className="flex items-center justify-between rounded-2xl bg-[#DDEFEA] px-4 py-2.5 text-sm">
                <span className="text-[#123F3A]">{m.milestone}</span>
                {m.percent != null && <span className="rounded-full bg-white px-2.5 py-0.5 font-extrabold text-[#123F3A]">{m.percent}%</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {plans.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-extrabold text-[#123F3A]"><Layers size={14} className="text-[#FF6B4A]" /> Floor plans</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {plans.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="sr-press block overflow-hidden rounded-2xl bg-[#FBF4EC]">
                <Img src={p.url} alt={p.label ?? `Floor plan ${i + 1}`} className="aspect-[4/3] w-full object-contain" />
                {p.label && <div className="px-3 py-1.5 text-xs font-bold text-[#2D5751]">{p.label}</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      <a href={projectUrl(project.slug)} className={`${btnSoft} mt-5`}>View project page →</a>
    </Card>
  );
}
