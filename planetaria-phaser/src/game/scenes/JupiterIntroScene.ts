import Phaser from "phaser";
import { EventBus } from "../EventBus";

/**
 * JupiterIntroScene.ts
 *
 * Cinematic intro before the Jupiter puzzle game.
 */

const COLORS = {
  VOID_OBSIDIAN: 0x01040a,
  TECH_CYAN: "#00f2ff",
  TEXT_LOG: "#ccd6f6",
};

export default class JupiterIntroScene extends Phaser.Scene {
  private ssAstra!: Phaser.GameObjects.Sprite;
  private jupiter!: Phaser.GameObjects.Sprite;
  private narrativeText!: Phaser.GameObjects.Text;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  private isSequenceActive: boolean = true;

  constructor() {
    super("JupiterIntroScene");
  }

  preload(): void {
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.image("jupiter_planet", "assets/ui/jupiter.png");
  }

  create(): void {
    const { width, height } = this.scale;

    this.setupVisuals(width, height);
    this.setupLetterbox(width, height);
    this.startCinematicSequence(width, height);
  }

  private setupVisuals(width: number, height: number): void {
    // Background
    this.add.rectangle(0, 0, width, height, COLORS.VOID_OBSIDIAN).setOrigin(0);

    // Parallax Stars
    for (let i = 0; i < 60; i++) {
      this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 1.5),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.4)
      );
    }

    // Jupiter
    this.jupiter = this.add.sprite(width + 300, height * 0.45, "jupiter_planet");
    this.jupiter.setDisplaySize(350, 350).setAlpha(0);

    // Rocketship
    this.ssAstra = this.add.sprite(-300, height * 0.6, "riding_ss_astra");
    this.ssAstra.setScale(0.4); 
    
    // Engine Trail Particles
    if (!this.textures.exists("engine_flare_jupiter")) {
        const particleGfx = this.make.graphics({x:0, y:0});
        particleGfx.fillStyle(0x00f2ff);
        particleGfx.fillCircle(4,4,4);
        particleGfx.generateTexture('engine_flare_jupiter', 8, 8);
        particleGfx.destroy();
    }
    
    this.add.particles(0, 0, 'engine_flare_jupiter', {
        speed: 100,
        scale: { start: 0.4, end: 0 },
        blendMode: 'ADD',
        lifespan: 500,
        follow: this.ssAstra,
        followOffset: { x: -60, y: 10 }
    });
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
  }

  private async startCinematicSequence(width: number, height: number): Promise<void> {
    this.playText("Sector 5: JUPITER. The King of Planets.");
    
    this.tweens.add({
      targets: this.ssAstra,
      x: width * 0.2,
      duration: 3500,
      ease: "Cubic.easeOut"
    });

    await this.wait(4000);

    this.playText("The Great Red Spot is visible. Detecting core interference...");
    
    this.tweens.add({
      targets: this.jupiter,
      x: width * 0.7,
      alpha: 1,
      duration: 4500,
      ease: "Power2.easeInOut"
    });

    await this.wait(5000);

    this.playText("Gravity well is too strong for direct entry. Searching for orbital core...");
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
    const hint = this.add.text(width / 2, height - 25, ">> TAP TO PROCEED <<", {
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

    this.cameras.main.flash(800, 255, 255, 255);
    
    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        EventBus.emit("enter-jupiter-game");
      });
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
