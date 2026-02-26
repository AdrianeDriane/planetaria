import Phaser from "phaser";

export class HoverInfo {
    private scene: Phaser.Scene;
    private container: Phaser.GameObjects.Container;
    private background: Phaser.GameObjects.Rectangle;
    private titleText: Phaser.GameObjects.Text;
    private descText: Phaser.GameObjects.Text;
    private currentFeatureId: string | null = null;
    private isVisible: boolean = false;

    // Kid-friendly descriptions
    private infoData: Record<string, { title: string; desc: string }> = {
        atmosphere: {
            title: "Air / Atmosphere",
            desc: "Like a fluffy blanket! It keeps us safe and gives us air to breathe.",
        },
        liquid_water: {
            title: "Ocean Water",
            desc: "Splash! Most of our planet is covered in big blue oceans.",
        },
        living_things: {
            title: "Living Things",
            desc: "Plants, animals, and you! This is where life grows on land.",
        },
        moon: {
            title: "The Moon",
            desc: "Our space neighbor! It lights up the night sky.",
        },
        sun_position: {
            title: "The Sun",
            desc: "A giant star! It gives us light and warmth to live.",
        },
    };

    constructor(scene: Phaser.Scene) {
        this.scene = scene;

        // Container
        this.container = this.scene.add.container(0, 0);
        this.container.setDepth(100); // Always on top
        this.container.setAlpha(0); // Hidden by default

        // Background Box (Initial Size)
        this.background = this.scene.add.rectangle(0, 0, 220, 100, 0x000000, 0.9);
        this.background.setStrokeStyle(2, 0xffffff);
        this.background.setOrigin(0, 0); // Top-left origin for easier positioning

        // Title
        this.titleText = this.scene.add.text(10, 10, "", {
            font: "bold 16px 'Arial'",
            color: "#ffff00",
        });

        // Description
        this.descText = this.scene.add.text(10, 35, "", {
            font: "14px 'Arial'",
            color: "#ffffff",
            wordWrap: { width: 200 },
        });

        this.container.add([this.background, this.titleText, this.descText]);
    }

    /**
     * Shows or updates the hover info box.
     * @param x Screen X position
     * @param y Screen Y position
     * @param featureId The ID of the feature being hovered
     */
    show(x: number, y: number, featureId: string) {
        // If data doesn't exist for this feature, hide and return
        const data = this.infoData[featureId];
        if (!data) {
            this.hide();
            return;
        }

        // If it's a new feature or we were hidden, update the text and size
        if (this.currentFeatureId !== featureId || !this.isVisible) {
            this.currentFeatureId = featureId;
            this.isVisible = true;

            // Update Text
            this.titleText.setText(data.title);
            this.descText.setText(data.desc);

            // Resize background based on text height
            const lines = this.descText.getWrappedText(data.desc);
            const textHeight = lines.length * 20 + 50; // roughly 20px per line + padding
            this.background.height = Math.max(80, textHeight);

            // Fade in
            this.scene.tweens.killTweensOf(this.container);
            this.container.setAlpha(1);
        }

        // Always update position to follow cursor/target
        this.updatePosition(x, y);
    }

    hide() {
        if (!this.isVisible) return;

        this.isVisible = false;
        this.currentFeatureId = null;

        this.scene.tweens.killTweensOf(this.container);
        this.container.setAlpha(0);
    }

    private updatePosition(x: number, y: number) {
        const { width, height } = this.scene.scale;
        
        // Offset slightly from cursor (bottom-right preference)
        let finalX = x + 15;
        let finalY = y + 15;

        // Keep inside screen bounds
        if (finalX + this.background.width > width) {
            finalX = x - this.background.width - 15; // Flip to left
        }
        if (finalY + this.background.height > height) {
            finalY = y - this.background.height - 15; // Flip to top
        }

        this.container.setPosition(finalX, finalY);
    }
}
