import Phaser from "phaser";
import { PLAYER, WORLD } from "../config";

/**
 * Player.ts
 *
 * Encapsulates all player logic: creation, physics,
 * input handling, animation, and directional facing.
 *
 * Usage in a scene:
 *   this.player = new Player(this);
 *   // in update():
 *   this.player.update();
 */
export default class Player {
    private sprite: Phaser.GameObjects.Sprite;
    private keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        S: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private facingLeft = false;

    constructor(private scene: Phaser.Scene) {
        this.sprite = this.createSprite();
        this.setupPhysics();
        this.createAnimations();
        this.keys = this.setupInput();
    }

    // --- Public API -----------------------------------------------------------

    /** Call this from the scene's update() every frame. */
    update(): void {
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;
        const velocity = this.getInputVector();

        // --- Apply movement ---
        body.setVelocity(velocity.x * PLAYER.SPEED, velocity.y * PLAYER.SPEED);

        // --- Facing direction ---
        this.updateFacing(velocity.x);

        // --- Animation ---
        this.updateAnimation(velocity.length() > 0);
    }

    /** Expose the sprite for camera follow, collisions, etc. */
    getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    /** Load player assets. Call from scene's preload(). */
    static preload(scene: Phaser.Scene): void {
        scene.load.spritesheet(PLAYER.TEXTURE_KEY, PLAYER.SPRITE_PATH, {
            frameWidth: PLAYER.FRAME_WIDTH,
            frameHeight: PLAYER.FRAME_HEIGHT,
        });
    }

    // --- Private ---------------------------------------------------------------

    private createSprite(): Phaser.GameObjects.Sprite {
        const sprite = this.scene.add.sprite(
            WORLD.WIDTH / 2,
            WORLD.HEIGHT / 2,
            PLAYER.TEXTURE_KEY,
        );
        sprite.setDepth(10);
        sprite.setFrame(PLAYER.IDLE_FRAME);
        return sprite;
    }

    private setupPhysics(): void {
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        // Hitbox covers only the bottom portion (feet)
        body.setSize(PLAYER.HITBOX_WIDTH, PLAYER.HITBOX_HEIGHT);
        body.setOffset(0, PLAYER.FRAME_HEIGHT - PLAYER.HITBOX_HEIGHT);
        body.setCollideWorldBounds(true);
    }

    private createAnimations(): void {
        this.scene.anims.create({
            key: "player-walk",
            frames: this.scene.anims.generateFrameNumbers(PLAYER.TEXTURE_KEY, {
                start: PLAYER.WALK_FRAMES.start,
                end: PLAYER.WALK_FRAMES.end,
            }),
            frameRate: PLAYER.WALK_FRAME_RATE,
            repeat: -1,
        });
    }

    private setupInput() {
        const keyboard = this.scene.input.keyboard;

        if (!keyboard) {
            throw new Error("Keyboard input not available");
        }

        return keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            S: Phaser.Input.Keyboard.KeyCodes.S,
            D: Phaser.Input.Keyboard.KeyCodes.D,
        }) as {
            W: Phaser.Input.Keyboard.Key;
            A: Phaser.Input.Keyboard.Key;
            S: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        };
    }

    /**
     * Reads WASD input and returns a normalized velocity vector.
     * Normalization prevents diagonal movement from being ~1.41x faster.
     */
    private getInputVector(): Phaser.Math.Vector2 {
        let x = 0;
        let y = 0;

        if (this.keys.A.isDown) x = -1;
        else if (this.keys.D.isDown) x = 1;

        if (this.keys.W.isDown) y = -1;
        else if (this.keys.S.isDown) y = 1;

        const vector = new Phaser.Math.Vector2(x, y);
        if (vector.length() > 0) vector.normalize();
        return vector;
    }

    private updateFacing(velocityX: number): void {
        if (velocityX < 0 && !this.facingLeft) {
            this.sprite.setFlipX(true);
            this.facingLeft = true;
        } else if (velocityX > 0 && this.facingLeft) {
            this.sprite.setFlipX(false);
            this.facingLeft = false;
        }
    }

    private updateAnimation(isMoving: boolean): void {
        if (isMoving) {
            this.sprite.anims.play("player-walk", true);
        } else {
            this.sprite.anims.stop();
            this.sprite.setFrame(PLAYER.IDLE_FRAME);
        }
    }
}
