import Phaser from "phaser";

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
    }

    update(): void {
        // Animation is handled by Phaser's animation system
    }
}