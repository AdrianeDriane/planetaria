import Phaser from "phaser";
import { INTRO_TEXTURES } from "./IntroTypes";

/**
 * IntroAssets.ts
 *
 * Generates all placeholder textures for the intro cinematic.
 *
 * Each texture is tagged with a PLACEHOLDER comment indicating
 * what real asset should eventually replace it. Search for
 * "PLACEHOLDER:" to find all replacement points.
 *
 * To replace a placeholder:
 *   1. Add your real asset to the preload() of IntroScene
 *      (e.g., this.load.image("intro_ship", "assets/ship.png"))
 *   2. Remove or skip the corresponding generator call below
 *   3. The texture key in INTRO_TEXTURES stays the same
 */
export function generatePlaceholderTextures(scene: Phaser.Scene): void {
  generateStarfieldTexture(scene);
  generateVoidDevourerTexture(scene);
  generatePlanetTextures(scene);
  generateShipTexture(scene);
  generateShockwaveTexture(scene);
  generateParticleTextures(scene);
  generateStarParticleTexture(scene);
  generateDustParticleTexture(scene);
}

/* ------------------------------------------------------------------ */
/*  Individual Generators                                              */
/* ------------------------------------------------------------------ */

/**
 * PLACEHOLDER: intro_starfield
 * A static deep-space background with scattered star dots.
 * Replace with a hand-painted or tiled space background.
 */
function generateStarfieldTexture(scene: Phaser.Scene): void {
  const w = 800;
  const h = 600;
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // Dark space gradient base
  gfx.fillStyle(0x000008);
  gfx.fillRect(0, 0, w, h);

  // Subtle nebula wash
  gfx.fillStyle(0x0a0015, 0.3);
  gfx.fillRect(0, 0, w / 2, h);
  gfx.fillStyle(0x000a15, 0.2);
  gfx.fillRect(w / 2, 0, w / 2, h);

  // Static background stars (the animated ones are layered on top)
  for (let i = 0; i < 120; i++) {
    const brightness = Phaser.Math.Between(40, 120);
    const color = Phaser.Display.Color.GetColor(
      brightness,
      brightness,
      brightness + 10
    );
    gfx.fillStyle(color, Math.random() * 0.4 + 0.1);
    gfx.fillRect(Phaser.Math.Between(0, w), Phaser.Math.Between(0, h), 1, 1);
  }

  gfx.generateTexture(INTRO_TEXTURES.STARFIELD, w, h);
  gfx.destroy();
}

/**
 * PLACEHOLDER: intro_void
 * The Void Devourer — a menacing dark entity with purple glow.
 * Replace with an animated sprite sheet of the Void Devourer.
 */
function generateVoidDevourerTexture(scene: Phaser.Scene): void {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // Outer ethereal glow
  gfx.fillStyle(0x330044, 0.15);
  gfx.fillCircle(cx, cy, 98);
  gfx.fillStyle(0x440066, 0.25);
  gfx.fillCircle(cx, cy, 80);
  // Mid-layer
  gfx.fillStyle(0x220033, 0.5);
  gfx.fillCircle(cx, cy, 60);
  // Inner dark mass
  gfx.fillStyle(0x110022, 0.8);
  gfx.fillCircle(cx, cy, 42);
  // Void core — pure black
  gfx.fillStyle(0x000000, 1);
  gfx.fillCircle(cx, cy, 25);
  // Sinister "eye" highlight
  gfx.fillStyle(0x8800aa, 0.3);
  gfx.fillCircle(cx - 8, cy - 8, 6);

  gfx.generateTexture(INTRO_TEXTURES.VOID_DEVOURER, size, size);
  gfx.destroy();
}

/**
 * Generates placeholder planet textures with basic shading.
 *
 * PLACEHOLDER: intro_mercury — Grey cratered planet
 * PLACEHOLDER: intro_neptune — Blue gas giant
 * PLACEHOLDER: intro_pluto — Small brownish dwarf planet
 * PLACEHOLDER: intro_planet_large — Generic large planet
 */
function generatePlanetTextures(scene: Phaser.Scene): void {
  createSinglePlanetTexture(scene, INTRO_TEXTURES.MERCURY, 30, 0xaaaaaa);
  createSinglePlanetTexture(scene, INTRO_TEXTURES.NEPTUNE, 45, 0x3344bb);
  createSinglePlanetTexture(scene, INTRO_TEXTURES.PLUTO, 18, 0x997766);
  createSinglePlanetTexture(scene, INTRO_TEXTURES.PLANET_LARGE, 60, 0x4488cc);
}

/** Helper: draws a circle planet with a specular highlight. */
function createSinglePlanetTexture(
  scene: Phaser.Scene,
  key: string,
  radius: number,
  color: number
): void {
  const padding = 4;
  const size = radius * 2 + padding;
  const cx = size / 2;
  const cy = size / 2;
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // Base sphere
  gfx.fillStyle(color, 1);
  gfx.fillCircle(cx, cy, radius);

  // Specular highlight (upper-left)
  const lighter = Phaser.Display.Color.IntegerToColor(color);
  lighter.lighten(35);
  gfx.fillStyle(lighter.color, 0.4);
  gfx.fillCircle(cx - radius * 0.25, cy - radius * 0.25, radius * 0.45);

  // Shadow crescent (lower-right)
  const darker = Phaser.Display.Color.IntegerToColor(color);
  darker.darken(30);
  gfx.fillStyle(darker.color, 0.3);
  gfx.fillCircle(cx + radius * 0.2, cy + radius * 0.2, radius * 0.7);

  gfx.generateTexture(key, size, size);
  gfx.destroy();
}

