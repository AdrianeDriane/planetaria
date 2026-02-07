/**
 * config.ts
 *
 * Single source of truth for all game constants.
 */

// --- World ---
export const WORLD = {
    WIDTH: 2000,
    HEIGHT: 800,
    TILE_SIZE: 32,
} as const;

// --- Physics ---
export const PHYSICS = {
    GRAVITY: 800,
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
    SPRITE_PATH: "assets/sprite_astronaut_male_spritesheet.png",

    // Hitbox (feet-aligned)
    HITBOX_WIDTH: 20,
    HITBOX_HEIGHT: 50,

    // Animation
    IDLE_FRAME: 0,
    WALK_FRAMES: { start: 0, end: 7 },
    WALK_FRAME_RATE: 10,
} as const;

// --- Terrain ---
export const TERRAIN = {
    TEXTURE_KEY: "ground-tile",
    TILE_SIZE: 32,
    COLOR: 0x452a00,
    BORDER_COLOR: 0x1f1300,
    SURFACE_COLOR: 0x5b8a4e,
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
