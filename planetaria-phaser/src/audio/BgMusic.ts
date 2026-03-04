/**
 * Dynamic Audio Orchestrator (Adaptive Intensity)
 * Manages multi-layered planetary scores with real-time filters and intensity scaling.
 */

export type AudioSituation =
  | "ambient"
  | "tension"
  | "climax"
  | "action"
  | "hazard"
  | "critical"
  | "stinger"
  | "phase1"
  | "phase2"
  | "victory"
  | "restored";

interface TrackLayer {
  audio: HTMLAudioElement;
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
  situation: AudioSituation;
}

export const DEFAULT_VOLUME = 0.8;
const FADE_DURATION = 1.5; // Seconds

let audioContext: AudioContext | null = null;
let currentPlanet: string = "";
let currentSituation: AudioSituation | null = null;
let currentRequestedSituation: AudioSituation = "ambient";
let layers: Map<AudioSituation, TrackLayer> = new Map();
let userMuted = false;
let globalVolume = DEFAULT_VOLUME;
let masterGainNode: GainNode | null = null;
let masterDistortionNode: WaveShaperNode | null = null;
let activeStinger: HTMLAudioElement | null = null;
let activeStingerCleanup: (() => void) | null = null;

interface SituationProfile {
  intensity: number;
  tempo: number;
  drive: number;
}

const SITUATION_PROFILES: Record<AudioSituation, SituationProfile> = {
  ambient: { intensity: 0.35, tempo: 1, drive: 0 },
  tension: { intensity: 0.5, tempo: 1.02, drive: 8 },
  action: { intensity: 0.62, tempo: 1.04, drive: 16 },
  climax: { intensity: 0.75, tempo: 1.07, drive: 24 },
  hazard: { intensity: 0.8, tempo: 1.08, drive: 32 },
  critical: { intensity: 0.88, tempo: 1.1, drive: 42 },
  phase1: { intensity: 0.6, tempo: 1.03, drive: 12 },
  phase2: { intensity: 0.82, tempo: 1.08, drive: 30 },
  victory: { intensity: 1.0, tempo: 1, drive: 0 },
  restored: { intensity: 0.6, tempo: 1, drive: 0 },
  stinger: { intensity: 0.7, tempo: 1, drive: 0 },
};

function getStingerMaxDurationMs(planet: string): number {
  const STINGER_DURATIONS: Record<string, number> = {
    mercury: 900, // Quick stinger
    venus: 1400, // Rich stinger
    earth: 1400, // Standard
    mars: 1400, // Cinematic
    jupiter: 1400, // Fanfare
    saturn: 900, // Swift
    uranus: 1400, // Cosmic
    neptune: 1400, // Deep space
    boss: 1800, // Epic
  };

  return STINGER_DURATIONS[planet] || 1400;
}

function normalizeStingerPlanet(input: string): string {
  const planet = input.trim().toLowerCase();
  const valid = new Set([
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
    "boss",
  ]);
  return valid.has(planet) ? planet : currentPlanet;
}

function resolveStingerSource(planet: string): string {
  const available: Record<string, string> = {
    mercury: "/musicalscores/mercury_stinger.mp3",
    earth: "/musicalscores/earth_stinger.mp3",
    jupiter: "/musicalscores/jupiter_stinger.mp3",
    saturn: "/musicalscores/saturn_stinger.mp3",
  };
  // Fallback keeps cue behavior consistent even when a planet-specific file is absent.
  return available[planet] ?? "/musicalscores/goodjob.mp3";
}

/**
 * Natural Fade-Out Utility
 * Fades a gain node from current value to zero over time with an organic curve.
 */
function scheduleNaturalFadeOut(
  gainNode: GainNode,
  startTime: number,
  duration: number
): void {
  gainNode.gain.cancelScheduledValues(startTime);
  gainNode.gain.setValueAtTime(gainNode.gain.value, startTime);
  // Human-like pace: quick initial drop, then long tail
  gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
}

