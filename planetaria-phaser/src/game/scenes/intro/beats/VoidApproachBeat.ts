import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * VoidApproachBeat.ts
 *
 * Beat 1: "The Void Devourer approaches"
 *
 * Visuals:
 *   - Pulsating Void Devourer entity on the right
 *   - Neptune trembling in the centre
 *   - Ghost of consumed Pluto fading away
 *   - Ominous title text
 *
 * Assets used:
 *   PLACEHOLDER: intro_void — Void Devourer sprite
 *   PLACEHOLDER: intro_neptune — Neptune planet sprite
 *   PLACEHOLDER: intro_pluto — Pluto dwarf-planet sprite
 */
export function buildVoidApproachVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Void Devourer ──
  // PLACEHOLDER: intro_void — Replace with animated Void Devourer sprite
  const voidEntity = scene.add
    .image(width * 0.82, height * 0.3, INTRO_TEXTURES.VOID_DEVOURER)
    .setScale(1.5)
    .setAlpha(0.9);
  container.add(voidEntity);

  // Menacing pulsation with scale + alpha
  scene.tweens.add({
    targets: voidEntity,
    scaleX: 1.7,
    scaleY: 1.7,
    alpha: 0.7,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // Slow ominous rotation
  scene.tweens.add({
    targets: voidEntity,
    angle: 360,
    duration: 20000,
    repeat: -1,
  });

  // ── Neptune (trembling under the Void's pull) ──
  // PLACEHOLDER: intro_neptune — Replace with Neptune sprite
  const neptune = scene.add
    .image(width * 0.55, height * 0.32, INTRO_TEXTURES.NEPTUNE)
    .setScale(1);
  container.add(neptune);

  // Shake + subtle scale pulse to show distress
  scene.tweens.add({
    targets: neptune,
    x: neptune.x + 3,
    y: neptune.y + 1,
    duration: 60,
    yoyo: true,
    repeat: -1,
  });

  scene.tweens.add({
    targets: neptune,
    scaleX: 0.96,
    scaleY: 0.96,
    duration: 800,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });

  // Neptune label
  const labelNeptune = scene.add
    .text(neptune.x, neptune.y + 55, "Neptune", {
      fontFamily: "monospace",
      fontSize: "11px",
      color: "#6677cc",
    })
    .setOrigin(0.5);
  container.add(labelNeptune);

  // ── Pluto (consumed — ghost being pulled toward Void) ──
  // PLACEHOLDER: intro_pluto — Replace with Pluto sprite
  const pluto = scene.add
    .image(width * 0.72, height * 0.28, INTRO_TEXTURES.PLUTO)
    .setAlpha(0.15);
  container.add(pluto);

  // Slowly drift toward the void and fade out
  scene.tweens.add({
    targets: pluto,
    x: width * 0.78,
    alpha: 0.03,
    duration: 4000,
    ease: "Sine.easeIn",
  });

  // Consumed label
  const labelPluto = scene.add
    .text(pluto.x, pluto.y + 30, "Pluto (consumed)", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#554444",
    })
    .setOrigin(0.5);
  container.add(labelPluto);

  // Label fades alongside Pluto
  scene.tweens.add({
    targets: labelPluto,
    alpha: 0,
    duration: 4000,
    ease: "Sine.easeIn",
  });

  // ── Title ──
  const title = scene.add
    .text(width / 2, height * 0.08, "THE VOID DEVOURER", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#aa44ff",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(title);

  // Title flicker with scale pulse
  scene.tweens.add({
    targets: title,
    alpha: 0.5,
    duration: 1200,
    yoyo: true,
    repeat: -1,
  });

  scene.tweens.add({
    targets: title,
    scaleX: 1.03,
    scaleY: 1.03,
    duration: 2000,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}
