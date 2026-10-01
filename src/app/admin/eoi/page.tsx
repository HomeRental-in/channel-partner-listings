import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { EOI_STATUSES, TIERS, bucketLabel } from "@/lib/partners";
import { CITIES, cityBySlug } from "@/lib/seo/cities";
import { filtersFrom, listEois } from "./data";
import { updateEoi } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Partner EOIs", robots: { index: false, follow: false } };

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function EoiAdminPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const f = filtersFrom(sp);
  const rows = await listEois(f);
  const qs = new URLSearchParams(Object.entries(f).filter((e): e is [string, string] => Boolean(e[1]))).toString();
  const founding = rows.filter((r) => r.tier === "FOUNDING").length;

  return (
    <main className="mx-auto flex max-w-[1400px] flex-col gap-4 p-4 md:p-8">
      <header className="panel flex flex-col gap-4 p-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow">Founding Partner programme</p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight">Partner EOIs</h1>
          <p className="text-muted mt-1">
            {rows.length} registrations · {founding} Founding
          </p>
        </div>
        <form className="flex flex-wrap items-center gap-2">
          <select name="city" defaultValue={f.city ?? ""} className="input !w-auto">
            <option value="">All cities</option>
            {CITIES.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <select name="tier" defaultValue={f.tier ?? ""} className="input !w-auto">
            <option value="">All tiers</option>
            {Object.entries(TIERS).map(([k, t]) => (
              <option key={k} value={k}>
                {t.label}
              </option>
            ))}
          </select>
          <select name="status" defaultValue={f.status ?? ""} className="input !w-auto">
            <option value="">All statuses</option>
            {EOI_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <button className="btn btn-dark">Filter</button>
          <Link href={`/admin/eoi/export${qs ? `?${qs}` : ""}`} className="btn btn-light" prefetch={false}>
            Export CSV
          </Link>
        </form>
      </header>

      <div className="panel overflow-x-auto p-2">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-muted">
            <tr>
              {["Firm", "City / micro-markets", "Inventory", "Links / mo", "Team", "Tier · score", "Source", "Status & notes"].map((h) => (
                <th key={h} className="p-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="hairline align-top">
                <td className="p-3">
                  <div className="font-medium">{r.agencyName}</div>
                  <div>
                    {r.contactName}
                    {r.role ? ` · ${r.role}` : ""}
                  </div>
                  <a className="underline" href={`https://wa.me/${r.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                    {r.phone}
                  </a>
                  {r.email && <div className="text-muted">{r.email}</div>}
                  {r.reraNumber && <div className="text-muted">RERA {r.reraNumber}</div>}
                  <div className="text-muted">{r.createdAt.toLocaleDateString("en-IN")}</div>
                </td>
                <td className="p-3">
                  <div>{cityBySlug(r.city)?.name ?? r.city}</div>
                  <div className="text-muted">{(Array.isArray(r.localities) ? r.localities : []).join(", ")}</div>
                  {r.message && <div className="mt-1 italic">&ldquo;{r.message}&rdquo;</div>}
                </td>
                <td className="p-3">{bucketLabel("inventory", r.inventory)}</td>
                <td className="p-3">{bucketLabel("links", r.monthlyLinks)}</td>
                <td className="p-3">{bucketLabel("team", r.teamSize)}</td>
                <td className="p-3">
                  <span className={r.tier === "FOUNDING" ? "chip bg-ink text-white" : "chip"}>{TIERS[r.tier as keyof typeof TIERS]?.label ?? r.tier}</span>
                  <div className="mt-1">{r.score}/100</div>
                  <div className="text-muted">{(Array.isArray(r.currentTools) ? r.currentTools : []).join(", ")}</div>
                </td>
                <td className="text-muted p-3">
                  {Object.entries((r.source ?? {}) as Record<string, string>).map(([k, v]) => (
                    <div key={k}>
                      {k}: {v}
                    </div>
                  ))}
                </td>
                <td className="p-3">
                  <form action={updateEoi} className="flex flex-col gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    <select name="status" defaultValue={r.status} className="input !py-2">
                      {EOI_STATUSES.map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                    <textarea name="notes" defaultValue={r.notes ?? ""} rows={2} className="input !py-2" placeholder="Notes" />
                    <button className="btn btn-dark !py-2 justify-center">Save</button>
                  </form>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="text-muted p-8 text-center">
                  No registrations match these filters yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
