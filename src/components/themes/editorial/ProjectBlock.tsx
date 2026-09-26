import Image from "next/image";
import { asConfigurations, asPaymentPlan, asFloorPlans, configPrice } from "@/components/themes/shared/helpers";

type ProjectLike = { name: string; developer: string | null; reraNumber: string | null; possessionDate: string | null; configurations: unknown[]; paymentPlan: unknown[]; floorPlans: unknown[] };

/** Configurations table, payment plan and floor plans — shared by the listing page and /p/[slug]. */
export function ProjectDetails({ project, showHeader = true }: { project: ProjectLike; showHeader?: boolean }) {
  const configs = asConfigurations(project.configurations);
  const plan = asPaymentPlan(project.paymentPlan);
  const plans = asFloorPlans(project.floorPlans);
  return (
    <div>
      {showHeader && (
        <p className="ed-muted" style={{ marginTop: "-0.5rem", marginBottom: "1rem" }}>
          {[project.developer ? `By ${project.developer}` : null, project.reraNumber ? `RERA ${project.reraNumber}` : null, project.possessionDate ? `Possession ${project.possessionDate}` : null].filter(Boolean).join(" · ")}
        </p>
      )}
      {configs.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table className="ed-table">
            <thead>
              <tr>
                <th scope="col">Configuration</th>
                <th scope="col">Size</th>
                <th scope="col">Price</th>
              </tr>
            </thead>
            <tbody>
              {configs.map((c, i) => (
                <tr key={i}>
                  <td>
                    {c.type}
                    {c.note && <div className="ed-faint" style={{ fontSize: "0.8rem" }}>{c.note}</div>}
                  </td>
                  <td>{c.sizeSqft ? `${c.sizeSqft.toLocaleString("en-IN")} sq ft` : "—"}</td>
                  <td>{configPrice(c)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {plan.length > 0 && (
        <>
          <h3 className="ed-h3">Payment plan</h3>
          <ul className="ed-list">
            {plan.map((m, i) => (
              <li key={i}>
                <span>{m.milestone}</span>
                <span>{m.percent != null ? `${m.percent}%` : ""}</span>
              </li>
            ))}
          </ul>
        </>
      )}
      {plans.length > 0 && (
        <>
          <h3 className="ed-h3">Floor plans</h3>
          <div className="ed-plans">
            {plans.map((p, i) => (
              <figure key={i} className="ed-plan" style={{ margin: 0 }}>
                <a href={p.url} target="_blank" rel="noopener" aria-label={`Open floor plan${p.label ? `: ${p.label}` : ""}`}>
                  <Image src={p.url} alt={p.label ?? `Floor plan ${i + 1}`} fill sizes="(min-width: 640px) 240px, 50vw" className="object-contain" />
                </a>
                {p.label && <figcaption>{p.label}</figcaption>}
              </figure>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
