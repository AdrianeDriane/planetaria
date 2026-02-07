import Phaser from "phaser";
import { WORLD, CAMERA } from "../config";
import { createGridBackground } from "../world/GridBackground";
import Player from "../entities/Player";

/**
 * GameScene.ts
 *
 * Thin orchestrator — delegates all logic to focused modules.
 * This scene wires together the world, player, and camera.
 */
export default class GameScene extends Phaser.Scene {
    private player!: Player;

    constructor() {
        super({ key: "GameScene" });
    }

    preload(): void {
        Player.preload(this);
    }

    create(): void {
        // --- World ---
        this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
        createGridBackground(this);

        // --- Player ---
        this.player = new Player(this);

        // --- Camera ---
        const camera = this.cameras.main;
        camera.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);
        camera.startFollow(this.player.getSprite(), true);
        camera.setLerp(CAMERA.LERP, CAMERA.LERP);
        camera.setDeadzone(CAMERA.DEADZONE_X, CAMERA.DEADZONE_Y);
    }

    update(): void {
        this.player.update();
    }
}
