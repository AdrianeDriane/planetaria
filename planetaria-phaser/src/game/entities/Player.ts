import Phaser from "phaser";
import { PLAYER, WORLD } from "../config";

/**
 * Player.ts
 *
 * Platformer player with full animation state machine:
 *   IDLE → WALK → JUMP_LAUNCH → RISING → FALLING → LANDING → IDLE
 *
 * Controls:
 *   A / D  — move left / right
 *   W      — jump (only when grounded)
 */

// =========================================================================
// Animation State Machine
// =========================================================================
// Each state maps to specific sprite frames and transition rules.
// This keeps updateAnimation() clean — it just reads the current
// state and decides what to show, rather than juggling booleans.
// =========================================================================
enum PlayerState {
    IDLE,
    WALKING,
    JUMP_LAUNCH, // brief: tucking feet before leaving ground
    RISING, // moving upward after launch
    FALLING, // past apex, moving downward
    LANDING, // brief: impact frame after touching ground
}

export default class Player {
    private sprite: Phaser.GameObjects.Sprite;
    private body!: Phaser.Physics.Arcade.Body;
    private keys: {
        W: Phaser.Input.Keyboard.Key;
        A: Phaser.Input.Keyboard.Key;
        D: Phaser.Input.Keyboard.Key;
    };
    private facingLeft = false;
    private state: PlayerState = PlayerState.IDLE;

    // Timer for brief transitional states (launch / landing)
    private stateTimer: Phaser.Time.TimerEvent | null = null;

    constructor(private scene: Phaser.Scene) {
        this.sprite = this.createSprite();
        this.body = this.setupPhysics();
        this.createAnimations();
        this.keys = this.setupInput();
    }

    // --- Public API -----------------------------------------------------------

    update(): void {
        this.handleMovement();
        this.updateFacing();
        this.updateState();
        this.updateAnimation();
    }

    getSprite(): Phaser.GameObjects.Sprite {
        return this.sprite;
    }

    static preload(scene: Phaser.Scene): void {
        scene.load.spritesheet(PLAYER.TEXTURE_KEY, PLAYER.SPRITE_PATH, {
            frameWidth: PLAYER.FRAME_WIDTH,
            frameHeight: PLAYER.FRAME_HEIGHT,
        });
    }

    // --- Private: Setup --------------------------------------------------------

    private createSprite(): Phaser.GameObjects.Sprite {
        const spawnX = WORLD.WIDTH / 4;
        const spawnY = WORLD.HEIGHT - 200;

        const sprite = this.scene.add.sprite(
            spawnX,
            spawnY,
            PLAYER.TEXTURE_KEY,
        );
        sprite.setDepth(10);
        sprite.setFrame(PLAYER.IDLE_FRAMES.a);
        return sprite;
    }

    private setupPhysics(): Phaser.Physics.Arcade.Body {
        this.scene.physics.add.existing(this.sprite);
        const body = this.sprite.body as Phaser.Physics.Arcade.Body;

        body.setSize(PLAYER.HITBOX_WIDTH, PLAYER.HITBOX_HEIGHT);

        const offsetX = (PLAYER.FRAME_WIDTH - PLAYER.HITBOX_WIDTH) / 2;
        const offsetY = PLAYER.FRAME_HEIGHT - PLAYER.HITBOX_HEIGHT;
        body.setOffset(offsetX, offsetY);

        body.setCollideWorldBounds(true);

        return body;
    }

