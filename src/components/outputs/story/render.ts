import { paletteFor, type OutputPalette } from "@/lib/outputs/theme";
import { STORY_W as W, STORY_H as H, TRANSITION_MS, type PlanSlide, type StoryPlan } from "./types";

export type ImageMap = Map<string, HTMLImageElement>;

/** Load images CORS-safely so the canvas stays exportable. Failures are skipped. */
export async function loadImages(urls: string[]): Promise<ImageMap> {
  const map: ImageMap = new Map();
  await Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload = () => {
            map.set(url, img);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = url;
        }),
    ),
  );
  return map;
}

let fontFamily = "Outfit, system-ui, sans-serif";
export function detectFontFamily() {
  if (typeof document !== "undefined") {
    const f = getComputedStyle(document.body).fontFamily;
    if (f) fontFamily = f;
  }
}
const font = (weight: number, px: number) => `${weight} ${px}px ${fontFamily}`;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const t = cur ? `${cur} ${w}` : w;
    if (ctx.measureText(t).width <= maxWidth || !cur) cur = t;
    else {
      lines.push(cur);
      cur = w;
    }
    if (lines.length === maxLines) break;
  }
  if (cur && lines.length < maxLines) lines.push(cur);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) lines[maxLines - 1] = lines[maxLines - 1].replace(/\s?\S*$/, "…");
  return lines;
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lineHeight: number) {
  lines.forEach((l, i) => ctx.fillText(l, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
}

function coverImage(ctx: CanvasRenderingContext2D, img: HTMLImageElement, scale = 1, dx = 0) {
  const r = Math.max(W / img.naturalWidth, H / img.naturalHeight) * scale;
  const w = img.naturalWidth * r, h = img.naturalHeight * r;
  ctx.drawImage(img, (W - w) / 2 + dx, (H - h) / 2, w, h);
}

function pill(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, bg: string, fg: string, px = 30) {
  ctx.font = font(500, px);
  const w = ctx.measureText(text).width + px * 1.6;
  const h = px * 1.9;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, h / 2);
  ctx.fill();
  ctx.fillStyle = fg;
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + px * 0.8, y + h / 2 + 1);
  ctx.textBaseline = "alphabetic";
  return w;
}

function brandMark(ctx: CanvasRenderingContext2D, plan: StoryPlan, color: string) {
  ctx.font = font(500, 24);
  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.fillText(`MADE WITH ${plan.listing.brand.toUpperCase()}`, W / 2, H - 60);
  ctx.textAlign = "left";
}

function photoSlide(ctx: CanvasRenderingContext2D, plan: StoryPlan, slide: Extract<PlanSlide, { kind: "photo" }>, images: ImageMap, p: OutputPalette, prog: number) {
  const img = images.get(slide.url);
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  if (img) {
    const zoom = plan.settings.animation === "zoom" ? 1 + 0.12 * prog : 1.02;
    coverImage(ctx, img, zoom);
  }
  const g = ctx.createLinearGradient(0, H * 0.55, 0, H);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, "rgba(0,0,0,0.82)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
  const top = ctx.createLinearGradient(0, 0, 0, 260);
  top.addColorStop(0, "rgba(0,0,0,0.45)");
  top.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = top;
  ctx.fillRect(0, 0, W, 260);

  pill(ctx, plan.listing.priceDisplay, 70, 80, p.accent, p.accentInk, 34);
  if (slide.caption) {
    ctx.font = font(700, 64);
    ctx.fillStyle = "#fff";
    const lines = wrap(ctx, slide.caption, W - 140, 3);
    const y = H - 190 - (lines.length - 1) * 76;
    drawLines(ctx, lines, 70, y, 76);
  }
  ctx.font = font(400, 30);
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.fillText(plan.listing.where || plan.listing.title, 70, H - 110);
  brandMark(ctx, plan, "rgba(255,255,255,0.55)");
}

function priceSlide(ctx: CanvasRenderingContext2D, plan: StoryPlan, images: ImageMap, p: OutputPalette) {
  const l = plan.listing;
  ctx.fillStyle = p.bg;
  ctx.fillRect(0, 0, W, H);
  const first = l.photos[0] ? images.get(l.photos[0].url) : undefined;
  if (first) {
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(70, 110, W - 140, 820, 48);
    ctx.clip();
    const r = Math.max((W - 140) / first.naturalWidth, 820 / first.naturalHeight);
    const w = first.naturalWidth * r, h = first.naturalHeight * r;
    ctx.drawImage(first, 70 + (W - 140 - w) / 2, 110 + (820 - h) / 2, w, h);
    ctx.restore();
  }
  let y = 1060;
  ctx.font = font(500, 30);
  ctx.fillStyle = p.accent;
  ctx.fillText(l.transaction.toUpperCase(), 70, y);
  y += 120;
  ctx.font = font(700, 120);
  ctx.fillStyle = p.accent;
  ctx.fillText(l.priceDisplay, 70, y);
  y += 90;
  ctx.font = font(700, 54);
  ctx.fillStyle = p.ink;
  y = drawLines(ctx, wrap(ctx, l.title, W - 140, 2), 70, y, 64);
  if (l.where) {
    ctx.font = font(400, 36);
    ctx.fillStyle = p.muted;
    ctx.fillText(l.where, 70, y + 16);
    y += 60;
  }
  let x = 70;
  y += 50;
  for (const c of l.chips.slice(0, 4)) {
    const w = pill(ctx, c, x, y, p.soft, p.ink, 30);
    x += w + 14;
    if (x > W - 300) {
      x = 70;
      y += 76;
    }
  }
  brandMark(ctx, plan, p.muted);
}

