"use client";

import { useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { drawFrame, type ImageMap } from "./render";
import { playMusic } from "./audio";
import { planDuration, STORY_H, STORY_W, type StoryPlan } from "./types";

type Props = { plan: StoryPlan; images: ImageMap; seekToSlide?: number | null };

/** 9:16 live preview. Loops the story; click to pause; speaker toggles the generated music. */
export function PreviewCanvas({ plan, images, seekToSlide }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [playing, setPlaying] = useState(true);
  const [sound, setSound] = useState(false);
  // start = wall-clock origin while playing; pausedAt = story time (ms) while paused. start=0 makes the first tick loop to 0.
  const clock = useRef({ start: 0, pausedAt: 0 });
  const lastSeek = useRef<number | null | undefined>(undefined);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    // jump to a slide when the user taps one in the strip
    if (seekToSlide != null && lastSeek.current !== seekToSlide) {
      lastSeek.current = seekToSlide;
      const ms = seekToSlide * plan.settings.seconds * 1000;
      clock.current = { start: performance.now() - ms, pausedAt: ms };
    }
    const total = planDuration(plan) * 1000;
    let audio: { ctx: AudioContext; stop: () => void } | null = null;
    const stopAudio = () => {
      audio?.stop();
      audio?.ctx.close().catch(() => {});
      audio = null;
    };
    const startAudio = () => {
      stopAudio();
      if (!(sound && playing && plan.settings.music)) return;
      try {
        const actx = new AudioContext();
        const elapsed = Math.max(0, (performance.now() - clock.current.start) / 1000);
        const h = playMusic(actx, actx.destination, Math.max(1, planDuration(plan) - elapsed));
        audio = { ctx: actx, stop: h.stop };
      } catch {}
    };
    startAudio();
    let raf = 0;
    const tick = () => {
      let t = playing ? performance.now() - clock.current.start : clock.current.pausedAt;
      if (total > 0 && t >= total) {
        clock.current = { start: performance.now(), pausedAt: 0 };
        t = 0;
        startAudio();
      }
      drawFrame(ctx, plan, images, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      stopAudio();
    };
  }, [plan, images, playing, sound, seekToSlide]);

  const toggle = () => {
    const now = performance.now();
    if (playing) clock.current.pausedAt = now - clock.current.start;
    else clock.current.start = now - clock.current.pausedAt;
    setPlaying((p) => !p);
  };

  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div className="relative rounded-[28px] overflow-hidden bg-black shadow-2xl border-[6px] border-black" style={{ aspectRatio: "9 / 16" }}>
        <canvas ref={ref} width={STORY_W} height={STORY_H} className="w-full h-full block cursor-pointer" onClick={toggle} />
        {!playing ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={26} className="ml-1" />
            </span>
          </div>
        ) : null}
      </div>
      <div className="flex items-center justify-center gap-2 mt-3">
        <button type="button" className="icon-btn" onClick={toggle} aria-label={playing ? "Pause" : "Play"}>
          {playing ? <Pause size={18} /> : <Play size={18} />}
        </button>
        <button type="button" className="icon-btn" onClick={() => setSound((s) => !s)} aria-label={sound ? "Mute preview" : "Preview music"} disabled={!plan.settings.music} title={plan.settings.music ? "Preview music" : "Turn on music to preview"}>
          {sound && plan.settings.music ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>
    </div>
  );
}
