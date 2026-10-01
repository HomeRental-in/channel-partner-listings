import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { bucketLabel } from "@/lib/partners";
import { cityBySlug } from "@/lib/seo/cities";
import { filtersFrom, listEois } from "../data";

const csv = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

export async function GET(req: NextRequest) {
  await requireAdmin();
  const rows = await listEois(filtersFrom(Object.fromEntries(req.nextUrl.searchParams)));
  const head = ["createdAt", "tier", "score", "status", "agency", "contact", "role", "phone", "email", "city", "localities", "inventory", "linksPerMonth", "team", "tools", "rera", "message", "source", "notes"];
  const lines = rows.map((r) =>
    [
      r.createdAt.toISOString(), r.tier, r.score, r.status, r.agencyName, r.contactName, r.role, r.phone, r.email,
      cityBySlug(r.city)?.name ?? r.city,
      (Array.isArray(r.localities) ? r.localities : []).join("; "),
      bucketLabel("inventory", r.inventory), bucketLabel("links", r.monthlyLinks), bucketLabel("team", r.teamSize),
      (Array.isArray(r.currentTools) ? r.currentTools : []).join("; "),
      r.reraNumber, r.message, JSON.stringify(r.source), r.notes,
    ].map(csv).join(","),
  );
  return new Response([head.join(","), ...lines].join("\n"), {
    headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="partner-eoi-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
