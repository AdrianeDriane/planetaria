import Phaser from "phaser";

interface Discovery {
  id: string;
  label: string;
}

export class UIOverlay {
  private scene: Phaser.Scene;
  private discoveries: string[] = [];
  private checklistItemContainers: Map<string, Phaser.GameObjects.Container> =
    new Map();

  // Checklist Data (Updated Labels)
  private checklistItems: Discovery[] = [
    { id: "liquid_water", label: "Liquid Water (Ocean)" },
    { id: "living_things", label: "Living Things" },
    { id: "atmosphere", label: "Air / Atmosphere" },
    { id: "sun_position", label: "Position from Sun" },
    { id: "moon", label: "The Moon (Luna)" },
    { id: "movement", label: "Earth's Movement" },
  ];

  // Discovery data with descriptions and placeholder images
  private discoveryData: Record<
    string,
    { title: string; desc: string; image: string }
  > = {
    liquid_water: {
      title: "Liquid Water (Ocean)",
      desc: "Earth has liquid water on its surface; about 70% is covered in water.",
      image: "/assets/ui/earth_water_placeholder.png",
    },
    living_things: {
      title: "Living Things",
      desc: "It is the only planet known to support life; it has plants, animals, and humans.",
      image: "/assets/ui/earth_life_placeholder.png",
    },
    atmosphere: {
      title: "Air / Atmosphere",
      desc: "It has an atmosphere that supports and protects life; burns most meteors before they reach the surface.",
      image: "/assets/ui/earth_atmosphere_placeholder.png",
    },
    sun_position: {
      title: "Position from Sun",
      desc: "It is the third planet from the Sun.",
      image: "/assets/ui/earth_sun_placeholder.png",
    },
    moon: {
      title: "The Moon (Luna)",
      desc: "1 moon; ancient name is Luna.",
      image: "/assets/ui/earth_moon_placeholder.png",
    },
    movement: {
      title: "Earth's Movement",
      desc: "Rotation: 23 hours, 56 minutes; Revolution: 365 ¼ days.",
      image: "/assets/ui/earth_movement_placeholder.png",
    },
  };

  private checklistContainer?: Phaser.GameObjects.Container;
  private discoveryBoxContainer?: Phaser.GameObjects.Container;
  private featureModalContainer?: Phaser.GameObjects.Container;

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
    const isMobile = width <= 900;
    this.checklistItemContainers.clear();

    // --- CHECKLIST PANEL CONFIGURATION ---
    const panelWidth = isMobile ? 280 : 260;
    const panelHeight = isMobile ? 300 : 280;
    const padding = isMobile ? 10 : 15;
    const x = width - panelWidth / 2 - padding;
    const y = isMobile ? 160 : 145;

    this.checklistContainer = this.scene.add.container(x, y);

    // Background
    const bg = this.scene.add.rectangle(
      0,
      0,
      panelWidth,
      panelHeight,
      0x001111,
      0.9
    );
    bg.setStrokeStyle(2, 0x00ffcc);

    // Header
    const headerBg = this.scene.add.rectangle(
      0,
      -(panelHeight / 2) + 22,
      panelWidth,
      36,
      0x003333
    );
    const title = this.scene.add
      .text(0, -(panelHeight / 2) + 22, "EARTH SCAN", {
        fontFamily: "'Courier New'",
        fontSize: isMobile ? "24px" : "20px",
        fontStyle: "bold",
        color: "#ccff00",
      })
      .setOrigin(0.5, 0.5);

    this.checklistContainer.add([bg, headerBg, title]);

    let yOffset = -(panelHeight / 2) + 64;
    const leftAlign = -(panelWidth / 2) + 18;

