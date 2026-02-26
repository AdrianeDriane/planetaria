import Phaser from "phaser";

interface Discovery {
    id: string;
    label: string;
}

export class UIOverlay {
    private scene: Phaser.Scene;
    private discoveries: string[] = [];
    private checklistItemContainers: Map<string, Phaser.GameObjects.Container> = new Map();

    // Checklist Data (Updated Labels)
    private checklistItems: Discovery[] = [
        { id: "liquid_water", label: "Liquid Water (Ocean)" },
        { id: "living_things", label: "Living Things" },
        { id: "atmosphere", label: "Air / Atmosphere" },
        { id: "sun_position", label: "Position from Sun" },
        { id: "moon", label: "The Moon (Luna)" },
        { id: "movement", label: "Earth's Movement" },
    ];

    private checklistContainer?: Phaser.GameObjects.Container;
    private discoveryBoxContainer?: Phaser.GameObjects.Container;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
        this.setupEventListeners();
        this.createChecklist();
    }

    private setupEventListeners() {
        const existingHandler = (window as any).earthDiscoveryHandler;
        if (existingHandler)
            window.removeEventListener("earth-discovery", existingHandler);

        const handler = (e: any) => {
            const feature = e.detail.feature;
            if (!this.discoveries.includes(feature)) {
                this.discoveries.push(feature);
                this.updateChecklist(); // Re-render checkmarks
                this.showDiscoveryBox(feature); // Show popup & fly animation

                if (this.discoveries.length === this.checklistItems.length) {
                    this.scene.events.emit("checklist-complete");
                }
            }
        };

        (window as any).earthDiscoveryHandler = handler;
        window.addEventListener("earth-discovery", handler);
    }

    private createChecklist() {
        const { width } = this.scene.scale;
        this.checklistItemContainers.clear();

        // --- CHECKLIST PANEL CONFIGURATION ---
        const panelWidth = 200;
        const panelHeight = 220;
        const padding = 15;
        const x = width - panelWidth / 2 - padding;
        const y = 130;

        this.checklistContainer = this.scene.add.container(x, y);

        // Background
        const bg = this.scene.add.rectangle(0, 0, panelWidth, panelHeight, 0x001111, 0.9);
        bg.setStrokeStyle(2, 0x00ffcc);

        // Header
        const headerBg = this.scene.add.rectangle(0, -(panelHeight / 2) + 18, panelWidth, 30, 0x003333);
        const title = this.scene.add.text(0, -(panelHeight / 2) + 18, "EARTH SCAN", {
            font: "bold 14px 'Courier New'",
            color: "#ccff00",
        }).setOrigin(0.5, 0.5);

        this.checklistContainer.add([bg, headerBg, title]);

        let yOffset = -(panelHeight / 2) + 50;
        const leftAlign = -(panelWidth / 2) + 15;

        this.checklistItems.forEach((item) => {
            const isFound = this.discoveries.includes(item.id);
            const color = isFound ? "#00ff00" : "#008888";

            // Create a mini-container for each item to easily animate it later
            const itemContainer = this.scene.add.container(0, 0);

            // Checkbox
            const checkboxSize = 12;
            const checkbox = this.scene.add.rectangle(leftAlign, yOffset, checkboxSize, checkboxSize, 0x000000);
            checkbox.setStrokeStyle(2, isFound ? 0x00ff00 : 0x008888);

            // Label
            const label = this.scene.add.text(leftAlign + 20, yOffset, item.label, {
                font: "11px 'Courier New'",
                color: color,
            }).setOrigin(0, 0.5);

            itemContainer.add([checkbox, label]);

            if (isFound) {
                const checkmark = this.scene.add.text(leftAlign, yOffset, "x", {
                    font: "bold 12px 'Courier New'",
                    color: "#00ff00",
                }).setOrigin(0.5, 0.5);
                itemContainer.add(checkmark);
            }

            this.checklistContainer!.add(itemContainer);
            this.checklistItemContainers.set(item.id, itemContainer);

            yOffset += 26;
        });

        this.scene.add.existing(this.checklistContainer);
        this.checklistContainer.setDepth(20);
    }

    private updateChecklist() {
        if (this.checklistContainer) this.checklistContainer.destroy();
        this.createChecklist();
    }

    private showDiscoveryBox(featureId: string) {
        // Destroy existing box immediately
        if (this.discoveryBoxContainer) this.discoveryBoxContainer.destroy();

        const { width, height } = this.scene.scale;

        // --- 1. FLYING STAR ANIMATION ---
        // Create a temporary star at center screen
        const star = this.scene.add.star(width / 2, height / 2, 5, 10, 20, 0xffff00);
        star.setDepth(100);

        // Find target position
        const targetContainer = this.checklistItemContainers.get(featureId);
        if (targetContainer && this.checklistContainer) {
            // Calculate absolute position: Parent Container (x,y) + Item Offset (which is 0,0 relative to parent addition order?? No wait)
            // Actually, in createChecklist, itemContainer is added at 0,0 of parent, but its children are offset?
            // Wait, I changed createChecklist to add itemContainer. 
            // In the previous code: `itemContainer.add([checkbox, label])`. Checkbox is at `leftAlign, yOffset`.
            // So the itemContainer itself is at 0,0 inside checklistContainer.
            // But the VISUAL elements are offset.
            // I should have positioned the container at yOffset.
            // Let's rely on the fact that the checklist is at (checklistContainer.x, checklistContainer.y)
            // And the items are drawn at (checkbox.x, checkbox.y) relative to that.
            
            // Re-calculating target position based on known layout logic
            const panelWidth = 200;
            const panelHeight = 220;
            const padding = 15;
            const checklistX = width - panelWidth / 2 - padding;
            const checklistY = 130;
            
            // Find index to calculate Y offset
            const index = this.checklistItems.findIndex(i => i.id === featureId);
            const yOffset = -(panelHeight / 2) + 50 + (index * 26);
            const leftAlign = -(panelWidth / 2) + 15;

            const targetX = checklistX + leftAlign;
            const targetY = checklistY + yOffset;

            this.scene.tweens.add({
                targets: star,
                x: targetX,
                y: targetY,
                scale: 0.2,
                duration: 800,
                ease: "Power2",
                onComplete: () => {
                    star.destroy();
                    // Flash the list item
                    if (targetContainer) {
                        // Since I re-created the list in updateChecklist, the reference might be stale?
                        // Actually updateChecklist is called BEFORE showDiscoveryBox in the event handler.
                        // So the map should be fresh.
                        // BUT wait, I refactored createChecklist to use itemContainer at 0,0 and offset children.
                        // Let's just flash the fresh container from the map.
                        const freshContainer = this.checklistItemContainers.get(featureId);
                        if (freshContainer) {
                            this.scene.tweens.add({
                                targets: freshContainer,
                                alpha: 0.2,
                                yoyo: true,
                                duration: 100,
                                repeat: 2
                            });
                        }
                    }
                }
            });
        } else {
            star.destroy(); // Fallback
        }

        // --- 2. SUCCESS TEXT ---
        const messages = ["GREAT JOB!", "GOOD JOB!", "AWESOME!", "NICE!", "FANTASTIC!", "GREAT FIND!"];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        const praiseText = this.scene.add.text(width / 2, height / 2, msg, {
            font: "bold 40px 'Courier New'",
            color: "#00ff00",
        });
        praiseText.setOrigin(0.5, 0.5);
        praiseText.setDepth(100);
        praiseText.setStroke("#000000", 6);
        praiseText.setScale(0.5);

        this.scene.tweens.add({
            targets: praiseText,
            y: height / 2 - 100,
            scale: 1.5,
            alpha: { from: 1, to: 0 },
            duration: 1200,
            ease: "Back.out",
            onComplete: () => praiseText.destroy(),
        });

        // --- 3. DISCOVERY BOX ---
        const discoveryData: Record<string, { title: string; desc: string }> = {
            liquid_water: {
                title: "Liquid Water (Ocean)",
                desc: "Earth has liquid water on its surface; about 70% is covered in water.",
            },
            living_things: {
                title: "Living Things",
                desc: "It is the only planet known to support life; it has plants, animals, and humans.",
            },
            atmosphere: {
                title: "Air / Atmosphere",
                desc: "It has an atmosphere that supports and protects life; burns most meteors before they reach the surface.",
            },
            sun_position: {
                title: "Position from Sun",
                desc: "It is the third planet from the Sun.",
            },
            moon: {
                title: "The Moon (Luna)",
                desc: "1 moon; ancient name is Luna.",
            },
            movement: {
                title: "Earth's Movement",
                desc: "Rotation: 23 hours, 56 minutes; Revolution: 365 ¼ days.",
            },
        };

        if (!discoveryData[featureId]) return;
        const data = discoveryData[featureId];

        const boxWidth = 320;
        const boxHeight = 120;
        const boxX = width / 2;
        const boxY = height - 70;

        this.discoveryBoxContainer = this.scene.add.container(boxX, boxY);

        // Background
        const bg = this.scene.add.rectangle(0, 0, boxWidth, boxHeight, 0x002222, 0.95);
        bg.setStrokeStyle(3, 0x00ff00);

        // Title
        const title = this.scene.add.text(0, -40, "★ " + data.title + " ★", {
            font: "bold 14px 'Courier New'",
            color: "#00ff00",
        }).setOrigin(0.5, 0.5);

        // Description (Word Wrapped)
        const desc = this.scene.add.text(0, 15, data.desc, {
            font: "12px 'Courier New'",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: boxWidth - 30 },
        }).setOrigin(0.5, 0.5);

        this.discoveryBoxContainer.add([bg, title, desc]);
        this.scene.add.existing(this.discoveryBoxContainer);
        this.discoveryBoxContainer.setDepth(20);

        // Animation: Pop in with bounce
        this.discoveryBoxContainer.setScale(0);
        this.scene.tweens.add({
            targets: this.discoveryBoxContainer,
            scale: 1,
            duration: 400,
            ease: "Elastic.out",
        });

        // Auto-hide
        this.scene.time.delayedCall(6000, () => {
            if (this.discoveryBoxContainer) {
                this.scene.tweens.add({
                    targets: this.discoveryBoxContainer,
                    alpha: 0,
                    scale: 0.8,
                    duration: 300,
                    onComplete: () => {
                        this.discoveryBoxContainer?.destroy();
                        this.discoveryBoxContainer = undefined;
                    },
                });
            }
        });
    }

    destroy() {
        if (this.checklistContainer) this.checklistContainer.destroy();
        if (this.discoveryBoxContainer) this.discoveryBoxContainer.destroy();
        const existingHandler = (window as any).earthDiscoveryHandler;
        if (existingHandler)
            window.removeEventListener("earth-discovery", existingHandler);
    }
}
