import Phaser from "phaser";
import { PLANET_CORE_COLORS, PLANET_NAMES } from "../IntroTypes";

/**
 * PlanetaryCoresBeat.ts
 *
 * Beat 2: "The Planetary Cores"
 *
 * Visuals:
 *   - All 8 planets shown in a row from Mercury to Neptune
 *   - Each has a pulsing inner core glow
 *   - Labels beneath each planet
 *
 * No external assets needed — planets are drawn with graphics.
 * When real planet sprites are available, replace the fillCircle
 * calls with scene.add.image() using individual planet texture keys.
 */
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
    const radius = 10 + i * 1.2;

    // ── Planet body ──
    // PLACEHOLDER: Individual planet sprites could replace these circles
    const planetGfx = scene.add.graphics();
    planetGfx.fillStyle(PLANET_CORE_COLORS[i], 0.7);
    planetGfx.fillCircle(x, y, radius);
    container.add(planetGfx);

    // ── Core glow (pulsing white center) ──
    const coreGlow = scene.add.graphics();
    coreGlow.fillStyle(0xffffff, 0.3);
    coreGlow.fillCircle(x, y, radius * 0.4);
    container.add(coreGlow);

    scene.tweens.add({
      targets: coreGlow,
      alpha: 0.1,
      duration: 800 + i * 100,
      yoyo: true,
      repeat: -1,
    });

    // ── Planet label ──
    const label = scene.add
      .text(x, y + radius + 14, PLANET_NAMES[i], {
        fontFamily: "monospace",
        fontSize: "9px",
        color: "#8899aa",
      })
      .setOrigin(0.5);
    container.add(label);
  }

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
}
