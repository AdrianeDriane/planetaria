import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * CrashLandingBeat.ts
 *
 * Beat 5: "Crash landing on Mercury"
 *
 * Visuals:
 *   - Mercury surface (ground bar)
 *   - Ship falling at an angle, spinning and accelerating
 *   - Smoke trail behind the descending ship
 *   - Impact flash, camera shake, and debris on landing
 *   - Fire and smoke particles at crash site
 *
 * Assets used:
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
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

  // Smoke trail behind the descending ship
  const smokeTrail = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_SMOKE, {
    follow: ship,
    followOffset: { x: 5, y: -10 },
    speed: { min: 5, max: 15 },
    angle: { min: 40, max: 60 },
    scale: { start: 0.6, end: 0.1 },
    lifespan: 1200,
    frequency: 60,
    quantity: 1,
    alpha: { start: 0.5, end: 0 },
  });
  container.add(smokeTrail);

  // Descent trajectory with spin
  scene.tweens.add({
    targets: ship,
    x: width * 0.45,
    y: height * 0.43,
    angle: { from: -25, to: 15 },
    duration: 2500,
    ease: "Quad.easeIn",
    onComplete: () => {
      smokeTrail.stop();
      onCrashImpact(scene, container, ship.x, height);
    },
  });

  // Ship spins during descent
  scene.tweens.add({
    targets: ship,
    angle: "+=360",
    duration: 1800,
    ease: "Cubic.easeIn",
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
 * Creates the impact flash, camera shake, debris, and particle effects.
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
    0.8
  );
  container.add(impactFlash);

  scene.tweens.add({
    targets: impactFlash,
    alpha: 0,
    duration: 400,
    ease: "Power2",
  });

  // ── Camera shake (initial impact + aftershock) ──
  scene.cameras.main.shake(600, 0.03);
  scene.time.delayedCall(700, () => {
    scene.cameras.main.shake(300, 0.01);
  });

  // ── Smoke particles ──
  const smokeEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_SMOKE,
    {
      x: impactX,
      y: impactY,
      speed: { min: 20, max: 60 },
      angle: { min: 230, max: 310 },
      scale: { start: 1.2, end: 0.2 },
      lifespan: 1800,
      frequency: 60,
      quantity: 3,
      alpha: { start: 0.7, end: 0 },
    }
  );
  container.add(smokeEmitter);

  // ── Fire particles ──
  const fireEmitter = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_FIRE, {
    x: impactX,
    y: impactY,
    speed: { min: 30, max: 100 },
    angle: { min: 230, max: 310 },
    scale: { start: 0.8, end: 0 },
    lifespan: 900,
    frequency: 40,
    quantity: 4,
    alpha: { start: 0.9, end: 0 },
  });
  container.add(fireEmitter);

  // ── Debris sparks flying outward ──
  const debrisEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_FIRE,
    {
      x: impactX,
      y: impactY,
      speed: { min: 60, max: 180 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.4, end: 0 },
      lifespan: 600,
      frequency: -1,
      quantity: 12,
      alpha: { start: 1, end: 0 },
    }
  );
  container.add(debrisEmitter);
  debrisEmitter.explode(12);

  // Stop continuous emission after a few seconds
  scene.time.delayedCall(3000, () => {
    smokeEmitter.stop();
    fireEmitter.stop();
  });
}
