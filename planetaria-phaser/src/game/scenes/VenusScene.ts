import Phaser from "phaser";
import { EventBus } from "../EventBus";

/**
 * VenusScene.ts
 *
 * Scene for the Venus chapter featuring animated background sprite.
 * Displays the acid clouds and atmosphere of Venus with looping animation.
 */
export default class VenusScene extends Phaser.Scene {
    private backgroundSprite!: Phaser.GameObjects.Sprite;

    constructor() {
        super({ key: "VenusScene" });
    }

    preload(): void {
        // Preload Venus background spritesheet
        // Expected: spritesheet with multiple frames of animated clouds/haze
        // Each frame should be 1376x768 pixels
        this.load.spritesheet("venus-bg", "assets/venus_background.png", {
            frameWidth: 1376,
            frameHeight: 768,
        });
    }

    create(): void {
        // --- Create animated background sprite (NOT physics sprite) ---
        this.backgroundSprite = this.add.sprite(0, 0, "venus-bg", 0);
        this.backgroundSprite.setOrigin(0, 0);

        // --- Create animation from spritesheet frames ---
        if (!this.anims.exists("venus-haze-loop")) {
            this.anims.create({
                key: "venus-haze-loop",
                frames: this.anims.generateFrameNumbers("venus-bg"), // Auto-detects all frames
                frameRate: 10,
                repeat: -1, // Loop infinitely
            });
        }

        // --- Play the animation ---
        this.backgroundSprite.play("venus-haze-loop");

        // --- Camera (match your game dimensions) ---
        const camera = this.cameras.main;
        camera.setBounds(0, 0, 1376, 768);
        camera.setBackgroundColor(0xd4a574);

        // --- MISSION COMPLETE UI ---
        this.time.delayedCall(5000, () => {
            this.showMissionComplete();
        });
    }

    private showMissionComplete() {
        const { width, height } = this.scale;
        const panel = this.add.container(width / 2, height / 2).setAlpha(0);

        const bg = this.add.rectangle(0, 0, 300, 150, 0x000000, 0.8).setStrokeStyle(2, 0xffaa00);
        const title = this.add.text(0, -40, "VENUS DATA COLLECTED", {
            font: "bold 16px 'Courier New'",
            color: "#ffaa00"
        }).setOrigin(0.5);

        const desc = this.add.text(0, 0, "Atmospheric analysis complete.\nCore fragment located.\n\nProceeding to EARTH SECTOR...", {
            font: "12px 'Courier New'",
            color: "#ffffff",
            align: "center"
        }).setOrigin(0.5);

        const btn = this.add.rectangle(0, 50, 180, 30, 0xffaa00).setInteractive({ useHandCursor: true });
        const btnText = this.add.text(0, 50, "INITIATE WARP", {
            font: "bold 12px 'Courier New'",
            color: "#000000"
        }).setOrigin(0.5);

        panel.add([bg, title, desc, btn, btnText]);

        this.tweens.add({
            targets: panel,
            alpha: 1,
            duration: 1000
        });

        btn.on("pointerdown", () => {
            this.cameras.main.fadeOut(1000, 0, 0, 0);
            this.cameras.main.once("camerafadeoutcomplete", () => {
                EventBus.emit("venus-complete");
            });
        });
    }

    update(): void {
        // Animation is handled by Phaser's animation system
    }
}
