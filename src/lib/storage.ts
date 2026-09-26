import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";

/**
 * Storage abstraction. "local" writes under ./public/uploads and serves from /uploads/...
 * "s3" is implemented against any S3-compatible endpoint via signed PUT (kept dependency-free).
 */
const DRIVER = process.env.STORAGE_DRIVER ?? "local";
const LOCAL_ROOT = path.join(process.cwd(), "public", "uploads");

export type StoredFile = { url: string; key: string; width?: number; height?: number; sizeBytes: number };

export async function storeBuffer(buf: Buffer, opts: { ext: string; folder: string; contentType: string }): Promise<StoredFile> {
  const key = `${opts.folder}/${nanoid(16)}.${opts.ext.replace(/^\./, "")}`;
  if (DRIVER === "s3") {
    const url = await putS3(key, buf, opts.contentType);
    return { url, key, sizeBytes: buf.length };
  }
  const full = path.join(LOCAL_ROOT, key);
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, buf);
  return { url: `/uploads/${key}`, key, sizeBytes: buf.length };
}

/** Normalise an uploaded image: auto-rotate, cap at 2000px, encode WebP. Returns dimensions. */
export async function storeImage(input: Buffer, folder = "photos"): Promise<StoredFile> {
  const img = sharp(input).rotate().resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true });
  const buf = await img.webp({ quality: 84 }).toBuffer();
  const meta = await sharp(buf).metadata();
  const stored = await storeBuffer(buf, { ext: "webp", folder, contentType: "image/webp" });
  return { ...stored, width: meta.width, height: meta.height };
}

export async function storeFile(input: Buffer, opts: { ext: string; folder: string; contentType: string }) {
  return storeBuffer(input, opts);
}

export async function deleteStored(key: string) {
  if (DRIVER === "s3") return; // best-effort; S3 lifecycle handles orphans
  try {
    await fs.unlink(path.join(LOCAL_ROOT, key));
  } catch {}
}

/** Absolute URL for a stored file (needed by OG images, PDF renderer, CAPI). */
export function absoluteUrl(url: string) {
  if (/^https?:\/\//.test(url)) return url;
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "localhost:3000";
  const proto = root.startsWith("localhost") ? "http" : "https";
  return `${proto}://${root}${url}`;
}

/** Read a stored file back as a Buffer (local driver) or fetch it (s3). */
export async function readStored(url: string): Promise<Buffer> {
  if (url.startsWith("/uploads/")) return fs.readFile(path.join(LOCAL_ROOT, url.slice("/uploads/".length)));
  const res = await fetch(absoluteUrl(url));
  return Buffer.from(await res.arrayBuffer());
}

// ── minimal S3 SigV4 PUT (no SDK) ──
async function putS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION ?? "ap-south-1";
  const endpoint = process.env.S3_ENDPOINT ?? `https://s3.${region}.amazonaws.com`;
  const accessKey = process.env.S3_ACCESS_KEY_ID!;
  const secretKey = process.env.S3_SECRET_ACCESS_KEY!;
  const host = new URL(endpoint).host;
  const url = `${endpoint}/${bucket}/${key}`;
  const { createHash, createHmac } = await import("node:crypto");
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const date = amzDate.slice(0, 8);
  const payloadHash = createHash("sha256").update(body).digest("hex");
  const headers: Record<string, string> = {
    host,
    "content-type": contentType,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
    "x-amz-acl": "public-read",
  };
  const signedHeaders = Object.keys(headers).sort().join(";");
  const canonical = ["PUT", `/${bucket}/${key}`, "", ...Object.keys(headers).sort().map((h) => `${h}:${headers[h]}`), "", signedHeaders, payloadHash].join("\n");
  const scope = `${date}/${region}/s3/aws4_request`;
  const toSign = ["AWS4-HMAC-SHA256", amzDate, scope, createHash("sha256").update(canonical).digest("hex")].join("\n");
  const kDate = createHmac("sha256", "AWS4" + secretKey).update(date).digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update("s3").digest();
  const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
  const signature = createHmac("sha256", kSigning).update(toSign).digest("hex");
  const auth = `AWS4-HMAC-SHA256 Credential=${accessKey}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
  const res = await fetch(url, { method: "PUT", headers: { ...headers, authorization: auth }, body: new Uint8Array(body) });
  if (!res.ok) throw new Error(`S3 upload failed: ${res.status} ${await res.text()}`);
  const publicBase = process.env.S3_PUBLIC_BASE_URL ?? `${endpoint}/${bucket}`;
  return `${publicBase}/${key}`;
}