    this.checklistItems.forEach((item) => {
      const isFound = this.discoveries.includes(item.id);
      const color = isFound ? "#00ff00" : "#008888";

      // Create a mini-container for each item to easily animate it later
      const itemContainer = this.scene.add.container(0, 0);

      // Checkbox
      const checkboxSize = isMobile ? 16 : 15;
      const checkbox = this.scene.add.rectangle(
        leftAlign,
        yOffset,
        checkboxSize,
        checkboxSize,
        0x000000
      );
      checkbox.setStrokeStyle(2, isFound ? 0x00ff00 : 0x008888);

      // Label
      const label = this.scene.add
        .text(leftAlign + 20, yOffset, item.label, {
          fontFamily: "'Courier New'",
          fontSize: isMobile ? "19px" : "17px",
          fontStyle: "bold",
          color: color,
        })
        .setOrigin(0, 0.5);

      itemContainer.add([checkbox, label]);

      if (isFound) {
        const checkmark = this.scene.add
          .text(leftAlign, yOffset, "x", {
            fontFamily: "'Courier New'",
            fontSize: isMobile ? "20px" : "18px",
            fontStyle: "bold",
            color: "#00ff00",
          })
          .setOrigin(0.5, 0.5);
        itemContainer.add(checkmark);

        // Make found items clickable — open Venus-style modal
        const hitArea = this.scene.add.rectangle(
          leftAlign + (isMobile ? 108 : 100),
          yOffset,
          panelWidth - 24,
          isMobile ? 30 : 28,
          0x000000,
          0
        );
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on("pointerdown", () => {
          this.showFeatureModal(item.id);
        });
        itemContainer.add(hitArea);
      }

      this.checklistContainer!.add(itemContainer);
      this.checklistItemContainers.set(item.id, itemContainer);

      yOffset += isMobile ? 38 : 34;
    });

