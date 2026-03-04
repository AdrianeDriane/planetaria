import Phaser from "phaser";
import { WORLD, CAMERA } from "../config";
import { GameStarfield } from "../world/GridBackground";
import Terrain from "../world/Terrain";
import Player from "../entities/Player";
import { EventBus } from "../EventBus";
import { playHitSfx } from "../../audio/Sfx";
import { setBgMusicTrack, playBgMusic, setBgMusicLoop } from "../../audio/BgMusic";

const SHIP_TEXTURE = "game_ss_astra";
const SHIP_ASSET = "assets/ui/ss_astra.png";

// =========================================================================
// Mercury Mission World Config (tighter bounds than global WORLD)
// =========================================================================
const MERCURY_WORLD_WIDTH = 2400; // Reduced from 10000 for tighter pacing

// =========================================================================
// Mercury Mission State Machine
// =========================================================================
enum MissionState {
  SEARCHING_HAMMER = "SEARCHING_HAMMER",
  EXPLORING_SMASHING = "EXPLORING_SMASHING",
  REPAIR_COMPLETE = "REPAIR_COMPLETE",
}

// =========================================================================
// Trinket Data - 5 collectible items with Mercury facts
// =========================================================================
interface TrinketData {
  id: string;
  name: string;
  fact: string;
  color: number;
  iconSymbol: string;
}

const TRINKETS: TrinketData[] = [
  {
    id: "oxygen_tank",
    name: "Oxygen Tank",
    fact: "Mercury has no atmosphere.",
    color: 0x4a90d9,
    iconSymbol: "O₂",
  },
  {
    id: "calendar",
    name: "Calendar (88 days)",
    fact: "Mercury has the shortest year / revolution.",
    color: 0xd9a74a,
    iconSymbol: "📅",
  },
  {
    id: "clock",
    name: "Digital Clock",
    fact: "Mercury finishes one rotation in 58 days, 15 hours, and 30 mins.",
    color: 0x6ad94a,
    iconSymbol: "⏰",
  },
  {
    id: "no_moon",
    name: "Crossed-out Moon",
    fact: "Mercury has no moon.",
    color: 0xa84ad9,
    iconSymbol: "🌙",
  },
  {
    id: "cog",
    name: "Mechanical Cog",
    fact: "The final piece to repair the spaceship.",
    color: 0xd9d94a,
    iconSymbol: "⚙️",
  },
];

export default class GameScene extends Phaser.Scene {
  private player!: Player;
  private terrain!: Terrain;
  private starfield!: GameStarfield;
  private ship!: Phaser.GameObjects.Image;

  // Mission state
  private missionState: MissionState = MissionState.SEARCHING_HAMMER;
  private hasHammer: boolean = false;
  private collectedTrinkets: Set<string> = new Set();

  // Game objects
  private hammer!: Phaser.GameObjects.Sprite;
  private craters!: Phaser.Physics.Arcade.StaticGroup;
  private craterTrinketMap: Map<Phaser.GameObjects.GameObject, TrinketData> =
    new Map();

  // UI elements
  private factOverlay!: Phaser.GameObjects.Container;
  private missionText!: Phaser.GameObjects.Text;
  private inventoryIcons: Phaser.GameObjects.Container[] = [];
  private shipRepairedNotification!: Phaser.GameObjects.Container;
  private hammerIndicator!: Phaser.GameObjects.Container;

  // Mobile controls
  private mobileControlsContainer!: Phaser.GameObjects.Container;
  private landscapeOverlay!: Phaser.GameObjects.Container;
  private actionButtonPressed: boolean = false;
  private lastActionButtonState: boolean = false;
  private isMobile: boolean = false;
  private isPortraitBlocked: boolean = false;
  private victoryMusicPlayed: boolean = false;

  // Track if final cog overlay is awaiting manual dismiss
  private awaitingCogDismiss: boolean = false;

  // Input
  private interactKey!: Phaser.Input.Keyboard.Key;

  constructor() {
    super({ key: "GameScene" });
  }

  preload(): void {
    Player.preload(this);
    Terrain.preload();
    this.load.image(SHIP_TEXTURE, SHIP_ASSET);
  }

