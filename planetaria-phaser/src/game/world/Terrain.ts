import Phaser from "phaser";
import { WORLD, TERRAIN } from "../config";

/**
 * Terrain.ts
 *
 * Generates Mercury-like terrain with a rocky surface, craters,
 * scattered boulders, and a thin exospheric atmosphere.
 *
 * The atmosphere is baked into a static texture at startup
 * so it costs nothing per frame — just one image draw call.
 */
export default class Terrain {
  private group: Phaser.Physics.Arcade.StaticGroup;
  private _colHeights: number[] = [];
  private _ridgePoints: { x: number; y: number }[] = [];

  constructor(private scene: Phaser.Scene) {
    this.group = this.scene.physics.add.staticGroup();
    this.generateTexture();
    this.buildTerrain();
    this.drawMercurySurface();
    this.bakeAtmosphereTexture();
  }

  getGroup(): Phaser.Physics.Arcade.StaticGroup {
    return this.group;
  }

  /**
   * Returns the height (in tile rows) for each column.
   * Use to position objects above the terrain surface.
   */
  getColumnHeights(): number[] {
    return this._colHeights;
  }

  /**
   * Get the surface Y coordinate for a given X position.
   * Returns the top of the terrain at that X.
   */
  getSurfaceY(x: number): number {
    const col = Math.floor(x / WORLD.TILE_SIZE);
    const clampedCol = Math.max(0, Math.min(col, this._colHeights.length - 1));
    const heightInRows = this._colHeights[clampedCol] || 4;
    return WORLD.HEIGHT - heightInRows * WORLD.TILE_SIZE;
  }

  static preload(): void {}

  // ---------------------------------------------------------------------------

  private generateTexture(): void {
    const size = TERRAIN.TILE_SIZE;

    if (!this.scene.textures.exists(TERRAIN.TEXTURE_KEY)) {
      const g = this.scene.add.graphics();
      g.fillStyle(TERRAIN.COLOR, 1);
      g.fillRect(0, 0, size, size);
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

    const topKey = TERRAIN.TEXTURE_KEY + "_top";
    if (!this.scene.textures.exists(topKey)) {
      const g = this.scene.add.graphics();
      g.fillStyle(TERRAIN.COLOR, 1);
      g.fillRect(0, 0, size, size);
      g.fillStyle(TERRAIN.SURFACE_COLOR, 1);
      g.fillRect(0, 0, size, 2);
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

  private buildTerrain(): void {
    const { WIDTH, TILE_SIZE } = WORLD;
    const baseGroundY = WORLD.HEIGHT;
    const minRows = 4;
    const maxExtra = 6;

    let seed = 42;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const totalCols = Math.ceil(WIDTH / TILE_SIZE);
    const colHeights: number[] = [];

    for (let col = 0; col < totalCols; col++) {
      const t = col / totalCols;
      const coarse = Math.sin(t * Math.PI * 6) * 2.5;
      const medium = Math.sin(t * Math.PI * 17 + 1.7) * 1.5;
      const fine = (rng() - 0.5) * 2;
      const extraRows = Math.round(maxExtra / 2 + coarse + medium + fine);
      const rows = Math.max(
        minRows,
        Math.min(minRows + maxExtra, minRows + extraRows)
      );
      colHeights.push(rows);
    }

    for (let col = 0; col < totalCols; col++) {
      const x = col * TILE_SIZE;
      const rows = colHeights[col];
      for (let row = 0; row < rows; row++) {
        const y = baseGroundY - (row + 1) * TILE_SIZE;
        this.addTile(x, y, row === rows - 1);
      }
    }

    this._colHeights = colHeights;

    // Build ridge points
    let seed2 = 1337;
    const rng2 = () => {
      seed2 = (seed2 * 16807) % 2147483647;
      return (seed2 - 1) / 2147483646;
    };

    const ridgePoints: { x: number; y: number }[] = [];
    for (let col = 0; col < totalCols; col++) {
      const x = col * TILE_SIZE + TILE_SIZE / 2;
      const topY = WORLD.HEIGHT - this._colHeights[col] * TILE_SIZE;
      const jitter = (rng2() - 0.5) * 4;
      ridgePoints.push({ x, y: topY + jitter });
    }
    ridgePoints.unshift({ x: 0, y: ridgePoints[0].y });
    ridgePoints.push({ x: WIDTH, y: ridgePoints[ridgePoints.length - 1].y });
    this._ridgePoints = ridgePoints;
  }

  private drawMercurySurface(): void {
    const { WIDTH, HEIGHT } = WORLD;
    const gfx = this.scene.add.graphics();
    gfx.setDepth(-1);

    let seed = 1337;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const ridgePoints = this._ridgePoints;
    const segments = this._colHeights.length;

    // Fill from ridgeline down
    gfx.fillStyle(0x3a3028, 1);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    gfx.fillStyle(0x4e4438, 0.6);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y + 6);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y + 6);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    gfx.fillStyle(0x302820, 0.4);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y + 18);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y + 18);
    gfx.lineTo(WIDTH, HEIGHT);
    gfx.lineTo(0, HEIGHT);
    gfx.closePath();
    gfx.fillPath();

