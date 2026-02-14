import Phaser from "phaser";

/**
 * Star data for the animated starfield.
 */
interface BGStar {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
  color: number;
}

/**
 * GameStarfield
 *
 * Animated starfield background that scrolls slowly diagonally.
 * Uses a RenderTexture redrawn each frame for per-pixel star movement.
 * Parallax: stars ignore camera scroll so the sky feels infinite.
 */
export class GameStarfield {
  private rt: Phaser.GameObjects.RenderTexture;
  private gfx: Phaser.GameObjects.Graphics;
  private stars: BGStar[] = [];

  /** Visible area size (viewport). */
  private vw: number;
  private vh: number;

  /** Diagonal drift direction (upper-left). */
  private dx = -0.18;
  private dy = -0.10;

  private static STAR_COLORS = [
    0xffffff, 0xc8c8ff, 0xffdcb4, 0xb4b4ff, 0xffb4b4, 0xb4ffdc, 0xdcc8ff,
  ];

  constructor(scene: Phaser.Scene) {
    this.vw = scene.scale.width;
    this.vh = scene.scale.height;

    // RenderTexture sized to viewport, pinned to camera via scrollFactor(0)
    this.rt = scene.add
      .renderTexture(0, 0, this.vw, this.vh)
      .setOrigin(0, 0)
      .setDepth(-10)
      .setScrollFactor(0);

    this.gfx = scene.add.graphics().setVisible(false);

    // Seeded RNG
    let seed = 7;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Create star pool
    for (let i = 0; i < 400; i++) {
      this.stars.push({
        x: rng() * this.vw,
        y: rng() * this.vh,
        speed: 0.15 + rng() * 0.6,
        size: rng() < 0.7 ? 1 : rng() < 0.9 ? 1.5 : 2,
        brightness: 0.15 + rng() * 0.55,
        color:
          GameStarfield.STAR_COLORS[
            Math.floor(rng() * GameStarfield.STAR_COLORS.length)
          ],
      });
    }

    // A few brighter accent stars
    for (let i = 0; i < 30; i++) {
      this.stars.push({
        x: rng() * this.vw,
        y: rng() * this.vh,
        speed: 0.08 + rng() * 0.25,
        size: 2.5,
        brightness: 0.5 + rng() * 0.5,
        color:
          GameStarfield.STAR_COLORS[
            Math.floor(rng() * GameStarfield.STAR_COLORS.length)
          ],
      });
    }
  }

  /** Call every frame from scene.update(). */
  update(delta: number): void {
    const dt = delta / 16.667;
    this.rt.clear();
    this.gfx.clear();

    // Deep space base
    this.gfx.fillStyle(0x000008, 1);
    this.gfx.fillRect(0, 0, this.vw, this.vh);

    // Subtle nebula washes
    const nebs = [
      { x: this.vw * 0.15, y: this.vh * 0.25, r: 80, c: 0x3c1450, a: 0.04 },
      { x: this.vw * 0.6, y: this.vh * 0.15, r: 60, c: 0x142850, a: 0.035 },
      { x: this.vw * 0.85, y: this.vh * 0.4, r: 50, c: 0x501428, a: 0.03 },
      { x: this.vw * 0.4, y: this.vh * 0.7, r: 45, c: 0x143c3c, a: 0.025 },
    ];
    for (const n of nebs) {
      this.gfx.fillStyle(n.c, n.a);
      this.gfx.fillCircle(n.x, n.y, n.r);
      this.gfx.fillStyle(n.c, n.a * 1.3);
      this.gfx.fillCircle(n.x, n.y, n.r * 0.6);
    }

    // Move and draw stars
    for (const s of this.stars) {
      s.x += this.dx * s.speed * dt;
      s.y += this.dy * s.speed * dt;

      // Wrap around viewport edges
      if (s.x < -2) s.x += this.vw + 4;
      if (s.x > this.vw + 2) s.x -= this.vw + 4;
      if (s.y < -2) s.y += this.vh + 4;
      if (s.y > this.vh + 2) s.y -= this.vh + 4;

      if (s.size > 2) {
        // Accent star with glow
        this.gfx.fillStyle(s.color, s.brightness * 0.15);
        this.gfx.fillCircle(s.x, s.y, 3);
        this.gfx.fillStyle(s.color, s.brightness);
        this.gfx.fillPoint(s.x, s.y, 2);
        this.gfx.fillStyle(0xffffff, s.brightness * 0.8);
        this.gfx.fillPoint(s.x, s.y, 1);
      } else {
        this.gfx.fillStyle(s.color, s.brightness);
        this.gfx.fillPoint(s.x, s.y, s.size);
      }
    }

    this.rt.draw(this.gfx);
  }

  destroy(): void {
    this.rt.destroy();
    this.gfx.destroy();
    this.stars = [];
  }
}
