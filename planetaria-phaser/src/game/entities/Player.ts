import Phaser from "phaser";
import { PLAYER, WORLD } from "../config";

/**
 * Player.ts
 *
 * Platformer player with horizontal movement, jumping,
 * and gravity. Collides with terrain via the scene.
 *
 * Controls:
 *   A / D  — move left / right
 *   W      — jump (only when on ground)
 */
export default class Player {
    private sprite: Phaser.GameObjects.Sprite;
    private body!: Phaser.Physics.Arcade.Body;
    private keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private facingLeft = false;

    constructor(private scene: Phaser.Scene) {
        this.sprite = this.createSprite();
        this.body = this.setupPhysics();
        this.createAnimations();
        this.keys = this.setupInput();
    }

    // --- Public API -----------------------------------------------------------

    /** Call every frame from the scene's update(). */
    update(): void {
        this.handleMovement();
        this.updateFacing();
        this.updateAnimation();
    }

    /** Expose sprite for camera follow, collision setup, etc. */
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
        // Spawn above the ground floor so the player falls into place
        const spawnX = WORLD.WIDTH / 4;
        const spawnY = WORLD.HEIGHT - 200;

        const sprite = this.scene.add.sprite(
            spawnX,
            spawnY,
            PLAYER.TEXTURE_KEY,
        );
        sprite.setDepth(10);
        sprite.setFrame(PLAYER.IDLE_FRAME);
        return sprite;
    }

    private setupPhysics(): Phaser.Physics.Arcade.Body {
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        // --- Hitbox: narrower than sprite for forgiving platforming ---
        body.setSize(PLAYER.HITBOX_WIDTH, PLAYER.HITBOX_HEIGHT);

        // Center the hitbox horizontally, align to feet vertically
        const offsetX = (PLAYER.FRAME_WIDTH - PLAYER.HITBOX_WIDTH) / 2;
        const offsetY = PLAYER.FRAME_HEIGHT - PLAYER.HITBOX_HEIGHT;
        body.setOffset(offsetX, offsetY);

        body.setCollideWorldBounds(true);

        // --- Gravity is set globally in PhaserGame.tsx config ---
        // The body inherits it automatically. No need to set per-body
        // unless you want a different gravity for this entity.

        return body;
    }

    private createAnimations(): void {
        // Guard: don't recreate if scene restarts
        if (this.scene.anims.exists("player-walk")) return;

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
        if (!keyboard) throw new Error("Keyboard input not available");

        return keyboard.addKeys({
            W: Phaser.Input.Keyboard.KeyCodes.W,
            A: Phaser.Input.Keyboard.KeyCodes.A,
            D: Phaser.Input.Keyboard.KeyCodes.D,
        }) as {
            W: Phaser.Input.Keyboard.Key;
            A: Phaser.Input.Keyboard.Key;
            D: Phaser.Input.Keyboard.Key;
        };
    }

    /**
     * Horizontal movement + jump logic.
     *
     * Key differences from top-down:
     *   - Only A/D control horizontal velocity
     *   - Vertical velocity is controlled by gravity + jump impulse
     *   - Jump only allowed when touching ground (body.blocked.down)
     *   - No diagonal normalization needed (gravity handles Y)
     */
    private handleMovement(): void {
        // --- Horizontal ---
        if (this.keys.A.isDown) {
            this.body.setVelocityX(-PLAYER.SPEED);
        } else if (this.keys.D.isDown) {
            this.body.setVelocityX(PLAYER.SPEED);
        } else {
            // No horizontal input — stop immediately (tight controls)
            this.body.setVelocityX(0);
        }

        // --- Jump ---
        // blocked.down = true when standing on a solid surface
        const isOnGround = this.body.blocked.down;

        if (this.keys.W.isDown && isOnGround) {
            this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
        }
    }

    private updateFacing(): void {
        const vx = this.body.velocity.x;

        if (vx < 0 && !this.facingLeft) {
            this.sprite.setFlipX(true);
            this.facingLeft = true;
        } else if (vx > 0 && this.facingLeft) {
            this.sprite.setFlipX(false);
            this.facingLeft = false;
        }
    }

    /**
     * Animation states:
     *   - In air (not on ground) → static idle frame (or jump frame if you have one)
     *   - On ground + moving     → walk animation
     *   - On ground + still      → static idle frame
     */
    private updateAnimation(): void {
        const isOnGround = this.body.blocked.down;
        const isMovingX = Math.abs(this.body.velocity.x) > 0;

        if (!isOnGround) {
            // Airborne — freeze on a single frame
            // Change to a dedicated jump frame if your spritesheet has one
            this.sprite.anims.stop();
            this.sprite.setFrame(PLAYER.IDLE_FRAME);
        } else if (isMovingX) {
            this.sprite.anims.play("player-walk", true);
        } else {
            this.sprite.anims.stop();
            this.sprite.setFrame(PLAYER.IDLE_FRAME);
        }
    }
}
