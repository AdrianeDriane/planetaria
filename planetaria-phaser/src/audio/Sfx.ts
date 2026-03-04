/**
 * Lightweight sound effects helper for UI taps/clicks.
 * Uses Web Audio to synthesize a short click without needing an asset file.
 */

const AudioContextClass =
  typeof window !== "undefined"
    ? (window.AudioContext || (window as any).webkitAudioContext)
    : null;

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (!AudioContextClass) return null;
  if (!ctx) ctx = new AudioContextClass();
  if (ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

/** Play a short UI click. */
export function playClickSfx(): void {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = "square";
  osc.frequency.setValueAtTime(880, now);

  gain.gain.setValueAtTime(0.08, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

  osc.connect(gain).connect(ac.destination);
  osc.start(now);
  osc.stop(now + 0.1);
}

// Cached HTMLAudioElement for hit sound (uses asset file if present)
let hitAudio: HTMLAudioElement | null = null;
let correctAudio: HTMLAudioElement | null = null;
let wrongAudio: HTMLAudioElement | null = null;
let celebrationAudio: HTMLAudioElement | null = null;
const activePlaybackTokens = new WeakMap<HTMLAudioElement, number>();
const activeFadeRafIds = new WeakMap<HTMLAudioElement, number>();

interface SegmentPlaybackOptions {
  startTime: number;
  endTime: number;
  baseVolume: number;
  fadeOutMs: number;
}

function clearActiveFade(audio: HTMLAudioElement): void {
  const rafId = activeFadeRafIds.get(audio);
  if (rafId !== undefined) {
    window.cancelAnimationFrame(rafId);
    activeFadeRafIds.delete(audio);
  }
}

function fadeOutAudioElement(
  audio: HTMLAudioElement,
  fromVolume: number,
  durationMs: number,
  token: number,
  onDone?: () => void
): void {
  clearActiveFade(audio);

  const start = performance.now();
  const tick = (now: number) => {
    if (activePlaybackTokens.get(audio) !== token) return;
    const elapsed = now - start;
    const progress = Math.min(1, elapsed / durationMs);
    const eased = 1 - Math.pow(progress, 2);
    audio.volume = Math.max(0, fromVolume * eased);
    if (progress < 1) {
      const rafId = window.requestAnimationFrame(tick);
      activeFadeRafIds.set(audio, rafId);
      return;
    }
    activeFadeRafIds.delete(audio);
    onDone?.();
  };

  const rafId = window.requestAnimationFrame(tick);
  activeFadeRafIds.set(audio, rafId);
}

function playAudioSegmentWithFade(
  audio: HTMLAudioElement,
  fallback: () => void,
  options: SegmentPlaybackOptions
): void {
  const segmentMs = Math.max(0, (options.endTime - options.startTime) * 1000);
  if (segmentMs < 60) {
    fallback();
    return;
  }

  const fadeOutMs = Math.min(options.fadeOutMs, Math.max(80, segmentMs - 40));
  const fadeStartMs = Math.max(0, segmentMs - fadeOutMs);
  const token = (activePlaybackTokens.get(audio) ?? 0) + 1;
  activePlaybackTokens.set(audio, token);
  clearActiveFade(audio);

  const onPlaySuccess = () => {
    window.setTimeout(() => {
      if (activePlaybackTokens.get(audio) !== token || audio.paused) return;
      fadeOutAudioElement(audio, options.baseVolume, fadeOutMs, token, () => {
        if (activePlaybackTokens.get(audio) !== token) return;
        audio.pause();
        audio.volume = options.baseVolume;
      });
    }, fadeStartMs);
  };

  try {
    audio.pause();
    audio.currentTime = options.startTime;
    audio.volume = options.baseVolume;
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.then(onPlaySuccess).catch(() => fallback());
    } else {
      onPlaySuccess();
    }
  } catch (_e) {
    fallback();
  }
}

/** Play hit sound from /assets/hit.mp3, with a synth fallback if missing/blocked. */
export function playHitSfx(): void {
  const ac = getCtx();

  const fallbackSynth = () => {
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.15);
  };

  if (!hitAudio) {
    hitAudio = new Audio("/musicalscores/hit.mp3");
    hitAudio.volume = 0.6;
  }

  try {
    hitAudio.currentTime = 0;
    const playPromise = hitAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => fallbackSynth());
    }
  } catch (_e) {
    fallbackSynth();
  }
}

