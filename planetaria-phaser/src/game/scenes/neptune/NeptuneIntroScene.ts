import Phaser from "phaser";
import { EventBus } from "../../EventBus";

/**
 * NeptuneIntroScene.ts
 *
 * Cinematic introduction for Neptune.
 * Shows the SS Astra arriving at the windy deep blue world.
 */

const COLORS = {
  VOID_OBSIDIAN: 0x01040a,
  NEPTUNE_BLUE: 0x3344bb,
  TECH_CYAN: "#00f2ff",
  TEXT_LOG: "#ccd6f6",
};

export default class NeptuneIntroScene extends Phaser.Scene {
  private spaceLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  private neptune!: Phaser.GameObjects.Sprite;
  private ssAstra!: Phaser.GameObjects.Sprite;
  private narrativeText!: Phaser.GameObjects.Text;
  private letterboxBottom!: Phaser.GameObjects.Rectangle;

  private isSequenceActive: boolean = true;

  constructor() {
    super("NeptuneIntroScene");
  }

  preload(): void {
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.image("neptune_planet", "assets/ui/neptune.png");
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

    // Neptune
    this.neptune = this.add.sprite(width + 200, height * 0.4, "neptune_planet");
    this.neptune.setDisplaySize(260, 260).setAlpha(0);
    this.midLayer.add(this.neptune);

    // Rocketship
    this.ssAstra = this.add.sprite(-300, height * 0.5, "riding_ss_astra");
    this.ssAstra.setScale(0.4); 
    
    // Create Engine Flare Texture
    if (!this.textures.exists("engine_flare_neptune")) {
        const particleGfx = this.make.graphics({x:0, y:0});
        particleGfx.fillStyle(0x00f2ff);
        particleGfx.fillCircle(4,4,4);
        particleGfx.generateTexture('engine_flare_neptune', 8, 8);
        particleGfx.destroy();
    }
    
    // Engine Trail Particles
    const particles = this.add.particles(0, 0, 'engine_flare_neptune', {
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
    this.playText("Sector 8: NEPTUNE. The Windy Deep.");
    
    this.tweens.add({
      targets: this.ssAstra,
      x: width * 0.2,
      duration: 4000,
      ease: "Cubic.easeOut"
    });

    await this.wait(4500);

    this.playText("The winds here reach 2,100 km/h. Hang on tight!");
    
    this.tweens.add({
      targets: this.neptune,
      x: width * 0.65,
      alpha: 1,
      duration: 5000,
      ease: "Power2.easeInOut"
    });

    await this.wait(5500);

    this.playText("We must descend into the storm to find the final core.");
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
    const hint = this.add.text(width / 2, height - 25, ">> TAP TO BRAVE THE STORM <<", {
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

    this.cameras.main.flash(800, 50, 100, 255);
    
    this.tweens.add({
      targets: this.ssAstra,
      alpha: 0,
      scale: 0.1,
      duration: 1000
    });

    this.tweens.add({
      targets: this.neptune,
      x: this.scale.width / 2,
      scale: 3,
      duration: 1500,
      ease: "Cubic.easeIn"
    });

    this.time.delayedCall(1200, () => {
      this.cameras.main.fadeOut(800, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        EventBus.emit("enter-neptune-game");
      });
    });
  }

  private wait(ms: number): Promise<void> {
    return new Promise(resolve => this.time.delayedCall(ms, resolve));
  }
}
