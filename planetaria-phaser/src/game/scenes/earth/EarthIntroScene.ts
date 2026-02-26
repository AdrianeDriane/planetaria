import Phaser from "phaser";
import { PLAYER } from "../../config";

/**
 * EarthIntroScene.ts
 *
 * A cinematic "movie-style" introduction for Chapter 3.
 * Uses multi-stage camera movements, parallax depth, and dynamic pacing
 * to tell the story of the S.S. Astra's arrival at a corrupted Earth.
 */

const COLORS = {
  VOID_OBSIDIAN: 0x01040a,
  NEBULA_PURPLE: 0x1a0b2e,
  TECH_CYAN: "#00f2ff",
  TEXT_LOG: "#ccd6f6",
  EARTH_VOID: 0x443355,
  EARTH_PURE: 0xffffff,
};

export default class EarthIntroScene extends Phaser.Scene {
  // Groups for depth management
  private spaceLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  // Sprites
  private earth!: Phaser.GameObjects.Sprite;
  private ssAstra!: Phaser.GameObjects.Sprite;
  private narrativeText!: Phaser.GameObjects.Text;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  private isSequenceActive: boolean = true;

  constructor() {
    super("EarthIntroScene");
  }

  preload(): void {
    this.load.spritesheet("player", "assets/game/sprite_2.png", {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT,
    });
    // Load the new composite rocket asset
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.image("ss_astra", "assets/ui/ss_astra.png"); // Keep for particles/fallback
    this.load.spritesheet("earth_spin", "assets/earth.png", {
      frameWidth: 582,
      frameHeight: 582,
    });
  }

  create(): void {
    const { width, height } = this.scale;

    // 1. Initialize Layers (Order = Depth)
    this.spaceLayer = this.add.container(0, 0);
    this.midLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.setupVisuals(width, height);
    this.setupLetterbox(width, height);
    this.startCinematicSequence(width, height);
  }

  /* ------------------------------------------------------------------ */
  /*  Visual Construction                                                */
  /* ------------------------------------------------------------------ */

  private setupVisuals(width: number, height: number): void {
    // Background
    const bg = this.add.rectangle(0, 0, width, height, COLORS.VOID_OBSIDIAN).setOrigin(0);
    this.spaceLayer.add(bg);

    // Parallax Stars
    for (let i = 0; i < 80; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 1.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.spaceLayer.add(star);
    }

    // Earth (Hidden/Small initially)
    this.earth = this.add.sprite(width + 200, height * 0.4, "earth_spin", 0);
    this.earth.setDisplaySize(300, 300).setTint(COLORS.EARTH_VOID).setAlpha(0);
    
    if (!this.anims.exists("earth_spin_cinematic")) {
      this.anims.create({
        key: "earth_spin_cinematic",
        frames: this.anims.generateFrameNumbers("earth_spin", { start: 0, end: 7 }),
        frameRate: 4,
        repeat: -1,
      });
    }
    this.earth.play("earth_spin_cinematic");
    this.midLayer.add(this.earth);

    // Rocketship (Using new asset)
    this.ssAstra = this.add.sprite(-300, height * 0.5, "riding_ss_astra");
    // Initial scale - adjusting based on likely asset size, keeping it cinematic
    this.ssAstra.setScale(0.5); 
    
    // Create Engine Flare Texture
    if (!this.textures.exists("engine_flare")) {
        const particleGfx = this.make.graphics({x:0, y:0});
        particleGfx.fillStyle(0x00f2ff);
        particleGfx.fillCircle(4,4,4);
        particleGfx.generateTexture('engine_flare', 8, 8);
        particleGfx.destroy();
    }
    
    // Engine Trail Particles
    const particles = this.add.particles(0, 0, 'engine_flare', {
        speed: 100,
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        follow: this.ssAstra,
        followOffset: { x: -60, y: 10 } // Adjusted offset for the new sprite
    });

    this.midLayer.add([particles, this.ssAstra]); // Add particles first so they are behind ship
  }

