import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * SSAstraBeat.ts
 *
 * Beat 3: "S.S. Astra — Training Mission near Mercury"
 *
 * Visuals:
 *   - Mercury planet on the left
 *   - S.S. Astra ship gently bobbing nearby
 *   - Engine exhaust particles
 *   - Calm, routine atmosphere
 *
 * Assets used:
 *   PLACEHOLDER: intro_mercury — Mercury planet sprite
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
 *   PLACEHOLDER: intro_particle_fire — Engine exhaust particle
 */
export function buildSSAstraVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Mercury ──
  // PLACEHOLDER: intro_mercury — Replace with Mercury sprite
  const mercury = scene.add
    .image(width * 0.3, height * 0.32, INTRO_TEXTURES.MERCURY)
    .setScale(2);
  container.add(mercury);

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

  // Gentle bobbing motion
  scene.tweens.add({
    targets: ship,
    y: ship.y + 8,
    duration: 2000,
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
  // PLACEHOLDER: intro_particle_fire — Replace with exhaust particle sprite
  const engineEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_FIRE,
    {
      x: ship.x - 5,
      y: ship.y + 45,
      speed: { min: 10, max: 30 },
      angle: { min: 80, max: 100 },
      scale: { start: 0.5, end: 0 },
      lifespan: 600,
      frequency: 120,
      quantity: 1,
      alpha: { start: 0.6, end: 0 },
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
