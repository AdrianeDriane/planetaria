import Phaser from "phaser";

/**
 * MarsIntroScene.ts
 *
 * Cinematic introduction to Chapter 4: Mars.
 * The S.S. Astra arrives at the Red Planet to find it fractured and scrambled
 * by the Void Devourer.
 */

const COLORS = {
  VOID_BG: 0x0a0000,      // Deep dark red/black
  MARS_DUST: 0xcc4400,    // Rusty orange
  TEXT_ALERT: 0xff3300,   // Red alert text
  TEXT_BODY: 0xffccaa,    // Pale orange text
  BTN_BG: 0x220500,
  BTN_STROKE: 0xff6600,
};

const FONTS = {
  HEADER: "bold 24px 'Courier New', monospace",
  BODY: "18px 'Courier New', monospace",
  BUTTON: "bold 18px 'Courier New', monospace",
};

export default class MarsIntroScene extends Phaser.Scene {
  private ssAstra!: Phaser.GameObjects.Sprite;
  private mars!: Phaser.GameObjects.Sprite;
  private isTransitioning: boolean = false;

  // Groups
  private spaceLayer!: Phaser.GameObjects.Container;
  private midLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;

  constructor() {
    super("MarsIntroScene");
  }

  preload() {
    this.load.image("riding_ss_astra", "assets/ui/riding_ss_astra.png");
    this.load.image("mars_intro", "assets/ui/mars.png");
    
    if (!this.textures.exists("flare")) {
        const gfx = this.make.graphics({x:0, y:0});
        gfx.fillStyle(0xffffff);
        gfx.fillCircle(4,4,4);
        gfx.generateTexture("flare", 8, 8);
        gfx.destroy();
    }
  }

  create() {
    const { width, height } = this.scale;

    this.spaceLayer = this.add.container(0, 0);
    this.midLayer = this.add.container(0, 0);
    this.uiLayer = this.add.container(0, 0);

    this.createAtmosphere(width, height);
    this.createVisuals(width, height);
    this.createCinematicSequence(width, height);
  }

  /* ------------------------------------------------------------------ */
  /*  Visuals                                                            */
  /* ------------------------------------------------------------------ */

  private createAtmosphere(width: number, height: number) {
    // Background
    const bg = this.add.rectangle(0, 0, width, height, COLORS.VOID_BG).setOrigin(0);
    this.spaceLayer.add(bg);

    // Dusty particles
    for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(0, width);
        const y = Phaser.Math.Between(0, height);
        const dust = this.add.circle(x, y, 1, COLORS.MARS_DUST, 0.5);
        this.spaceLayer.add(dust);

        this.tweens.add({
            targets: dust,
            x: x - 50,
            alpha: 0,
            duration: Phaser.Math.Between(2000, 5000),
            repeat: -1,
            ease: "Linear"
        });
    }
  }

  private createVisuals(width: number, height: number) {
    const centerY = height * 0.45;

    // MARS - Glitchy and ominous
    this.mars = this.add.sprite(width + 200, centerY, "mars_intro");
    this.mars.setDisplaySize(220, 220);
    this.mars.setTint(0xaa4444); // Darkened
    this.midLayer.add(this.mars);

    // Void Static Effect on Mars (Simulating scramble)
    this.tweens.add({
        targets: this.mars,
        alpha: 0.8,
        yoyo: true,
        duration: 100,
        repeat: -1,
        ease: "Stepped" // Jerky flicker
    });

    // SHIP
    this.ssAstra = this.add.sprite(-150, centerY + 80, "riding_ss_astra");
    this.ssAstra.setScale(0.25);
    this.ssAstra.setAngle(15);
    this.midLayer.add(this.ssAstra);

    // Engine Trail
    const particles = this.add.particles(0, 0, "flare", {
        speed: 100,
        scale: { start: 0.3, end: 0 },
        blendMode: 'ADD',
        lifespan: 400,
        follow: this.ssAstra,
        followOffset: { x: -30, y: 5 },
        tint: 0x00ffff
    });
    this.midLayer.add(particles);
    
    // Ensure ship is on top of trail
    this.midLayer.bringToTop(this.ssAstra);
  }

  /* ------------------------------------------------------------------ */
  /*  Cinematic Sequence                                                 */
  /* ------------------------------------------------------------------ */

  private createCinematicSequence(width: number, height: number) {
    // 1. Ship enters
    this.tweens.add({
        targets: this.ssAstra,
        x: width * 0.2,
        duration: 3000,
        ease: "Cubic.out"
    });

    // 2. Mars looms into view
    this.tweens.add({
        targets: this.mars,
        x: width * 0.7,
        duration: 4000,
        ease: "Power2.out",
        delay: 1000
    });

    // 3. UI Sequence
    this.time.delayedCall(2500, () => this.showAlertUI(width, height));
  }

  private showAlertUI(width: number, height: number) {
    // Landscape positioning: Text on left, button on right
    const leftX = width * 0.35;
    const rightX = width * 0.75;
    const centerY = height * 0.78;

    // Warning Header (Top centered)
    const header = this.add.text(width / 2, height * 0.65, "⚠ WARNING: SECTOR UNSTABLE ⚠", {
        font: FONTS.HEADER,
        color: "#ff3300"
    }).setOrigin(0.5).setAlpha(0);
    this.uiLayer.add(header);

    // Narrative (Left side)
    const logText = this.add.text(leftX, centerY, 
        "The Void Devourer has shattered the Planetary Core.\nData streams are fragmented.\n\nMission: REASSEMBLE and DECRYPT.", {
        font: "14px 'Courier New', monospace", // Slightly smaller for fit
        color: "#ffccaa",
        align: "left",
        lineSpacing: 4,
        wordWrap: { width: width * 0.45 }
    }).setOrigin(0.5, 0.5).setAlpha(0);
    this.uiLayer.add(logText);

    // Button (Right side)
    const btnContainer = this.add.container(rightX, centerY).setAlpha(0);
    
    const btnBg = this.add.rectangle(0, 0, 240, 50, COLORS.BTN_BG)
        .setStrokeStyle(3, COLORS.BTN_STROKE);
    
    const btnText = this.add.text(0, 0, "INITIATE DESCENT >>", {
        font: "bold 14px 'Courier New', monospace",
        color: "#ff6600"
    }).setOrigin(0.5);

    btnContainer.add([btnBg, btnText]);
    this.uiLayer.add(btnContainer);

    // Reveal Animations
    this.tweens.add({ targets: header, alpha: 1, duration: 500, yoyo: true, repeat: 3 }); // Flash warning
    this.tweens.add({ targets: header, alpha: 1, duration: 500, delay: 2000 }); // Stay on
    this.tweens.add({ targets: logText, alpha: 1, duration: 1000, delay: 1000 });
    
    this.time.delayedCall(3000, () => {
        this.tweens.add({ targets: btnContainer, alpha: 1, duration: 500 });
        
        btnBg.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                btnBg.setFillStyle(COLORS.BTN_STROKE, 0.2);
                btnText.setColor("#ffffff");
            })
            .on('pointerout', () => {
                btnBg.setFillStyle(COLORS.BTN_BG);
                btnText.setColor("#ff6600");
            })
            .on('pointerdown', () => this.startMission());
    });
  }

  private startMission() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // Shake and Zoom
    this.cameras.main.shake(500, 0.01);
    this.cameras.main.pan(this.mars.x, this.mars.y, 800, 'Power2');
    this.cameras.main.zoomTo(3, 800, 'Power2');

    this.time.delayedCall(800, () => {
        this.scene.start("MarsScene");
    });
  }
}
