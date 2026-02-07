/**
 * config.ts
 *
 * Single source of truth for all game constants.
 * Import from here instead of scattering magic numbers.
 */

// --- World ---
export const WORLD = {
    WIDTH: 2000,
    HEIGHT: 2000,
    TILE_SIZE: 32,
} as const;

// --- Player ---
export const PLAYER = {
    SPEED: 150,
    FRAME_WIDTH: 32,
    FRAME_HEIGHT: 52,
    HITBOX_WIDTH: 32,
    HITBOX_HEIGHT: 32,
    IDLE_FRAME: 0,
    WALK_FRAMES: { start: 0, end: 7 },
    WALK_FRAME_RATE: 10,
    TEXTURE_KEY: "player",
    SPRITE_PATH: "assets/sprite_astronaut_male_spritesheet.png",
} as const;

// --- Camera ---
export const CAMERA = {
    LERP: 0.09,
    DEADZONE_X: 4,
    DEADZONE_Y: 4,
} as const;

// --- Display ---
export const DISPLAY = {
    WIDTH: 640,
    HEIGHT: 360,
    BG_COLOR: "#0f0f1a",
} as const;