function contactSlide(ctx: CanvasRenderingContext2D, plan: StoryPlan, images: ImageMap, p: OutputPalette) {
  const b = plan.listing.broker;
  ctx.fillStyle = "#111111";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = p.accent;
  ctx.beginPath();
  ctx.arc(W / 2, 520, 420, 0, Math.PI * 2);
  ctx.globalAlpha = 0.18;
  ctx.fill();
  ctx.globalAlpha = 1;
  let y = 560;
  const avatar = b.avatarUrl && b.showName ? images.get(b.avatarUrl) : undefined;
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(W / 2, 420, 150, 0, Math.PI * 2);
    ctx.clip();
    const r = Math.max(300 / avatar.naturalWidth, 300 / avatar.naturalHeight);
    ctx.drawImage(avatar, W / 2 - (avatar.naturalWidth * r) / 2, 420 - (avatar.naturalHeight * r) / 2, avatar.naturalWidth * r, avatar.naturalHeight * r);
    ctx.restore();
    y = 660;
  }
  ctx.textAlign = "center";
  if (b.showName) {
    ctx.font = font(700, 72);
    ctx.fillStyle = "#fff";
    ctx.fillText(b.name, W / 2, y);
    y += 60;
    if (b.showAgency && b.agency) {
      ctx.font = font(400, 38);
      ctx.fillStyle = "rgba(255,255,255,0.75)";
      ctx.fillText(b.agency, W / 2, y);
      y += 60;
    }
  }
  y += 80;
  ctx.font = font(500, 32);
  ctx.fillStyle = p.accent;
  ctx.fillText("INTERESTED? GET IN TOUCH", W / 2, y);
  y += 100;
  const wa = b.showWhatsApp ? (b.whatsapp ?? b.phone) : null;
  if (wa) {
    ctx.font = font(700, 62);
    ctx.fillStyle = "#25d366";
    ctx.fillText(`WhatsApp ${wa}`, W / 2, y);
    y += 90;
  }
  if (b.showCall && b.phone && b.phone !== wa) {
    ctx.font = font(500, 46);
    ctx.fillStyle = "#fff";
    ctx.fillText(`Call ${b.phone}`, W / 2, y);
    y += 80;
  }
  if (b.showSite) {
    ctx.font = font(400, 34);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fillText(b.siteUrl.replace(/^https?:\/\//, ""), W / 2, y + 40);
  }
  ctx.font = font(700, 44);
  ctx.fillStyle = "#fff";
  const lines = wrap(ctx, plan.listing.title, W - 160, 2);
  drawLines(ctx, lines, W / 2, H - 330, 54);
  ctx.textAlign = "left";
  brandMark(ctx, plan, "rgba(255,255,255,0.55)");
}

function drawSlide(ctx: CanvasRenderingContext2D, plan: StoryPlan, slide: PlanSlide, images: ImageMap, p: OutputPalette, prog: number) {
  if (slide.kind === "photo") photoSlide(ctx, plan, slide, images, p, prog);
  else if (slide.kind === "price") priceSlide(ctx, plan, images, p);
  else contactSlide(ctx, plan, images, p);
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

/** Draw the frame at time t (ms) onto a 1080×1920 context. Returns false once the story has ended. */
export function drawFrame(ctx: CanvasRenderingContext2D, plan: StoryPlan, images: ImageMap, tMs: number): boolean {
  const per = plan.settings.seconds * 1000;
  const n = plan.slides.length;
  if (!n) {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, W, H);
    return false;
  }
  const total = per * n;
  if (tMs >= total) return false;
  const p = paletteFor(plan.listing.theme);
  const idx = Math.min(n - 1, Math.floor(tMs / per));
  const local = tMs - idx * per;
  const prog = local / per;
  const cur = plan.slides[idx];
  const prev = idx > 0 ? plan.slides[idx - 1] : null;
  const anim = plan.settings.animation;
  const inTransition = prev && local < TRANSITION_MS;
  const k = inTransition ? ease(local / TRANSITION_MS) : 1;

  ctx.save();
  if (inTransition && prev && anim === "slide") {
    ctx.save();
    ctx.translate(-W * k, 0);
    drawSlide(ctx, plan, prev, images, p, 1);
    ctx.restore();
    ctx.translate(W * (1 - k), 0);
    drawSlide(ctx, plan, cur, images, p, prog);
  } else if (inTransition && prev) {
    drawSlide(ctx, plan, prev, images, p, 1);
    ctx.globalAlpha = k;
    drawSlide(ctx, plan, cur, images, p, prog);
  } else {
    drawSlide(ctx, plan, cur, images, p, prog);
  }
  ctx.restore();

  // progress bar
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  const gap = 8, bw = (W - 140 - gap * (n - 1)) / n;
  for (let i = 0; i < n; i++) {
    ctx.fillStyle = i < idx ? "#fff" : "rgba(255,255,255,0.35)";
    ctx.fillRect(70 + i * (bw + gap), 40, bw, 6);
    if (i === idx) {
      ctx.fillStyle = "#fff";
      ctx.fillRect(70 + i * (bw + gap), 40, bw * prog, 6);
    }
  }
  return true;
}
