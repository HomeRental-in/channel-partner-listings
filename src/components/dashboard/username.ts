/** Username (subdomain) rules shared by the home "Edit address" form, settings and server actions. */
export const RESERVED_USERNAMES = new Set(["www", "app", "api", "admin", "mail", "static", "cdn", "assets", "dashboard", "login", "review"]);
export const USERNAME_RE = /^[a-z0-9]{3,24}$/;

export function normaliseUsername(raw: string) {
  return raw.trim().toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 24);
}

/** Returns an error message or null when valid. Uniqueness is checked server-side. */
export function validateUsername(u: string): string | null {
  if (!u) return "Choose an address.";
  if (u.length < 3) return "At least 3 characters.";
  if (u.length > 24) return "At most 24 characters.";
  if (!USERNAME_RE.test(u)) return "Only lowercase letters and numbers.";
  if (RESERVED_USERNAMES.has(u)) return "That address is reserved.";
  return null;
}