function createDistortionCurve(amount: number): Float32Array {
  const k = Math.max(0, amount);
  const n = 44100;
  const curve = new Float32Array(n);
  const deg = Math.PI / 180;
  for (let i = 0; i < n; i++) {
    const x = (i * 2) / n - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

function ensureMasterChain(ctx: AudioContext): void {
  if (masterGainNode && masterDistortionNode) return;

  masterGainNode = ctx.createGain();
  masterGainNode.gain.value = globalVolume;
  masterDistortionNode = ctx.createWaveShaper();
  masterDistortionNode.curve = createDistortionCurve(0);
  masterDistortionNode.oversample = "4x";

  masterDistortionNode.connect(masterGainNode);
  masterGainNode.connect(ctx.destination);
}

/** Initialize the AudioContext on first user interaction */
export function initDynamicAudio(): void {
  const setupContext = () => {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    document.removeEventListener("pointerdown", setupContext);
    document.removeEventListener("keydown", setupContext);
  };

  document.addEventListener("pointerdown", setupContext, { once: true });
  document.addEventListener("keydown", setupContext, { once: true });
}

function getContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (
      window.AudioContext || (window as any).webkitAudioContext
    )();
  }
  ensureMasterChain(audioContext);
  return audioContext;
}

/**
 * Sets the intensity of a specific situation (e.g. pressure/stability).
 * Scales volume and filter frequency dynamically.
 */
export function setSituationIntensity(
  situation: AudioSituation,
  intensity: number
): void {
  const layer = layers.get(situation);
  if (!layer) return;

  const ctx = getContext();
  const now = ctx.currentTime;
  const clamped = Math.max(0, Math.min(1, intensity));

  // Intensity affects both volume and filter brightness
  // 0 = Muffled (500Hz), 1 = Full Brightness (20000Hz)
  const freq = 500 + clamped * 19500;
  layer.filterNode.frequency.setTargetAtTime(freq, now, 0.2);

  // If this is the active situation, it should also scale the volume
  if (situation === currentSituation) {
    const vol = userMuted ? 0 : globalVolume * (0.5 + clamped * 0.5);
    layer.gainNode.gain.setTargetAtTime(vol, now, 0.2);
  }
}

/** Sets global background music volume (0.0 - 1.0). */
export function setBgMusicVolume(volume: number): void {
  globalVolume = Math.max(0, Math.min(1, volume));
  applySituationProfile(currentRequestedSituation, false);
}

/** Preloads and starts all layers for a planet (initially at volume 0) */
export function setPlanetAudio(planet: string): void {
  if (currentPlanet === planet) return;

  if (activeStingerCleanup) {
    activeStingerCleanup();
  }

  const outgoingLayers = Array.from(layers.values());
  const ctx = getContext();
  const fadeOutNow = ctx.currentTime;
  outgoingLayers.forEach((layer) => {
    layer.gainNode.gain.cancelScheduledValues(fadeOutNow);
    layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, fadeOutNow);
    layer.gainNode.gain.setTargetAtTime(0, fadeOutNow, 0.65);
  });
  if (outgoingLayers.length > 0) {
    window.setTimeout(() => {
      outgoingLayers.forEach((layer) => {
        layer.audio.pause();
        layer.audio.src = "";
        layer.audio.remove();
      });
    }, 1300);
  }
  layers.clear();
  currentSituation = null;

  currentPlanet = planet;

  const createLayer = (
    situation: AudioSituation,
    src: string,
    startTime: number = 0,
    loop: boolean = true
  ) => {
    const audio = new Audio(src);
    audio.loop = loop;
    audio.crossOrigin = "anonymous";

    audio.addEventListener("loadedmetadata", () => {
      if (startTime > 0) audio.currentTime = startTime;
    });

    const source = ctx.createMediaElementSource(audio);
    const gainNode = ctx.createGain();
    const filterNode = ctx.createBiquadFilter();

    filterNode.type = "lowpass";
    filterNode.frequency.value = 20000; // Start fully open

    gainNode.gain.value = 0;

    source.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(masterDistortionNode!);

    layers.set(situation, { audio, gainNode, filterNode, situation });
    audio.play().catch((e) => console.warn(`Autoplay blocked for ${src}:`, e));
  };

  const base = `/musicalscores`;

  // Choose the victory track: cinematic for Mars/Boss, 8-bit for others
  const victorySrc =
    planet === "mars" || planet === "boss"
      ? `${base}/boss_victory.mp3`
      : `${base}/victory.mp3`;

  createLayer("victory", victorySrc, 0, false);

  switch (planet) {
    case "mercury":
      createLayer("ambient", `${base}/mercury_ambient.mp3`, 0);
      break;
    case "venus":
      createLayer("ambient", `${base}/venus_ambient.mp3`, 0);
      createLayer("hazard", `${base}/venus_hazard.mp3`, 75); // 1:15
      break;
    case "earth":
      createLayer("ambient", `${base}/earth_ambient.mp3`, 0);
      break;
    case "mars":
      // Cinematic Mars Overhaul: Using marsbg.mp3 for ambient
      createLayer("ambient", `${base}/marsbg.mp3`, 0);
      createLayer("action", `${base}/mars_action.mp3`, 0);
      break;
    case "jupiter":
      createLayer("ambient", `${base}/jupiter_ambient.mp3`, 0);
      break;
    case "saturn":
      createLayer("ambient", `${base}/saturn_ambient.mp3`, 0);
      break;
    case "uranus":
      createLayer("ambient", `${base}/uranus_ambient.mp3`, 0);
      createLayer("hazard", `${base}/uranus_hazard.mp3`, 45); // 0:45
      break;
    case "neptune":
      createLayer("action", `${base}/neptune_action.mp3`, 15); // 0:15
      createLayer("hazard", `${base}/neptune_hazard.mp3`, 0);
      break;
    case "boss":
      createLayer("phase1", `${base}/boss_phase1.mp3`, 30); // 0:30
      createLayer("phase2", `${base}/boss_phase2.mp3`, 70); // 1:10
      break;
    case "menu":
      createLayer("ambient", `${base}/mainbgmusic.mp3`, 0);
      break;
  }

  const defaultLayer =
    planet === "neptune" ? "action" : planet === "boss" ? "phase1" : "ambient";
  transitionTo(defaultLayer as AudioSituation);
}

