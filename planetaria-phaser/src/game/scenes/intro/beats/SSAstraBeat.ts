import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * SSAstraBeat.ts
 *
 * Beat 3: "S.S. Astra — Training Mission near Mercury"
 *
 * Visuals:
 *   - Mercury planet on the left (real sprite)
 *   - S.S. Astra ship gently bobbing nearby
 *   - Engine exhaust particles
 *   - Calm, routine atmosphere
 *
 * Assets used:
 *   Mercury uses real asset (assets/ui/mercury.png)
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
 */
export function buildSSAstraVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Mercury ──
  const mercury = scene.add
    .image(width * 0.3, height * 0.32, INTRO_TEXTURES.MERCURY)
    .setScale(0.15);
  container.add(mercury);

  // Subtle slow rotation
  scene.tweens.add({
    targets: mercury,
    angle: 15,
    duration: 12000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const labelMercury = scene.add
    .text(mercury.x, mercury.y + 70, "Mercury", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#aaaaaa",
    })
    .setOrigin(0.5);
  container.add(labelMercury);

  // ── S.S. Astra ──
  // PLACEHOLDER: intro_ship — Replace with ship sprite
  const ship = scene.add
    .image(width * 0.55, height * 0.26, INTRO_TEXTURES.SHIP)
    .setScale(0.7);
  container.add(ship);

  // Gentle bobbing motion (combined x and y for more natural feel)
  scene.tweens.add({
    targets: ship,
    y: ship.y + 8,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  scene.tweens.add({
    targets: ship,
    x: ship.x + 3,
    angle: 2,
    duration: 3000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  const labelShip = scene.add
    .text(ship.x, ship.y + 55, "S.S. Astra", {
      fontFamily: "monospace",
      fontSize: "12px",
      color: "#88bbff",
    })
    .setOrigin(0.5);
  container.add(labelShip);

  // ── Engine exhaust particles ──
  const engineEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_FIRE,
    {
      x: ship.x - 5,
      y: ship.y + 45,
      speed: { min: 10, max: 40 },
      angle: { min: 75, max: 105 },
      scale: { start: 0.5, end: 0 },
      lifespan: 700,
      frequency: 80,
      quantity: 2,
      alpha: { start: 0.7, end: 0 },
    }
  );
  container.add(engineEmitter);

  // ── Title ──
  const title = scene.add
    .text(width / 2, height * 0.08, "S.S. ASTRA — TRAINING MISSION", {
      fontFamily: "monospace",
      fontSize: "18px",
      color: "#88ccff",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(title);
}
