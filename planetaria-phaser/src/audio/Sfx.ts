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
    hitAudio = new Audio("/assets/musicalscores/hit.mp3");
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
    correctAudio = new Audio("/musicalscores/correct.mp3");
    correctAudio.volume = 0.8;
  }

  try {
    correctAudio.currentTime = 0;
    const playPromise = correctAudio.play();
    if (playPromise && typeof playPromise.then === "function") {
      playPromise.catch(() => fallbackSynth());
    }
  } catch (_e) {
    fallbackSynth();
  }
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
    alarmAudio.pause();
    alarmAudio.currentTime = 0;
  }
  stopAlarmFallbackLoop();
}
