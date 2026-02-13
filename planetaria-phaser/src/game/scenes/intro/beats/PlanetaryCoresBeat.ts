import Phaser from "phaser";
import {
  PLANET_CORE_COLORS,
  PLANET_NAMES,
  PLANET_TEXTURE_KEYS,
} from "../IntroTypes";

/**
 * PlanetaryCoresBeat.ts
 *
 * Beat 2: "The Planetary Cores"
 *
 * Visuals:
 *   - All 8 planets shown in a row from Mercury to Neptune
 *   - Each has a pulsing inner core glow
 *   - Labels beneath each planet
 *   - Staggered reveal with gentle floating animation
 *
 * Assets used:
 *   PLACEHOLDER: intro_mercury — Mercury planet sprite
 *   PLACEHOLDER: intro_venus — Venus planet sprite
 *   PLACEHOLDER: intro_earth — Earth planet sprite
 *   PLACEHOLDER: intro_mars — Mars planet sprite
 *   PLACEHOLDER: intro_jupiter — Jupiter planet sprite
 *   PLACEHOLDER: intro_saturn — Saturn planet sprite
 *   PLACEHOLDER: intro_uranus — Uranus planet sprite
 *   PLACEHOLDER: intro_neptune — Neptune planet sprite
 */

// Display scales to normalise different-sized planet textures into the row
const PLANET_SCALES = [0.45, 0.5, 0.5, 0.45, 0.4, 0.4, 0.45, 0.45];

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

    // Sub-container for this planet group (planet + glow + label)
    const planetGroup = scene.add.container(x, y);
    container.add(planetGroup);

    // ── Core glow (pulsing colored circle behind planet) ──
    const coreGlow = scene.add.graphics();
    coreGlow.fillStyle(PLANET_CORE_COLORS[i], 0.3);
    coreGlow.fillCircle(0, 0, 20);
    planetGroup.add(coreGlow);

    // ── Planet sprite ──
    // PLACEHOLDER: Replace with individual planet sprite
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

    // Core glow pulse
    scene.tweens.add({
      targets: coreGlow,
      alpha: 0.1,
      duration: 800 + i * 100,
      yoyo: true,
      repeat: -1,
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
