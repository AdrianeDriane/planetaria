import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * CrashLandingBeat.ts
 *
 * Beat 5: "Crash landing on Mercury"
 *
 * Visuals:
 *   - Mercury surface (ground bar)
 *   - Ship falling at an angle, accelerating downward
 *   - Impact flash and camera shake on landing
 *   - Fire and smoke particles at crash site
 *
 * Assets used:
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
 *   PLACEHOLDER: intro_particle_fire — Fire/spark particle
 *   PLACEHOLDER: intro_particle_smoke — Smoke puff particle
 */
export function buildCrashLandingVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Mercury surface ──
  const ground = scene.add.rectangle(
    width / 2,
    height * 0.48,
    width * 0.8,
    8,
    0x887766
  );
  container.add(ground);

  const surfaceLabel = scene.add
    .text(width / 2, height * 0.51, "— Mercury Surface —", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#776655",
    })
    .setOrigin(0.5);
  container.add(surfaceLabel);

  // ── Ship falling and crashing ──
  // PLACEHOLDER: intro_ship — Replace with ship sprite
  const ship = scene.add
    .image(width * 0.6, height * 0.05, INTRO_TEXTURES.SHIP)
    .setScale(0.6)
    .setAngle(-25);
  container.add(ship);

  // Descent trajectory
  scene.tweens.add({
    targets: ship,
    x: width * 0.45,
    y: height * 0.43,
    angle: -5,
    duration: 2500,
    ease: "Quad.easeIn",
    onComplete: () => {
      onCrashImpact(scene, container, ship.x, height);
    },
  });

  // ── Title ──
  const title = scene.add
    .text(width / 2, height * 0.08, "CRASH LANDING", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ff6633",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(title);
}

/**
 * Called when the ship reaches the ground.
 * Creates the impact flash, camera shake, and particle effects.
 */
function onCrashImpact(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  impactX: number,
  sceneHeight: number
): void {
  const { width } = scene.scale;
  const impactY = sceneHeight * 0.44;

  // ── White impact flash ──
  const impactFlash = scene.add.rectangle(
    width / 2,
    sceneHeight / 2,
    width,
    sceneHeight,
    0xffffff,
    0.6
  );
  container.add(impactFlash);

  scene.tweens.add({
    targets: impactFlash,
    alpha: 0,
    duration: 500,
  });

  // ── Camera shake ──
  scene.cameras.main.shake(500, 0.02);

  // ── Smoke particles ──
  // PLACEHOLDER: intro_particle_smoke — Replace with smoke particle sprite
  const smokeEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_SMOKE,
    {
      x: impactX,
      y: impactY,
      speed: { min: 20, max: 60 },
      angle: { min: 230, max: 310 },
      scale: { start: 1, end: 0.2 },
      lifespan: 1500,
      frequency: 80,
      quantity: 2,
      alpha: { start: 0.7, end: 0 },
    }
  );
  container.add(smokeEmitter);

  // ── Fire particles ──
  // PLACEHOLDER: intro_particle_fire — Replace with fire particle sprite
  const fireEmitter = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_FIRE, {
    x: impactX,
    y: impactY,
    speed: { min: 30, max: 80 },
    angle: { min: 240, max: 300 },
    scale: { start: 0.8, end: 0 },
    lifespan: 800,
    frequency: 60,
    quantity: 3,
    alpha: { start: 0.9, end: 0 },
  });
  container.add(fireEmitter);

  // Stop particle emission after a few seconds
  scene.time.delayedCall(3000, () => {
    smokeEmitter.stop();
    fireEmitter.stop();
  });
}
