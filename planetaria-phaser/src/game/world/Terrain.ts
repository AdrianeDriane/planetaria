import Phaser from "phaser";
import { WORLD, TERRAIN } from "../config";

/**
 * Terrain.ts
 *
 * Generates Mercury-like terrain with a rocky surface, craters,
 * and scattered boulders. Uses a procedural ridgeline for the
 * ground surface and fills solid collision tiles beneath it.
 *
 * Returns a static physics group that the scene uses for collision.
 */
export default class Terrain {
  private group: Phaser.Physics.Arcade.StaticGroup;

  constructor(private scene: Phaser.Scene) {
    this.group = this.scene.physics.add.staticGroup();
    this.generateTexture();
    this.buildTerrain();
    this.drawMercurySurface();
  }

  /** Expose the static group for collision setup in GameScene. */
  getGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.group;
  }

  static preload(): void {
    // Textures generated at runtime
  }

  // --- Private ---------------------------------------------------------------

  /**
   * Generates two 32×32 Mercury ground tile textures:
   *   - TEXTURE_KEY: plain rocky body (no border) for all rows
   *   - TEXTURE_KEY + "_top": same but with a lighter top-edge highlight
   */
  private generateTexture(): void {
    const size = TERRAIN.TILE_SIZE;

    // --- Base tile (no border at all) ---
    if (!this.scene.textures.exists(TERRAIN.TEXTURE_KEY)) {
      const g = this.scene.add.graphics();
      g.fillStyle(TERRAIN.COLOR, 1);
      g.fillRect(0, 0, size, size);
      // Rocky speckles
      g.fillStyle(TERRAIN.BORDER_COLOR, 0.2);
      g.fillRect(6, 10, 2, 2);
      g.fillRect(18, 6, 2, 2);
      g.fillRect(12, 20, 2, 2);
      g.fillRect(24, 14, 2, 2);
      g.fillRect(8, 26, 2, 2);
      g.fillStyle(TERRAIN.SURFACE_COLOR, 0.12);
      g.fillRect(14, 8, 1, 1);
      g.fillRect(22, 22, 1, 1);
      g.fillRect(4, 18, 1, 1);
      g.generateTexture(TERRAIN.TEXTURE_KEY, size, size);
      g.destroy();
    }

    // --- Top tile (light surface highlight on top edge only) ---
    const topKey = TERRAIN.TEXTURE_KEY + "_top";
    if (!this.scene.textures.exists(topKey)) {
      const g = this.scene.add.graphics();
      g.fillStyle(TERRAIN.COLOR, 1);
      g.fillRect(0, 0, size, size);
      // Light top-edge highlight
      g.fillStyle(TERRAIN.SURFACE_COLOR, 1);
      g.fillRect(0, 0, size, 2);
      // Same speckles
      g.fillStyle(TERRAIN.BORDER_COLOR, 0.2);
      g.fillRect(6, 10, 2, 2);
      g.fillRect(18, 6, 2, 2);
      g.fillRect(12, 20, 2, 2);
      g.fillRect(24, 14, 2, 2);
      g.fillRect(8, 26, 2, 2);
      g.fillStyle(TERRAIN.SURFACE_COLOR, 0.12);
      g.fillRect(14, 8, 1, 1);
      g.fillRect(22, 22, 1, 1);
      g.fillRect(4, 18, 1, 1);
      g.generateTexture(topKey, size, size);
      g.destroy();
    }
  }

  /**
   * Builds bumpy collision tiles. Each column has a varying height
   * generated from layered sine waves + noise, creating a rugged
   * Mercury-like terrain profile. The "_top" texture is applied only
   * to the topmost tile of each column.
   */
  private buildTerrain(): void {
    const { WIDTH, TILE_SIZE } = WORLD;
    const baseGroundY = WORLD.HEIGHT; // absolute bottom

    // Minimum rows so terrain is never too thin
    const minRows = 4;
    // Maximum extra rows on top of minimum
    const maxExtra = 6;

    // Seeded RNG matching the visual overlay seed
    let seed = 42;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const totalCols = Math.ceil(WIDTH / TILE_SIZE);

    // Pre-compute height (in rows) for each column
    const colHeights: number[] = [];
    for (let col = 0; col < totalCols; col++) {
      const t = col / totalCols;
      // Layered noise for bumpy profile
      const coarse = Math.sin(t * Math.PI * 6) * 2.5;
      const medium = Math.sin(t * Math.PI * 17 + 1.7) * 1.5;
      const fine = (rng() - 0.5) * 2;
      const extraRows = Math.round(
        (maxExtra / 2) + coarse + medium + fine
      );
      const rows = Math.max(minRows, Math.min(minRows + maxExtra, minRows + extraRows));
      colHeights.push(rows);
    }

    // Place tiles for each column
    for (let col = 0; col < totalCols; col++) {
      const x = col * TILE_SIZE;
      const rows = colHeights[col];
      for (let row = 0; row < rows; row++) {
        const y = baseGroundY - (row + 1) * TILE_SIZE;
        const isTop = row === rows - 1;
        this.addTile(x, y, isTop);
      }
    }

    // Store heights for the visual overlay to reference
    this._colHeights = colHeights;
  }

  /** Column heights (in rows) for visual overlay alignment. */
  private _colHeights: number[] = [];

  /**
   * Draws a Mercury-like decorative surface on top of the collision tiles.
   * Includes a jagged ridgeline, craters, boulders, and dust.
   * This is purely visual — collision is handled by the tile group above.
   */
  private drawMercurySurface(): void {
    const { WIDTH, HEIGHT, TILE_SIZE } = WORLD;
    const gfx = this.scene.add.graphics();
    gfx.setDepth(-1); // Behind player, above background

    // Seeded RNG for deterministic visuals
    let seed = 1337;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // ── Build ridgeline from actual collision column heights ──
    const totalCols = this._colHeights.length;
    const segments = totalCols;
    const ridgePoints: { x: number; y: number }[] = [];
    for (let col = 0; col < totalCols; col++) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const topY = HEIGHT - this._colHeights[col] * TILE_SIZE;
      // Add slight sub-tile noise for visual jitter
      const jitter = (rng() - 0.5) * 4;
      ridgePoints.push({ x, y: topY + jitter });
    }
    // Bookend so fill reaches the edges
    ridgePoints.unshift({ x: 0, y: ridgePoints[0].y });
    ridgePoints.push({ x: WIDTH, y: ridgePoints[ridgePoints.length - 1].y });

    // Fill from ridgeline down to bottom (dark crust over tiles)
    gfx.fillStyle(0x3a3028, 1);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    // Sub-surface layer (lighter)
    gfx.fillStyle(0x4e4438, 0.6);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y + 6);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y + 6);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    // Deep sub-layer
    gfx.fillStyle(0x302820, 0.4);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y + 18);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y + 18);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    // Ridgeline highlight
    gfx.lineStyle(2, 0x9a8a72, 0.8);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y);
    gfx.strokePath();

    // Secondary faint highlight
    gfx.lineStyle(1, 0xbba882, 0.25);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y - 1);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y - 1);
    gfx.strokePath();

    // ── Craters — procedurally distributed across the full width ──
    // Helper to look up local surface Y from ridgePoints
    const getLocalSurfaceY = (px: number): number => {
      const idx = Math.min(
        ridgePoints.length - 1,
        Math.max(0, Math.floor((px / WIDTH) * (ridgePoints.length - 2)) + 1)
      );
      return ridgePoints[idx].y;
    };

    // Generate many craters for the wide map
    const craters: { cx: number; r: number; depth: number }[] = [];
    const craterSeed = 99;
    let cSeed = craterSeed;
    const crng = () => {
      cSeed = (cSeed * 16807) % 2147483647;
      return (cSeed - 1) / 2147483646;
    };
    const craterCount = 60;
    for (let i = 0; i < craterCount; i++) {
      craters.push({
        cx: crng() * WIDTH,
        r: 12 + crng() * 30,
        depth: 4 + crng() * 10,
      });
    }

    for (const c of craters) {
      const cx = c.cx;
      const localY = getLocalSurfaceY(cx);
      const cy = localY + c.depth + 10;

      // Outer crater rim — raised edge highlight
      gfx.lineStyle(1.5, 0x8a7a62, 0.55);
      gfx.beginPath();
      gfx.arc(cx, cy - 2, c.r + 2, Math.PI * 1.05, Math.PI * 1.95, false);
      gfx.strokePath();

      // Crater depression — dark deep ellipse
      gfx.fillStyle(0x1a1610, 0.8);
      gfx.fillEllipse(cx, cy, c.r * 2, c.r * 0.9);

      // Inner depth gradient (darker center)
      gfx.fillStyle(0x0e0c08, 0.7);
      gfx.fillEllipse(cx + 1, cy + 2, c.r * 1.4, c.r * 0.55);

      // Deepest core shadow
      gfx.fillStyle(0x060504, 0.5);
      gfx.fillEllipse(cx + 2, cy + 3, c.r * 0.8, c.r * 0.3);

      // Lit rim on the sun-facing side (top-left)
      gfx.lineStyle(1, 0xaa9a78, 0.4);
      gfx.beginPath();
      gfx.arc(cx, cy - 1, c.r * 0.95, Math.PI * 1.15, Math.PI * 1.6, false);
      gfx.strokePath();

      // Shadow side rim (bottom-right, very dark)
      gfx.lineStyle(1, 0x1e1a14, 0.3);
      gfx.beginPath();
      gfx.arc(cx, cy + 1, c.r * 0.9, Math.PI * 0.2, Math.PI * 0.8, false);
      gfx.strokePath();
    }

    // ── Boulders and rocks ──
    for (let i = 0; i < 120; i++) {
      const rx = rng() * WIDTH;
      const ridgeIdx = Math.min(
        segments,
        Math.floor((rx / WIDTH) * segments)
      );
      const baseY = ridgePoints[ridgeIdx].y;
      const ry = baseY + 2 + rng() * 20;
      const rSize = 1.5 + rng() * 4;
      const shade = 0x45 + Math.floor(rng() * 0x25);
      const rockColor = (shade << 16) | ((shade - 0x08) << 8) | (shade - 0x15);
      gfx.fillStyle(rockColor, 0.6 + rng() * 0.3);
      gfx.fillRect(rx, ry, rSize, rSize * 0.7);
    }

    // ── Surface dust speckles ──
    for (let i = 0; i < 250; i++) {
      const dx = rng() * WIDTH;
      const ridgeIdx = Math.min(
        segments,
        Math.floor((dx / WIDTH) * segments)
      );
      const baseY = ridgePoints[ridgeIdx].y;
      const dy = baseY + 2 + rng() * 30;
      gfx.fillStyle(0x6a5a48, 0.2 + rng() * 0.3);
      gfx.fillPoint(dx, dy, 1 + rng());
    }

    // ── Horizontal cracks in the surface ──
    for (let i = 0; i < 50; i++) {
      const startX = rng() * WIDTH;
      const ridgeIdx = Math.min(
        segments,
        Math.floor((startX / WIDTH) * segments)
      );
      const y = ridgePoints[ridgeIdx].y + 4 + rng() * 25;
      const len = 15 + rng() * 40;
      gfx.lineStyle(1, 0x2a2218, 0.3 + rng() * 0.2);
      gfx.beginPath();
      gfx.moveTo(startX, y);
      gfx.lineTo(startX + len, y + (rng() - 0.5) * 6);
      gfx.strokePath();
    }
  }

  /** Places a single tile at grid-aligned position. */
  private addTile(x: number, y: number, isTopRow = false): void {
    const texKey = isTopRow
      ? TERRAIN.TEXTURE_KEY + "_top"
      : TERRAIN.TEXTURE_KEY;
    const tile = this.group.create(
      x + TERRAIN.TILE_SIZE / 2,
      y + TERRAIN.TILE_SIZE / 2,
      texKey
    ) as Phaser.Physics.Arcade.Sprite;

    tile.setOrigin(0.5, 0.5);
    tile.refreshBody();
  }
}
