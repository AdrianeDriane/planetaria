import Phaser from "phaser";

interface Discovery {
    id: string;
    label: string;
}

export class UIOverlay {
    private scene: Phaser.Scene;
    private discoveries: string[] = [];

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
                this.updateChecklist();
                this.showDiscoveryBox(feature);
            }
        };

        (window as any).earthDiscoveryHandler = handler;
        window.addEventListener("earth-discovery", handler);
    }

    private createChecklist() {
        const { width } = this.scene.scale;

        // --- CHECKLIST PANEL CONFIGURATION ---
        // Increased width slightly to fit longer labels like "Liquid Water (Ocean)"
        const panelWidth = 180;
        const panelHeight = 190;
        const padding = 10;

        // Position: Top-Right Corner
        const x = width - panelWidth / 2 - padding;
        const y = 120;

        this.checklistContainer = this.scene.add.container(x, y);

        // Background
        const bg = this.scene.add.rectangle(
            0,
            0,
            panelWidth,
            panelHeight,
            0x001111,
            0.9,
        );
        bg.setStrokeStyle(2, 0x00ffcc);

        // Header
        const headerBg = this.scene.add.rectangle(
            0,
            -(panelHeight / 2) + 15,
            panelWidth,
            24,
            0x003333,
        );
        const title = this.scene.add.text(
            0,
            -(panelHeight / 2) + 15,
            "EARTH SCAN",
            {
                font: "bold 11px 'Courier New'",
                color: "#ccff00",
            },
        );
        title.setOrigin(0.5, 0.5);

        // List Items
        const childrenToAdd: Phaser.GameObjects.GameObject[] = [
            bg,
            headerBg,
            title,
        ];

        let yOffset = -(panelHeight / 2) + 40;
        const leftAlign = -(panelWidth / 2) + 10;

        this.checklistItems.forEach((item) => {
            const isFound = this.discoveries.includes(item.id);
            const color = isFound ? "#00ff00" : "#008888";

            // Checkbox
            const checkbox = this.scene.add.rectangle(
                leftAlign,
                yOffset,
                8,
                8,
                0x000000,
            );
            checkbox.setStrokeStyle(1, isFound ? 0x00ff00 : 0x008888);

            // Label
            const label = this.scene.add.text(
                leftAlign + 15,
                yOffset,
                item.label,
                {
                    font: "9px 'Courier New'",
                    color: color,
                },
            );
            label.setOrigin(0, 0.5);

            if (isFound) {
                const checkmark = this.scene.add.text(leftAlign, yOffset, "x", {
                    font: "bold 9px 'Courier New'",
                    color: "#00ff00",
                });
                checkmark.setOrigin(0.5, 0.5);
                childrenToAdd.push(checkmark);
            }

            childrenToAdd.push(checkbox, label);
            yOffset += 22;
        });

        this.checklistContainer.add(childrenToAdd);
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

        // --- UPDATED DISCOVERY TEXT ---
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
                desc: "It has an atmosphere that supports and protects life; burns most meteors before they reach the surface; has air that living things can breathe.",
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

        // --- DISCOVERY BOX LAYOUT ---
        // Increased size to fit the longer descriptions
        const boxWidth = 260;
        const boxHeight = 110;
        const x = width / 2;
        const y = height - 70;

        this.discoveryBoxContainer = this.scene.add.container(x, y);

        // Background
        const bg = this.scene.add.rectangle(
            0,
            0,
            boxWidth,
            boxHeight,
            0x002222,
            0.95,
        );
        bg.setStrokeStyle(2, 0x00ff00);

        // Title
        const title = this.scene.add.text(0, -35, "★ " + data.title + " ★", {
            font: "bold 12px 'Courier New'",
            color: "#00ff00",
        });
        title.setOrigin(0.5, 0.5);

        // Description (Word Wrapped)
        const desc = this.scene.add.text(0, 10, data.desc, {
            font: "11px 'Courier New'",
            color: "#ffffff",
            align: "center",
            wordWrap: { width: boxWidth - 20 },
        });
        desc.setOrigin(0.5, 0.5);

        this.discoveryBoxContainer.add([bg, title, desc]);
        this.scene.add.existing(this.discoveryBoxContainer);
        this.discoveryBoxContainer.setDepth(20);

        // Animation: Pop in
        this.discoveryBoxContainer.setScale(0);
        this.scene.tweens.add({
            targets: this.discoveryBoxContainer,
            scale: 1,
            duration: 200,
            ease: "Back.out",
        });

        // Auto-hide after 6 seconds (increased time for reading)
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
