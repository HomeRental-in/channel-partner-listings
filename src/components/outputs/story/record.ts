import { drawFrame, type ImageMap } from "./render";
import { playMusic } from "./audio";
import { planDuration, STORY_H, STORY_W, type StoryPlan } from "./types";

function pickMime() {
  const candidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp9", "video/webm;codecs=vp8,opus", "video/webm;codecs=vp8", "video/webm", "video/mp4"];
  return candidates.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ?? "";
}

/** Render the story to a video Blob (WebM where supported) using canvas.captureStream + MediaRecorder. */
export function recordStory(plan: StoryPlan, images: ImageMap, onProgress?: (fraction: number) => void): Promise<Blob> {
  return new Promise((resolve, reject) => {
    if (typeof MediaRecorder === "undefined") return reject(new Error("This browser cannot record video. Try Chrome or Edge."));
    const canvas = document.createElement("canvas");
    canvas.width = STORY_W;
    canvas.height = STORY_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return reject(new Error("Canvas unavailable"));

    const fps = 30;
    const stream = canvas.captureStream(fps);
    const seconds = planDuration(plan);
    let audioCtx: AudioContext | null = null;
    let music: { stop: () => void } | null = null;
    if (plan.settings.music) {
      try {
        audioCtx = new AudioContext();
        const dest = audioCtx.createMediaStreamDestination();
        music = playMusic(audioCtx, dest, seconds);
        for (const t of dest.stream.getAudioTracks()) stream.addTrack(t);
      } catch {
        audioCtx = null;
      }
    }

    const mime = pickMime();
    const rec = new MediaRecorder(stream, { mimeType: mime || undefined, videoBitsPerSecond: 6_000_000 });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    rec.onerror = () => reject(new Error("Recording failed"));
    rec.onstop = () => {
      music?.stop();
      audioCtx?.close().catch(() => {});
      for (const t of stream.getTracks()) t.stop();
      resolve(new Blob(chunks, { type: mime || "video/webm" }));
    };

    drawFrame(ctx, plan, images, 0);
    rec.start(250);
    const start = performance.now();
    const total = seconds * 1000;
    const tick = () => {
      const t = performance.now() - start;
      const alive = drawFrame(ctx, plan, images, t);
      onProgress?.(Math.min(1, t / total));
      if (alive && t < total) requestAnimationFrame(tick);
      else setTimeout(() => rec.state !== "inactive" && rec.stop(), 120);
    };
    requestAnimationFrame(tick);
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export type UploadResult = { url: string; format: "mp4" | "webm"; filename: string; sizeBytes: number; warning?: string };

/** Send the recorded video to the server for MP4 conversion + storage. */
export async function uploadStory(listingId: string, blob: Blob): Promise<UploadResult> {
  const form = new FormData();
  form.append("file", blob, "story.webm");
  const res = await fetch(`/api/listings/${listingId}/story-video`, { method: "POST", body: form });
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error ?? "Upload failed");
  return res.json();
}
