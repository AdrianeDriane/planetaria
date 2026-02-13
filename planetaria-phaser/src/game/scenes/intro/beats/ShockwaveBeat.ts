import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * ShockwaveBeat.ts
 *
 * Beat 4: "Shockwave strikes the S.S. Astra"
 *
 * Visuals:
 *   - Ship in the centre
 *   - Multiple expanding shockwave rings sweeping from right to left
 *   - Ship shakes violently on impact with sparks
 *   - Purple flash and warning text
 *
 * Assets used:
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
 *   PLACEHOLDER: intro_shockwave — Expanding energy ring sprite
 */
export function buildShockwaveVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Ship ──
  const ship = scene.add
    .image(width * 0.5, height * 0.3, INTRO_TEXTURES.SHIP)
    .setScale(0.06);
  container.add(ship);

  // ── Primary shockwave ring ──
  // PLACEHOLDER: intro_shockwave — Replace with shockwave ring sprite
  const wave1 = scene.add
    .image(width * 0.85, height * 0.3, INTRO_TEXTURES.SHOCKWAVE)
    .setScale(0.5)
    .setAlpha(0.9);
  container.add(wave1);

  scene.tweens.add({
    targets: wave1,
    scaleX: 4,
    scaleY: 4,
    alpha: 0,
    x: width * 0.2,
    duration: 3000,
    repeat: -1,
    delay: 500,
  });

  // ── Secondary trailing ring (offset timing) ──
  const wave2 = scene.add
    .image(width * 0.9, height * 0.3, INTRO_TEXTURES.SHOCKWAVE)
    .setScale(0.3)
    .setAlpha(0.5);
  container.add(wave2);

  scene.tweens.add({
    targets: wave2,
    scaleX: 3.5,
    scaleY: 3.5,
    alpha: 0,
    x: width * 0.15,
    duration: 3200,
    repeat: -1,
    delay: 1000,
  });

  // ── Impact sequence (delayed) ──
  scene.time.delayedCall(1500, () => {
    // Ship shakes gently with slight angle distortion
    scene.tweens.add({
      targets: ship,
      x: ship.x + Phaser.Math.Between(-2, 2),
      y: ship.y + Phaser.Math.Between(-1, 1),
      angle: Phaser.Math.Between(-5, 5),
      duration: 160,
      yoyo: true,
      repeat: 20,
    });

    // Subtle scale pulse from impact
    scene.tweens.add({
      targets: ship,
      scaleX: 0.07,
      scaleY: 0.065,
      duration: 120,
      yoyo: true,
      repeat: 3,
    });

    // Purple energy flash
    const flash = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0xff44ff,
      0.4
    );
    container.add(flash);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 600,
    });

    // Impact sparks around the ship
    const sparks = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_FIRE, {
      x: ship.x,
      y: ship.y,
      speed: { min: 40, max: 120 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.6, end: 0 },
      lifespan: 500,
      frequency: 50,
      quantity: 16,
      alpha: { start: 1, end: 0 },
    });
    container.add(sparks);

    scene.time.delayedCall(1500, () => {
      sparks.stop();
    });
  });

  // ── Warning text ──
  const warning = scene.add
    .text(width / 2, height * 0.08, "⚠ SHOCKWAVE DETECTED ⚠", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ff4444",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(warning);

  // Alarm-style blink with scale pulse
  scene.tweens.add({
    targets: warning,
    alpha: 0.2,
    duration: 300,
    yoyo: true,
    repeat: -1,
  });

  scene.tweens.add({
    targets: warning,
    scaleX: 1.05,
    scaleY: 1.05,
    duration: 300,
    yoyo: true,
    repeat: -1,
  });
}