  private setupLetterbox(width: number, height: number): void {
    // Cinematic black bar at bottom for text
    const barHeight = height * 0.22;
    this.letterboxBottom = this.add.rectangle(0, height - barHeight, width, barHeight, 0x000000, 0.9).setOrigin(0);
    
    this.narrativeText = this.add.text(width / 2, height - (barHeight / 2), "", {
      font: "italic 18px 'Courier New'",
      color: COLORS.TEXT_LOG,
      align: "center",
      wordWrap: { width: width - 80 }
    }).setOrigin(0.5);

    this.uiLayer.add([this.letterboxBottom, this.narrativeText]);
  }

  /* ------------------------------------------------------------------ */
  /*  Cinematic Sequence                                                 */
  /* ------------------------------------------------------------------ */

  private async startCinematicSequence(width: number, height: number): Promise<void> {
    // Stage 1: The Approach
    // Ship flies in from left, engines burning
    this.playText("Approaching Earth sector... It's so quiet out here.");
    
    this.tweens.add({
      targets: this.ssAstra,
      x: width * 0.25,
      y: height * 0.45,
      duration: 4000,
      ease: "Cubic.easeOut"
    });

    await this.wait(4500);

    // Stage 2: The Revelation
    // Camera "pans" by moving the Earth in
    this.playText("Look! There is our home... Planet Earth.");
    
    this.tweens.add({
      targets: this.earth,
      x: width * 0.65,
      alpha: 1,
      duration: 5000, // Slow, majestic reveal
      ease: "Power2.easeInOut"
    });

    // Ship drifts slightly back into foreground, creating parallax
    this.tweens.add({
        targets: this.ssAstra,
        scale: 0.4, // Slight zoom out relative to Earth
        x: width * 0.15,
        duration: 5000,
        ease: "Power2.easeInOut"
    });

    await this.wait(5500);

    // Stage 3: The Corruption
    // Earth pulses, tense realization
    this.playText("Oh no! The Void Shadows are hurting it!");
    
    this.tweens.add({
      targets: this.earth,
      tint: 0x221133,
      duration: 2000,
      yoyo: true,
      repeat: 1
    });

    await this.wait(3500);

    // Stage 4: User Action
    this.playText("Quick! Let's boost the signal to save our home!");
    this.createInteractionHint(width, height);
  }

  /* ------------------------------------------------------------------ */
  /*  Helpers                                                            */
  /* ------------------------------------------------------------------ */

  private playText(msg: string): void {
    this.narrativeText.setText("");
    let i = 0;
    this.time.addEvent({
      delay: 40,
      repeat: msg.length - 1,
      callback: () => {
        this.narrativeText.setText(msg.substring(0, i + 1));
        i++;
      }
    });
  }

  private createInteractionHint(width: number, height: number): void {
    const hint = this.add.text(width / 2, height - 25, ">> TAP PLANET TO ENGAGE <<", {
      font: "bold 14px 'Courier New'",
      color: COLORS.TECH_CYAN
    }).setOrigin(0.5).setAlpha(0);

    this.tweens.add({
      targets: hint,
      alpha: 1,
      yoyo: true,
      repeat: -1,
      duration: 800
    });

    this.input.once("pointerdown", () => this.finalTransition());
  }

  private finalTransition(): void {
    if (!this.isSequenceActive) return;
    this.isSequenceActive = false;

    // Cinematic "Push" Transition - Interstellar style hard cut/zoom
    this.cameras.main.flash(800, 255, 255, 255);
    
    // Zoom ship away and Earth in rapidly
    this.tweens.add({
      targets: this.ssAstra,
      alpha: 0,
      scale: 0.1,
      duration: 1000
    });

    this.tweens.add({
      targets: this.earth,
      x: this.scale.width / 2,
      scale: 3,
      tint: COLORS.EARTH_PURE,
      duration: 1500,
      ease: "Cubic.easeIn"
    });

    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("EarthScene");
      });
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
