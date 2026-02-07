import Phaser from "phaser";
import { WORLD } from "../config";

/**
 * GridBackground.ts
 *
 * Draws a tiled grid across the entire world
 * so player movement is visually trackable.
 */
export function createGridBackground(scene: Phaser.Scene): void {
    const { WIDTH, HEIGHT, TILE_SIZE } = WORLD;
    const graphics = scene.add.graphics();

    // --- Background fill ---
    graphics.fillStyle(0x1a1a2e, 1);
    graphics.fillRect(0, 0, WIDTH, HEIGHT);

    // --- Grid lines ---
    graphics.lineStyle(1, 0x2a2a4e, 0.5);

    for (let x = 0; x <= WIDTH; x += TILE_SIZE) {
        graphics.moveTo(x, 0);
        graphics.lineTo(x, HEIGHT);
    }

    for (let y = 0; y <= HEIGHT; y += TILE_SIZE) {
        graphics.moveTo(0, y);
        graphics.lineTo(WIDTH, y);
    }

    graphics.strokePath();

    // --- Center crosshair ---
    const cx = WIDTH / 2;
    const cy = HEIGHT / 2;
    graphics.lineStyle(2, 0x4a4a8e, 0.8);
    graphics.moveTo(cx - 16, cy);
    graphics.lineTo(cx + 16, cy);
    graphics.moveTo(cx, cy - 16);
    graphics.lineTo(cx, cy + 16);
    graphics.strokePath();
}
