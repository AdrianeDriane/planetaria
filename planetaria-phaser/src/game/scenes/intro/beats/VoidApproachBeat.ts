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

  // Menacing pulsation
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

  // ── Neptune (trembling) ──
  // PLACEHOLDER: intro_neptune — Replace with Neptune sprite
  const neptune = scene.add
    .image(width * 0.55, height * 0.32, INTRO_TEXTURES.NEPTUNE)
    .setScale(1);
  container.add(neptune);

  // Shake effect to show Neptune trembling
  scene.tweens.add({
    targets: neptune,
    x: neptune.x + 2,
    duration: 60,
    yoyo: true,
    repeat: -1,
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

  // ── Pluto (consumed — ghost) ──
  // PLACEHOLDER: intro_pluto — Replace with Pluto sprite
  const pluto = scene.add
    .image(width * 0.72, height * 0.28, INTRO_TEXTURES.PLUTO)
    .setAlpha(0.15);
  container.add(pluto);

  // Consumed label
  const labelPluto = scene.add
    .text(pluto.x, pluto.y + 30, "Pluto (consumed)", {
      fontFamily: "monospace",
      fontSize: "10px",
      color: "#554444",
    })
    .setOrigin(0.5);
  container.add(labelPluto);

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

  // Title flicker
  scene.tweens.add({
    targets: title,
    alpha: 0.5,
    duration: 1200,
    yoyo: true,
    repeat: -1,
  });
}
