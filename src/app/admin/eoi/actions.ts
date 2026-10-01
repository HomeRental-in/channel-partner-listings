"use server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import { EOI_STATUSES } from "@/lib/partners";

export async function updateEoi(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const notes = String(form.get("notes") ?? "").slice(0, 2000);
  if (!id || !(EOI_STATUSES as readonly string[]).includes(status)) return;
  await db.partnerEoi.update({ where: { id }, data: { status, notes: notes || null } });
  revalidatePath("/admin/eoi");
}
