"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { normaliseUsername, validateUsername } from "@/components/dashboard/username";
import type { ActionResult } from "@/app/dashboard/actions";

async function uniqueCode(): Promise<string> {
  for (let i = 0; i < 20; i++) {
    const code = String(Math.floor(1000000 + Math.random() * 9000000)); // 7 digits, no leading zero
    const exists = await db.agency.findUnique({ where: { code }, select: { id: true } });
    if (!exists) return code;
  }
  throw new Error("Could not allocate an agency code");
}

async function membership(userId: string) {
  return db.agencyMember.findFirst({ where: { userId }, select: { agencyId: true, role: true } });
}

export async function createAgency(rawName: string, rawUsername?: string): Promise<ActionResult<{ code: string }>> {
  const user = await requireUser();
  if (await membership(user.id)) return { ok: false, error: "You are already in an agency. Leave it first." };
  const name = rawName.trim();
  if (name.length < 2 || name.length > 60) return { ok: false, error: "Enter the agency name (2–60 characters)." };
  let username: string | null = null;
  if (rawUsername && rawUsername.trim()) {
    username = normaliseUsername(rawUsername);
    const err = validateUsername(username);
    if (err) return { ok: false, error: err };
    const [u, a] = await Promise.all([db.user.findUnique({ where: { username }, select: { id: true } }), db.agency.findUnique({ where: { username }, select: { id: true } })]);
    if (u || a) return { ok: false, error: "That address is already taken." };
  }
  const code = await uniqueCode();
  await db.agency.create({ data: { name, code, username, ownerId: user.id, members: { create: { userId: user.id, role: "OWNER" } } } });
  if (!user.agencyName) await db.user.update({ where: { id: user.id }, data: { agencyName: name } });
  revalidatePath("/dashboard/agency");
  return { ok: true, data: { code } };
}

export async function joinAgency(rawCode: string): Promise<ActionResult<{ name: string }>> {
  const user = await requireUser();
  if (await membership(user.id)) return { ok: false, error: "You are already in an agency. Leave it first." };
  const code = rawCode.replace(/\D/g, "");
  if (code.length !== 7) return { ok: false, error: "Enter the 7-digit code." };
  const agency = await db.agency.findUnique({ where: { code } });
  if (!agency) return { ok: false, error: "No agency found with that code." };
  await db.agencyMember.create({ data: { agencyId: agency.id, userId: user.id, role: "AGENT" } });
  if (!user.agencyName) await db.user.update({ where: { id: user.id }, data: { agencyName: agency.name } });
  revalidatePath("/dashboard/agency");
  return { ok: true, data: { name: agency.name } };
}

export async function removeMember(memberUserId: string): Promise<ActionResult> {
  const user = await requireUser();
  const m = await membership(user.id);
  if (!m || (m.role !== "OWNER" && m.role !== "ADMIN")) return { ok: false, error: "Only the agency owner can remove members." };
  if (memberUserId === user.id) return { ok: false, error: "Use “Leave agency” to remove yourself." };
  const target = await db.agencyMember.findUnique({ where: { agencyId_userId: { agencyId: m.agencyId, userId: memberUserId } } });
  if (!target) return { ok: false, error: "Member not found." };
  if (target.role === "OWNER") return { ok: false, error: "The owner cannot be removed." };
  await db.agencyMember.delete({ where: { agencyId_userId: { agencyId: m.agencyId, userId: memberUserId } } });
  revalidatePath("/dashboard/agency");
  return { ok: true };
}

/** Members leave; the owner deletes the agency instead (cascade removes memberships). */
export async function leaveAgency(): Promise<ActionResult> {
  const user = await requireUser();
  const m = await membership(user.id);
  if (!m) return { ok: false, error: "You are not in an agency." };
  if (m.role === "OWNER") {
    await db.agency.delete({ where: { id: m.agencyId } });
  } else {
    await db.agencyMember.delete({ where: { agencyId_userId: { agencyId: m.agencyId, userId: user.id } } });
  }
  revalidatePath("/dashboard/agency");
  return { ok: true };
}