/** Smoothly cross-fades or hard-cuts between situations */
export function transitionTo(
  targetSituation: AudioSituation,
  immediate: boolean = false
): void {
  currentRequestedSituation = targetSituation;
  const resolvedSituation = resolveSituation(targetSituation);
  if (!resolvedSituation) return;
  currentSituation = resolvedSituation;
  const ctx = getContext();
  const now = ctx.currentTime;

  const duration = immediate
    ? 0.015
    : targetSituation === "victory" || targetSituation === "restored"
      ? FADE_DURATION * 1.5 // Slower, more cinematic fade-in for victory
      : FADE_DURATION / 4;

  layers.forEach((layer, sit) => {
    const isTarget = sit === resolvedSituation;
    const targetGain = isTarget ? (userMuted ? 0 : globalVolume) : 0;

    layer.gainNode.gain.cancelScheduledValues(now);
    layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, now);

    if (isTarget) {
      layer.gainNode.gain.linearRampToValueAtTime(targetGain, now + duration);

      // Special: If victory, schedule a long natural fade-out after the initial fanfare
      if (targetSituation === "victory") {
        // Schedule fade-out to start after 6 seconds (most victory tracks are 6-10s)
        const fadeStart = now + 7;
        const fadeDuration = 5; // Long, organic fade
        scheduleNaturalFadeOut(layer.gainNode, fadeStart, fadeDuration);
      }
    } else {
      layer.gainNode.gain.setTargetAtTime(0, now, duration / 2);
    }

    // Reset filters on transition to avoid muffled starts
    if (isTarget) {
      layer.filterNode.frequency.setTargetAtTime(20000, now, 0.5);
    }
  });

  applySituationProfile(targetSituation, immediate);
}

function resolveSituation(
  targetSituation: AudioSituation
): AudioSituation | null {
  if (layers.has(targetSituation)) return targetSituation;

  const fallbacks: Record<AudioSituation, AudioSituation[]> = {
    ambient: ["ambient", "action", "phase1"],
    tension: ["action", "hazard", "ambient", "phase1"],
    climax: ["action", "phase2", "hazard", "phase1", "ambient"],
    action: ["action", "ambient", "phase1"],
    hazard: ["hazard", "action", "ambient", "phase2"],
    critical: ["hazard", "action", "phase2", "ambient"],
    phase1: ["phase1", "action", "ambient"],
    phase2: ["phase2", "action", "hazard", "phase1"],
    victory: ["victory", "ambient", "action", "phase2"],
    restored: ["victory", "ambient", "action"],
    stinger: ["ambient", "action", "hazard", "phase1"],
  };

  for (const candidate of fallbacks[targetSituation]) {
    if (layers.has(candidate)) return candidate;
  }
  return null;
}

