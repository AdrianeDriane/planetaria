import Phaser from "phaser";
import { EventBus } from "../EventBus";

// ─── Planet Data ───

interface PlanetOrbitData {
  name: string;
  textureKey: string;
  orbitRadius: number;
  orbitSpeed: number;
  size: number;
  startAngle: number;
  color: number;
}

const PLANETS: PlanetOrbitData[] = [
  {
    name: "Mercury",
    textureKey: "mercury",
    orbitRadius: 55,
    orbitSpeed: 1.6,
    size: 12,
    startAngle: 0,
    color: 0xa8a29e,
  },
  {
    name: "Venus",
    textureKey: "venus",
    orbitRadius: 78,
    orbitSpeed: 1.25,
    size: 16,
    startAngle: 0.8,
    color: 0xfbbf24,
  },
  {
    name: "Earth",
    textureKey: "earth",
    orbitRadius: 102,
    orbitSpeed: 1.0,
    size: 18,
    startAngle: 2.1,
    color: 0x4ade80,
  },
  {
    name: "Mars",
    textureKey: "mars",
    orbitRadius: 124,
    orbitSpeed: 0.82,
    size: 14,
    startAngle: 3.5,
    color: 0xfb923c,
  },
  {
    name: "Jupiter",
    textureKey: "jupiter",
    orbitRadius: 158,
    orbitSpeed: 0.55,
    size: 32,
    startAngle: 1.2,
    color: 0xc084fc,
  },
  {
    name: "Saturn",
    textureKey: "saturn",
    orbitRadius: 192,
    orbitSpeed: 0.4,
    size: 28,
    startAngle: 4.5,
    color: 0xfbbf24,
  },
  {
    name: "Uranus",
    textureKey: "uranus",
    orbitRadius: 222,
    orbitSpeed: 0.3,
    size: 22,
    startAngle: 5.8,
    color: 0x7dd3fc,
  },
  {
    name: "Neptune",
    textureKey: "neptune",
    orbitRadius: 248,
    orbitSpeed: 0.24,
    size: 20,
    startAngle: 3.0,
    color: 0x6366f1,
  },
];

interface BGStar {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: number;
}

const STAR_COLORS = [
  0xffffff, 0xc8c8ff, 0xffdcb4, 0xb4b4ff, 0xffb4b4, 0xb4ffdc, 0xdcc8ff,
];

export default class FinalOutroScene extends Phaser.Scene {
  private elapsed: number = 0;
  private planetSprites: Phaser.GameObjects.Sprite[] = [];
  private planetData: PlanetOrbitData[] = [];
  private orbitGraphics!: Phaser.GameObjects.Graphics;
  private sunGlow!: Phaser.GameObjects.Arc;
  private sunCore!: Phaser.GameObjects.Arc;
  private sunHighlight!: Phaser.GameObjects.Arc;
  private centerX: number = 0;
  private centerY: number = 0;
  private bgStars: BGStar[] = [];
  private starRT!: Phaser.GameObjects.RenderTexture;
  private starGfx!: Phaser.GameObjects.Graphics;
  private orbitAlpha: number = 0;
  private planetsRevealed: number = 0;
  private allPlanetsIn: boolean = false;

  constructor() {
    super("FinalOutroScene");
  }

  preload(): void {
    const planetKeys = [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ];
    planetKeys.forEach((key) => {
      if (!this.textures.exists(key)) {
        this.load.image(key, `assets/ui/${key}.png`);
      }
    });
  }

  create(): void {
    const { width, height } = this.scale;

    this.elapsed = 0;
    this.planetSprites = [];
    this.planetData = [...PLANETS];
    this.orbitAlpha = 0;
    this.planetsRevealed = 0;
    this.allPlanetsIn = false;

    this.centerX = width * 0.5;
    this.centerY = height * 0.38;

    this.createParticleTextures();
    this.createStarfield(width, height);

    // Warm color overlay
    const warmOverlay = this.add
      .rectangle(0, 0, width, height, 0x1a0f00, 0)
      .setOrigin(0)
      .setDepth(-5);
    this.tweens.add({
      targets: warmOverlay,
      fillAlpha: 0.12,
      duration: 3000,
      ease: "Sine.easeInOut",
    });

    // Orbit paths
    this.orbitGraphics = this.add.graphics().setDepth(1);

    // Sun
    this.createSun();

    // Planets (initially invisible)
    this.createPlanets();

    // Start sequence
    this.startOutroSequence(width, height);
  }

