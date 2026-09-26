import { NextResponse, type NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { storeFile } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const FFMPEG = process.env.FFMPEG_PATH ?? "/opt/homebrew/bin/ffmpeg";
const MAX_BYTES = 150 * 1024 * 1024;

async function ffmpegAvailable() {
  try {
    await fs.access(FFMPEG);
    return true;
  } catch {
    return false;
  }
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const proc = spawn(FFMPEG, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    proc.stderr.on("data", (d) => (err += d.toString().slice(-2000)));
    proc.on("error", reject);
    proc.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exited ${code}: ${err.slice(-600)}`))));
  });
}

/**
 * POST /api/listings/[id]/story-video — body: multipart `file` (video/webm) or a raw webm body.
 * Converts to MP4 (H.264 + AAC, 1080×1920) with ffmpeg when available, stores it and returns { url, format }.
 */
export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const listing = await db.listing.findFirst({ where: { id, userId: user.id }, select: { id: true, slug: true } });
  if (!listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  let webm: Buffer;
  const ct = req.headers.get("content-type") ?? "";
  if (ct.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "file missing" }, { status: 400 });
    webm = Buffer.from(await file.arrayBuffer());
  } else {
    webm = Buffer.from(await req.arrayBuffer());
  }
  if (!webm.length) return NextResponse.json({ error: "Empty upload" }, { status: 400 });
  if (webm.length > MAX_BYTES) return NextResponse.json({ error: "Video too large" }, { status: 413 });

  if (!(await ffmpegAvailable())) {
    const stored = await storeFile(webm, { ext: "webm", folder: "videos", contentType: "video/webm" });
    return NextResponse.json({ url: stored.url, format: "webm", sizeBytes: stored.sizeBytes, filename: `${listing.slug}-story.webm` });
  }

  const dir = await fs.mkdtemp(path.join(os.tmpdir(), "story-"));
  const input = path.join(dir, `${nanoid(8)}.webm`);
  const output = path.join(dir, `${nanoid(8)}.mp4`);
  try {
    await fs.writeFile(input, webm);
    await runFfmpeg([
      "-y", "-hide_banner", "-loglevel", "error",
      "-fflags", "+genpts",
      "-i", input,
      "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p",
      "-r", "30",
      "-c:v", "libx264", "-preset", "veryfast", "-crf", "23", "-profile:v", "high", "-level", "4.0",
      "-c:a", "aac", "-b:a", "128k",
      "-movflags", "+faststart",
      output,
    ]);
    const mp4 = await fs.readFile(output);
    const stored = await storeFile(mp4, { ext: "mp4", folder: "videos", contentType: "video/mp4" });
    return NextResponse.json({ url: stored.url, format: "mp4", sizeBytes: stored.sizeBytes, filename: `${listing.slug}-story.mp4` });
  } catch (err) {
    console.error("story video conversion failed", err);
    const stored = await storeFile(webm, { ext: "webm", folder: "videos", contentType: "video/webm" });
    return NextResponse.json({ url: stored.url, format: "webm", sizeBytes: stored.sizeBytes, filename: `${listing.slug}-story.webm`, warning: "MP4 conversion failed; WebM stored instead" });
  } finally {
    fs.rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