    this.scene.add.existing(this.checklistContainer);
    this.checklistContainer.setDepth(20);
  }

  private updateChecklist() {
    if (this.checklistContainer) this.checklistContainer.destroy();
    this.createChecklist();
  }

  /**
   * Venus-style modal that appears when a discovered checklist item is clicked.
   * Shows a placeholder image, title, and description in a centered overlay.
   */
  private showFeatureModal(featureId: string) {
    // Destroy any existing modal
    if (this.featureModalContainer) this.featureModalContainer.destroy();

    const data = this.discoveryData[featureId];
    if (!data) return;

    const { width, height } = this.scene.scale;
    const isMobile = width <= 900;

    this.featureModalContainer = this.scene.add.container(0, 0);
    this.featureModalContainer.setDepth(200);

    // --- Dark backdrop ---
    const backdrop = this.scene.add.rectangle(
      width / 2,
      height / 2,
      width,
      height,
      0x000000,
      0.75
    );
    backdrop.setInteractive();

    // --- Modal panel ---
    const modalWidth = Math.min(isMobile ? 520 : 480, width - 30);
    const modalHeight = isMobile ? 400 : 370;
    const modalX = width / 2;
    const modalY = height / 2;

    // Outer border glow
    const outerBorder = this.scene.add.rectangle(
      modalX,
      modalY,
      modalWidth + 4,
      modalHeight + 4,
      0xfbbf24,
      1
    );
    outerBorder.setAlpha(0.8);

    // Panel background (gradient-like: dark blue)
    const panelBg = this.scene.add.rectangle(
      modalX,
      modalY,
      modalWidth,
      modalHeight,
      0x1e1b4b,
      0.97
    );
    panelBg.setStrokeStyle(2, 0xfbbf24);

    // --- Placeholder image area (top section) ---
    const imgAreaHeight = isMobile ? 140 : 130;
    const imgAreaY = modalY - modalHeight / 2 + imgAreaHeight / 2 + 10;
    const imgBg = this.scene.add.rectangle(
      modalX,
      imgAreaY,
      modalWidth - 30,
      imgAreaHeight,
      0x312e81,
      0.8
    );
    imgBg.setStrokeStyle(1, 0x6366f1);

    // Placeholder icon text (since actual images may not exist yet)
    const iconMap: Record<string, string> = {
      liquid_water: "🌊",
      living_things: "🧑",
      atmosphere: "☁️",
      sun_position: "☀️",
      moon: "🌙",
      movement: "🔄",
    };
    const iconText = this.scene.add
      .text(modalX, imgAreaY, iconMap[featureId] || "🌍", {
        fontFamily: "Arial",
        fontSize: isMobile ? "68px" : "60px",
      })
      .setOrigin(0.5, 0.5);

    // --- Title ---
    const titleY = modalY - modalHeight / 2 + imgAreaHeight + 44;
    const titleText = this.scene.add
      .text(modalX, titleY, "★ " + data.title + " ★", {
        fontFamily: "'Press Start 2P', 'Courier New'",
        fontSize: isMobile ? "20px" : "18px",
        fontStyle: "bold",
        color: "#fbbf24",
        align: "center",
      })
      .setOrigin(0.5, 0.5);

    // --- Description ---
    const descY = titleY + 40;
    const descText = this.scene.add
      .text(modalX, descY, data.desc, {
        fontFamily: "'Press Start 2P', 'Courier New'",
        fontSize: isMobile ? "16px" : "14px",
        color: "#e2e8f0",
        align: "center",
        wordWrap: { width: modalWidth - 70 },
        lineSpacing: 8,
      })
      .setOrigin(0.5, 0);

    // --- Close button ---
    const btnY = modalY + modalHeight / 2 - 36;
    const btnBg = this.scene.add.rectangle(
      modalX,
      btnY,
      isMobile ? 140 : 130,
      isMobile ? 42 : 38,
      0x7c3aed,
      1
    );
    btnBg.setStrokeStyle(2, 0xfbbf24);
    btnBg.setInteractive({ useHandCursor: true });

    const btnText = this.scene.add
      .text(modalX, btnY, "CLOSE", {
        fontFamily: "'Press Start 2P', 'Courier New'",
        fontSize: isMobile ? "16px" : "14px",
        fontStyle: "bold",
        color: "#ffffff",
      })
      .setOrigin(0.5, 0.5);

    btnBg.on("pointerdown", () => this.closeFeatureModal());
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x9333ea));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x7c3aed));

    this.featureModalContainer.add([
      backdrop,
      outerBorder,
      panelBg,
      imgBg,
      iconText,
      titleText,
      descText,
      btnBg,
      btnText,
    ]);

    // Animate entrance
    this.featureModalContainer.setScale(0.8);
    this.featureModalContainer.setAlpha(0);
    this.scene.tweens.add({
      targets: this.featureModalContainer,
      scale: 1,
      alpha: 1,
      duration: 300,
      ease: "Back.easeOut",
    });
  }

  private closeFeatureModal() {
    if (!this.featureModalContainer) return;
    this.scene.tweens.add({
      targets: this.featureModalContainer,
      scale: 0.8,
      alpha: 0,
      duration: 200,
      ease: "Power2",
      onComplete: () => {
        this.featureModalContainer?.destroy();
        this.featureModalContainer = undefined;
      },
    });
  }

  private showDiscoveryBox(featureId: string) {
    // Destroy existing box immediately
    if (this.discoveryBoxContainer) this.discoveryBoxContainer.destroy();

    const { width, height } = this.scene.scale;

    // --- 1. FLYING STAR ANIMATION ---
    // Create a temporary star at center screen
    const star = this.scene.add.star(
      width / 2,
      height / 2,
      5,
      10,
      20,
      0xffff00
    );
    star.setDepth(100);

    // Find target position
    const targetContainer = this.checklistItemContainers.get(featureId);
    if (targetContainer && this.checklistContainer) {
      const panelWidth = 200;
      const panelHeight = 220;
      const padding = 15;
      const checklistX = width - panelWidth / 2 - padding;
      const checklistY = 130;

      // Find index to calculate Y offset
      const index = this.checklistItems.findIndex((i) => i.id === featureId);
      const yOffset = -(panelHeight / 2) + 50 + index * 26;
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
          const freshContainer = this.checklistItemContainers.get(featureId);
          if (freshContainer) {
            this.scene.tweens.add({
              targets: freshContainer,
              alpha: 0.2,
              yoyo: true,
              duration: 100,
              repeat: 2,
            });
          }
        },
      });
    } else {
      star.destroy();
    }

    // --- 2. SUCCESS TEXT ---
    const messages = [
      "GREAT JOB!",
      "GOOD JOB!",
      "AWESOME!",
      "NICE!",
      "FANTASTIC!",
      "GREAT FIND!",
    ];
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

    // --- 3. Auto-open the Venus-style modal for newly discovered feature ---
    this.scene.time.delayedCall(600, () => {
      this.showFeatureModal(featureId);
    });
  }

  destroy() {
    if (this.checklistContainer) this.checklistContainer.destroy();
    if (this.discoveryBoxContainer) this.discoveryBoxContainer.destroy();
    if (this.featureModalContainer) this.featureModalContainer.destroy();
    const existingHandler = (window as any).earthDiscoveryHandler;
    if (existingHandler)
      window.removeEventListener("earth-discovery", existingHandler);
  }
}
