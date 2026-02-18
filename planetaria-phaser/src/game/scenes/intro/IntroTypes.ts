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
  /** Procedural deep-space background */
  STARFIELD: "intro_starfield",
  /** PLACEHOLDER: intro_void — The Void Devourer entity sprite */
  VOID_DEVOURER: "intro_void",
  /** Real asset: Mercury planet sprite (assets/ui/mercury.png) */
  MERCURY: "intro_mercury",
  /** Real asset: Venus planet sprite (assets/ui/venus.png) */
  VENUS: "intro_venus",
  /** Real asset: Earth planet sprite (assets/ui/earth.png) */
  EARTH: "intro_earth",
  /** Real asset: Mars planet sprite (assets/ui/mars.png) */
  MARS: "intro_mars",
  /** Real asset: Jupiter planet sprite (assets/ui/jupiter.png) */
  JUPITER: "intro_jupiter",
  /** Real asset: Saturn planet sprite (assets/ui/saturn.png) */
  SATURN: "intro_saturn",
  /** Real asset: Uranus planet sprite (assets/ui/uranus.png) */
  URANUS: "intro_uranus",
  /** Real asset: Neptune planet sprite (assets/ui/neptune.png) */
  NEPTUNE: "intro_neptune",
  /** PLACEHOLDER: intro_pluto — Pluto dwarf-planet sprite */
  PLUTO: "intro_pluto",
  /** Real asset: S.S. Astra spaceship (assets/ui/ss_astra.png) */
  SHIP: "intro_ship",
  /** PLACEHOLDER: intro_shockwave — Expanding shockwave ring sprite */
  SHOCKWAVE: "intro_shockwave",
  /** Procedural fire/spark particle */
  PARTICLE_FIRE: "intro_particle_fire",
  /** Procedural smoke puff particle */
  PARTICLE_SMOKE: "intro_particle_smoke",
  /** Procedural tiny star dot for parallax starfield */
  STAR_PARTICLE: "intro_star_particle",
  /** Procedural faint dust mote */
  DUST_PARTICLE: "intro_dust_particle",
} as const;

/**
 * Ordered planet texture keys from Mercury to Neptune.
 * Used by PlanetaryCoresBeat to display all 8 planets.
 */
export const PLANET_TEXTURE_KEYS: string[] = [
  INTRO_TEXTURES.MERCURY,
  INTRO_TEXTURES.VENUS,
  INTRO_TEXTURES.EARTH,
  INTRO_TEXTURES.MARS,
  INTRO_TEXTURES.JUPITER,
  INTRO_TEXTURES.SATURN,
  INTRO_TEXTURES.URANUS,
  INTRO_TEXTURES.NEPTUNE,
];

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
