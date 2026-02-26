import Phaser from "phaser";
import { WORLD, CAMERA } from "../config";
import { GameStarfield } from "../world/GridBackground";
import Terrain from "../world/Terrain";
import Player from "../entities/Player";

/** Texture key for the SS Astra ship in the game world. */
const SHIP_TEXTURE = "game_ss_astra";
const SHIP_ASSET = "assets/ui/ss_astra.png";

/**
 * GameScene.ts
 *
 * Thin orchestrator for a platformer scene.
 * Wires together: background, terrain, player, collisions, camera.
 */
export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private terrain!: Terrain;
  private starfield!: GameStarfield;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    Player.preload(this);
    Terrain.preload();
    this.load.image(SHIP_TEXTURE, SHIP_ASSET);
  }

  create(): void {
    // --- World bounds ---
    this.physics.world.setBounds(0, 0, WORLD.WIDTH, WORLD.HEIGHT);

    // --- Animated starfield background ---
    this.starfield = new GameStarfield(this);

    // --- SS Astra crashed ship (behind terrain) ---
    const shipX = 200;
    const shipY = WORLD.HEIGHT - 32 * 5 - 250;
    const ship = this.add.image(shipX, shipY, SHIP_TEXTURE);
    ship.setScale(0.5);
    ship.setAngle(12);
    ship.setDepth(-5);

    // --- Terrain (Mercury surface) ---
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

  update(_time: number, delta: number): void {
    this.player.update();
    this.starfield.update(delta);

    // Transition to Venus if player reaches end of world
    if (this.player.getSprite().x > WORLD.WIDTH - 100) {
        this.transitionToVenus();
    }
  }

  private transitionToVenus() {
    // Prevent multiple triggers
    if ((this as any).isTransitioning) return;
    (this as any).isTransitioning = true;

    // Unlock Level 2 (Venus) in local storage
    try {
        const STORAGE_KEY = "planetaria_progress";
        const stored = localStorage.getItem(STORAGE_KEY);
        let progress = stored ? JSON.parse(stored) : {};
        progress[2] = "unlocked";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
        console.warn("Failed to save progress in GameScene:", e);
    }

    this.cameras.main.fadeOut(1000, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("VenusIntroScene");
    });
  }
}
