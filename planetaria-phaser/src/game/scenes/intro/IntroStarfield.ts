import Phaser from "phaser";
import {
  Star,
  SpaceDust,
  ShootingStar,
  Nebula,
  STAR_COLORS,
  INTRO_CONFIG,
  INTRO_TEXTURES,
} from "./IntroTypes";

/**
 * IntroStarfield.ts
 *
 * Animated pixel-art starfield background for the intro cinematic.
 * Emulates the PixelStarfield React component using Phaser's
 * RenderTexture for per-pixel drawing each frame.
 *
 * Layers (back to front):
 *   1. Static painted background (INTRO_TEXTURES.STARFIELD)
 *   2. Nebula clouds (soft colour washes)
 *   3. Space dust (faint drifting motes)
 *   4. Stars (twinkling, parallax)
 *   5. Shooting stars (rare, fast streaks)
 */
export default class IntroStarfield {
  private scene: Phaser.Scene;
  private width: number;
  private height: number;

  // Render target for the animated layer
  private renderTexture!: Phaser.GameObjects.RenderTexture;

  // Particle pools
  private stars: Star[] = [];
  private dust: SpaceDust[] = [];
  private shootingStars: ShootingStar[] = [];
  private nebulae: Nebula[] = [];

  // Movement direction (from INTRO_CONFIG.STARFIELD_DIRECTION)
  private dx: number;
  private dy: number;

  // Shooting star spawn timer (in ms)
  private shootingStarTimer: number = 0;

  // Elapsed time tracker
  private elapsed: number = 0;

  // Temporary graphics context for per-frame drawing
  private drawGfx!: Phaser.GameObjects.Graphics;

  private destroyed: boolean = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.width = scene.scale.width;
    this.height = scene.scale.height;

    // Compute drift direction
    const rad = (INTRO_CONFIG.STARFIELD_DIRECTION * Math.PI) / 180;
    this.dx = Math.cos(rad);
    this.dy = Math.sin(rad);

