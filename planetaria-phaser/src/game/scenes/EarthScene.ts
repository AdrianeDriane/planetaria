import Phaser from "phaser";
import { UIOverlay } from "./EarthChecklist";
import { HoverInfo } from "./earth/HoverInfo";

export default class EarthScene extends Phaser.Scene {
  private earth!: Phaser.Physics.Arcade.Sprite;
  private moon!: Phaser.GameObjects.Image;
  private sun!: Phaser.GameObjects.Image;
  private humanFigure!: Phaser.GameObjects.Image;
  private uiOverlay!: UIOverlay;
  private hoverInfo!: HoverInfo;

  private baseMoonScale: number = 1;
  private baseSunScale: number = 1;

  // Particles
  private discoveryEmitter!: Phaser.GameObjects.Particles.ParticleEmitter;

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

    // Create a simple texture for particles if not exists
    if (!this.textures.exists("sparkle")) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xffff00);
      // Draw a diamond shape for sparkle
      gfx.beginPath();
      gfx.moveTo(5, 0);
      gfx.lineTo(6, 4);
      gfx.lineTo(10, 5);
      gfx.lineTo(6, 6);
      gfx.lineTo(5, 10);
      gfx.lineTo(4, 6);
      gfx.lineTo(0, 5);
      gfx.lineTo(4, 4);
      gfx.closePath();
      gfx.fillPath();
      gfx.generateTexture("sparkle", 10, 10);
      gfx.destroy();
    }
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

    // --- PARTICLES ---
    this.discoveryEmitter = this.add.particles(0, 0, "sparkle", {
      lifespan: 800,
      speed: { min: 100, max: 200 },
      scale: { start: 1, end: 0 },
      gravityY: 200,
      blendMode: "ADD",
      emitting: false,
    });

    // --- 1. THE SUN ---
    this.sun = this.add
      .image(width * 0.15, height * 0.15, "sun")
      .setDisplaySize(sunSize, sunSize)
      .setInteractive();

    this.baseSunScale = this.sun.scale;

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

    this.baseMoonScale = this.moon.scale;

    this.moon.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      this.handleMoonClick(pointer);
    });
    this.addHoverCursor(this.moon);

    // --- 2b. HUMAN FIGURE (representation of living things) ---
    this.generateHumanFigureTexture();
    const humanScale = earthSize / 150; // much bigger scale
    const humanOffsetX = earthSize * 0.08; // on the land area
    const humanOffsetY = -earthSize * 0.05;
    this.humanFigure = this.add.image(
      cX + humanOffsetX,
      cY + humanOffsetY,
      "human_figure"
    );
    this.humanFigure.setScale(humanScale);
    this.humanFigure.setDepth(11);
    this.humanFigure.setVisible(false); // starts hidden, shown on certain frames

    // Subtle idle bounce animation
    this.tweens.add({
      targets: this.humanFigure,
      y: this.humanFigure.y - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

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
        gameObject: Phaser.GameObjects.Sprite
      ) => {
        if (gameObject === this.earth) {
          this.dragStartX = pointer.x;
          this.startFrame = parseInt(this.earth.frame.name);
        }
      }
    );

    this.input.on(
      "drag",
      (
        pointer: Phaser.Input.Pointer,
        gameObject: Phaser.GameObjects.Sprite
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

          this.handleDiscovery("movement", pointer.x, pointer.y);
        }
      }
    );

    // --- 4. UI OVERLAY ---
    this.uiOverlay = new UIOverlay(this);
    this.hoverInfo = new HoverInfo(this);

    // --- HOVER LOGIC (DISABLED) ---
    // Hover-based hints are disabled; discoveries are shown via click modals
    // this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
    //     this.handleHover(pointer);
    // });

    // --- CHECKLIST COMPLETION ---
    this.events.on("checklist-complete", () => {
      console.log("Checklist complete event received via this.events");

      // Show summary screen before fading out
      this.showEarthSummary();
    });
  }

  /**
   * Shows a full-screen summary of all Earth discoveries before proceeding.
   */
  private showEarthSummary(): void {
    const w = this.cameras.main.width;
    const h = this.cameras.main.height;

    const summaryContainer = this.add.container(0, 0).setDepth(2000);

    // Dark backdrop
    const backdrop = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.85);
    backdrop.setInteractive(); // block clicks
    summaryContainer.add(backdrop);

    // Panel
    const panelW = Math.min(w * 0.9, 760);
    const panelH = Math.min(h * 0.92, 640);
    const panelX = w / 2;
    const panelY = h / 2;

    const panelBg = this.add.rectangle(
      panelX,
      panelY,
      panelW,
      panelH,
      0x0a0a2e,
      0.95
    );
    panelBg.setStrokeStyle(3, 0x22d3ee);
    summaryContainer.add(panelBg);

    // Title
    const title = this.add
      .text(
        panelX,
        panelY - panelH / 2 + 30,
        "★ EARTH: SUMMARY OF LEARNINGS ★",
        {
          fontFamily: "'Press Start 2P'",
          fontSize: "15px",
          color: "#22d3ee",
          align: "center",
        }
      )
      .setOrigin(0.5);
    summaryContainer.add(title);

    // Discovery facts
    const earthFacts = [
      {
        icon: "🌊",
        title: "Liquid Water (Ocean)",
        desc: "Earth has liquid water on its surface; about 70% is covered in water.",
      },
      {
        icon: "🧑",
        title: "Living Things",
        desc: "It is the only planet known to support life; it has plants, animals, and humans.",
      },
      {
        icon: "🌬️",
        title: "Air / Atmosphere",
        desc: "It has an atmosphere that supports and protects life.",
      },
      {
        icon: "☀️",
        title: "Position from Sun",
        desc: "It is the third planet from the Sun.",
      },
      {
        icon: "🌙",
        title: "The Moon (Luna)",
        desc: "1 moon; ancient name is Luna.",
      },
      {
        icon: "🔄",
        title: "Earth's Movement",
        desc: "Rotation: 23 hours, 56 minutes; Revolution: 365 ¼ days.",
      },
    ];

    const startY = panelY - panelH / 2 + 80;
    const itemHeight = 82;

    earthFacts.forEach((fact, i) => {
      const yPos = startY + i * itemHeight;

      // Row background
      const rowBg = this.add.rectangle(
        panelX,
        yPos + 26,
        panelW - 30,
        itemHeight - 8,
        0x0f172a,
        0.8
      );
      rowBg.setStrokeStyle(1, 0x1e3a5f);
      summaryContainer.add(rowBg);

      // Icon
      const icon = this.add
        .text(panelX - panelW / 2 + 28, yPos + 6, fact.icon, {
          fontSize: "24px",
        })
        .setOrigin(0, 0);
      summaryContainer.add(icon);

      // Title text
      const titleText = this.add
        .text(panelX - panelW / 2 + 55, yPos + 5, fact.title, {
          fontFamily: "'Press Start 2P'",
          fontSize: "13px",
          color: "#67e8f9",
        })
        .setOrigin(0, 0);
      summaryContainer.add(titleText);

      // Description text
      const descText = this.add
        .text(panelX - panelW / 2 + 55, yPos + 22, fact.desc, {
          fontFamily: "'Press Start 2P'",
          fontSize: "10px",
          color: "#94a3b8",
          wordWrap: { width: panelW - 100 },
          lineSpacing: 6,
        })
        .setOrigin(0, 0);
      summaryContainer.add(descText);
    });

    // "Proceed" button
    const btnY = panelY + panelH / 2 - 30;
    const btnBg = this.add.rectangle(panelX, btnY, 220, 32, 0x22d3ee, 1);
    btnBg.setStrokeStyle(2, 0x67e8f9);
    summaryContainer.add(btnBg);

    const btnText = this.add
      .text(panelX, btnY, "LAUNCH TO MARS", {
        fontFamily: "'Press Start 2P'",
        fontSize: "12px",
        color: "#0a0a2e",
        align: "center",
      })
      .setOrigin(0.5);
    summaryContainer.add(btnText);

    btnBg.setInteractive({ useHandCursor: true });
    btnBg.on("pointerover", () => btnBg.setFillStyle(0x67e8f9));
    btnBg.on("pointerout", () => btnBg.setFillStyle(0x22d3ee));
    btnBg.on("pointerdown", () => {
      summaryContainer.destroy();

      // Unlock Level 4 (Mars)
      try {
        const STORAGE_KEY = "planetaria_progress";
        const stored = localStorage.getItem(STORAGE_KEY);
        let progress = stored ? JSON.parse(stored) : {};
        progress[4] = "unlocked";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn("Failed to save progress in EarthScene:", e);
      }

      // Fade out and notify React
      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          window.dispatchEvent(new CustomEvent("earth-complete"));
        }
      );
    });

    // Entrance animation
    summaryContainer.setAlpha(0);
    this.tweens.add({
      targets: summaryContainer,
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });
  }

  /**
   * Generates a pixel-art human figure texture to represent living things on Earth.
   */
  private generateHumanFigureTexture(): void {
    if (this.textures.exists("human_figure")) return;

    const gfx = this.add.graphics();
    const w = 32;
    const h = 56;

    // Head (skin tone)
    gfx.fillStyle(0xf5c6a0, 1);
    gfx.fillRect(12, 0, 8, 8);

    // Hair (dark brown)
    gfx.fillStyle(0x3b2314, 1);
    gfx.fillRect(12, 0, 8, 3);

    // Eyes
    gfx.fillStyle(0x222222, 1);
    gfx.fillRect(14, 4, 2, 2);
    gfx.fillRect(18, 4, 2, 2);

    // Smile
    gfx.fillStyle(0xd4956a, 1);
    gfx.fillRect(15, 6, 4, 1);

    // Body / Shirt (blue)
    gfx.fillStyle(0x3b82f6, 1);
    gfx.fillRect(10, 9, 12, 16);

    // Shirt collar detail
    gfx.fillStyle(0x2563eb, 1);
    gfx.fillRect(13, 9, 6, 2);

    // Arms (skin tone)
    gfx.fillStyle(0xf5c6a0, 1);
    gfx.fillRect(6, 10, 4, 12);
    gfx.fillRect(22, 10, 4, 12);

    // Hands
    gfx.fillStyle(0xf5c6a0, 1);
    gfx.fillRect(6, 22, 4, 3);
    gfx.fillRect(22, 22, 4, 3);

    // Pants (dark grey)
    gfx.fillStyle(0x4b5563, 1);
    gfx.fillRect(10, 25, 12, 14);

    // Leg gap
    gfx.fillStyle(0x000000, 0);
    gfx.fillRect(15, 30, 2, 9);

    // Left leg
    gfx.fillStyle(0x4b5563, 1);
    gfx.fillRect(10, 25, 5, 14);

    // Right leg
    gfx.fillStyle(0x4b5563, 1);
    gfx.fillRect(17, 25, 5, 14);

    // Shoes (brown)
    gfx.fillStyle(0x78350f, 1);
    gfx.fillRect(9, 39, 6, 4);
    gfx.fillRect(17, 39, 6, 4);

    // Small wave hand (one arm slightly raised - friendly pose)
    gfx.fillStyle(0xf5c6a0, 1);
    gfx.fillRect(22, 8, 4, 3);
    gfx.fillRect(24, 5, 3, 4);

    gfx.generateTexture("human_figure", w, h);
    gfx.destroy();
  }

  handleHover(pointer: Phaser.Input.Pointer) {
    // 1. Check Sun (Radius check for circle)
    const sunRadius = (this.sun.displayWidth / 2) * 0.9; // 90% hit area
    if (
      Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.sun.x,
        this.sun.y
      ) < sunRadius
    ) {
      this.hoverInfo.show(pointer.x, pointer.y, "sun_position");
      return;
    }

    // 2. Check Moon (Radius check)
    const moonRadius = (this.moon.displayWidth / 2) * 0.9;
    if (
      Phaser.Math.Distance.Between(
        pointer.x,
        pointer.y,
        this.moon.x,
        this.moon.y
      ) < moonRadius
    ) {
      this.hoverInfo.show(pointer.x, pointer.y, "moon");
      return;
    }

    // 3. Check Earth
    // Only run pixel check if within Earth bounds
    if (this.earth.getBounds().contains(pointer.x, pointer.y)) {
      const textureManager = this.textures;
      const frame = this.earth.frame;

      const localX = pointer.x - (this.earth.x - this.earth.displayWidth / 2);
      const localY = pointer.y - (this.earth.y - this.earth.displayHeight / 2);

      const texX = Math.floor((localX / this.earth.displayWidth) * frame.width);
      const texY = Math.floor(
        (localY / this.earth.displayHeight) * frame.height
      );

      const clampedTexX = Math.max(0, Math.min(texX, frame.width - 1));
      const clampedTexY = Math.max(0, Math.min(texY, frame.height - 1));

      // Use frame.x / frame.y for spritesheet offsets (Fixes rotation issue)
      const finalX = clampedTexX + frame.x;
      const finalY = clampedTexY + frame.y;

      const pixel = textureManager.getPixel(finalX, finalY, "earth_spin");

      if (pixel) {
        const feature = this.analyzeColor(pixel.red, pixel.green, pixel.blue);
        if (feature) {
          this.hoverInfo.show(pointer.x, pointer.y, feature);
          return;
        }
      }
    }

    // If nothing found
    this.hoverInfo.hide();
  }

  /**
   * Translates World Click -> Texture Pixel -> Feature ID
   * Uses 3x3 Super-sampling for robust detection
   */
  handleEarthClick(pointer: Phaser.Input.Pointer) {
    const textureManager = this.textures;
    const frame = this.earth.frame;

    // Calculate Local Click Position on the Sprite
    const localX = pointer.x - (this.earth.x - this.earth.displayWidth / 2);
    const localY = pointer.y - (this.earth.y - this.earth.displayHeight / 2);

    if (
      localX < 0 ||
      localX > this.earth.displayWidth ||
      localY < 0 ||
      localY > this.earth.displayHeight
    ) {
      return;
    }

    // Potential candidates found in the 3x3 grid
    const candidates: string[] = [];

    // Sample a 3x3 grid around the click point
    for (let ox = -1; ox <= 1; ox++) {
      for (let oy = -1; oy <= 1; oy++) {
        // Map Local Position + Offset to Texture Coordinates
        const sampleLocalX = localX + ox;
        const sampleLocalY = localY + oy;

        const texX = Math.floor(
          (sampleLocalX / this.earth.displayWidth) * frame.width
        );
        const texY = Math.floor(
          (sampleLocalY / this.earth.displayHeight) * frame.height
        );

        const clampedTexX = Math.max(0, Math.min(texX, frame.width - 1));
        const clampedTexY = Math.max(0, Math.min(texY, frame.height - 1));

        // Use frame.x / frame.y for spritesheet offsets
        const finalX = clampedTexX + frame.x;
        const finalY = clampedTexY + frame.y;

        // Debug only the center pixel sample
        if (ox === 0 && oy === 0) {
          console.log(
            `Frame: ${frame.name} | Offset: ${frame.x},${frame.y} | Click: ${finalX},${finalY}`
          );
        }

        const pixel = textureManager.getPixel(finalX, finalY, "earth_spin");

        if (pixel) {
          const feature = this.analyzeColor(pixel.red, pixel.green, pixel.blue);
          if (feature) {
            candidates.push(feature);
          }
        }
      }
    }

    // Prioritize Features (Clouds > Life > Water)
    if (candidates.includes("atmosphere")) {
      this.handleDiscovery("atmosphere", pointer.x, pointer.y);
    } else if (candidates.includes("living_things")) {
      this.handleDiscovery("living_things", pointer.x, pointer.y);
    } else if (candidates.includes("liquid_water")) {
      this.handleDiscovery("liquid_water", pointer.x, pointer.y);
    }
  }

  /**
   * Helper: Convert RGB to HSL
   * r, g, b: 0-255
   * returns: { h, s, l } all in range 0-1
   */
  rgbToHsl(r: number, g: number, b: number) {
    ((r /= 255), (g /= 255), (b /= 255));
    const max = Math.max(r, g, b),
      min = Math.min(r, g, b);
    let h = 0,
      s = 0,
      l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      h /= 6;
    }

    return { h, s, l };
  }

  analyzeColor(r: number, g: number, b: number): string | null {
    // Ignore transparent pixels
    if (r === 0 && g === 0 && b === 0) return null;

    const { h, s, l } = this.rgbToHsl(r, g, b);
    const hDeg = h * 360;

    // 1. ATMOSPHERE / CLOUDS
    // Data shows clouds are very bright (L > 0.8) or grey (low S)
    // Primary Check: Very High Lightness
    if (l > 0.75) {
      return "atmosphere";
    }
    // Secondary Check: Moderate Lightness but Greyish (White/Grey clouds)
    if (l > 0.55 && s < 0.2) {
      return "atmosphere";
    }

    // 2. LIQUID WATER
    // Data shows water is Deep Blue (H ~220-240) and Saturated (S > 0.8)
    // Range: ~170 to ~260
    if (hDeg > 170 && hDeg < 260 && s > 0.25) {
      return "liquid_water";
    }

    // 3. LIVING THINGS (Land)
    // IMPORTANT: Land is usually darker (L < 0.6). Bright pixels are likely clouds.

    // Green Range: ~60 to ~160 (Vegetation)
    if (hDeg >= 60 && hDeg <= 165 && s > 0.15 && l < 0.65) {
      return "living_things";
    }

    // Brown/Yellow Range: ~15 to ~60 (Desert/Dirt)
    // Must check Lightness to avoid confused bright clouds
    if (hDeg >= 15 && hDeg < 60 && s > 0.15 && l < 0.65) {
      return "living_things";
    }

    // Deep Reddish/Brown fallback (Mountains)
    if ((hDeg < 15 || hDeg > 345) && s > 0.15 && l < 0.5) {
      return "living_things";
    }

    return null;
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
      console.log(`Moon - RGB: R${pixel.red} G${pixel.green} B${pixel.blue}`);
      // Only trigger discovery for non-transparent pixels
      if (!(pixel.red === 0 && pixel.green === 0 && pixel.blue === 0)) {
        this.handleDiscovery("moon", pointer.x, pointer.y);
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
      console.log(`Sun - RGB: R${pixel.red} G${pixel.green} B${pixel.blue}`);
      // Only trigger discovery for non-transparent pixels
      if (!(pixel.red === 0 && pixel.green === 0 && pixel.blue === 0)) {
        this.handleDiscovery("sun_position", pointer.x, pointer.y);
      }
    }
  }

  update(_time: number) {
    // Show the human figure only when land-facing frames are visible
    // Frames 0-3 show land masses; frames 4-7 are mostly ocean
    if (this.earth && this.humanFigure) {
      const frame = parseInt(this.earth.frame.name);
      const showOnFrames = [0, 1, 2, 3];
      this.humanFigure.setVisible(showOnFrames.includes(frame));
    }
  }

  addHoverCursor(gameObject: Phaser.GameObjects.GameObject) {
    gameObject.on("pointerover", () => this.input.setDefaultCursor("pointer"));
    gameObject.on("pointerout", () => this.input.setDefaultCursor("default"));
  }

  handleDiscovery(featureID: string, x?: number, y?: number) {
    // Emit Particles if coordinates are provided
    if (x !== undefined && y !== undefined) {
      this.discoveryEmitter.explode(15, x, y);
    }

    window.dispatchEvent(
      new CustomEvent("earth-discovery", {
        detail: { feature: featureID },
      })
    );

    // Audio trigger
    window.dispatchEvent(
      new CustomEvent("audio-stinger", { detail: { situation: "earth" } })
    );

    // Animations for feedback
    if (featureID === "moon") {
      this.tweens.killTweensOf(this.moon);
      this.moon.setScale(this.baseMoonScale);
      this.tweens.add({
        targets: this.moon,
        scale: this.baseMoonScale * 1.5,
        yoyo: true,
        duration: 200,
      });
    }
    if (featureID === "sun_position") {
      this.tweens.killTweensOf(this.sun);
      this.sun.setScale(this.baseSunScale);
      this.tweens.add({
        targets: this.sun,
        scale: this.baseSunScale * 1.2,
        yoyo: true,
        duration: 200,
      });
    }
  }

  shutdown() {
    this.uiOverlay.destroy();
  }
}