    private createAnimations(): void {
        if (this.scene.anims.exists("player-idle")) return;

        // --- Idle: alternates between frame 0 and frame 12 ---
        this.scene.anims.create({
            key: "player-idle",
            frames: [
                { key: PLAYER.TEXTURE_KEY, frame: PLAYER.IDLE_FRAMES.a },
                { key: PLAYER.TEXTURE_KEY, frame: PLAYER.IDLE_FRAMES.b },
            ],
            frameRate: PLAYER.IDLE_FRAME_RATE,
            repeat: -1,
        });

        // --- Walk: frames 0-7 ---
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

    // --- Private: Movement -----------------------------------------------------

    private handleMovement(): void {
        // --- Horizontal (always allowed, even in air) ---
        if (this.keys.A.isDown) {
            this.body.setVelocityX(-PLAYER.SPEED);
        } else if (this.keys.D.isDown) {
            this.body.setVelocityX(PLAYER.SPEED);
        } else {
            this.body.setVelocityX(0);
        }

        // --- Jump (only from ground, not during landing) ---
        const isOnGround = this.body.blocked.down;

        if (
            this.keys.W.isDown &&
            isOnGround &&
            this.state !== PlayerState.JUMP_LAUNCH &&
            this.state !== PlayerState.LANDING
        ) {
            this.enterState(PlayerState.JUMP_LAUNCH);
        }
    }

    // --- Private: State Machine ------------------------------------------------

    /**
     * Transitions to a new state. Handles cleanup of the
     * previous state and setup of the new one.
     */
    private enterState(newState: PlayerState): void {
        // Clean up any running timer from previous state
        if (this.stateTimer) {
            this.stateTimer.destroy();
            this.stateTimer = null;
        }

        this.state = newState;

        switch (newState) {
            case PlayerState.JUMP_LAUNCH:
                // Show tuck frame briefly, THEN apply jump velocity
                this.sprite.anims.stop();
                this.sprite.setFrame(PLAYER.JUMP_LAUNCH_FRAME);

                this.stateTimer = this.scene.time.delayedCall(
                    PLAYER.LAUNCH_DURATION,
                    () => {
                        // Actually leave the ground after the tuck frame
                        this.body.setVelocityY(PLAYER.JUMP_VELOCITY);
                        this.enterState(PlayerState.RISING);
                    },
                );
                break;

            case PlayerState.LANDING:
                // Show landing frame briefly, then return to idle/walk
                this.sprite.anims.stop();
                this.sprite.setFrame(PLAYER.LAND_FRAME);

                this.stateTimer = this.scene.time.delayedCall(
                    PLAYER.LAND_DURATION,
                    () => {
                        // After landing animation, check what to do next
                        const isMoving = Math.abs(this.body.velocity.x) > 0;
                        this.enterState(
                            isMoving ? PlayerState.WALKING : PlayerState.IDLE,
                        );
                    },
                );
                break;

            case PlayerState.RISING:
            case PlayerState.FALLING:
            case PlayerState.IDLE:
            case PlayerState.WALKING:
                // These states don't need timers — they transition
                // based on physics checks in updateState()
                break;
        }
    }

    /**
     * Called every frame. Checks physics conditions and
     * transitions between states automatically.
     *
     * State flow:
     *
     *   IDLE ──(moving)──→ WALKING
     *   WALKING ──(stop)──→ IDLE
     *   IDLE/WALKING ──(jump)──→ JUMP_LAUNCH
     *   JUMP_LAUNCH ──(timer)──→ RISING
     *   RISING ──(vy > 0)──→ FALLING
     *   FALLING ──(on ground)──→ LANDING
     *   LANDING ──(timer)──→ IDLE/WALKING
     */
    private updateState(): void {
        const isOnGround = this.body.blocked.down;
        const isMovingX = Math.abs(this.body.velocity.x) > 0;
        const vy = this.body.velocity.y;

        switch (this.state) {
            case PlayerState.IDLE:
                if (!isOnGround) {
                    // Walked off an edge
                    this.enterState(PlayerState.FALLING);
                } else if (isMovingX) {
                    this.enterState(PlayerState.WALKING);
                }
                break;

            case PlayerState.WALKING:
                if (!isOnGround) {
                    // Walked off an edge
                    this.enterState(PlayerState.FALLING);
                } else if (!isMovingX) {
                    this.enterState(PlayerState.IDLE);
                }
                break;

            case PlayerState.JUMP_LAUNCH:
                // Handled by timer in enterState — don't interrupt
                break;

            case PlayerState.RISING:
                if (vy >= 0) {
                    // Past the apex — start falling
                    this.enterState(PlayerState.FALLING);
                }
                break;

            case PlayerState.FALLING:
                if (isOnGround) {
                    this.enterState(PlayerState.LANDING);
                }
                break;

            case PlayerState.LANDING:
                // Handled by timer in enterState — don't interrupt
                break;
        }
    }

    // --- Private: Facing -------------------------------------------------------

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

    // --- Private: Animation ----------------------------------------------------

    /**
     * Maps each state to its visual representation.
     * Static frames use setFrame(). Loops use anims.play().
     *
     *   State         │ Visual
     *   ──────────────┼──────────────────────────
     *   IDLE          │ idle anim (frames 0, 12)
     *   WALKING       │ walk anim (frames 0-7)
     *   JUMP_LAUNCH   │ static frame 8
     *   RISING        │ static frame 9
     *   FALLING       │ static frame 10
     *   LANDING       │ static frame 11
     */
    private updateAnimation(): void {
        switch (this.state) {
            case PlayerState.IDLE:
                this.sprite.anims.play("player-idle", true);
                break;

            case PlayerState.WALKING:
                this.sprite.anims.play("player-walk", true);
                break;

            case PlayerState.RISING:
                this.sprite.anims.stop();
                this.sprite.setFrame(PLAYER.JUMP_RISE_FRAME);
                break;

            case PlayerState.FALLING:
                this.sprite.anims.stop();
                this.sprite.setFrame(PLAYER.FALL_FRAME);
                break;

            // JUMP_LAUNCH and LANDING frames are set in enterState()
            // so they don't get overwritten here every frame
            case PlayerState.JUMP_LAUNCH:
            case PlayerState.LANDING:
                break;
        }
    }
}