  create(): void {
    // Reset state for scene restart
    this.missionState = MissionState.SEARCHING_HAMMER;
    this.hasHammer = false;
    this.collectedTrinkets = new Set();
    this.craterTrinketMap = new Map();
    this.inventoryIcons = [];
    this.actionButtonPressed = false;
    this.lastActionButtonState = false;
    this.awaitingCogDismiss = false;
    this.isPortraitBlocked = false;
    this.victoryMusicPlayed = false;

    // Detect mobile device
    this.isMobile = !this.sys.game.device.os.desktop;

    // Use reduced Mercury world width for tighter pacing
    this.physics.world.setBounds(0, 0, MERCURY_WORLD_WIDTH, WORLD.HEIGHT);

    this.starfield = new GameStarfield(this);

    this.terrain = new Terrain(this);

    // Create damaged ship near the end of the level (right side)
    const shipX = MERCURY_WORLD_WIDTH - 300;
    const shipY = this.terrain.getSurfaceY(shipX) - 80;
    this.ship = this.add.image(shipX, shipY, SHIP_TEXTURE);
    this.ship.setScale(0.5);
    this.ship.setAngle(12);
    this.ship.setDepth(-5);

    this.player = new Player(this);

    this.physics.add.collider(this.player.getSprite(), this.terrain.getGroup());

    // Setup camera with reduced bounds
    const camera = this.cameras.main;
    camera.setBounds(0, 0, MERCURY_WORLD_WIDTH, WORLD.HEIGHT);
    camera.startFollow(this.player.getSprite(), true);
    camera.setLerp(CAMERA.LERP, CAMERA.LERP);
    camera.setDeadzone(CAMERA.DEADZONE_X, CAMERA.DEADZONE_Y);

    // Setup input
    this.interactKey = this.input.keyboard!.addKey(
      Phaser.Input.Keyboard.KeyCodes.E
    );

    // Create game objects
    this.createHammer();
    this.createCraters();

    // Create UI
    this.createUI();

    // Create mobile controls if on mobile
    if (this.isMobile) {
      this.createMobileControls();
      this.createLandscapeOverlay();
    }

    // Initial mission display
    this.updateMissionText();
  }

  update(_time: number, delta: number): void {
    // Check orientation on mobile - block everything if in portrait
    if (this.isMobile) {
      this.checkOrientation();
      if (this.isPortraitBlocked) {
        return; // Don't process anything while in portrait mode
      }
    }

    this.player.update();
    this.starfield.update(delta);

    // Handle interactions based on state
    this.handleInteractions();

    // Animate hammer if not collected
    if (!this.hasHammer && this.hammer) {
      this.hammer.y += Math.sin(_time * 0.005) * 0.3;
    }
  }

  // ===========================================================================
  // MOBILE CONTROLS
  // ===========================================================================

  private createMobileControls(): void {
    this.mobileControlsContainer = this.add.container(0, 0);
    this.mobileControlsContainer.setScrollFactor(0);
    this.mobileControlsContainer.setDepth(500);

    const buttonSize = 60;
    const padding = 15;
    const bottomY = this.scale.height - buttonSize - padding;

    // --- Left Side: Movement Buttons ---
    const leftX = padding;
    const rightX = padding + buttonSize + 10;

    // Left button
    this.createMobileButton(
      leftX + buttonSize / 2,
      bottomY + buttonSize / 2,
      buttonSize,
      "◀",
      () => this.player.setMoveLeft(true),
      () => this.player.setMoveLeft(false)
    );

    // Right button
    this.createMobileButton(
      rightX + buttonSize / 2,
      bottomY + buttonSize / 2,
      buttonSize,
      "▶",
      () => this.player.setMoveRight(true),
      () => this.player.setMoveRight(false)
    );

    // --- Right Side: Jump and Action Buttons ---
    const actionX = this.scale.width - padding - buttonSize / 2;
    const jumpX = actionX - buttonSize - 10;

    // Jump button
    this.createMobileButton(
      jumpX,
      bottomY + buttonSize / 2,
      buttonSize,
      "▲",
      () => this.player.setJump(true),
      () => this.player.setJump(false)
    );

    // Action button (replaces E key)
    this.createMobileButton(
      actionX,
      bottomY + buttonSize / 2,
      buttonSize,
      "⚡",
      () => {
        this.actionButtonPressed = true;
        playHitSfx();
      },
      () => {
        this.actionButtonPressed = false;
      },
      0x44aa44 // Green color for action
    );
  }

  private createMobileButton(
    x: number,
    y: number,
    size: number,
    label: string,
    onDown: () => void,
    onUp: () => void,
    color: number = 0x444466
  ): void {
    const container = this.add.container(x, y);
    container.setScrollFactor(0);

    // Button background
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.6);
    bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
    bg.lineStyle(3, 0xffffff, 0.4);
    bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
    container.add(bg);

