/**
 * Singleton background music manager.
 * Plays background tracks in a loop across the entire app.
 *
 * Strategy: start muted immediately (browsers allow muted autoplay),
 * then unmute on the very first user interaction so it's audible from
 * the title screen without waiting for a click.
 */

const DEFAULT_TRACK = "/musicalscores/mainbgmusic.mp3";
const DEFAULT_VOLUME = 0.4;

let audio: HTMLAudioElement | null = null;
let currentSrc = DEFAULT_TRACK;
let userMuted = false; // tracks the user's explicit mute preference

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio(currentSrc);
    audio.loop = true;
    audio.volume = DEFAULT_VOLUME;
  }
  return audio;
}

function setTrack(src: string): HTMLAudioElement {
  currentSrc = src;
  const a = getAudio();
  if (!a.src.endsWith(src)) {
    const wasPlaying = !a.paused;
    a.pause();
    a.src = src;
    a.loop = true;
    if (wasPlaying) {
      a.play().catch(() => {});
    }
  }
  return a;
}

/**
 * Call once on app init. Starts music muted immediately, then unmutes
 * on the first pointer/touch/key event.
 */
export function initBgMusic(): void {
  const a = setTrack(DEFAULT_TRACK);
  a.muted = true;  // muted autoplay is allowed by all browsers
  a.play().catch(() => {/* silently ignore if even muted play fails */});

  const unmute = () => {
    if (!userMuted) {
      a.muted = false;
    }
    document.removeEventListener("pointerdown", unmute, true);
    document.removeEventListener("touchstart",  unmute, true);
    document.removeEventListener("keydown",      unmute, true);
  };

  document.addEventListener("pointerdown", unmute, { once: true, capture: true });
  document.addEventListener("touchstart",  unmute, { once: true, capture: true });
  document.addEventListener("keydown",      unmute, { once: true, capture: true });
}

/** Ensure music is playing (safe to call multiple times). */
export function playBgMusic(src: string = currentSrc): void {
  const a = setTrack(src);
  if (a.paused) {
    a.muted = userMuted;
    a.play().catch(() => {});
  }
}

/** Set track (and play it if already playing) without changing mute preference. */
export function setBgMusicTrack(src: string): void {
  const a = setTrack(src);
  if (!a.paused) {
    a.muted = userMuted;
    a.play().catch(() => {});
  }
}

/** Toggle mute and return the new muted state. */
export function toggleMute(): boolean {
  userMuted = !userMuted;
  getAudio().muted = userMuted;
  return userMuted;
}

/** Get current muted state. */
export function isMuted(): boolean {
  return userMuted;
}

/** Set muted state explicitly. */
export function setMuted(value: boolean): void {
  userMuted = value;
  getAudio().muted = value;
}

export function getCurrentTrack(): string {
  return currentSrc;
}

export function setBgMusicLoop(loop: boolean): void {
  getAudio().loop = loop;
}

/** Set background music volume (0.0 - 1.0). */
export function setBgMusicVolume(volume: number): void {
  const clamped = Math.max(0, Math.min(1, volume));
  getAudio().volume = clamped;
}

export { DEFAULT_TRACK, DEFAULT_VOLUME };