/** Play correct sound from /musicalscores/correct.mp3, with a soft synth fallback. */
export function playCorrectSfx(): void {
  const ac = getCtx();

  const fallbackSynth = () => {
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1046.5, now); // C6
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.4);
  };

  if (!correctAudio) {
    correctAudio = new Audio("/musicalscores/goodjob.mp3");
  }

  // Use the strongest cue slice to avoid dragging tail/silence.
  playAudioSegmentWithFade(correctAudio, fallbackSynth, {
    startTime: 0.12,
    endTime: 1.28,
    baseVolume: 0.8,
    fadeOutMs: 280,
  });
}

/** Play wrong-answer cue from /musicalscores/error.mp3, with a short buzzer fallback. */
export function playWrongSfx(): void {
  const ac = getCtx();

  const fallbackSynth = () => {
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(240, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + 0.24);
  };

  if (!wrongAudio) {
    wrongAudio = new Audio("/musicalscores/error.mp3");
  }

  // Keep the initial buzzer impact only.
  playAudioSegmentWithFade(wrongAudio, fallbackSynth, {
    startTime: 0.04,
    endTime: 0.82,
    baseVolume: 0.65,
    fadeOutMs: 220,
  });
}

/** Play a short celebration cue at planet completion. */
export function playCelebrationSfx(): void {
  const ac = getCtx();

  const fallbackSynth = () => {
    if (!ac) return;
    const now = ac.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
    notes.forEach((freq, i) => {
      const t = now + i * 0.08;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
      osc.connect(gain).connect(ac.destination);
      osc.start(t);
      osc.stop(t + 0.24);
    });
  };

  if (!celebrationAudio) {
    celebrationAudio = new Audio("/musicalscores/goodjob.mp3");
  }

  // Celebration gets a longer excerpt but still avoids full-track overhang.
  playAudioSegmentWithFade(celebrationAudio, fallbackSynth, {
    startTime: 0.08,
    endTime: 2.95,
    baseVolume: 0.9,
    fadeOutMs: 520,
  });
}

/** 
 * Cinematic celebration stinger with rising harmonic sweeps and sparkles.
 * Designed to layer with the main victory background music.
 * @param planet Optional planet name to vary the stinger's character.
 */
