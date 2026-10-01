import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser, verifyReviewToken } from "@/lib/auth";
import { storeFile, storeImage } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * POST /api/upload — multipart `file` + `kind` (photo|video|document|avatar|logo|brochure|floorplan).
 * Auth: a session, OR a review token via `?t=<token>&listingId=<id>` (no-login review page).
 * Returns { url, key, width, height, sizeBytes, name }.
 */
type Kind = "photo" | "video" | "document" | "avatar" | "logo" | "brochure" | "floorplan";
const MB = 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif", "image/heic", "image/heif", "image/tiff"];
const VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm", "video/x-m4v", "video/3gpp"];
const RULES: Record<Kind, { max: number; types: string[]; folder: string }> = {
  photo: { max: 10 * MB, types: IMAGE_TYPES, folder: "photos" },
  avatar: { max: 5 * MB, types: IMAGE_TYPES, folder: "avatars" },
  logo: { max: 5 * MB, types: IMAGE_TYPES, folder: "logos" }, // stored as WebP, transparency preserved
  video: { max: 100 * MB, types: VIDEO_TYPES, folder: "videos" },
  document: { max: 25 * MB, types: ["application/pdf"], folder: "documents" },
  brochure: { max: 25 * MB, types: ["application/pdf"], folder: "brochures" },
  floorplan: { max: 25 * MB, types: ["application/pdf", ...IMAGE_TYPES], folder: "floorplans" },
};

async function authorised(req: NextRequest) {
  if (await getCurrentUser()) return true;
  const t = req.nextUrl.searchParams.get("t");
  const listingId = req.nextUrl.searchParams.get("listingId");
  return !!(t && listingId && (await verifyReviewToken(t, listingId)));
}

function extFor(file: File, mime: string) {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]{2,5}$/.test(fromName)) return fromName;
  return mime.split("/")[1] ?? "bin";
}

export async function POST(req: NextRequest) {
  if (!(await authorised(req))) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
  }
  const file = form.get("file");
  const kind = String(form.get("kind") ?? "photo") as Kind;
  if (!(file instanceof File)) return NextResponse.json({ error: "Missing file" }, { status: 400 });
  const rule = RULES[kind];
  if (!rule) return NextResponse.json({ error: "Unknown kind" }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: "Empty file" }, { status: 400 });
  if (file.size > rule.max) return NextResponse.json({ error: `File too large (max ${Math.round(rule.max / MB)} MB)` }, { status: 413 });

  const mime = (file.type || "").toLowerCase();
  const isPdf = mime === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  const isImage = mime.startsWith("image/");
  if (!rule.types.includes(mime) && !(isPdf && rule.types.includes("application/pdf"))) {
    return NextResponse.json({ error: `Unsupported file type for ${kind}` }, { status: 415 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  try {
    if (isImage && (kind === "photo" || kind === "avatar" || kind === "logo" || kind === "floorplan")) {
      const stored = await storeImage(buf, rule.folder);
      return NextResponse.json({ ...stored, name: file.name });
    }
    const stored = await storeFile(buf, { ext: isPdf ? "pdf" : extFor(file, mime), folder: rule.folder, contentType: isPdf ? "application/pdf" : mime });
    return NextResponse.json({ ...stored, width: null, height: null, name: file.name });
  } catch (err) {
    console.error("upload failed", err);
    return NextResponse.json({ error: "Could not process the file" }, { status: 500 });
  }
}