    gfx.lineStyle(2, 0x9a8a72, 0.8);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y);
    gfx.strokePath();

    gfx.lineStyle(1, 0xbba882, 0.25);
    gfx.beginPath();
    gfx.moveTo(0, ridgePoints[0].y - 1);
    for (const pt of ridgePoints) gfx.lineTo(pt.x, pt.y - 1);
    gfx.strokePath();

    const getLocalSurfaceY = (px: number): number => {
      const idx = Math.min(
        ridgePoints.length - 1,
        Math.max(0, Math.floor((px / WIDTH) * (ridgePoints.length - 2)) + 1)
      );
      return ridgePoints[idx].y;
    };

    let cSeed = 99;
    const crng = () => {
      cSeed = (cSeed * 16807) % 2147483647;
      return (cSeed - 1) / 2147483646;
    };
    for (let i = 0; i < 60; i++) {
      const cx = crng() * WIDTH;
      const r = 12 + crng() * 30;
      const depth = 4 + crng() * 10;
      const localY = getLocalSurfaceY(cx);
      const cy = localY + depth + 10;

      gfx.lineStyle(1.5, 0x8a7a62, 0.55);
      gfx.beginPath();
      gfx.arc(cx, cy - 2, r + 2, Math.PI * 1.05, Math.PI * 1.95, false);
      gfx.strokePath();

      gfx.fillStyle(0x1a1610, 0.8);
      gfx.fillEllipse(cx, cy, r * 2, r * 0.9);
      gfx.fillStyle(0x0e0c08, 0.7);
      gfx.fillEllipse(cx + 1, cy + 2, r * 1.4, r * 0.55);
      gfx.fillStyle(0x060504, 0.5);
      gfx.fillEllipse(cx + 2, cy + 3, r * 0.8, r * 0.3);

      gfx.lineStyle(1, 0xaa9a78, 0.4);
      gfx.beginPath();
      gfx.arc(cx, cy - 1, r * 0.95, Math.PI * 1.15, Math.PI * 1.6, false);
      gfx.strokePath();

      gfx.lineStyle(1, 0x1e1a14, 0.3);
      gfx.beginPath();
      gfx.arc(cx, cy + 1, r * 0.9, Math.PI * 0.2, Math.PI * 0.8, false);
      gfx.strokePath();
    }

    for (let i = 0; i < 120; i++) {
      const rx = rng() * WIDTH;
      const ridgeIdx = Math.min(segments, Math.floor((rx / WIDTH) * segments));
      const baseY = ridgePoints[ridgeIdx].y;
      const ry = baseY + 2 + rng() * 20;
      const rSize = 1.5 + rng() * 4;
      const shade = 0x45 + Math.floor(rng() * 0x25);
      const rockColor = (shade << 16) | ((shade - 0x08) << 8) | (shade - 0x15);
      gfx.fillStyle(rockColor, 0.6 + rng() * 0.3);
      gfx.fillRect(rx, ry, rSize, rSize * 0.7);
    }

    for (let i = 0; i < 250; i++) {
      const dx = rng() * WIDTH;
      const ridgeIdx = Math.min(segments, Math.floor((dx / WIDTH) * segments));
      const baseY = ridgePoints[ridgeIdx].y;
      const dy = baseY + 2 + rng() * 30;
      gfx.fillStyle(0x6a5a48, 0.2 + rng() * 0.3);
      gfx.fillPoint(dx, dy, 1 + rng());
    }

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

  /**
   * Bakes the atmosphere into a texture, then destroys the graphics.
   *
   * The atmosphere is split into tiles (640px wide chunks) so we
   * never create a single massive canvas. Each chunk is rendered
   * to a small RenderTexture, snapshotted into a real texture,
   * then placed as a lightweight image. Total GPU cost at runtime:
   * just a handful of small sprite draws, same as any tile.
   */
  private bakeAtmosphereTexture(): void {
    const { WIDTH } = WORLD;
    const ridgePoints = this._ridgePoints;
    const ATMO_HEIGHT = 120; // pixels above lowest ridge point

    // Find the top of the atmosphere band
    let minRidgeY: number = WORLD.HEIGHT;
    for (const pt of ridgePoints) {
      if (pt.y < minRidgeY) minRidgeY = pt.y;
    }
    const atmoTop = minRidgeY - ATMO_HEIGHT;

    // Chunk width — matches display width so chunks are manageable
    const CHUNK_W = 640;
    const chunkCount = Math.ceil(WIDTH / CHUNK_W);

    let seed = 2023;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let c = 0; c < chunkCount; c++) {
      const chunkX = c * CHUNK_W;
      const chunkRight = Math.min(chunkX + CHUNK_W, WIDTH);
      const chunkW = chunkRight - chunkX;

      const gfx = this.scene.add.graphics();

      // ── Haze bands ──
      const hazeLayers = [
        { offset: -2, height: 10, color: 0xffaa44, alpha: 0.045 },
        { offset: -8, height: 14, color: 0xffcc66, alpha: 0.032 },
        { offset: -16, height: 18, color: 0xffdd88, alpha: 0.022 },
        { offset: -28, height: 22, color: 0xffeebb, alpha: 0.015 },
        { offset: -44, height: 26, color: 0xfff4dd, alpha: 0.01 },
        { offset: -64, height: 30, color: 0xccccff, alpha: 0.006 },
      ];

      // Get ridge points that fall within this chunk
      const localRidge: { x: number; y: number }[] = [];
      for (const pt of ridgePoints) {
        if (pt.x >= chunkX - 32 && pt.x <= chunkRight + 32) {
          localRidge.push({ x: pt.x - chunkX, y: pt.y - atmoTop });
        }
      }
      if (localRidge.length < 2) continue;

      for (const layer of hazeLayers) {
        gfx.fillStyle(layer.color, layer.alpha);
        gfx.beginPath();
        gfx.moveTo(localRidge[0].x, localRidge[0].y + layer.offset);
        for (const pt of localRidge) {
          gfx.lineTo(pt.x, pt.y + layer.offset);
        }
        for (let i = localRidge.length - 1; i >= 0; i--) {
          gfx.lineTo(
            localRidge[i].x,
            localRidge[i].y + layer.offset - layer.height
          );
        }
        gfx.closePath();
        gfx.fillPath();
      }

      // ── Surface glow ──
      gfx.lineStyle(1, 0xffaa44, 0.07);
      gfx.beginPath();
      gfx.moveTo(localRidge[0].x, localRidge[0].y - 1);
      for (const pt of localRidge) gfx.lineTo(pt.x, pt.y - 1);
      gfx.strokePath();

      gfx.lineStyle(3, 0xffcc66, 0.03);
      gfx.beginPath();
      gfx.moveTo(localRidge[0].x, localRidge[0].y - 3);
      for (const pt of localRidge) gfx.lineTo(pt.x, pt.y - 3);
      gfx.strokePath();

      // ── Sodium hotspots in this chunk ──
      for (let i = 0; i < 4; i++) {
        const hx = rng() * chunkW;
        // Find closest ridge point
        let closestY = localRidge[0].y;
        let bestDist = Infinity;
        for (const pt of localRidge) {
          const d = Math.abs(pt.x - hx);
          if (d < bestDist) {
            bestDist = d;
            closestY = pt.y;
          }
        }
        const hy = closestY - 8 - rng() * 35;
        const hr = 12 + rng() * 25;

        gfx.fillStyle(0xffaa44, 0.018 + rng() * 0.015);
        gfx.fillCircle(hx, hy, hr);
        gfx.fillStyle(0xffcc66, 0.02 + rng() * 0.01);
        gfx.fillCircle(hx, hy + 2, hr * 0.45);
      }

      // ── Gas motes ──
      for (let i = 0; i < 12; i++) {
        const mx = rng() * chunkW;
        let closestY = localRidge[0].y;
        let bestDist = Infinity;
        for (const pt of localRidge) {
          const d = Math.abs(pt.x - mx);
          if (d < bestDist) {
            bestDist = d;
            closestY = pt.y;
          }
        }
        const my = closestY - 3 - rng() * 70;
        const isNa = rng() < 0.5;
        const color = isNa ? 0xffaa44 : 0xbbccff;
        const alpha = 0.04 + rng() * 0.06;
        gfx.fillStyle(color, alpha);
        gfx.fillPoint(mx, my, 1 + rng() * 1.5);
        if (isNa) {
          gfx.fillStyle(color, alpha * 0.3);
          gfx.fillCircle(mx, my, 3 + rng() * 3);
        }
      }

      // ── Sputtering jet (one per chunk, sometimes) ──
      if (rng() < 0.6) {
        const jx = rng() * chunkW;
        let closestY = localRidge[0].y;
        let bestDist = Infinity;
        for (const pt of localRidge) {
          const d = Math.abs(pt.x - jx);
          if (d < bestDist) {
            bestDist = d;
            closestY = pt.y;
          }
        }
        const jetH = 25 + rng() * 40;
        const jetW = 3 + rng() * 4;
        for (let h = 0; h < jetH; h += 3) {
          const frac = h / jetH;
          const w = jetW * (1 - frac * 0.7);
          gfx.fillStyle(0xffbb55, 0.02 * (1 - frac));
          gfx.fillRect(jx - w / 2, closestY - h - 4, w, 3);
        }
      }

      // Bake this chunk's graphics into a texture
      const texKey = `_atmo_chunk_${c}`;
      const totalH = WORLD.HEIGHT - atmoTop;
      gfx.generateTexture(texKey, chunkW, totalH);
      gfx.destroy();

      // Place as a simple image
      const img = this.scene.add.image(chunkX, atmoTop, texKey);
      img.setOrigin(0, 0);
      img.setDepth(0); // Above terrain, below player
    }
  }

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
