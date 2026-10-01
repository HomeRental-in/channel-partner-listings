import { notFound } from "next/navigation";
import { getCurrentUser, normalizePhone } from "./auth";

/** Internal team access: phones listed in ADMIN_PHONES (comma separated). Everyone else gets a 404. */
export async function requireAdmin() {
  const user = await getCurrentUser();
  const admins = (process.env.ADMIN_PHONES ?? "").split(",").map((p) => normalizePhone(p)).filter(Boolean);
  if (!user || !admins.includes(user.phone)) notFound();
  return user;
}