    this.init();
  }

  /* ------------------------------------------------------------------ */
  /*  Initialization                                                     */
  /* ------------------------------------------------------------------ */

  private init(): void {
    const { scene, width, height } = this;

    // Static background image (lowest layer)
    scene.add
      .image(width / 2, height / 2, INTRO_TEXTURES.STARFIELD)
      .setDisplaySize(width, height)
      .setDepth(0);

    // Render texture for animated elements (drawn each frame)
    this.renderTexture = scene.add
      .renderTexture(0, 0, width, height)
      .setOrigin(0, 0)
      .setDepth(1);

    // Graphics object used for drawing onto the render texture
    this.drawGfx = scene.add.graphics().setVisible(false);

    // Populate star pool
    for (let i = 0; i < INTRO_CONFIG.STAR_COUNT; i++) {
      this.stars.push(this.createStar(true));
    }

    // Populate dust pool
    for (let i = 0; i < INTRO_CONFIG.DUST_COUNT; i++) {
      this.dust.push(this.createDust(true));
    }

    // Populate nebulae (fixed decorative blobs)
    this.nebulae = [
      {
        x: width * 0.2,
        y: height * 0.3,
        radius: 50,
        color: 0x3c1450,
        alpha: 0.04,
        driftX: 0.008,
        driftY: 0.012,
      },
      {
        x: width * 0.75,
        y: height * 0.55,
        radius: 42,
        color: 0x142850,
        alpha: 0.035,
        driftX: -0.006,
        driftY: 0.009,
      },
      {
        x: width * 0.5,
        y: height * 0.15,
        radius: 30,
        color: 0x501428,
        alpha: 0.03,
        driftX: 0.01,
        driftY: -0.007,
      },
      {
        x: width * 0.85,
        y: height * 0.8,
        radius: 35,
        color: 0x143c3c,
        alpha: 0.025,
        driftX: -0.005,
        driftY: 0.008,
      },
    ];

    // Initial shooting star timer
    this.shootingStarTimer =
      INTRO_CONFIG.SHOOTING_STAR_INTERVAL * 0.5 +
      Math.random() * INTRO_CONFIG.SHOOTING_STAR_INTERVAL;
  }

  /* ------------------------------------------------------------------ */
  /*  Per-Frame Update (call from scene.update)                         */
  /* ------------------------------------------------------------------ */

  update(delta: number): void {
    if (this.destroyed) return;

    this.elapsed += delta;
    const dt = delta / 16.667; // Normalize to ~60fps
    const speed = INTRO_CONFIG.STARFIELD_SPEED;

    // Clear the animated layer
    this.renderTexture.clear();
    this.drawGfx.clear();

    // --- Nebulae ---
    this.drawNebulae(dt);

    // --- Space Dust ---
    this.updateAndDrawDust(dt, speed);

    // --- Stars ---
    this.updateAndDrawStars(dt, speed);

    // --- Shooting Stars ---
    this.updateShootingStarSpawner(delta);
    this.updateAndDrawShootingStars(dt);

    // Stamp the graphics onto the render texture
    this.renderTexture.draw(this.drawGfx);
  }

  /* ------------------------------------------------------------------ */
  /*  Nebulae                                                            */
  /* ------------------------------------------------------------------ */

  private drawNebulae(_dt: number): void {
    const time = this.elapsed;

    for (const neb of this.nebulae) {
      const cx = neb.x + Math.sin(time * neb.driftX) * 6;
      const cy = neb.y + Math.cos(time * neb.driftY) * 4;
      // const r = Phaser.Display.Color.IntegerToColor(neb.color);

      this.drawGfx.fillStyle(neb.color, neb.alpha);

      // Draw as scattered pixels within the radius for a cloudy look
      const step = 2;
      for (let py = -neb.radius; py <= neb.radius; py += step) {
        for (let px = -neb.radius; px <= neb.radius; px += step) {
          const dist = Math.sqrt(px * px + py * py);
          if (dist > neb.radius) continue;
          const fade = 1 - dist / neb.radius;
          if (Math.random() < fade * 0.3) {
            this.drawGfx.fillRect(
              Math.floor(cx + px),
              Math.floor(cy + py),
              step,
              step
            );
          }
        }
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Space Dust                                                         */
  /* ------------------------------------------------------------------ */

  private updateAndDrawDust(dt: number, speed: number): void {
    const { dx, dy, width, height } = this;

    for (let i = 0; i < this.dust.length; i++) {
      const d = this.dust[i];

      // Move in the starfield direction
      d.x += dx * d.speed * speed * dt;
      d.y += dy * d.speed * speed * dt;

      // Perpendicular drift for floaty feel
      const perpDx = -dy;
      const perpDy = dx;
      const drift =
        Math.sin(this.elapsed * 0.001 * d.driftSpeed + d.driftPhase) * 0.5;
      const drawX = Math.floor(d.x + perpDx * drift);
      const drawY = Math.floor(d.y + perpDy * drift);

      // Recycle if off-screen
      if (drawX < -2 || drawX > width + 2 || drawY < -2 || drawY > height + 2) {
        this.dust[i] = this.createDust(false);
        continue;
      }

      this.drawGfx.fillStyle(0x9688b4, d.alpha);
      this.drawGfx.fillRect(drawX, drawY, 1, 1);
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Stars                                                              */
  /* ------------------------------------------------------------------ */

  private updateAndDrawStars(dt: number, speed: number): void {
    const { dx, dy, width, height, elapsed } = this;

    for (let i = 0; i < this.stars.length; i++) {
      const star = this.stars[i];

      // Parallax movement
      star.x += dx * star.speed * speed * dt;
      star.y += dy * star.speed * speed * dt;

      // Recycle if off-screen
      const margin = star.size + 2;
      if (
        star.x < -margin ||
        star.x > width + margin ||
        star.y < -margin ||
        star.y > height + margin
      ) {
        this.stars[i] = this.createStar(false);
        continue;
      }

      // Twinkle
      const twinkle =
        0.5 +
        0.5 *
          Math.sin(elapsed * 0.001 * star.twinkleSpeed + star.twinkleOffset);
      const alpha = star.brightness * (0.4 + 0.6 * twinkle);

      const px = Math.floor(star.x);
      const py = Math.floor(star.y);

      this.drawGfx.fillStyle(star.color, alpha);

      if (star.size === 1) {
        // Single pixel
        this.drawGfx.fillRect(px, py, 1, 1);
      } else if (star.size === 2) {
        // 2x2 block
        this.drawGfx.fillRect(px, py, 2, 2);
      } else {
        // Cross shape (3px) with bright center
        this.drawGfx.fillRect(px, py - 1, 1, 1);
        this.drawGfx.fillRect(px - 1, py, 3, 1);
        this.drawGfx.fillRect(px, py + 1, 1, 1);

        // Brighter core
        const brighter = Phaser.Display.Color.IntegerToColor(star.color);
        brighter.lighten(20);
        this.drawGfx.fillStyle(brighter.color, Math.min(alpha * 1.3, 1));
        this.drawGfx.fillRect(px, py, 1, 1);
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Shooting Stars                                                     */
  /* ------------------------------------------------------------------ */

  private updateShootingStarSpawner(delta: number): void {
    this.shootingStarTimer -= delta;
    if (this.shootingStarTimer <= 0) {
      this.shootingStars.push(this.createShootingStar());
      this.shootingStarTimer =
        INTRO_CONFIG.SHOOTING_STAR_INTERVAL * 8 +
        Math.random() * INTRO_CONFIG.SHOOTING_STAR_INTERVAL * 16;
    }
  }

  private updateAndDrawShootingStars(dt: number): void {
    const { width, height } = this;

    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.speedX * dt;
      ss.y += ss.speedY * dt;
      ss.life += dt;

      // Remove when expired or off-screen
      if (
        ss.life >= ss.maxLife ||
        ss.x < -20 ||
        ss.x > width + 20 ||
        ss.y < -20 ||
        ss.y > height + 20
      ) {
        this.shootingStars.splice(i, 1);
        continue;
      }

      this.drawShootingStar(ss);
    }
  }

  private drawShootingStar(ss: ShootingStar): void {
    const fadeIn = Math.min(ss.life / 10, 1);
    const fadeOut = Math.max(1 - ss.life / ss.maxLife, 0);
    const alpha = fadeIn * fadeOut;

    const hx = Math.floor(ss.x);
    const hy = Math.floor(ss.y);

    // Head
    this.drawGfx.fillStyle(ss.color, alpha);
    this.drawGfx.fillRect(hx, hy, 2, 2);

    // Bright core
    this.drawGfx.fillStyle(0xffffff, alpha * 0.8);
    this.drawGfx.fillRect(hx, hy, 1, 1);

    // Tail
    const tailDx = -ss.speedX / Math.sqrt(ss.speedX ** 2 + ss.speedY ** 2);
    const tailDy = -ss.speedY / Math.sqrt(ss.speedX ** 2 + ss.speedY ** 2);

    for (let t = 1; t <= ss.tailLength; t++) {
      const tailAlpha = alpha * (1 - t / ss.tailLength) * 0.6;
      if (tailAlpha <= 0.01) break;

      const tx = Math.floor(ss.x + tailDx * t * 1.5);
      const ty = Math.floor(ss.y + tailDy * t * 1.5);

      this.drawGfx.fillStyle(ss.color, tailAlpha);
      this.drawGfx.fillRect(tx, ty, 1, 1);

      // Sparkle
      if (t % 2 === 0 && Math.random() > 0.3) {
        this.drawGfx.fillStyle(0xffffc8, tailAlpha * 0.5);
        this.drawGfx.fillRect(
          tx + Phaser.Math.Between(-1, 1),
          ty + Phaser.Math.Between(-1, 1),
          1,
          1
        );
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  Factory Methods                                                    */
  /* ------------------------------------------------------------------ */

  private createStar(randomize: boolean): Star {
    const { dx, dy, width, height } = this;
    const size = Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 3;

    let x: number, y: number;
    if (randomize) {
      x = Math.random() * width;
      y = Math.random() * height;
    } else {
      // Spawn from the edge opposite to movement
      if (Math.random() < 0.5) {
        x = dx > 0 ? -size : width + size;
        y = Math.random() * height;
      } else {
        x = Math.random() * width;
        y = dy > 0 ? -size : height + size;
      }
    }

    return {
      x,
      y,
      speed: 0.2 + Math.random() * 0.8,
      size,
      brightness: 0.3 + Math.random() * 0.7,
      twinkleSpeed: 0.5 + Math.random() * 2.0,
      twinkleOffset: Math.random() * Math.PI * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
    };
  }

  private createDust(randomize: boolean): SpaceDust {
    const { dx, dy, width, height } = this;

    let x: number, y: number;
    if (randomize) {
      x = Math.random() * width;
      y = Math.random() * height;
    } else {
      if (Math.random() < 0.5) {
        x = dx > 0 ? -1 : width + 1;
        y = Math.random() * height;
      } else {
        x = Math.random() * width;
        y = dy > 0 ? -1 : height + 1;
      }
    }

    return {
      x,
      y,
      speed: 0.1 + Math.random() * 0.3,
      alpha: 0.05 + Math.random() * 0.15,
      driftSpeed: 0.5 + Math.random() * 1.5,
      driftPhase: Math.random() * Math.PI * 2,
    };
  }

  private createShootingStar(): ShootingStar {
    const { dx, dy, width, height } = this;

    let x: number, y: number;
    if (Math.random() < 0.5) {
      x = dx > 0 ? -2 : width + 2;
      y = Math.random() * height * 0.6;
    } else {
      x = Math.random() * width;
      y = dy > 0 ? -2 : height * 0.3;
    }

    const speed = 3 + Math.random() * 4;
    return {
      x,
      y,
      speedX: dx * speed,
      speedY: dy * speed,
      tailLength: 6 + Math.floor(Math.random() * 10),
      life: 0,
      maxLife: 40 + Math.random() * 60,
      color: Math.random() > 0.5 ? 0xffffc8 : 0xc8dcff,
    };
  }

  /* ------------------------------------------------------------------ */
  /*  Cleanup                                                            */
  /* ------------------------------------------------------------------ */

  destroy(): void {
    this.destroyed = true;
    this.renderTexture.destroy();
    this.drawGfx.destroy();
    this.stars = [];
    this.dust = [];
    this.shootingStars = [];
  }
}
