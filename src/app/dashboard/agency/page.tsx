import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROOT_DOMAIN, siteUrl } from "@/lib/site";
import { AgencyPanel } from "@/components/dashboard/AgencyPanel";

export const metadata: Metadata = { title: "Agency" };
export const dynamic = "force-dynamic";

export default async function AgencyPage() {
  const user = await requireUser();
  const membership = await db.agencyMember.findFirst({
    where: { userId: user.id },
    include: { agency: { include: { members: { orderBy: { joinedAt: "asc" }, include: { user: { select: { id: true, name: true, phone: true, avatarUrl: true } } } } } } },
  });
  const agency = membership
    ? {
        id: membership.agency.id,
        name: membership.agency.name,
        code: membership.agency.code,
        username: membership.agency.username,
        siteUrl: membership.agency.username ? siteUrl(membership.agency.username) : null,
        members: membership.agency.members.map((m) => ({ userId: m.user.id, name: m.user.name, phone: m.user.phone, avatarUrl: m.user.avatarUrl, role: m.role, joinedAt: m.joinedAt.toISOString() })),
      }
    : null;

  return (
    <div className="pt-2 flex flex-col gap-4">
      <div className="px-1">
        <h1 className="text-3xl">Agency</h1>
        <p className="text-muted mt-1">Work as a team: one code, one shared storefront, everyone keeps their own listings.</p>
      </div>
      <AgencyPanel agency={agency} myUserId={user.id} myRole={membership?.role ?? null} rootDomain={ROOT_DOMAIN} />
    </div>
  );
}
