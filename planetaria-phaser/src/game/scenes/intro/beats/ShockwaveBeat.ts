import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * ShockwaveBeat.ts
 *
 * Beat 4: "Shockwave strikes the S.S. Astra"
 *
 * Visuals:
 *   - Ship in the centre
 *   - Expanding shockwave ring sweeping from right to left
 *   - Ship shakes violently on impact
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
  // PLACEHOLDER: intro_ship — Replace with ship sprite
  const ship = scene.add
    .image(width * 0.5, height * 0.3, INTRO_TEXTURES.SHIP)
    .setScale(0.7);
  container.add(ship);

  // ── Shockwave ring expanding from the right ──
  // PLACEHOLDER: intro_shockwave — Replace with shockwave ring sprite
  const wave = scene.add
    .image(width * 0.85, height * 0.3, INTRO_TEXTURES.SHOCKWAVE)
    .setScale(0.5)
    .setAlpha(0.9);
  container.add(wave);

  scene.tweens.add({
    targets: wave,
    scaleX: 4,
    scaleY: 4,
    alpha: 0,
    x: width * 0.2,
    duration: 3000,
    repeat: -1,
    delay: 500,
  });

  // ── Impact sequence (delayed) ──
  scene.time.delayedCall(1500, () => {
    // Ship shakes violently
    scene.tweens.add({
      targets: ship,
      x: ship.x + Phaser.Math.Between(-8, 8),
      y: ship.y + Phaser.Math.Between(-5, 5),
      angle: Phaser.Math.Between(-15, 15),
      duration: 80,
      yoyo: true,
      repeat: 15,
    });

    // Purple energy flash
    const flash = scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0xff44ff,
      0.3
    );
    container.add(flash);

    scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 800,
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

  // Alarm-style blink
  scene.tweens.add({
    targets: warning,
    alpha: 0.2,
    duration: 400,
    yoyo: true,
    repeat: -1,
  });
}
