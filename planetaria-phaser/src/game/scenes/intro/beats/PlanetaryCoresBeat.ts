import Phaser from "phaser";
import { PLANET_NAMES, PLANET_TEXTURE_KEYS } from "../IntroTypes";

/**
 * PlanetaryCoresBeat.ts
 *
 * Beat 2: "The Planetary Cores"
 *
 * Visuals:
 *   - All 8 planets shown in a row from Mercury to Neptune
 *   - Labels beneath each planet
 *   - Staggered reveal with gentle floating animation
 *
 * Uses real planet sprites from assets/ui/
 */

// Display scales — PNGs are large, these shrink them to fit the row
const PLANET_SCALES = [0.05, 0.06, 0.065, 0.055, 0.09, 0.08, 0.07, 0.065];

export function buildPlanetaryCoresVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  const startX = width * 0.12;
  const endX = width * 0.88;
  const y = height * 0.3;

  for (let i = 0; i < 8; i++) {
    const x = startX + (endX - startX) * (i / 7);
    const scale = PLANET_SCALES[i];

    // Sub-container for this planet group (planet + label)
    const planetGroup = scene.add.container(x, y);
    container.add(planetGroup);

    // ── Planet sprite ──
    const planet = scene.add
      .image(0, 0, PLANET_TEXTURE_KEYS[i])
      .setScale(scale);
    planetGroup.add(planet);

    // ── Planet label ──
    const label = scene.add
      .text(0, 30, PLANET_NAMES[i], {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#8899aa",
      })
      .setOrigin(0.5);
    planetGroup.add(label);

    // ── Animations ──

    // Start hidden, staggered fade-in
    planetGroup.setAlpha(0);
    scene.tweens.add({
      targets: planetGroup,
      alpha: 1,
      duration: 600,
      delay: i * 150,
      ease: "Power2",
    });

    // Gentle floating motion
    scene.tweens.add({
      targets: planetGroup,
      y: y + 4,
      duration: 1800 + i * 200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
      delay: i * 100,
    });
  }

  // ── Connecting energy line between planets ──
  const energyLine = scene.add.graphics();
  energyLine.lineStyle(1, 0xffdd66, 0.15);
  energyLine.beginPath();
  energyLine.moveTo(startX, y);
  energyLine.lineTo(endX, y);
  energyLine.strokePath();
  energyLine.setAlpha(0);
  container.add(energyLine);
  container.sendToBack(energyLine);

  scene.tweens.add({
    targets: energyLine,
    alpha: 1,
    duration: 1200,
    delay: 8 * 150 + 400,
  });

  // ── Section title ──
  const title = scene.add
    .text(width / 2, height * 0.08, "THE PLANETARY CORES", {
      fontFamily: "monospace",
      fontSize: "20px",
      color: "#ffdd66",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(title);

  // Title glow pulse
  scene.tweens.add({
    targets: title,
    alpha: 0.7,
    duration: 1500,
    yoyo: true,
    repeat: -1,
    ease: "Sine.easeInOut",
  });
}
