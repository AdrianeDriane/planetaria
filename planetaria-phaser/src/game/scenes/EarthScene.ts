import Phaser from "phaser";
import { UIOverlay } from "./EarthChecklist";

export default class EarthScene extends Phaser.Scene {
    private earth!: Phaser.Physics.Arcade.Sprite;
    private moon!: Phaser.GameObjects.Image;
    private sun!: Phaser.GameObjects.Image;
    private uiOverlay!: UIOverlay;

    // Drag variables
    private dragStartX: number = 0;
    private startFrame: number = 0;
    private totalFrames: number = 8;
    private pixelsPerFrame: number = 30;

    constructor() {
        super("EarthScene");
    }

    preload() {
        // Ensure the spritesheet is loaded correctly with the frame dimensions
        this.load.spritesheet("earth_spin", "assets/earth.png", {
            frameWidth: 582,
            frameHeight: 582,
        });
        this.load.image("moon", "assets/moon.png");
        this.load.image("sun", "assets/sun.png");
        this.load.image("outerspace", "assets/outerspace.png");
    }

    create() {
        const { width, height } = this.scale;
        const cX = width * 0.35;
        const cY = height * 0.5;

        // Dynamic Sizing
        const minDim = Math.min(width, height);
        const earthSize = minDim * 0.65;
        const moonSize = earthSize * 0.2;
        const sunSize = earthSize * 0.25;

        // --- 0. BACKGROUND ---
        this.add
            .image(width, height, "outerspace")
            .setDisplaySize(width, height)
            .setOrigin(1, 1);

        // --- 1. THE SUN ---
        this.sun = this.add
            .image(width * 0.15, height * 0.15, "sun")
            .setDisplaySize(sunSize, sunSize)
            .setInteractive();

        this.sun.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.handleSunClick(pointer);
        });
        this.addHoverCursor(this.sun);

        // --- 2. THE MOON ---
        const moonX = cX + earthSize * 0.65;
        const moonY = cY - earthSize * 0.25;
        this.moon = this.add
            .image(moonX, moonY, "moon")
            .setDisplaySize(moonSize, moonSize)
            .setInteractive();

        this.moon.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.handleMoonClick(pointer);
        });
        this.addHoverCursor(this.moon);

        // --- 3. THE EARTH (Pixel Perfect Logic) ---
        this.earth = this.physics.add.sprite(cX, cY, "earth_spin", 0);
        this.earth.setDisplaySize(earthSize, earthSize);
        this.earth.setDepth(10);

        const earthBody = this.earth.body as Phaser.Physics.Arcade.Body;
        earthBody.setAllowGravity(false);
        this.earth.setImmovable(true);

        this.earth.setInteractive({ draggable: true }); // Enable Drag AND Click
        this.addHoverCursor(this.earth);

        // --- PIXEL CLICK DETECTION ---
        this.earth.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
            this.handleEarthClick(pointer);
        });

        // --- DRAG LOGIC (Movement) ---
        this.input.on(
            "dragstart",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
            ) => {
                if (gameObject === this.earth) {
                    this.dragStartX = pointer.x;
                    this.startFrame = parseInt(this.earth.frame.name);
                }
            },
        );

        this.input.on(
            "drag",
            (
                pointer: Phaser.Input.Pointer,
                gameObject: Phaser.GameObjects.Sprite,
            ) => {
                if (gameObject === this.earth) {
                    const diffX = pointer.x - this.dragStartX;
                    const frameShift = Math.floor(diffX / this.pixelsPerFrame);
                    const newFrame =
                        (((this.startFrame + frameShift) % this.totalFrames) +
                            this.totalFrames) %
                        this.totalFrames;

                    // Only update frame if changed to save perf
                    if (this.earth.frame.name !== newFrame.toString()) {
                        this.earth.setFrame(newFrame);
                    }

                    this.handleDiscovery("movement");
                }
            },
        );

        // --- 4. UI OVERLAY ---
        this.uiOverlay = new UIOverlay(this);
    }

    /**
     * Translates World Click -> Texture Pixel -> Feature ID
     */
    handleEarthClick(pointer: Phaser.Input.Pointer) {
        // 1. Get the Texture Manager
        const textureManager = this.textures;
        const frame = this.earth.frame;

        // 2. Calculate Local Click Position on the Sprite (0 to displayWidth)
        // (Pointer - TopLeft of Sprite)
        const localX = pointer.x - (this.earth.x - this.earth.displayWidth / 2);
        const localY =
            pointer.y - (this.earth.y - this.earth.displayHeight / 2);

        // Check if click is within sprite bounds
        if (
            localX < 0 ||
            localX > this.earth.displayWidth ||
            localY < 0 ||
            localY > this.earth.displayHeight
        ) {
            return; // Click was outside sprite
        }

        // 3. Map Local Position to Frame Texture Coordinates
        // (Account for scaling: e.g., if sprite is 200px but texture is 582px)
        const texX = Math.floor(
            (localX / this.earth.displayWidth) * frame.width,
        );
        const texY = Math.floor(
            (localY / this.earth.displayHeight) * frame.height,
        );

        // 4. Clamp to frame bounds to ensure we stay within the current frame
        const clampedTexX = Math.max(0, Math.min(texX, frame.width - 1));
        const clampedTexY = Math.max(0, Math.min(texY, frame.height - 1));

        // 5. Add the Frame Offset (Because it's a spritesheet!)
        // cutX/cutY tells us where the current frame starts in the big image
        const finalX = clampedTexX + frame.cutX;
        const finalY = clampedTexY + frame.cutY;

        // 6. Get the Pixel Color
        // 'earth_spin' is the key we used in preload()
        const pixel = textureManager.getPixel(finalX, finalY, "earth_spin");

        if (pixel) {
            this.analyzeColorAndTrigger(pixel.red, pixel.green, pixel.blue);
        }
    }

    analyzeColorAndTrigger(r: number, g: number, b: number) {
        // Ignore transparent pixels (Background stars showing through corners)
        if (r === 0 && g === 0 && b === 0) return;

        console.log(`Clicked Color: R${r} G${g} B${b}`);

        // --- COLOR HEURISTICS ---

        // 1. WHITE/GREY = CLOUDS (Atmosphere)
        // High values in all channels
        if (r > 200 && g > 200 && b > 200) {
            this.handleDiscovery("atmosphere");
            return;
        }

        // 2. BLUE = WATER (Liquid Water)
        // Blue is dominant
        if (b > r + 20 && b > g + 20) {
            this.handleDiscovery("liquid_water");
            return;
        }

        // 3. GREEN/BROWN = LAND (Living Things)
        // Green is dominant OR Brownish (Red dominant but low Blue)
        // Green check:
        if (g > b + 10 && g > r - 30) {
            this.handleDiscovery("living_things");
            return;
        }
        // Brown/Earth tone check:
        if (r > g && r > b && b < 100) {
            this.handleDiscovery("living_things");
            return;
        }
    }

    handleMoonClick(pointer: Phaser.Input.Pointer) {
        const textureManager = this.textures;

        // Calculate Local Click Position on the Moon Sprite
        const localX = pointer.x - (this.moon.x - this.moon.displayWidth / 2);
        const localY = pointer.y - (this.moon.y - this.moon.displayHeight / 2);

        // Get the texture dimensions
        const texture = textureManager.get("moon");
        const width = texture.source[0].width;
        const height = texture.source[0].height;

        // Map Local Position to Texture Coordinates
        const texX = Math.floor((localX / this.moon.displayWidth) * width);
        const texY = Math.floor((localY / this.moon.displayHeight) * height);

        // Clamp to texture bounds
        const finalX = Math.max(0, Math.min(texX, width - 1));
        const finalY = Math.max(0, Math.min(texY, height - 1));

        // Get the Pixel Color
        const pixel = textureManager.getPixel(finalX, finalY, "moon");

        if (pixel) {
            console.log(
                `Moon - RGB: R${pixel.red} G${pixel.green} B${pixel.blue}`,
            );
            // Only trigger discovery for non-transparent pixels
            if (!(pixel.red === 0 && pixel.green === 0 && pixel.blue === 0)) {
                this.handleDiscovery("moon");
            }
        }
    }

    handleSunClick(pointer: Phaser.Input.Pointer) {
        const textureManager = this.textures;

        // Calculate Local Click Position on the Sun Sprite
        const localX = pointer.x - (this.sun.x - this.sun.displayWidth / 2);
        const localY = pointer.y - (this.sun.y - this.sun.displayHeight / 2);

        // Get the texture dimensions
        const texture = textureManager.get("sun");
        const width = texture.source[0].width;
        const height = texture.source[0].height;

        // Map Local Position to Texture Coordinates
        const texX = Math.floor((localX / this.sun.displayWidth) * width);
        const texY = Math.floor((localY / this.sun.displayHeight) * height);

        // Clamp to texture bounds
        const finalX = Math.max(0, Math.min(texX, width - 1));
        const finalY = Math.max(0, Math.min(texY, height - 1));

        // Get the Pixel Color
        const pixel = textureManager.getPixel(finalX, finalY, "sun");

        if (pixel) {
            console.log(
                `Sun - RGB: R${pixel.red} G${pixel.green} B${pixel.blue}`,
            );
            // Only trigger discovery for non-transparent pixels
            if (!(pixel.red === 0 && pixel.green === 0 && pixel.blue === 0)) {
                this.handleDiscovery("sun_position");
            }
        }
    }

    update(time: number) {}

    addHoverCursor(gameObject: Phaser.GameObjects.GameObject) {
        gameObject.on("pointerover", () =>
            this.input.setDefaultCursor("pointer"),
        );
        gameObject.on("pointerout", () =>
            this.input.setDefaultCursor("default"),
        );
    }

    handleDiscovery(featureID: string) {
        window.dispatchEvent(
            new CustomEvent("earth-discovery", {
                detail: { feature: featureID },
            }),
        );

        // Animations for feedback
        if (featureID === "moon") {
            this.tweens.add({
                targets: this.moon,
                scale: this.moon.scale * 1.5,
                yoyo: true,
                duration: 200,
            });
        }
        if (featureID === "sun_position") {
            this.tweens.add({
                targets: this.sun,
                scale: this.sun.scale * 1.2,
                yoyo: true,
                duration: 200,
            });
        }
    }

    shutdown() {
        this.uiOverlay.destroy();
    }
}
