import Phaser from "phaser";
import { WORLD } from "../config";

/**
 * GridBackground.ts
 *
 * Purely visual background grid — no collision.
 * Renders behind everything for spatial reference.
 */
export function createGridBackground(scene: Phaser.Scene): void {
  const { WIDTH, HEIGHT, TILE_SIZE } = WORLD;
  const graphics = scene.add.graphics();

  // --- Sky gradient background ---
  graphics.fillStyle(0x1a1a2e, 1);
  graphics.fillRect(0, 0, WIDTH, HEIGHT);

  // --- Subtle grid lines ---
  graphics.lineStyle(1, 0x2a2a4e, 0.3);

  for (let x = 0; x <= WIDTH; x += TILE_SIZE) {
    graphics.moveTo(x, 0);
    graphics.lineTo(x, HEIGHT);
  }

  for (let y = 0; y <= HEIGHT; y += TILE_SIZE) {
    graphics.moveTo(0, y);
    graphics.lineTo(WIDTH, y);
  }

  graphics.strokePath();

  // --- Set depth behind everything ---
  graphics.setDepth(-10);
}
