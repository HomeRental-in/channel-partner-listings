import { Building2, BadgeCheck, CalendarCheck, Layers } from "lucide-react";
import { asArray, type Configuration, type PaymentMilestone, type FloorPlan } from "@/lib/types";
import { formatINR } from "@/lib/format";
import { projectUrl } from "@/lib/site";
import type { PublicListing } from "@/components/themes/types";
import { Img, Panel, SectionTitle } from "./ui";

/** Project block: configurations table, payment plan, floor plans. Only rendered when `data.project` is set. */
export function ProjectBlock({ project, currency }: { project: NonNullable<PublicListing["project"]>; currency: string }) {
  const configs = asArray<Configuration>(project.configurations);
  const plan = asArray<PaymentMilestone>(project.paymentPlan);
  const plans = asArray<FloorPlan>(project.floorPlans).filter((p) => p && p.url);
  const price = (n: number | null | undefined) => (n == null ? "—" : formatINR(n, { currency }));
  return (
    <Panel id="project">
      <SectionTitle eyebrow="Part of a project">{project.name}</SectionTitle>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#A9AFBC]">
        {project.developer && <span className="inline-flex items-center gap-1.5"><Building2 size={14} className="text-[#22D3EE]" /> {project.developer}</span>}
        {project.reraNumber && <span className="inline-flex items-center gap-1.5"><BadgeCheck size={14} className="text-[#22D3EE]" /> RERA {project.reraNumber}</span>}
        {project.possessionDate && <span className="inline-flex items-center gap-1.5"><CalendarCheck size={14} className="text-[#22D3EE]" /> Possession {project.possessionDate}</span>}
      </div>

      {configs.length > 0 && (
        <div className="mt-5 overflow-x-auto mn-scroll">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#7D8391]">
                <th className="pb-2 pr-3 font-medium">Configuration</th>
                <th className="pb-2 pr-3 font-medium">Size</th>
                <th className="pb-2 pr-3 font-medium">Price</th>
                <th className="pb-2 font-medium">Note</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c, i) => (
                <tr key={i} className="border-t border-white/5">
                  <td className="py-2.5 pr-3 font-semibold text-white">{c.type}</td>
                  <td className="py-2.5 pr-3 text-[#C9CDD6]">{c.sizeSqft ? `${c.sizeSqft.toLocaleString("en-IN")} sq ft` : "—"}</td>
                  <td className="py-2.5 pr-3 text-[#C9CDD6]">{c.priceFrom != null || c.priceTo != null ? `${price(c.priceFrom)}${c.priceTo != null ? ` – ${price(c.priceTo)}` : "+"}` : "—"}</td>
                  <td className="py-2.5 text-[#7D8391]">{c.note ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {plan.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 text-sm font-semibold text-[#F5F6F8]">Payment plan</h3>
          <ol className="grid gap-2 sm:grid-cols-2">
            {plan.map((m, i) => (
              <li key={i} className="flex items-center justify-between rounded-lg border border-white/5 bg-[#0F1216] px-3 py-2 text-sm">
                <span className="text-[#C9CDD6]">{m.milestone}</span>
                {m.percent != null && <span className="font-semibold text-[#8EEBF7]">{m.percent}%</span>}
              </li>
            ))}
          </ol>
        </div>
      )}

      {plans.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#F5F6F8]"><Layers size={14} className="text-[#22D3EE]" /> Floor plans</h3>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {plans.map((p, i) => (
              <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block overflow-hidden rounded-lg border border-white/5 bg-[#0F1216]">
                <Img src={p.url} alt={p.label ?? `Floor plan ${i + 1}`} className="aspect-[4/3] w-full object-contain" />
                {p.label && <div className="px-2 py-1.5 text-xs text-[#A9AFBC]">{p.label}</div>}
              </a>
            ))}
          </div>
        </div>
      )}

      <a href={projectUrl(project.slug)} className="mt-5 inline-flex text-sm font-medium text-[#C4B5FF] hover:text-white">View project page →</a>
    </Panel>
  );
}
