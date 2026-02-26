import Phaser from "phaser";

/**
 * EarthCongratulationScene.ts
 *
 * A cinematic dedication to Earth's restoration.
 * Slow-paced, majestic, and focused on the scale of the achievement.
 */

const COLORS = {
  VOID_BG: 0x000000,
  TEXT_HEADER: 0x00ffcc,
  TEXT_BODY: 0xffffff,
  BTN_BG: 0x000000,
  BTN_STROKE: 0x00ffcc,
};

const FONTS = {
  HEADER: "bold 26px 'Courier New', monospace",
  BODY: "italic 16px 'Courier New', monospace",
  BUTTON: "bold 18px 'Courier New', monospace",
};

export default class EarthCongratulationScene extends Phaser.Scene {
  private ssAstra!: Phaser.GameObjects.Sprite;
  private earth!: Phaser.GameObjects.Sprite;
  private isTransitioning: boolean = false;

  constructor() {
    super("EarthCongratulationScene");
  }

  preload() {
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.spritesheet("earth_spin", "assets/earth.png", {
      frameWidth: 582,
      frameHeight: 582,
    });
    if (!this.textures.exists("flare")) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffffff);
      gfx.fillCircle(4, 4, 4);
      gfx.generateTexture("flare", 8, 8);
      gfx.destroy();
    }
  }

  create() {
    const { width, height } = this.scale;

    this.createStarfield(width, height);
    this.createVisuals(width, height);
    this.createCinematicUI(width, height);
  }

  /* ------------------------------------------------------------------ */
  /*  Composition                                                        */
  /* ------------------------------------------------------------------ */

  private createStarfield(width: number, height: number) {
    this.add.rectangle(0, 0, width, height, COLORS.VOID_BG).setOrigin(0);

    // Stars fade in slowly for atmosphere
    for (let i = 0; i < 80; i++) {
      const x = Phaser.Math.Between(0, width);
      const y = Phaser.Math.Between(0, height);
      const alpha = Phaser.Math.FloatBetween(0.2, 0.8);
      const star = this.add.circle(x, y, 1, 0xffffff, 0); // Start invisible

      this.tweens.add({
        targets: star,
        alpha: alpha,
        duration: 3000,
        delay: Phaser.Math.Between(0, 2000),
        ease: "Sine.easeInOut",
      });
    }
  }

  private createVisuals(width: number, height: number) {
    const centerY = height * 0.4;

    // EARTH - Majestic and Slow
    this.earth = this.add.sprite(width / 2, centerY, "earth_spin", 0);
    this.earth.setDisplaySize(200, 200); // Slightly larger for impact
    this.earth.setAlpha(0);
    this.earth.setTint(0xaaddff); // Brighter, purer blue

    this.anims.create({
      key: "earth_majestic_spin",
      frames: this.anims.generateFrameNumbers("earth_spin", {
        start: 0,
        end: 7,
      }),
      frameRate: 2, // Very slow spin
      repeat: -1,
    });
    this.earth.play("earth_majestic_spin");

    // SHIP - Tiny against the planet
    this.ssAstra = this.add.sprite(-100, centerY + 60, "riding_ss_astra");
    this.ssAstra.setScale(0.18); // Much smaller
    this.ssAstra.setAngle(10); // Banking

    // Engine Trail
    this.add.particles(0, 0, "flare", {
      speed: 80,
      scale: { start: 0.2, end: 0 },
      blendMode: "ADD",
      lifespan: 600,
      follow: this.ssAstra,
      followOffset: { x: -25, y: 4 },
      tint: 0x00ffff,
    });

    // --- CINEMATIC TIMELINE ---

    // 1. Earth Fade In (Dramatic Reveal) - 4 seconds
    this.tweens.add({
      targets: this.earth,
      alpha: 1,
      duration: 4000,
      delay: 500,
      ease: "Power2.inOut",
    });

    // 2. Ship Drift (Slow fly-by) - 8 seconds
    this.tweens.add({
      targets: this.ssAstra,
      x: width / 2 - 40,
      y: centerY + 50,
      duration: 8000,
      delay: 2000,
      ease: "Cubic.out",
    });

    // 3. Subtle Earth Pan (Camera movement feel)
    this.tweens.add({
      targets: this.earth,
      y: centerY - 10,
      duration: 10000,
      ease: "Sine.inOut",
    });
  }

  private createCinematicUI(width: number, height: number) {
    // Landscape positioning
    const leftX = width * 0.25;
    const rightX = width * 0.75;
    const bottomY = height * 0.82;

    // --- HEADER (Top center) ---
    const headerText = this.add
      .text(width / 2, height * 0.15, "EARTH: RESTORED", {
        font: FONTS.HEADER,
        color: "#00ffcc",
        letterSpacing: 2,
      })
      .setOrigin(0.5)
      .setAlpha(0);

    // --- LOG (Left side bottom) ---
    const logText = this.add
      .text(
        leftX,
        bottomY,
        "The silence of the Void has been broken.\nEarth breathes once more.\n\nIncoming Signal: MARS SECTOR...",
        {
          font: "italic 13px 'Courier New', monospace",
          color: "#ffffff",
          align: "left",
          lineSpacing: 4,
          wordWrap: { width: width * 0.45 }
        }
      )
      .setOrigin(0.5)
      .setAlpha(0);

    // --- BUTTON (Right side bottom) ---
    const btnContainer = this.add.container(rightX, bottomY).setAlpha(0);

    const btnBg = this.add
      .rectangle(0, 0, 260, 48, COLORS.BTN_BG)
      .setStrokeStyle(2, COLORS.BTN_STROKE);

    const btnText = this.add
      .text(0, 0, "INITIATE WARP TO MARS", {
        font: "bold 15px 'Courier New', monospace",
        color: "#00ffcc",
      })
      .setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);

    // --- UI SEQUENCING (Delayed for effect) ---

    // Header fades in after Earth is visible
    this.time.delayedCall(5000, () => {
      this.tweens.add({ targets: headerText, alpha: 1, duration: 2000 });
    });

    // Narrative text fades in slowly
    this.time.delayedCall(8000, () => {
      this.tweens.add({ targets: logText, alpha: 1, duration: 2000 });
    });

    // Action button appears last
    this.time.delayedCall(11000, () => {
      this.tweens.add({ targets: btnContainer, alpha: 1, duration: 1000 });

      // Interactive Logic
      btnBg
        .setInteractive({ useHandCursor: true })
        .on("pointerover", () => {
          btnBg.setFillStyle(COLORS.BTN_STROKE, 0.1);
          btnText.setColor("#ffffff");
        })
        .on("pointerout", () => {
          btnBg.setFillStyle(COLORS.BTN_BG);
          btnText.setColor("#00ffcc");
        })
        .on("pointerdown", () => this.warpToMars());
    });
  }

  private warpToMars() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    const { width } = this.scale;

    // 1. Ship blasts off rapidly
    this.tweens.add({
      targets: this.ssAstra,
      x: width + 300,
      scale: 0.05,
      duration: 500,
      ease: "Expo.in",
    });

    // 2. Cinematic Flash
    this.cameras.main.flash(1000, 255, 255, 255);

        this.time.delayedCall(1000, () => {
            this.scene.start("MarsIntroScene");
        });  }
}