    // Button label
    const text = this.add.text(0, 0, label, {
      fontSize: "24px",
      color: "#ffffff",
    });
    text.setOrigin(0.5);
    container.add(text);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-size / 2, -size / 2, size, size);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on("pointerdown", () => {
      bg.clear();
      bg.fillStyle(0xffffff, 0.3);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
      bg.lineStyle(3, 0xffffff, 0.8);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
      onDown();
    });

    container.on("pointerup", () => {
      bg.clear();
      bg.fillStyle(color, 0.6);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
      bg.lineStyle(3, 0xffffff, 0.4);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
      onUp();
    });

    container.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(color, 0.6);
      bg.fillRoundedRect(-size / 2, -size / 2, size, size, 12);
      bg.lineStyle(3, 0xffffff, 0.4);
      bg.strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
      onUp();
    });

    this.mobileControlsContainer.add(container);
  }

  private createLandscapeOverlay(): void {
    this.landscapeOverlay = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );
    this.landscapeOverlay.setScrollFactor(0);
    this.landscapeOverlay.setDepth(1000);
    this.landscapeOverlay.setVisible(false);

    // Full screen dark overlay - use large values to cover any orientation
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.98);
    bg.fillRect(-1000, -1000, 2000, 2000);
    this.landscapeOverlay.add(bg);

    // Rotate icon (phone rotating animation)
    const rotateIcon = this.add.text(0, -40, "📲", {
      fontSize: "64px",
    });
    rotateIcon.setOrigin(0.5);
    this.landscapeOverlay.add(rotateIcon);

    // Animate the rotate icon
    this.tweens.add({
      targets: rotateIcon,
      angle: { from: -15, to: 15 },
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Main message
    const message = this.add.text(
      0,
      35,
      "Rotate your device to\nenter landscape view",
      {
        fontSize: "20px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 6,
      }
    );
    message.setOrigin(0.5);
    this.landscapeOverlay.add(message);

    // Subtitle
    const subtitle = this.add.text(
      0,
      85,
      "This game requires landscape orientation",
      {
        fontSize: "12px",
        color: "#888888",
      }
    );
    subtitle.setOrigin(0.5);
    this.landscapeOverlay.add(subtitle);
  }

  private checkOrientation(): void {
    const isPortrait = this.scale.height > this.scale.width;

    if (isPortrait) {
      this.isPortraitBlocked = true;
      if (this.landscapeOverlay) {
        this.landscapeOverlay.setVisible(true);
        // Reposition overlay to center of current screen dimensions
        this.landscapeOverlay.setPosition(
          this.scale.width / 2,
          this.scale.height / 2
        );
      }
      this.physics.pause();
      // Hide mobile controls while in portrait
      if (this.mobileControlsContainer) {
        this.mobileControlsContainer.setVisible(false);
      }
    } else {
      this.isPortraitBlocked = false;
      if (this.landscapeOverlay) {
        this.landscapeOverlay.setVisible(false);
      }
      // Show mobile controls again
      if (this.mobileControlsContainer) {
        this.mobileControlsContainer.setVisible(true);
      }
      // Only resume if not in fact overlay
      if (!this.factOverlay.visible) {
        this.physics.resume();
      }
    }
  }

  // ===========================================================================
  // HAMMER SYSTEM
  // ===========================================================================

  private createHammer(): void {
    // Place hammer in rubble area (left side of map, accessible on terrain)
    const hammerX = 350;
    const hammerY = this.terrain.getSurfaceY(hammerX) - 20;

    // Generate hammer texture
    this.generateHammerTexture();

    this.hammer = this.add.sprite(hammerX, hammerY, "hammer_sprite");
    this.hammer.setDepth(5);
    this.hammer.setScale(1.5);

    // Add glow effect
    this.createPickupGlow(this.hammer);

    // Add idle pulsing animation (visual feedback)
    this.tweens.add({
      targets: this.hammer,
      scaleX: { from: 1.5, to: 1.8 },
      scaleY: { from: 1.5, to: 1.8 },
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  private generateHammerTexture(): void {
    if (this.textures.exists("hammer_sprite")) return;

    const gfx = this.add.graphics();
    const size = 24;

    // Handle
    gfx.fillStyle(0x8b4513, 1);
    gfx.fillRect(10, 8, 4, 16);

    // Head
    gfx.fillStyle(0x708090, 1);
    gfx.fillRect(4, 4, 16, 8);

    // Head highlight
    gfx.fillStyle(0xa0a0a0, 0.6);
    gfx.fillRect(5, 5, 14, 2);

    gfx.generateTexture("hammer_sprite", size, size);
    gfx.destroy();
  }

  private createPickupGlow(target: Phaser.GameObjects.Sprite): void {
    const glow = this.add.graphics();
    glow.fillStyle(0xffff00, 0.3);
    glow.fillCircle(0, 0, 20);
    glow.setPosition(target.x, target.y);
    glow.setDepth(4);

    // Pulse animation
    this.tweens.add({
      targets: glow,
      alpha: { from: 0.3, to: 0.7 },
      scaleX: { from: 1, to: 1.3 },
      scaleY: { from: 1, to: 1.3 },
      duration: 800,
      yoyo: true,
      repeat: -1,
    });

    // Store reference for cleanup
    (target as any).glowEffect = glow;
  }

  private pickupHammer(): void {
    // Stop all tweens on hammer
    this.tweens.killTweensOf(this.hammer);

    // Visual pickup animation: scale up, spin, then shrink away
    this.tweens.add({
      targets: this.hammer,
      scaleX: 2.5,
      scaleY: 2.5,
      angle: 360,
      alpha: 0,
      duration: 400,
      ease: "Back.easeIn",
      onComplete: () => {
        // Remove hammer sprite and glow after animation
        const glow = (this.hammer as any).glowEffect;
        if (glow) glow.destroy();
        this.hammer.destroy();
      },
    });

    this.hasHammer = true;
    this.missionState = MissionState.EXPLORING_SMASHING;

    // Show pickup notification
    this.showFactOverlay({
      id: "hammer",
      name: "Hammer",
      fact: this.isMobile
        ? "You found a hammer! Tap ⚡ near craters to smash them."
        : "You found a hammer! Use E near craters to smash them.",
      color: 0x708090,
      iconSymbol: "🔨",
    });

    // Update UI
    this.updateMissionText();
    this.hammerIndicator.setVisible(true);
  }

  // ===========================================================================
  // CRATER SYSTEM
  // ===========================================================================

  private createCraters(): void {
    this.craters = this.physics.add.staticGroup();

    // Generate crater texture
    this.generateCraterTexture();

    // Distribute 5 craters evenly across the reduced map width
    // Final crater (cog) placed near the ship at the right side
    const craterPositions = [
      { x: 550, trinketIdx: 0 }, // Oxygen Tank
      { x: 900, trinketIdx: 1 }, // Calendar
      { x: 1300, trinketIdx: 2 }, // Digital Clock
      { x: 1700, trinketIdx: 3 }, // Crossed-out Moon
      { x: 2050, trinketIdx: 4 }, // Mechanical Cog (near ship)
    ];

    craterPositions.forEach((pos) => {
      // Use terrain's getSurfaceY to place crater ON TOP of visible terrain
      const surfaceY = this.terrain.getSurfaceY(pos.x);
      const craterY = surfaceY - 16; // Slightly above surface so it's accessible

      const crater = this.craters.create(
        pos.x,
        craterY,
        "crater_sprite"
      ) as Phaser.Physics.Arcade.Sprite;

      crater.setDepth(3);
      crater.setScale(2);

      // Adjust body size to not block player completely
      crater.body?.setSize(32, 16);
      crater.body?.setOffset(0, 16);
      crater.refreshBody();

      // Map crater to trinket
      this.craterTrinketMap.set(crater, TRINKETS[pos.trinketIdx]);

      // Add visual indicator
      this.createCraterIndicator(crater);
    });

    // Overlap instead of collider so player can walk through and interact
    this.physics.add.overlap(
      this.player.getSprite(),
      this.craters,
      undefined,
      undefined,
      this
    );
  }

  private generateCraterTexture(): void {
    if (this.textures.exists("crater_sprite")) return;

    const gfx = this.add.graphics();
    const size = 32;

    // Outer crater rim
    gfx.fillStyle(0x4a4035, 1);
    gfx.fillEllipse(size / 2, size / 2 + 4, size - 4, size / 2);

    // Inner dark area
    gfx.fillStyle(0x1a1510, 1);
    gfx.fillEllipse(size / 2, size / 2 + 6, size - 12, size / 3);

    // Highlight
    gfx.fillStyle(0x6a5a48, 0.7);
    gfx.fillEllipse(size / 2 - 4, size / 2 + 2, size / 3, size / 6);

    // Glowing crack (hint there's something inside)
    gfx.fillStyle(0xffcc00, 0.5);
    gfx.fillRect(size / 2 - 2, size / 2 + 4, 4, 2);

    gfx.generateTexture("crater_sprite", size, size);
    gfx.destroy();
  }

  private createCraterIndicator(crater: Phaser.Physics.Arcade.Sprite): void {
    const indicator = this.add.text(crater.x, crater.y - 40, "?", {
      fontSize: "16px",
      color: "#ffcc00",
      fontStyle: "bold",
    });
    indicator.setOrigin(0.5);
    indicator.setDepth(6);

    // Bounce animation
    this.tweens.add({
      targets: indicator,
      y: indicator.y - 8,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    (crater as any).indicator = indicator;
  }

  private smashCrater(crater: Phaser.Physics.Arcade.Sprite): void {
    const trinket = this.craterTrinketMap.get(crater);
    if (!trinket) return;

    // Play hammer swing animation near the player
    this.playHammerSwing();

    // Destroy crater visual
    const indicator = (crater as any).indicator;
    if (indicator) indicator.destroy();

    // Create smash particles
    this.createSmashParticles(crater.x, crater.y);

    // Remove crater
    crater.destroy();
    this.craterTrinketMap.delete(crater);

    // Collect trinket
    this.collectTrinket(trinket);
  }

  private playHammerSwing(): void {
    // Create temporary hammer sprite for swing animation
    const playerSprite = this.player.getSprite();
    const swingHammer = this.add.sprite(
      playerSprite.x + (playerSprite.flipX ? -20 : 20),
      playerSprite.y - 10,
      "hammer_sprite"
    );
    swingHammer.setScale(2);
    swingHammer.setDepth(15);
    swingHammer.setFlipX(playerSprite.flipX);

    // Swing rotation animation
    const startAngle = playerSprite.flipX ? 45 : -45;
    const endAngle = playerSprite.flipX ? -90 : 90;
    swingHammer.setAngle(startAngle);

    this.tweens.add({
      targets: swingHammer,
      angle: endAngle,
      duration: 150,
      ease: "Power2",
      yoyo: true,
      onComplete: () => swingHammer.destroy(),
    });
  }

  private createSmashParticles(x: number, y: number): void {
    const particles = this.add.graphics();
    particles.setDepth(10);

    // Create debris particles
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      const dist = 20 + Math.random() * 30;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;

      const particle = this.add.graphics();
      particle.fillStyle(0x6a5a48, 1);
      particle.fillRect(-2, -2, 4, 4);
      particle.setPosition(x, y);
      particle.setDepth(10);

      this.tweens.add({
        targets: particle,
        x: px,
        y: py - 20,
        alpha: 0,
        duration: 400,
        ease: "Power2",
        onComplete: () => particle.destroy(),
      });
    }

    // Screen shake
    this.cameras.main.shake(150, 0.005);
  }

  // ===========================================================================
  // TRINKET COLLECTION
  // ===========================================================================

  private collectTrinket(trinket: TrinketData): void {
    this.collectedTrinkets.add(trinket.id);

    // Add to inventory UI
    this.addInventoryIcon(trinket);

    // Check if this is the mechanical cog (final trinket)
    if (trinket.id === "cog") {
      // Show regular overlay; completion triggers when player dismisses it
      this.awaitingCogDismiss = true;
      this.showFactOverlay(trinket);
    } else {
      // Show regular fact overlay
      this.showFactOverlay(trinket);

      // Check for completion (won't trigger here since cog hasn't been collected)
      if (this.collectedTrinkets.size >= TRINKETS.length) {
        this.onAllTrinketsCollected();
      }
    }
  }

  private addInventoryIcon(trinket: TrinketData): void {
    const idx = this.inventoryIcons.length;
    const iconSize = 28;
    const padding = 6;
    const startX = 10;
    const startY = 50;

    const container = this.add.container(
      startX + idx * (iconSize + padding),
      startY
    );
    container.setScrollFactor(0);
    container.setDepth(100);

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(trinket.color, 0.8);
    bg.fillRoundedRect(0, 0, iconSize, iconSize, 4);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeRoundedRect(0, 0, iconSize, iconSize, 4);
    container.add(bg);

    // Icon text
    const icon = this.add.text(iconSize / 2, iconSize / 2, trinket.iconSymbol, {
      fontSize: "14px",
    });
    icon.setOrigin(0.5);
    container.add(icon);

    // Pop-in animation
    container.setScale(0);
    this.tweens.add({
      targets: container,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });

    this.inventoryIcons.push(container);
  }

  // ===========================================================================
  // UI SYSTEM
  // ===========================================================================

  private createUI(): void {
    // Mission text at top
    this.missionText = this.add.text(10, 10, "", {
      fontSize: "14px",
      color: "#ffffff",
      backgroundColor: "#00000088",
      padding: { x: 8, y: 4 },
    });
    this.missionText.setScrollFactor(0);
    this.missionText.setDepth(100);

    // Hammer indicator (hidden until collected)
    this.hammerIndicator = this.add.container(10, 85);
    this.hammerIndicator.setScrollFactor(0);
    this.hammerIndicator.setDepth(100);
    this.hammerIndicator.setVisible(false);

    const hammerBg = this.add.graphics();
    hammerBg.fillStyle(0x708090, 0.8);
    hammerBg.fillRoundedRect(0, 0, 80, 24, 4);
    this.hammerIndicator.add(hammerBg);

    const hammerText = this.add.text(40, 12, "🔨 Hammer", {
      fontSize: "12px",
      color: "#ffffff",
    });
    hammerText.setOrigin(0.5);
    this.hammerIndicator.add(hammerText);

    // Fact overlay (hidden by default)
    this.createFactOverlay();

    // Interaction hint
    this.createInteractionHint();
  }

  private createFactOverlay(): void {
    this.factOverlay = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );
    this.factOverlay.setScrollFactor(0);
    this.factOverlay.setDepth(200);
    this.factOverlay.setVisible(false);

    // Darker semi-transparent background
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.75);
    overlay.fillRect(
      -this.scale.width / 2,
      -this.scale.height / 2,
      this.scale.width,
      this.scale.height
    );
    this.factOverlay.add(overlay);

    // Fact panel
    const panelWidth = 320;
    const panelHeight = 160;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a1a2e, 1);
    panel.fillRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      12
    );
    panel.lineStyle(3, 0x4a90d9, 1);
    panel.strokeRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      12
    );
    this.factOverlay.add(panel);
  }

  private showFactOverlay(trinket: TrinketData): void {
    // Clear previous content (keep background elements)
    while (this.factOverlay.length > 2) {
      this.factOverlay.removeAt(2, true);
    }

    // Title
    const title = this.add.text(0, -50, trinket.name, {
      fontSize: "20px",
      color: "#ffffff",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    this.factOverlay.add(title);

    // Icon
    const icon = this.add.text(0, -15, trinket.iconSymbol, {
      fontSize: "32px",
    });
    icon.setOrigin(0.5);
    this.factOverlay.add(icon);

    // Fact text
    const fact = this.add.text(0, 30, trinket.fact, {
      fontSize: "14px",
      color: "#aaaaaa",
      wordWrap: { width: 280 },
      align: "center",
    });
    fact.setOrigin(0.5);
    this.factOverlay.add(fact);

    // Continue prompt - show appropriate text for mobile/desktop
    const promptText = this.isMobile
      ? "Tap ⚡ to continue"
      : "Press E to continue";
    const prompt = this.add.text(0, 65, promptText, {
      fontSize: "12px",
      color: "#666666",
    });
    prompt.setOrigin(0.5);
    this.factOverlay.add(prompt);

    // Show with animation
    this.factOverlay.setScale(0.8);
    this.factOverlay.setAlpha(0);
    this.factOverlay.setVisible(true);

    this.tweens.add({
      targets: this.factOverlay,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 200,
      ease: "Back.easeOut",
    });

    // Pause game while overlay is shown
    this.physics.pause();
  }

  private hideFactOverlay(): void {
    this.tweens.add({
      targets: this.factOverlay,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 150,
      onComplete: () => {
        this.factOverlay.setVisible(false);
        this.physics.resume();
        this.updateMissionText();

        if (this.awaitingCogDismiss) {
          this.awaitingCogDismiss = false;
          if (this.collectedTrinkets.size >= TRINKETS.length) {
            this.onAllTrinketsCollected();
          }
        }
      },
    });
  }

  private createInteractionHint(): void {
    const hint = this.add.text(0, 0, "[E] Interact", {
      fontSize: "10px",
      color: "#ffff00",
      backgroundColor: "#00000088",
      padding: { x: 4, y: 2 },
    });
    hint.setOrigin(0.5);
    hint.setDepth(50);
    hint.setVisible(false);
    (this as any).interactionHint = hint;
  }

  private updateMissionText(): void {
    let text = "";
    switch (this.missionState) {
      case MissionState.SEARCHING_HAMMER:
        text = "🔍 Find the Hammer in the rubble";
        break;
      case MissionState.EXPLORING_SMASHING:
        text = `🔨 Smash craters to find parts (${this.collectedTrinkets.size}/${TRINKETS.length})`;
        break;
      case MissionState.REPAIR_COMPLETE:
        text = "🚀 Ship Repaired! Launching to Venus...";
        break;
    }
    this.missionText.setText(text);
  }

  // ===========================================================================
  // INTERACTION HANDLING
  // ===========================================================================

  private handleInteractions(): void {
    // If fact overlay is visible, check for dismiss
    if (this.factOverlay.visible) {
      const actionJustPressed = this.isActionJustPressed();
      if (actionJustPressed) {
        this.hideFactOverlay();
      }
      // Must update state tracking even when returning early
      this.lastActionButtonState = this.actionButtonPressed;
      return;
    }

    const playerSprite = this.player.getSprite();
    const hint = (this as any).interactionHint as Phaser.GameObjects.Text;
    hint.setVisible(false);

    switch (this.missionState) {
      case MissionState.SEARCHING_HAMMER:
        this.checkHammerPickup(playerSprite, hint);
        break;

      case MissionState.EXPLORING_SMASHING:
        this.checkCraterSmash(playerSprite, hint);
        break;

      case MissionState.REPAIR_COMPLETE:
        // Handled by transition
        break;
    }

    // Track action button state for edge detection
    this.lastActionButtonState = this.actionButtonPressed;
  }

  private isActionJustPressed(): boolean {
    const keyboardAction = Phaser.Input.Keyboard.JustDown(this.interactKey);
    if (keyboardAction) playHitSfx();
    const mobileAction =
      this.actionButtonPressed && !this.lastActionButtonState;
    return keyboardAction || mobileAction;
  }

  private checkHammerPickup(
    playerSprite: Phaser.GameObjects.Sprite,
    hint: Phaser.GameObjects.Text
  ): void {
    if (!this.hammer || !this.hammer.active) return;

    const dist = Phaser.Math.Distance.Between(
      playerSprite.x,
      playerSprite.y,
      this.hammer.x,
      this.hammer.y
    );

    if (dist < 50) {
      hint.setPosition(this.hammer.x, this.hammer.y - 30);
      hint.setText(this.isMobile ? "Tap ⚡ to pick up" : "[E] Pick up Hammer");
      hint.setVisible(true);

      if (this.isActionJustPressed()) {
        this.pickupHammer();
      }
    }
  }

  private checkCraterSmash(
    playerSprite: Phaser.GameObjects.Sprite,
    hint: Phaser.GameObjects.Text
  ): void {
    let nearestCrater: Phaser.Physics.Arcade.Sprite | null = null;
    let nearestDist = Infinity;

    this.craters.getChildren().forEach((obj) => {
      const crater = obj as Phaser.Physics.Arcade.Sprite;
      const dist = Phaser.Math.Distance.Between(
        playerSprite.x,
        playerSprite.y,
        crater.x,
        crater.y
      );

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestCrater = crater;
      }
    });

    if (nearestCrater !== null && nearestDist < 60) {
      const crater = nearestCrater as Phaser.Physics.Arcade.Sprite;
      hint.setPosition(crater.x, crater.y - 50);
      hint.setText(this.isMobile ? "Tap ⚡ to smash" : "[E] Smash Crater");
      hint.setVisible(true);

      if (this.isActionJustPressed()) {
        this.smashCrater(crater);
      }
    }
  }

  // ===========================================================================
  // COMPLETION & TRANSITION
  // ===========================================================================

  private onAllTrinketsCollected(): void {
    // Brief delay to let facts sink in
    this.time.delayedCall(500, () => {
      this.missionState = MissionState.REPAIR_COMPLETE;
      this.updateMissionText();

      // Swap to victory music
      if (!this.victoryMusicPlayed) {
        const victoryTrack = "/musicalscores/victory.mp3";
        setBgMusicLoop(false);
        setBgMusicTrack(victoryTrack);
        playBgMusic(victoryTrack);
        this.victoryMusicPlayed = true;
      }

      // Screen shake for dramatic effect
      this.cameras.main.shake(400, 0.015);

      // Show "Ship Repaired" notification
      this.showShipRepairedNotification();

      // Show Summary of Learnings after notification, before launch
      this.time.delayedCall(2000, () => {
        this.showMercurySummary();
      });
    });
  }

  /**
   * Summary of Learnings screen for Mercury.
   * Displays all collected trinket facts before launching to Venus.
   */
  private showMercurySummary(): void {
    // Hide the ship repaired notification
    if (this.shipRepairedNotification) {
      this.tweens.add({
        targets: this.shipRepairedNotification,
        alpha: 0,
        duration: 300,
        onComplete: () => this.shipRepairedNotification?.destroy(),
      });
    }

    // Hide mobile controls so they don't block the launch button on touch devices
    if (this.mobileControlsContainer) {
      this.mobileControlsContainer.setVisible(false);
    }

    const cx = this.scale.width / 2;
    const cy = this.scale.height / 2;

    const summaryContainer = this.add.container(cx, cy);
    summaryContainer.setScrollFactor(0);
    summaryContainer.setDepth(300);

    // Dark backdrop
    const backdrop = this.add.rectangle(
      0,
      0,
      this.scale.width,
      this.scale.height,
      0x000000,
      0.8
    );
    summaryContainer.add(backdrop);

    // Panel
    const panelWidth = Math.min(460, this.scale.width - 40);
    const panelHeight = Math.min(380, this.scale.height - 60);
    const panel = this.add.graphics();
    panel.fillStyle(0x0d1b2a, 0.97);
    panel.fillRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      14
    );
    panel.lineStyle(3, 0xfbbf24, 1);
    panel.strokeRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      14
    );
    summaryContainer.add(panel);

    // Title
    const title = this.add.text(
      0,
      -panelHeight / 2 + 30,
      "★ MERCURY: SUMMARY OF LEARNINGS ★",
      {
        fontSize: "14px",
        color: "#fbbf24",
        fontStyle: "bold",
        fontFamily: "'Press Start 2P', 'Courier New'",
        align: "center",
        wordWrap: { width: panelWidth - 40 },
      }
    );
    title.setOrigin(0.5, 0);
    summaryContainer.add(title);

    // Subtitle
    const subtitle = this.add.text(
      0,
      -panelHeight / 2 + 60,
      "Key facts discovered on Mercury:",
      {
        fontSize: "10px",
        color: "#94a3b8",
        fontFamily: "'Courier New'",
      }
    );
    subtitle.setOrigin(0.5, 0);
    summaryContainer.add(subtitle);

    // List trinket facts
    let factY = -panelHeight / 2 + 90;
    TRINKETS.forEach((trinket) => {
      // Skip the cog (it's a repair piece, not a learning fact)
      if (trinket.id === "cog") return;

      const bulletIcon = this.add.text(
        -panelWidth / 2 + 30,
        factY,
        trinket.iconSymbol,
        {
          fontSize: "16px",
        }
      );
      bulletIcon.setOrigin(0, 0);
      summaryContainer.add(bulletIcon);

      const factName = this.add.text(
        -panelWidth / 2 + 60,
        factY,
        trinket.name,
        {
          fontSize: "11px",
          color: "#fbbf24",
          fontStyle: "bold",
          fontFamily: "'Courier New'",
        }
      );
      factName.setOrigin(0, 0);
      summaryContainer.add(factName);

      const factText = this.add.text(
        -panelWidth / 2 + 60,
        factY + 18,
        trinket.fact,
        {
          fontSize: "10px",
          color: "#e2e8f0",
          fontFamily: "'Courier New'",
          wordWrap: { width: panelWidth - 100 },
          lineSpacing: 4,
        }
      );
      factText.setOrigin(0, 0);
      summaryContainer.add(factText);

      factY += 45;
    });

    // Auto-continue countdown (replaces launch button)
    const countdownText = this.add.text(
      0,
      panelHeight / 2 - 28,
      "Auto-continue in 10...",
      {
        fontSize: "11px",
        color: "#94a3b8",
        fontFamily: "'Courier New'",
        align: "center",
      }
    );
    countdownText.setOrigin(0.5, 0.5);
    summaryContainer.add(countdownText);

    let countdown = 10;
    let hasLaunched = false;

    const proceedToVenus = () => {
      if (hasLaunched) return;
      hasLaunched = true;

      try {
        const STORAGE_KEY = "planetaria_progress";
        const stored = localStorage.getItem(STORAGE_KEY);
        let progress = stored ? JSON.parse(stored) : {};
        progress[2] = "unlocked";
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn("Failed to save progress in GameScene:", e);
      }

      this.tweens.add({
        targets: summaryContainer,
        alpha: 0,
        duration: 500,
        onComplete: () => {
          summaryContainer.destroy();
          this.startLaunchSequence();
        },
      });
    };

    this.time.addEvent({
      delay: 1000,
      repeat: 9,
      callback: () => {
        countdown--;
        countdownText.setText(`Auto-continue in ${countdown}...`);
        if (countdown <= 0) {
          proceedToVenus();
        }
      },
    });

    // Animate entrance
    summaryContainer.setScale(0.8);
    summaryContainer.setAlpha(0);
    this.tweens.add({
      targets: summaryContainer,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 500,
      ease: "Back.easeOut",
    });
  }

  private showShipRepairedNotification(): void {
    this.shipRepairedNotification = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2
    );
    this.shipRepairedNotification.setScrollFactor(0);
    this.shipRepairedNotification.setDepth(250);

    // Background panel
    const panelWidth = 280;
    const panelHeight = 100;
    const panel = this.add.graphics();
    panel.fillStyle(0x1a3a1a, 0.95);
    panel.fillRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      12
    );
    panel.lineStyle(4, 0x44ff44, 1);
    panel.strokeRoundedRect(
      -panelWidth / 2,
      -panelHeight / 2,
      panelWidth,
      panelHeight,
      12
    );
    this.shipRepairedNotification.add(panel);

    // Success icon
    const icon = this.add.text(0, -20, "✅", { fontSize: "32px" });
    icon.setOrigin(0.5);
    this.shipRepairedNotification.add(icon);

    // Title
    const title = this.add.text(0, 20, "SHIP REPAIRED!", {
      fontSize: "20px",
      color: "#44ff44",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);
    this.shipRepairedNotification.add(title);

    // Animate in
    this.shipRepairedNotification.setScale(0);
    this.shipRepairedNotification.setAlpha(0);
    this.tweens.add({
      targets: this.shipRepairedNotification,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration: 400,
      ease: "Back.easeOut",
    });

    // Flash effect on the panel
    this.tweens.add({
      targets: panel,
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: 3,
    });
  }

  private startLaunchSequence(): void {
    // Disable player input
    this.input.keyboard!.enabled = false;

    // Hide mobile controls if present
    if (this.mobileControlsContainer) {
      this.tweens.add({
        targets: this.mobileControlsContainer,
        alpha: 0,
        duration: 300,
      });
    }

    // Hide the notification
    if (this.shipRepairedNotification) {
      this.tweens.add({
        targets: this.shipRepairedNotification,
        alpha: 0,
        duration: 300,
        onComplete: () => this.shipRepairedNotification.destroy(),
      });
    }

    // Pan camera to ship
    this.cameras.main.stopFollow();
    this.cameras.main.pan(this.ship.x, this.ship.y, 1000, "Power2");

    // Hide the player sprite (Galactic Cadet is now inside the ship)
    const playerSprite = this.player.getSprite();
    this.tweens.add({
      targets: playerSprite,
      alpha: 0,
      scaleX: 0.5,
      scaleY: 0.5,
      duration: 500,
      onComplete: () => {
        playerSprite.setVisible(false);
      },
    });

    // Ship repair effect
    const repairFlash = this.add.graphics();
    repairFlash.fillStyle(0xffff00, 0.5);
    repairFlash.fillCircle(this.ship.x, this.ship.y, 100);
    repairFlash.setDepth(50);

    this.tweens.add({
      targets: repairFlash,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 800,
      onComplete: () => repairFlash.destroy(),
    });

    // Straighten ship
    this.tweens.add({
      targets: this.ship,
      angle: 0,
      duration: 1000,
      ease: "Power2",
    });

    // Launch sequence after repair
    this.time.delayedCall(1500, () => {
      this.launchToVenus();
    });
  }

  private launchToVenus(): void {
    // Engine particles
    const engineGlow = this.add.graphics();
    engineGlow.fillStyle(0xff6600, 0.8);
    engineGlow.fillEllipse(this.ship.x, this.ship.y + 50, 30, 60);
    engineGlow.setDepth(49);

    // Screen shake for launch
    this.cameras.main.shake(500, 0.01);

    // Ship flies up
    this.tweens.add({
      targets: [this.ship, engineGlow],
      y: -200,
      duration: 2000,
      ease: "Power2.easeIn",
    });

    // Fade to white
    this.cameras.main.fadeOut(2000, 255, 255, 255);

    // Transition to Venus scene (or next scene)
    this.time.delayedCall(2500, () => {
      // Save Venus as unlocked before transitioning
      try {
        const STORAGE_KEY = "planetaria_progress";
        const stored = localStorage.getItem(STORAGE_KEY);
        let progress = stored ? JSON.parse(stored) : {};
        progress[2] = "unlocked"; // Venus is planet index 2
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      } catch (e) {
        console.warn("Failed to save progress in GameScene:", e);
      }

      this.cameras.main.fadeOut(1000, 0, 0, 0);
      this.cameras.main.once(
        Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE,
        () => {
          EventBus.emit("mercury-complete");
        }
      );
    });
  }
}