export function playCelebrationStinger(planet?: string): void {
  const ac = getCtx();
  if (!ac) return;

  const now = ac.currentTime;

  // 1. Rising Harmonic Sweep (Glissando)
  const sweepOsc = ac.createOscillator();
  const sweepGain = ac.createGain();
  
  // Vary character based on planet
  if (planet === "mars") {
    sweepOsc.type = "sawtooth"; // Grittier for Mars
  } else if (planet === "venus" || planet === "neptune") {
    sweepOsc.type = "sine"; // Smoother for gaseous/liquid
  } else {
    sweepOsc.type = "triangle";
  }

  sweepOsc.frequency.setValueAtTime(220, now); // Low A
  sweepOsc.frequency.exponentialRampToValueAtTime(planet === "mars" ? 1320 : 1760, now + 2.5);

  sweepGain.gain.setValueAtTime(0, now);
  sweepGain.gain.linearRampToValueAtTime(planet === "mars" ? 0.08 : 0.12, now + 0.5);
  sweepGain.gain.linearRampToValueAtTime(0, now + 2.5);

  sweepOsc.connect(sweepGain).connect(ac.destination);
  sweepOsc.start(now);
  sweepOsc.stop(now + 2.6);

  // 2. Sparkling "Dust" / Glissando highlights
  const sparkleCount = planet === "jupiter" ? 18 : 12;
  for (let i = 0; i < sparkleCount; i++) {
    const timeOffset = i * (planet === "mars" ? 0.2 : 0.15);
    const sparkOsc = ac.createOscillator();
    const sparkGain = ac.createGain();
    
    sparkOsc.type = planet === "mars" ? "square" : "triangle";
    // Upward pentatonic-ish sparkles
    const scale = planet === "uranus" ? [0, 3, 5, 7, 10, 12] : [0, 2, 4, 7, 9, 12];
    const freq = 880 * Math.pow(1.059, scale[i % scale.length]);
    
    sparkOsc.frequency.setValueAtTime(freq, now + timeOffset);
    sparkGain.gain.setValueAtTime(0, now + timeOffset);
    sparkGain.gain.linearRampToValueAtTime(0.05, now + timeOffset + 0.05);
    sparkGain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + 0.4);

    sparkOsc.connect(sparkGain).connect(ac.destination);
    sparkOsc.start(now + timeOffset);
    sparkOsc.stop(now + timeOffset + 0.5);
  }

  // 3. Low-end Percussive Accent (Impact)
  const impactOsc = ac.createOscillator();
  const impactGain = ac.createGain();
  impactOsc.type = "triangle";
  impactOsc.frequency.setValueAtTime(planet === "mars" ? 60 : 80, now);
  impactOsc.frequency.exponentialRampToValueAtTime(planet === "mars" ? 30 : 40, now + 0.4);
  
  impactGain.gain.setValueAtTime(0.2, now);
  impactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);

  impactOsc.connect(impactGain).connect(ac.destination);
  impactOsc.start(now);
  impactOsc.stop(now + 0.6);
}

// Cached HTMLAudioElement for alarm sound (trap trigger in Venus).
let alarmAudio: HTMLAudioElement | null = null;
let alarmInterval: number | null = null;

const stopAlarmFallbackLoop = () => {
  if (alarmInterval !== null) {
    clearInterval(alarmInterval);
    alarmInterval = null;
  }
};

/** Begin looping alarm from /musicalscores/alarm.mp3. Falls back to a repeating synth beep if blocked. */
export function startAlarmLoopSfx(): void {
  const ac = getCtx();

  const startFallbackLoop = () => {
    if (!ac) return;
    if (alarmInterval !== null) return;
    alarmInterval = window.setInterval(() => {
      const now = ac.currentTime;
      const osc = ac.createOscillator();
      const gain = ac.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(660, now);
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      osc.connect(gain).connect(ac.destination);
      osc.start(now);
      osc.stop(now + 0.5);
    }, 500);
  };

  if (!alarmAudio) {
    alarmAudio = new Audio("/musicalscores/alarm.mp3");
    alarmAudio.volume = 0.7;
    alarmAudio.loop = true;
  }

  try {
    stopAlarmFallbackLoop();
    alarmAudio.currentTime = 0;
    const playPromise = alarmAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => startFallbackLoop());
    }
  } catch (_e) {
    startFallbackLoop();
  }
}

/** Stop the looping alarm (audio or fallback synth). */
export function stopAlarmLoopSfx(): void {
  if (alarmAudio) {
    alarmAudio.loop = false;
    const startVolume = alarmAudio.volume || 0.7;
    const token = (activePlaybackTokens.get(alarmAudio) ?? 0) + 1;
    activePlaybackTokens.set(alarmAudio, token);
    fadeOutAudioElement(alarmAudio, startVolume, 450, token, () => {
      alarmAudio?.pause();
      if (alarmAudio) {
        alarmAudio.currentTime = 0;
        alarmAudio.volume = 0.7;
      }
    });
  }
  stopAlarmFallbackLoop();
}
