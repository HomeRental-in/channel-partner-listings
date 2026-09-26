/**
 * Soft generated background music (no binary assets). A slow pad progression (Cmaj7 → Am7 → Fmaj7 → G6)
 * with a gentle sine arpeggio, low-passed and quiet. Works for live preview and is routed into the
 * MediaStream during recording.
 */
const CHORDS: number[][] = [
  [261.63, 329.63, 392.0, 493.88], // Cmaj7
  [220.0, 261.63, 329.63, 392.0], // Am7
  [174.61, 220.0, 261.63, 329.63], // Fmaj7
  [196.0, 246.94, 293.66, 329.63], // G6
];
const CHORD_SECONDS = 2.4;

export type MusicHandle = { stop: () => void };

/** Schedule `seconds` of music starting at ctx.currentTime, routed into `dest`. */
export function playMusic(ctx: AudioContext, dest: AudioNode, seconds: number, volume = 0.16): MusicHandle {
  const master = ctx.createGain();
  master.gain.value = volume;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  filter.Q.value = 0.6;
  master.connect(filter).connect(dest);

  const nodes: AudioScheduledSourceNode[] = [];
  const start = ctx.currentTime + 0.05;
  const end = start + seconds;
  let t = start;
  let i = 0;
  while (t < end) {
    const chord = CHORDS[i % CHORDS.length];
    const dur = Math.min(CHORD_SECONDS, end - t);
    // pad: detuned triangles per note with slow envelope
    for (const f of chord) {
      for (const detune of [-5, 5]) {
        const osc = ctx.createOscillator();
        osc.type = "triangle";
        osc.frequency.value = f;
        osc.detune.value = detune;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.11, t + 0.5);
        g.gain.setValueAtTime(0.11, t + dur - 0.4);
        g.gain.linearRampToValueAtTime(0, t + dur);
        osc.connect(g).connect(master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
        nodes.push(osc);
      }
    }
    // arpeggio: 8 sine plucks per chord an octave up
    const step = dur / 8;
    for (let k = 0; k < 8 && t + k * step < end; k++) {
      const f = chord[[0, 2, 1, 3, 2, 0, 3, 1][k]] * 2;
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = f;
      const g = ctx.createGain();
      const at = t + k * step;
      g.gain.setValueAtTime(0, at);
      g.gain.linearRampToValueAtTime(0.09, at + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0008, at + step * 0.95);
      osc.connect(g).connect(master);
      osc.start(at);
      osc.stop(at + step);
      nodes.push(osc);
    }
    t += dur;
    i++;
  }
  // gentle fade-out at the end
  master.gain.setValueAtTime(volume, Math.max(start, end - 1.2));
  master.gain.linearRampToValueAtTime(0, end);

  return {
    stop: () => {
      for (const n of nodes) {
        try {
          n.stop();
        } catch {}
      }
      try {
        master.disconnect();
      } catch {}
    },
  };
}
