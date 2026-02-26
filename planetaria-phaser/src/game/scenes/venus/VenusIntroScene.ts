import Phaser from "phaser";
import { EventBus } from "../../EventBus";

/**
 * VenusIntroScene.ts
 *
 * Cinematic introduction for Venus.
 * Shows the SS Astra entering the thick acid clouds.
 */

const COLORS = {
  VOID_OBSIDIAN: 0x01040a,
  VENUS_AMBER: 0xffcc33,
  TECH_CYAN: "#00f2ff",
  TEXT_LOG: "#ffddaa",
  VENUS_PURE: 0xffffff,
};

export default class VenusIntroScene extends Phaser.Scene {
  private spaceLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  private venus!: Phaser.GameObjects.Sprite;
  private ssAstra!: Phaser.GameObjects.Sprite;
  private narrativeText!: Phaser.GameObjects.Text;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  private isSequenceActive: boolean = true;

  constructor() {
    super("VenusIntroScene");
  }

  preload(): void {
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.image("venus_planet", "assets/ui/venus.png");
  }

  create(): void {
    const { width, height } = this.scale;

    this.spaceLayer = this.add.container(0, 0);
    this.midLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.setupVisuals(width, height);
    this.setupLetterbox(width, height);
    this.startCinematicSequence(width, height);
  }

  private setupVisuals(width: number, height: number): void {
    // Background
    const bg = this.add.rectangle(0, 0, width, height, COLORS.VOID_OBSIDIAN).setOrigin(0);
    this.spaceLayer.add(bg);

    // Parallax Stars
    for (let i = 0; i < 60; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 1.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
      this.spaceLayer.add(star);
    }

    // Venus
    this.venus = this.add.sprite(width + 200, height * 0.45, "venus_planet");
    this.venus.setDisplaySize(250, 250).setAlpha(0);
    this.midLayer.add(this.venus);

    // Rocketship
    this.ssAstra = this.add.sprite(-300, height * 0.55, "riding_ss_astra");
    this.ssAstra.setScale(0.4); 
    
    // Create Engine Flare Texture
    if (!this.textures.exists("engine_flare_venus")) {
        const particleGfx = this.make.graphics({x:0, y:0});
        particleGfx.fillStyle(0x00f2ff);
        particleGfx.fillCircle(4,4,4);
        particleGfx.generateTexture('engine_flare_venus', 8, 8);
        particleGfx.destroy();
    }
    
    // Engine Trail Particles
    const particles = this.add.particles(0, 0, 'engine_flare_venus', {
        speed: 100,
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        follow: this.ssAstra,
        followOffset: { x: -60, y: 10 }
    });

    this.midLayer.add([particles, this.ssAstra]);
  }

  private setupLetterbox(width: number, height: number): void {
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

  private async startCinematicSequence(width: number, height: number): Promise<void> {
    this.playText("Sector 2: VENUS. The Morning Star is blinding.");
    
    this.tweens.add({
      targets: this.ssAstra,
      x: width * 0.2,
      duration: 3500,
      ease: "Cubic.easeOut"
    });

    await this.wait(4000);

    this.playText("The acid clouds are thickening. Scanners are struggling.");
    
    this.tweens.add({
      targets: this.venus,
      x: width * 0.7,
      alpha: 1,
      duration: 4500,
      ease: "Power2.easeInOut"
    });

    await this.wait(5000);

    this.playText("We need to dive deep to find the core fragment.");
    this.createInteractionHint(width, height);
  }

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
    const hint = this.add.text(width / 2, height - 25, ">> TAP TO INITIATE DESCENT <<", {
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

    this.cameras.main.flash(800, 255, 200, 100);
    
    this.tweens.add({
      targets: this.ssAstra,
      alpha: 0,
      scale: 0.1,
      duration: 1000
    });

    this.tweens.add({
      targets: this.venus,
      x: this.scale.width / 2,
      scale: 4,
      tint: 0xffaa00,
      duration: 1500,
      ease: "Cubic.easeIn"
    });

    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        EventBus.emit("enter-venus-game");
      });
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