/**
 * PLACEHOLDER: intro_ship
 * The S.S. Astra research vessel — a small spaceship.
 * Replace with a pixel-art ship sprite (facing upward).
 */
function generateShipTexture(scene: Phaser.Scene): void {
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // Hull body
  gfx.fillStyle(0xcccccc);
  gfx.fillTriangle(40, 0, 0, 30, 80, 30); // Nose cone
  gfx.fillRect(0, 30, 80, 40); // Main hull

  // Wing struts
  gfx.fillStyle(0x888888);
  gfx.fillTriangle(0, 40, -20, 70, 0, 70); // Left wing
  gfx.fillTriangle(80, 40, 100, 70, 80, 70); // Right wing

  // Cockpit window
  gfx.fillStyle(0x44aaff, 0.6);
  gfx.fillTriangle(40, 8, 30, 25, 50, 25);

  // Engine glow
  gfx.fillStyle(0x44aaff);
  gfx.fillRect(15, 70, 15, 8);
  gfx.fillRect(50, 70, 15, 8);

  // Engine exhaust hint
  gfx.fillStyle(0x2266aa, 0.5);
  gfx.fillRect(18, 78, 9, 4);
  gfx.fillRect(53, 78, 9, 4);

  gfx.generateTexture(INTRO_TEXTURES.SHIP, 100, 84);
  gfx.destroy();
}

/**
 * PLACEHOLDER: intro_shockwave
 * An expanding energy ring from the Void Devourer's pulse.
 * Replace with an animated shockwave sprite or shader effect.
 */
function generateShockwaveTexture(scene: Phaser.Scene): void {
  const size = 200;
  const cx = size / 2;
  const cy = size / 2;
  const gfx = scene.make.graphics({ x: 0, y: 0 });

  // Outer faint ring
  gfx.lineStyle(1, 0xcc33cc, 0.2);
  gfx.strokeCircle(cx, cy, 98);

  // Main energy ring
  gfx.lineStyle(3, 0xff44ff, 0.8);
  gfx.strokeCircle(cx, cy, 90);

  // Inner glow ring
  gfx.lineStyle(2, 0xff88ff, 0.4);
  gfx.strokeCircle(cx, cy, 85);

  // Core wash
  gfx.lineStyle(1, 0xffaaff, 0.15);
  gfx.strokeCircle(cx, cy, 80);

  gfx.generateTexture(INTRO_TEXTURES.SHOCKWAVE, size, size);
  gfx.destroy();
}

/**
 * PLACEHOLDER: intro_particle_fire — Small orange fire/spark particle
 * PLACEHOLDER: intro_particle_smoke — Small grey smoke puff particle
 *
 * Replace with tiny pixel-art particle sprites.
 */
function generateParticleTextures(scene: Phaser.Scene): void {
  // Fire particle
  const fireGfx = scene.make.graphics({ x: 0, y: 0 });
  fireGfx.fillStyle(0xff8800);
  fireGfx.fillCircle(4, 4, 4);
  fireGfx.fillStyle(0xffcc44, 0.6);
  fireGfx.fillCircle(4, 4, 2);
  fireGfx.generateTexture(INTRO_TEXTURES.PARTICLE_FIRE, 8, 8);
  fireGfx.destroy();

  // Smoke particle
  const smokeGfx = scene.make.graphics({ x: 0, y: 0 });
  smokeGfx.fillStyle(0x666666);
  smokeGfx.fillCircle(6, 6, 6);
  smokeGfx.fillStyle(0x888888, 0.4);
  smokeGfx.fillCircle(6, 5, 3);
  smokeGfx.generateTexture(INTRO_TEXTURES.PARTICLE_SMOKE, 12, 12);
  smokeGfx.destroy();
}

/**
 * PLACEHOLDER: intro_star_particle
 * A tiny white pixel used for animated parallax stars.
 * Replace with a small pixel-art star sprite if desired.
 */
function generateStarParticleTexture(scene: Phaser.Scene): void {
  const gfx = scene.make.graphics({ x: 0, y: 0 });
  gfx.fillStyle(0xffffff);
  gfx.fillRect(0, 0, 2, 2);
  gfx.generateTexture(INTRO_TEXTURES.STAR_PARTICLE, 2, 2);
  gfx.destroy();
}

/**
 * PLACEHOLDER: intro_dust_particle
 * A faint lavender mote for space dust layers.
 * Replace with a subtle 1–2px dust sprite.
 */
function generateDustParticleTexture(scene: Phaser.Scene): void {
  const gfx = scene.make.graphics({ x: 0, y: 0 });
  gfx.fillStyle(0x9688b4, 0.5);
  gfx.fillRect(0, 0, 2, 2);
  gfx.generateTexture(INTRO_TEXTURES.DUST_PARTICLE, 2, 2);
  gfx.destroy();
}
