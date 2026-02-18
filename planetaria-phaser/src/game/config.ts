/**
 * config.ts
 *
 * Single source of truth for all game constants.
 */

// --- World ---

/**
 * config.ts
 *
 * Single source of truth for all game constants.
 */

// --- World ---
export const WORLD = {
  WIDTH: 10000,
  HEIGHT: 800,
  TILE_SIZE: 32,
} as const;

// --- Physics ---
export const PHYSICS = {
  GRAVITY: 400,
  DEBUG: false,
} as const;

// --- Player ---
export const PLAYER = {
  // Movement
  SPEED: 160,
  JUMP_VELOCITY: -350,

  // Sprite
  FRAME_WIDTH: 32,
  FRAME_HEIGHT: 52,
  TEXTURE_KEY: "player",
  SPRITE_PATH: "assets/game/sprite_2.png",

  // Hitbox (feet-aligned)
  HITBOX_WIDTH: 20,
  HITBOX_HEIGHT: 40,

  // ---------------------------------------------------------------
  // Animation Frames
  //
  // Spritesheet layout:
  //   0-7   walk cycle
  //   8     jump launch (tucking feet)
  //   9     rising / peak (arms outstretched)
  //   10    falling (past apex)
  //   11    landing (brace for impact)
  //   12    idle pose B (pairs with frame 0 for idle loop)
  // ---------------------------------------------------------------
  IDLE_FRAMES: { a: 0, b: 12 },
  IDLE_FRAME_RATE: 0.8,

  WALK_FRAMES: { start: 0, end: 7 },
  WALK_FRAME_RATE: 10,

  JUMP_LAUNCH_FRAME: 8,
  JUMP_RISE_FRAME: 9,
  FALL_FRAME: 10,
  LAND_FRAME: 11,

  // Duration in ms for brief transitional frames
  LAUNCH_DURATION: 100,
  LAND_DURATION: 150,
} as const;

// --- Camera ---
export const CAMERA = {
  LERP: 0.09,
  DEADZONE_X: 8,
  DEADZONE_Y: 8,
} as const;

// --- Display ---
export const DISPLAY = {
  WIDTH: 640,
  HEIGHT: 360,
  BG_COLOR: "#1a1a2e",
} as const;

// --- Terrain ---
export const TERRAIN = {
  TEXTURE_KEY: "ground-tile",
  TILE_SIZE: 32,
  COLOR: 0x3a3028,
  BORDER_COLOR: 0x1e1a14,
  SURFACE_COLOR: 0x6a5a48,
} as const;