function applySituationProfile(
  targetSituation: AudioSituation,
  immediate: boolean
): void {
  const ctx = getContext();
  const now = ctx.currentTime;
  const profile =
    SITUATION_PROFILES[targetSituation] ?? SITUATION_PROFILES.ambient;
  const ramp = immediate ? 0.01 : 0.2;
  const isMars = currentPlanet === "mars";
  const tempo = isMars ? Math.min(profile.tempo, 1.05) : profile.tempo;
  const drive = isMars ? Math.min(profile.drive, 16) : profile.drive;

  if (masterDistortionNode) {
    masterDistortionNode.curve = createDistortionCurve(drive);
  }
  if (masterGainNode) {
    const targetVolume = userMuted
      ? 0
      : globalVolume * (0.85 + profile.intensity * 0.15);
    masterGainNode.gain.setTargetAtTime(targetVolume, now, ramp);
  }

  layers.forEach((layer) => {
    layer.audio.playbackRate = tempo;
  });
}

/** Plays a one-shot stinger and ducks the background music */
export function playStinger(situation: AudioSituation | string): void {
  const ctx = getContext();
  const stingerPlanet = normalizeStingerPlanet(String(situation || currentPlanet));
  const src = resolveStingerSource(stingerPlanet);
  const maxDurationMs = getStingerMaxDurationMs(stingerPlanet);
  const fadeMs = Math.min(600, Math.max(260, Math.floor(maxDurationMs * 0.4)));

  activeStingerCleanup?.();
  activeStingerCleanup = null;

  const audio = new Audio(src);
  activeStinger = audio;
  audio.crossOrigin = "anonymous";
  const source = ctx.createMediaElementSource(audio);
  const gainNode = ctx.createGain();

  gainNode.gain.value = userMuted ? 0 : globalVolume * 0.9;
  source.connect(gainNode);
  gainNode.connect(ctx.destination);

  const now = ctx.currentTime;
  layers.forEach((layer) => {
    if (layer.gainNode.gain.value > 0) {
      layer.gainNode.gain.setTargetAtTime(
        layer.gainNode.gain.value * 0.3,
        now,
        0.2
      );
    }
  });

  let cleanedUp = false;
  const cleanup = () => {
    if (cleanedUp) return;
    cleanedUp = true;
    audio.pause();
    audio.currentTime = 0;
    layers.forEach((layer) => {
      if (layer.situation === currentSituation) {
        layer.gainNode.gain.setTargetAtTime(
          userMuted ? 0 : globalVolume,
          ctx.currentTime,
          0.5
        );
      }
    });
    audio.remove();
    if (activeStinger === audio) {
      activeStinger = null;
      activeStingerCleanup = null;
    }
  };

  const fadeTimer = window.setTimeout(() => {
    if (activeStinger !== audio) return;
    scheduleNaturalFadeOut(gainNode, ctx.currentTime, fadeMs / 1000);
  }, Math.max(0, maxDurationMs - fadeMs));

  const cleanupTimer = window.setTimeout(() => {
    if (activeStinger !== audio) return;
    cleanup();
  }, maxDurationMs + 30);

  audio.onended = () => {
    if (activeStinger !== audio) return;
    scheduleNaturalFadeOut(gainNode, ctx.currentTime, 0.25);
    window.setTimeout(cleanup, 260);
  };

  activeStingerCleanup = () => {
    window.clearTimeout(fadeTimer);
    window.clearTimeout(cleanupTimer);
    cleanup();
  };

  audio.play().catch(() => {
    // Fallback uses generic success cue timing.
    scheduleNaturalFadeOut(gainNode, ctx.currentTime, 0.35);
    window.setTimeout(cleanup, 360);
  });
}

export function toggleMute(): boolean {
  userMuted = !userMuted;
  applySituationProfile(currentRequestedSituation, userMuted);

  return userMuted;
}

export function isMuted(): boolean {
  return userMuted;
}

export function setMuted(value: boolean): void {
  userMuted = value;
  applySituationProfile(currentRequestedSituation, userMuted);
}
