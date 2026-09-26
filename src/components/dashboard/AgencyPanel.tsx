"use client";
import { useState, useTransition } from "react";
import Image from "next/image";
import { Building2, ExternalLink, KeyRound, LogOut, Trash2, UserMinus, Users } from "lucide-react";
import { format } from "date-fns";
import { createAgency, joinAgency, leaveAgency, removeMember } from "@/app/dashboard/agency/actions";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";
import { CopyButton } from "./CopyButton";

export type AgencyMemberRow = { userId: string; name: string | null; phone: string; avatarUrl: string | null; role: string; joinedAt: string };
export type AgencyView = { id: string; name: string; code: string; username: string | null; siteUrl: string | null; members: AgencyMemberRow[] };

export function AgencyPanel({ agency, myUserId, myRole, rootDomain }: { agency: AgencyView | null; myUserId: string; myRole: string | null; rootDomain: string }) {
  if (!agency) return <NoAgency rootDomain={rootDomain} />;
  return <AgencyDetails agency={agency} myUserId={myUserId} myRole={myRole ?? "AGENT"} />;
}

function NoAgency({ rootDomain }: { rootDomain: string }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [code, setCode] = useState("");
  const [createErr, setCreateErr] = useState<string | null>(null);
  const [joinErr, setJoinErr] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const toast = useToast();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <form
        className="card p-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setCreateErr(null);
          start(async () => {
            const r = await createAgency(name, username);
            if (!r.ok) return setCreateErr(r.error);
            toast.success(`Agency created · code ${r.data?.code}`);
          });
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft">
            <Building2 size={20} />
          </span>
          <div>
            <h2 className="text-xl">Create an agency</h2>
            <p className="text-sm text-muted">You become the owner and get a 7-digit code to invite your team.</p>
          </div>
        </div>
        <Input label="Agency name" placeholder="Demo Realty" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} required error={createErr} />
        <Input label="Agency address (optional)" placeholder="demorealty" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} suffix={`.${rootDomain}`} hint="A shared storefront showing every member's listings." autoComplete="off" />
        <Button type="submit" loading={pending}>
          Create agency
        </Button>
      </form>

      <form
        className="card p-6 flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          setJoinErr(null);
          start(async () => {
            const r = await joinAgency(code);
            if (!r.ok) return setJoinErr(r.error);
            toast.success(`Joined ${r.data?.name}`);
          });
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-soft">
            <KeyRound size={20} />
          </span>
          <div>
            <h2 className="text-xl">Join with code</h2>
            <p className="text-sm text-muted">Ask your agency owner for their 7-digit code.</p>
          </div>
        </div>
        <Input label="Agency code" placeholder="1234567" inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 7))} className="tracking-[.3em] font-medium" required error={joinErr} />
        <Button type="submit" variant="light" loading={pending}>
          Join agency
        </Button>
      </form>
    </div>
  );
}

function AgencyDetails({ agency, myUserId, myRole }: { agency: AgencyView; myUserId: string; myRole: string }) {
  const [removing, setRemoving] = useState<AgencyMemberRow | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [pending, start] = useTransition();
  const toast = useToast();
  const isOwner = myRole === "OWNER";
  const canRemove = isOwner || myRole === "ADMIN";

  return (
    <div className="flex flex-col gap-4">
      <section className="card p-6 flex flex-col md:flex-row md:items-center gap-5">
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-black text-white">
          <Building2 size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="eyebrow">Your agency</p>
          <h2 className="text-2xl mt-0.5">{agency.name}</h2>
          <p className="text-sm text-muted mt-1">
            {agency.members.length} member{agency.members.length === 1 ? "" : "s"} · Every member&apos;s live listings show on the agency storefront.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:items-end">
          <div className="flex items-center gap-2 rounded-2xl bg-soft p-2 pl-4">
            <span className="text-xs text-muted">Code</span>
            <span className="font-medium tracking-[.25em] tabular-nums">{agency.code}</span>
            <CopyButton text={agency.code} label="Copy" className="btn btn-dark !py-2 !px-3 text-sm" />
          </div>
          {agency.siteUrl ? (
            <a href={agency.siteUrl} target="_blank" rel="noreferrer" className="btn btn-light !py-2 !px-3.5 text-sm">
              <ExternalLink size={15} /> Agency storefront
            </a>
          ) : (
            <span className="text-xs text-muted">No agency address set.</span>
          )}
        </div>
      </section>

      <section className="card p-5 md:p-6">
        <div className="flex items-center gap-2 mb-3">
          <Users size={18} />
          <h3 className="text-lg">Members</h3>
        </div>
        <ul className="divide-y divide-line">
          {agency.members.map((m) => (
            <li key={m.userId} className="flex items-center gap-3 py-3">
              {m.avatarUrl ? (
                <Image src={m.avatarUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" unoptimized />
              ) : (
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-soft text-sm font-medium">{(m.name ?? "•").charAt(0).toUpperCase()}</span>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-medium">
                  {m.name ?? "Unnamed member"} {m.userId === myUserId && <span className="text-xs text-muted">(you)</span>}
                </p>
                <p className="truncate text-sm text-muted">{m.phone}</p>
              </div>
              <div className="text-right">
                <span className="chip text-xs">{m.role === "OWNER" ? "Owner" : m.role === "ADMIN" ? "Admin" : "Agent"}</span>
                <p className="mt-1 text-[11px] text-muted">Joined {format(new Date(m.joinedAt), "d MMM yyyy")}</p>
              </div>
              {canRemove && m.role !== "OWNER" && m.userId !== myUserId && (
                <button type="button" onClick={() => setRemoving(m)} className="icon-btn !w-9 !h-9 hover:!bg-red-50 hover:text-red-600" aria-label={`Remove ${m.name ?? m.phone}`}>
                  <UserMinus size={15} />
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={() => setLeaving(true)} className="btn btn-ghost !py-2.5 !px-4 text-sm text-red-600 !border-red-200 hover:bg-red-50">
          {isOwner ? <Trash2 size={15} /> : <LogOut size={15} />} {isOwner ? "Delete agency" : "Leave agency"}
        </button>
      </div>

      <ConfirmDialog
        open={!!removing}
        onClose={() => setRemoving(null)}
        loading={pending}
        onConfirm={() => {
          const m = removing;
          if (!m) return;
          start(async () => {
            const r = await removeMember(m.userId);
            if (r.ok) toast.success("Member removed");
            else toast.error(r.error);
            setRemoving(null);
          });
        }}
        title={`Remove ${removing?.name ?? removing?.phone}?`}
        description="Their listings will no longer appear on the agency storefront. They keep their own site and listings."
        confirmLabel="Remove"
        danger
      />
      <ConfirmDialog
        open={leaving}
        onClose={() => setLeaving(false)}
        loading={pending}
        onConfirm={() =>
          start(async () => {
            const r = await leaveAgency();
            if (r.ok) toast.success(isOwner ? "Agency deleted" : "You left the agency");
            else toast.error(r.error);
            setLeaving(false);
          })
        }
        title={isOwner ? "Delete this agency?" : "Leave this agency?"}
        description={isOwner ? "All members are removed and the code stops working. Nobody's listings are deleted." : "You can rejoin later with the code."}
        confirmLabel={isOwner ? "Delete agency" : "Leave"}
        danger
      />
    </div>
  );
}
