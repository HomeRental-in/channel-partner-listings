import sharp from "sharp";
import { readStored } from "@/lib/storage";

/** Fetch a stored/remote photo and normalise it to a JPEG buffer (react-pdf and satori both handle JPEG reliably). */
export async function photoAsJpeg(url: string, maxWidth = 1600, quality = 80): Promise<Buffer | null> {
  try {
    const raw = await readStored(url);
    return await sharp(raw).rotate().resize({ width: maxWidth, height: maxWidth, fit: "inside", withoutEnlargement: true }).jpeg({ quality }).toBuffer();
  } catch {
    return null;
  }
}

/** Same as photoAsJpeg but returned as a data URI (for ImageResponse / satori). */
export async function photoAsDataUri(url: string, maxWidth = 1200, quality = 78): Promise<string | null> {
  const buf = await photoAsJpeg(url, maxWidth, quality);
  return buf ? `data:image/jpeg;base64,${buf.toString("base64")}` : null;
}

/** Load several photos concurrently, dropping failures, preserving order. */
export async function loadPhotos(urls: string[], maxWidth = 1600): Promise<Buffer[]> {
  const out = await Promise.all(urls.map((u) => photoAsJpeg(u, maxWidth)));
  return out.filter((b): b is Buffer => !!b);
}
