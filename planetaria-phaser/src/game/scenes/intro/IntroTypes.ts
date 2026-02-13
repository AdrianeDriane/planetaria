/**
 * IntroTypes.ts
 *
 * Shared types and constants used across the intro cinematic system.
 */

/* ------------------------------------------------------------------ */
/*  Story Beat Definition                                              */
/* ------------------------------------------------------------------ */

/** Identifies which visual builder to use for a story beat. */
export type BeatId =
  | "void_approach"
  | "planetary_cores"
  | "ss_astra"
  | "shockwave"
  | "crash";

/** A single narrative beat in the intro sequence. */
export interface StoryBeat {
  /** Unique identifier — maps to a visual builder. */
  id: BeatId;
  /** Narrative text displayed with typewriter effect. */
  text: string;
}

/* ------------------------------------------------------------------ */
/*  Starfield Types                                                    */
/* ------------------------------------------------------------------ */

/** A single star in the parallax starfield. */
export interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: number; // Phaser color integer
}

/** A drifting space dust particle. */
export interface SpaceDust {
  x: number;
  y: number;
  speed: number;
  alpha: number;
  driftSpeed: number;
  driftPhase: number;
}

/** A shooting star with a fading tail. */
export interface ShootingStar {
  x: number;
  y: number;
  speedX: number;
  speedY: number;
  tailLength: number;
  life: number;
  maxLife: number;
  color: number;
}

/** A faint background nebula cloud. */
export interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: number;
  alpha: number;
  driftX: number;
  driftY: number;
}

/* ------------------------------------------------------------------ */
/*  Texture Keys                                                       */
/* ------------------------------------------------------------------ */

/**
 * Central registry of all texture keys used in the intro.
 * When replacing placeholders with real assets, update the
 * corresponding key usage here.
 */
export const INTRO_TEXTURES = {
  /** PLACEHOLDER: intro_starfield — Deep-space background tile */
  STARFIELD: "intro_starfield",
  /** PLACEHOLDER: intro_void — The Void Devourer entity sprite */
  VOID_DEVOURER: "intro_void",
  /** PLACEHOLDER: intro_mercury — Mercury planet sprite */
  MERCURY: "intro_mercury",
  /** PLACEHOLDER: intro_neptune — Neptune planet sprite */
  NEPTUNE: "intro_neptune",
  /** PLACEHOLDER: intro_pluto — Pluto dwarf-planet sprite */
  PLUTO: "intro_pluto",
  /** PLACEHOLDER: intro_planet_large — Generic large planet sprite */
  PLANET_LARGE: "intro_planet_large",
  /** PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite */
  SHIP: "intro_ship",
  /** PLACEHOLDER: intro_shockwave — Expanding shockwave ring */
  SHOCKWAVE: "intro_shockwave",
  /** PLACEHOLDER: intro_particle_fire — Orange fire/explosion particle */
  PARTICLE_FIRE: "intro_particle_fire",
  /** PLACEHOLDER: intro_particle_smoke — Grey smoke particle */
  PARTICLE_SMOKE: "intro_particle_smoke",
  /** PLACEHOLDER: intro_star_particle — Tiny white star dot for starfield */
  STAR_PARTICLE: "intro_star_particle",
  /** PLACEHOLDER: intro_dust_particle — Faint dust mote */
  DUST_PARTICLE: "intro_dust_particle",
} as const;

/* ------------------------------------------------------------------ */
/*  Color Palettes                                                     */
/* ------------------------------------------------------------------ */

/** Star color palette — subtle variations of white, blue, and warm tones. */
export const STAR_COLORS: number[] = [
  0xffffff, // Pure white
  0xc8c8ff, // Blue-white
  0xffdcb4, // Warm white
  0xb4b4ff, // Light blue
  0xffb4b4, // Light pink
  0xb4ffdc, // Light green
  0xdcc8ff, // Lavender
];

/** Planet colors for the cores display. */
export const PLANET_CORE_COLORS: number[] = [
  0xaaaaaa, // Mercury — grey
  0xddaa44, // Venus — gold
  0x44aa77, // Earth — blue-green
  0xcc4422, // Mars — red
  0xddaa66, // Jupiter — amber
  0xccbb66, // Saturn — tan
  0x66bbcc, // Uranus — cyan
  0x3344bb, // Neptune — deep blue
];

/** Planet names in order from the Sun. */
export const PLANET_NAMES: string[] = [
  "Mercury",
  "Venus",
  "Earth",
  "Mars",
  "Jupiter",
  "Saturn",
  "Uranus",
  "Neptune",
];

/* ------------------------------------------------------------------ */
/*  Layout & Timing Constants                                          */
/* ------------------------------------------------------------------ */

export const INTRO_CONFIG = {
  /** Typewriter speed in ms per character. */
  TYPEWRITER_DELAY: 30,
  /** Duration of fade transitions between beats (ms). */
  FADE_DURATION: 400,
  /** Delay before the "continue" prompt appears (ms). */
  PROMPT_DELAY: 1500,
  /** How long after typing finishes before input is accepted (ms). */
  POST_TYPE_BUFFER: 500,
  /** Starfield direction in degrees (225 = upper-left drift). */
  STARFIELD_DIRECTION: 225,
  /** Base star movement speed multiplier. */
  STARFIELD_SPEED: 0.3,
  /** Number of background stars. */
  STAR_COUNT: 180,
  /** Number of space dust particles. */
  DUST_COUNT: 50,
  /** Frames between shooting star spawns (randomized around this). */
  SHOOTING_STAR_INTERVAL: 300,
} as const;
