import { promises as fs } from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import sharp from "sharp";

/**
 * Storage abstraction. "local" writes under ./public/uploads and serves from /uploads/...
 * "s3" uses @aws-sdk/client-s3 with the default credential chain (EC2 instance role in production).
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
  if (DRIVER === "s3") {
    try {
      const { S3Client, DeleteObjectCommand } = await import("@aws-sdk/client-s3");
      await new S3Client({ region: process.env.S3_REGION ?? "ap-south-1" }).send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
    } catch {}
    return;
  }
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

// ── S3 via the AWS SDK: credentials come from the default chain (instance role on EC2, env vars locally) ──
async function putS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
  const bucket = process.env.S3_BUCKET!;
  const region = process.env.S3_REGION ?? "ap-south-1";
  const client = new S3Client({
    region,
    ...(process.env.S3_ENDPOINT ? { endpoint: process.env.S3_ENDPOINT, forcePathStyle: true } : {}),
    ...(process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY
      ? { credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY } }
      : {}),
  });
  await client.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
  const publicBase = process.env.S3_PUBLIC_BASE_URL ?? `https://${bucket}.s3.${region}.amazonaws.com`;
  return `${publicBase}/${key}`;
}
