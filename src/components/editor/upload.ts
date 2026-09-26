/** Browser-side helper for POST /api/upload. `auth` carries the review token when there is no session. */
export type UploadKind = "photo" | "video" | "document" | "avatar" | "brochure" | "floorplan";
export type UploadResult = { url: string; key: string; width: number | null; height: number | null; sizeBytes: number; name: string };
export type ReviewAuth = { token: string; listingId: string } | null | undefined;

export function apiUrl(path: string, auth?: ReviewAuth) {
  if (!auth) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}t=${encodeURIComponent(auth.token)}&listingId=${encodeURIComponent(auth.listingId)}`;
}

export async function uploadFile(file: File, kind: UploadKind, auth?: ReviewAuth): Promise<UploadResult> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("kind", kind);
  const res = await fetch(apiUrl("/api/upload", auth), { method: "POST", body: fd });
  const json = (await res.json().catch(() => ({}))) as Partial<UploadResult> & { error?: string };
  if (!res.ok || !json.url) throw new Error(json.error ?? `Upload failed (${res.status})`);
  return json as UploadResult;
}

export function formatBytes(n: number) {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

/** Reorder helper for drag-and-drop lists. */
export function move<T>(arr: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= arr.length || to >= arr.length) return arr;
  const next = arr.slice();
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