  update(_time: number, delta: number): void {
    this.elapsed += delta;
    this.updateStarfield();
    this.updateSun();
    this.updatePlanets();
    this.drawOrbitPaths();
  }

  // ─── Particle Textures ───

  private createParticleTextures(): void {
    if (!this.textures.exists("outro_sparkle")) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture("outro_sparkle", 6, 6);
      gfx.destroy();
    }
  }

  // ─── Starfield ───

  private createStarfield(width: number, height: number): void {
    this.starRT = this.add
      .renderTexture(0, 0, width, height)
      .setOrigin(0)
      .setDepth(-10)
      .setScrollFactor(0);

    this.starGfx = this.add.graphics().setVisible(false);

    let seed = 77;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    this.bgStars = [];
    for (let i = 0; i < 250; i++) {
      this.bgStars.push({
        x: rng() * width,
        y: rng() * height,
        size: rng() < 0.7 ? 1 : rng() < 0.9 ? 1.5 : 2,
        baseAlpha: 0.2 + rng() * 0.6,
        twinkleSpeed: 1 + rng() * 3,
        twinkleOffset: rng() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(rng() * STAR_COLORS.length)],
      });
    }
  }

  private updateStarfield(): void {
    const { width, height } = this.scale;
    const time = this.elapsed / 1000;

    this.starRT.clear();
    this.starGfx.clear();

    this.starGfx.fillStyle(0x020210, 1);
    this.starGfx.fillRect(0, 0, width, height);

    // Warm nebula hints
    const a = 0.025;
    this.starGfx.fillStyle(0x2a1a00, a);
    this.starGfx.fillCircle(width * 0.3, height * 0.25, 100);
    this.starGfx.fillStyle(0x1a0a20, a);
    this.starGfx.fillCircle(width * 0.7, height * 0.6, 80);
    this.starGfx.fillStyle(0x0a1a2a, a * 0.8);
    this.starGfx.fillCircle(width * 0.5, height * 0.8, 90);

    for (const s of this.bgStars) {
      const twinkle =
        s.baseAlpha *
        (0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));
      this.starGfx.fillStyle(s.color, twinkle);
      this.starGfx.fillPoint(s.x, s.y, s.size);
    }

    this.starRT.draw(this.starGfx);
  }

  // ─── Sun ───

  private createSun(): void {
    this.sunGlow = this.add
      .circle(this.centerX, this.centerY, 32, 0xfbbf24, 0.12)
      .setDepth(2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0);

    this.sunCore = this.add
      .circle(this.centerX, this.centerY, 16, 0xfde68a, 1)
      .setDepth(3)
      .setScale(0);

    this.sunHighlight = this.add
      .circle(this.centerX - 3, this.centerY - 3, 7, 0xffffff, 0.35)
      .setDepth(4)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setScale(0);
  }

  private updateSun(): void {
    const time = this.elapsed / 1000;

    if (this.sunGlow && this.sunGlow.active) {
      const glowPulse =
        this.sunGlow.scaleX * (1.0 + Math.sin(time * 1.5) * 0.08);
      // Only override scale if sun has appeared
      if (this.sunGlow.scaleX > 0.01) {
        const base = 1.0 + Math.sin(time * 1.5) * 0.08;
        this.sunGlow.setScale(base);
        this.sunGlow.setAlpha(0.1 + Math.sin(time * 2) * 0.04);
      }
    }

    if (this.sunCore && this.sunCore.active && this.sunCore.scaleX > 0.01) {
      const corePulse = 1.0 + Math.sin(time * 2.5) * 0.025;
      this.sunCore.setScale(corePulse);
    }

    if (
      this.sunHighlight &&
      this.sunHighlight.active &&
      this.sunHighlight.scaleX > 0.01
    ) {
      this.sunHighlight.setScale(1.0 + Math.sin(time * 2) * 0.03);
    }
  }

  // ─── Orbit Paths ───

  private drawOrbitPaths(): void {
    this.orbitGraphics.clear();
    if (this.orbitAlpha <= 0) return;

    for (
      let i = 0;
      i < this.planetsRevealed && i < this.planetData.length;
      i++
    ) {
      const planet = this.planetData[i];
      this.orbitGraphics.lineStyle(1, 0x334155, 0.15 * this.orbitAlpha);
      this.orbitGraphics.strokeEllipse(
        this.centerX,
        this.centerY,
        planet.orbitRadius * 2,
        planet.orbitRadius * 2 * 0.55
      );
    }
  }

  // ─── Planets ───

  private createPlanets(): void {
    for (const planet of this.planetData) {
      const sprite = this.add
        .sprite(this.centerX, this.centerY, planet.textureKey)
        .setDepth(5)
        .setAlpha(0)
        .setScale(0);

      this.planetSprites.push(sprite);
    }
  }

  private updatePlanets(): void {
    if (this.planetsRevealed === 0) return;

    const time = this.elapsed / 1000;

    for (
      let i = 0;
      i < this.planetsRevealed && i < this.planetData.length;
      i++
    ) {
      const planet = this.planetData[i];
      const sprite = this.planetSprites[i];

      if (!sprite || !sprite.active || sprite.alpha < 0.01) continue;

      const angle = planet.startAngle + time * planet.orbitSpeed;
      const x = this.centerX + Math.cos(angle) * planet.orbitRadius;
      const y = this.centerY + Math.sin(angle) * planet.orbitRadius * 0.55;

      sprite.setPosition(x, y);

      // Depth-based scaling for pseudo-3D
      const depthFactor = 0.85 + 0.15 * Math.sin(angle);
      const tex = this.textures.get(planet.textureKey);
      const frame = tex.getSourceImage();
      const aspect = frame.height / frame.width;
      sprite.setDisplaySize(
        planet.size * depthFactor,
        planet.size * aspect * depthFactor
      );

      // Z-ordering: planets in front (sin > 0) render above sun
      sprite.setDepth(Math.sin(angle) > 0 ? 6 : 1);
    }
  }

  // ─── Outro Sequence ───

  private startOutroSequence(width: number, height: number): void {
    // Phase 1: Sun appears (delay 500ms)
    this.tweens.add({
      targets: [this.sunGlow, this.sunCore, this.sunHighlight],
      scaleX: 1,
      scaleY: 1,
      duration: 1500,
      ease: "Back.easeOut",
      delay: 500,
    });

    // Phase 2: Title
    const titleText = this.add
      .text(width / 2, height * 0.06, "HARMONY RESTORED", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "11px",
        color: "#fde68a",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 1200,
      delay: 1500,
      ease: "Sine.easeIn",
    });

    // Gentle title pulse
    this.tweens.add({
      targets: titleText,
      alpha: { from: 0.85, to: 1 },
      duration: 2000,
      delay: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Phase 3: Planets appear one by one
    for (let i = 0; i < this.planetData.length; i++) {
      const delay = 2000 + i * 500;
      const planet = this.planetData[i];

      this.time.delayedCall(delay, () => {
        const sprite = this.planetSprites[i];

        // Position at starting angle
        const angle = planet.startAngle;
        const x = this.centerX + Math.cos(angle) * planet.orbitRadius;
        const y = this.centerY + Math.sin(angle) * planet.orbitRadius * 0.55;
        sprite.setPosition(x, y);

        // Set initial display size
        const tex = this.textures.get(planet.textureKey);
        const frame = tex.getSourceImage();
        const aspect = frame.height / frame.width;

        // Fade in
        sprite.setAlpha(0);
        sprite.setDisplaySize(planet.size * 0.3, planet.size * aspect * 0.3);

        this.tweens.add({
          targets: sprite,
          alpha: 1,
          duration: 500,
          ease: "Sine.easeIn",
          onComplete: () => {
            sprite.setDisplaySize(planet.size, planet.size * aspect);
          },
        });

        // Scale up the display size smoothly
        const sizeProxy = { s: 0.3 };
        this.tweens.add({
          targets: sizeProxy,
          s: 1,
          duration: 600,
          ease: "Back.easeOut",
          onUpdate: () => {
            if (sprite.active) {
              sprite.setDisplaySize(
                planet.size * sizeProxy.s,
                planet.size * aspect * sizeProxy.s
              );
            }
          },
        });

        this.planetsRevealed = i + 1;

        // Fade in orbit path
        this.tweens.add({
          targets: this,
          orbitAlpha: 1,
          duration: 800,
        });

        // Sparkle burst
        if (this.textures.exists("outro_sparkle")) {
          const burst = this.add
            .particles(x, y, "outro_sparkle", {
              speed: { min: 15, max: 60 },
              scale: { start: 0.5, end: 0 },
              blendMode: "ADD",
              lifespan: 500,
              tint: planet.color,
              quantity: 5,
              emitting: false,
            })
            .setDepth(10);
          burst.explode(5);
        }

        // Planet name label (briefly)
        const label = this.add
          .text(x, y - planet.size / 2 - 12, planet.name.toUpperCase(), {
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "5px",
            color: `#${planet.color.toString(16).padStart(6, "0")}`,
            align: "center",
          })
          .setOrigin(0.5)
          .setDepth(20)
          .setAlpha(0);

        this.tweens.add({
          targets: label,
          alpha: 1,
          y: y - planet.size / 2 - 18,
          duration: 400,
          yoyo: true,
          hold: 700,
          onComplete: () => label.destroy(),
        });
      });
    }

    // Phase 4: After all planets, show celebration text
    const allDoneDelay = 2000 + this.planetData.length * 500 + 1200;

    this.time.delayedCall(allDoneDelay, () => {
      this.allPlanetsIn = true;
      this.showCelebration(width, height);
    });
  }

  // ─── Celebration ───

  private showCelebration(width: number, height: number): void {
    // Ambient sparkle particles
    if (this.textures.exists("outro_sparkle")) {
      this.add
        .particles(width / 2, height / 2, "outro_sparkle", {
          x: { min: -width * 0.4, max: width * 0.4 },
          y: { min: -height * 0.35, max: height * 0.35 },
          speed: { min: 3, max: 15 },
          scale: { start: 0.35, end: 0 },
          blendMode: "ADD",
          lifespan: { min: 2000, max: 4000 },
          tint: [0xfde68a, 0x4ade80, 0x7dd3fc, 0xfbbf24, 0xc084fc, 0x6366f1],
          frequency: 180,
          quantity: 1,
          alpha: { start: 0.4, end: 0 },
        })
        .setDepth(8);
    }

    // Congratulation message
    const congratsText = this.add
      .text(
        width / 2,
        height * 0.72,
        "The Void Devourer has been vanquished!\nThe planets orbit in peace once more.",
        {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "7px",
          color: "#e2e8f0",
          align: "center",
          lineSpacing: 8,
          wordWrap: { width: width * 0.8 },
        }
      )
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.tweens.add({
      targets: congratsText,
      alpha: 1,
      duration: 1000,
      ease: "Sine.easeIn",
    });

    // Sub message
    const subText = this.add
      .text(
        width / 2,
        height * 0.81,
        "Thank you, brave explorer.\nThe Solar System is safe.",
        {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "6px",
          color: "#94a3b8",
          align: "center",
          lineSpacing: 6,
          wordWrap: { width: width * 0.7 },
        }
      )
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.tweens.add({
      targets: subText,
      alpha: 1,
      duration: 1000,
      delay: 1500,
      ease: "Sine.easeIn",
    });

    // Return button
    this.time.delayedCall(3000, () => {
      this.createOutroButton(
        width / 2,
        height * 0.92,
        "RETURN TO PLANET MAP",
        0xfbbf24,
        () => {
          // Save boss defeated state
          try {
            const STORAGE_KEY = "planetaria_progress";
            const stored = localStorage.getItem(STORAGE_KEY);
            const progress = stored ? JSON.parse(stored) : {};
            progress["bossDefeated"] = true;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
          } catch (e) {
            console.warn("Failed to save boss defeated state:", e);
          }

          // Fade out then emit
          this.cameras.main.fadeOut(800, 0, 0, 0);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            EventBus.emit("outro-complete");
          });
        }
      );
    });
  }

  // ─── Button ───

  private createOutroButton(
    x: number,
    y: number,
    label: string,
    color: number,
    callback: () => void
  ): void {
    const btnWidth = 200;
    const btnHeight = 30;

    const container = this.add.container(x, y).setDepth(33).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.15);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
    bg.lineStyle(2, color);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "6px",
        color: `#${color.toString(16).padStart(6, "0")}`,
        align: "center",
      })
      .setOrigin(0.5);

    const hitZone = this.add
      .rectangle(0, 0, btnWidth, btnHeight)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(color, 0.3);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
      bg.lineStyle(2, color);
      bg.strokeRoundedRect(
        -btnWidth / 2,
        -btnHeight / 2,
        btnWidth,
        btnHeight,
        4
      );
      container.setScale(1.05);
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(color, 0.15);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
      bg.lineStyle(2, color);
      bg.strokeRoundedRect(
        -btnWidth / 2,
        -btnHeight / 2,
        btnWidth,
        btnHeight,
        4
      );
      container.setScale(1);
    });

    hitZone.on("pointerdown", callback);

    container.add([bg, text, hitZone]);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 600,
      ease: "Sine.easeIn",
    });

    // Subtle pulse
    this.tweens.add({
      targets: container,
      scaleX: { from: 1, to: 1.02 },
      scaleY: { from: 1, to: 1.02 },
      duration: 1500,
      delay: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }
}
