import Phaser from "phaser";
import { WORLD, TERRAIN } from "../config";

/**
 * Terrain.ts
 *
 * Generates solid ground tiles that the player collides with.
 * Creates a procedural terrain layout with platforms at various heights.
 *
 * Returns a static physics group that the scene uses for collision.
 */
export default class Terrain {
    private group: Phaser.Physics.Arcade.StaticGroup;

    constructor(private scene: Phaser.Scene) {
        this.group = this.scene.physics.add.staticGroup();
        this.generateTexture();
        this.buildTerrain();
    }

    /** Expose the static group for collision setup in GameScene. */
    getGroup(): Phaser.Physics.Arcade.StaticGroup {
        return this.group;
    }

    /** Generate the ground tile texture. Call-free if already cached. */
    static preload(scene: Phaser.Scene): void {
        // We generate the texture at runtime, no file to load.
        // This method exists to keep the preload pattern consistent.
        // If you have a tileset PNG, load it here instead:
        // scene.load.image(TERRAIN.TEXTURE_KEY, "assets/ground.png");
    }

    // --- Private ---------------------------------------------------------------

    /**
     * Procedurally generates a 32x32 ground tile texture.
     * Includes a darker body, lighter grass-like top edge,
     * and a subtle border for visual definition.
     */
    private generateTexture(): void {
        if (this.scene.textures.exists(TERRAIN.TEXTURE_KEY)) return;

        const size = TERRAIN.TILE_SIZE;
        const graphics = this.scene.add.graphics();

        // --- Dirt body ---
        graphics.fillStyle(TERRAIN.COLOR, 1);
        graphics.fillRect(0, 0, size, size);

        // --- Grass top (4px strip) ---
        graphics.fillStyle(TERRAIN.SURFACE_COLOR, 1);
        graphics.fillRect(0, 0, size, 4);

        // --- Subtle border ---
        graphics.lineStyle(1, TERRAIN.BORDER_COLOR, 0.6);
        graphics.strokeRect(0, 0, size, size);

        // --- Some dirt speckles for texture ---
        graphics.fillStyle(TERRAIN.BORDER_COLOR, 0.3);
        graphics.fillRect(8, 12, 2, 2);
        graphics.fillRect(20, 8, 2, 2);
        graphics.fillRect(14, 22, 2, 2);
        graphics.fillRect(6, 26, 2, 2);
        graphics.fillRect(24, 18, 2, 2);

        graphics.generateTexture(TERRAIN.TEXTURE_KEY, size, size);
        graphics.destroy();
    }

    /**
     * Builds the world terrain layout.
     *
     * Terrain is defined as a simple map:
     *   - Ground floor spans the entire world width
     *   - Platforms at various heights for jumping
     *
     * Each tile is a static physics body (immovable).
     */
    private buildTerrain(): void {
        const { WIDTH, TILE_SIZE } = WORLD;
        const groundY = WORLD.HEIGHT - TILE_SIZE;

        // =================================================================
        // GROUND FLOOR — spans entire world width
        // =================================================================
        // Fill 3 rows at the bottom for a thick ground
        for (let row = 0; row < 3; row++) {
            for (let x = 0; x < WIDTH; x += TILE_SIZE) {
                this.addTile(x, groundY - row * TILE_SIZE);
            }
        }

        // =================================================================
        // PLATFORMS — defined as [x, y, widthInTiles]
        // =================================================================
        const platforms: [number, number, number][] = [
            // Starting area platforms (near spawn)
            [200, groundY - 100, 6],
            [500, groundY - 150, 4],
            [350, groundY - 200, 5],

            // Middle section
            [750, groundY - 110, 8],
            [900, groundY - 230, 3],
            [1050, groundY - 150, 5],

            // Right section
            [1300, groundY - 100, 6],
            [1400, groundY - 250, 4],
            [1600, groundY - 170, 7],

            // High platforms
            [600, groundY - 350, 3],
            [1100, groundY - 330, 4],
            [1500, groundY - 370, 3],
        ];

        for (const [x, y, widthInTiles] of platforms) {
            this.addPlatform(x, y, widthInTiles);
        }
    }

    /** Places a single tile at grid-aligned position. */
    private addTile(x: number, y: number): void {
        const tile = this.group.create(
            x + TERRAIN.TILE_SIZE / 2,
            y + TERRAIN.TILE_SIZE / 2,
            TERRAIN.TEXTURE_KEY,
        ) as Phaser.Physics.Arcade.Sprite;

        tile.setOrigin(0.5, 0.5);
        tile.refreshBody();
    }

    /** Places a horizontal row of tiles to form a platform. */
    private addPlatform(startX: number, y: number, widthInTiles: number): void {
        for (let i = 0; i < widthInTiles; i++) {
            this.addTile(startX + i * TERRAIN.TILE_SIZE, y);
        }
    }
}
