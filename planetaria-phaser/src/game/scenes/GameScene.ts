import Phaser from "phaser";
import { WORLD, CAMERA } from "../config";
import { createGridBackground } from "../world/GridBackground";
import Terrain from "../world/Terrain";
import Player from "../entities/Player";

/**
 * GameScene.ts
 *
 * Thin orchestrator for a platformer scene.
 * Wires together: background, terrain, player, collisions, camera.
 */
export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private terrain!: Terrain;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    Player.preload(this);
    Terrain.preload();
  }

  create(): void {
    // --- World bounds ---
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    // --- Background (visual only, no collision) ---
    createGridBackground(this);

    // --- Terrain (solid ground + platforms) ---
    this.terrain = new Terrain(this);

    // --- Player ---
    this.player = new Player(this);

    // --- Collision: player lands on terrain ---
    this.physics.add.collider(this.player.getSprite(), this.terrain.getGroup());

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
