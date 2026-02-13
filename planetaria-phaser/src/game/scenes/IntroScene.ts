import Phaser from "phaser";
import { BeatId, INTRO_CONFIG } from "./intro/IntroTypes";
import { generatePlaceholderTextures } from "./intro/IntroAssets";
import { STORY_BEATS } from "./intro/IntroStoryBeats";
import IntroStarfield from "./intro/IntroStarfield";
import IntroTextRenderer from "./intro/IntroTextRenderer";

// Beat visual builders
import { buildVoidApproachVisuals } from "./intro/beats/VoidApproachBeat";
import { buildPlanetaryCoresVisuals } from "./intro/beats/PlanetaryCoresBeat";
import { buildSSAstraVisuals } from "./intro/beats/SSAstraBeat";
import { buildShockwaveVisuals } from "./intro/beats/ShockwaveBeat";
import { buildCrashLandingVisuals } from "./intro/beats/CrashLandingBeat";

/**
 * IntroScene.ts
 *
 * Orchestrates the intro cinematic sequence.
 * Manages beat progression, input handling, transitions,
 * and delegates rendering to specialised modules.
 *
 * Flow:
 *   1. Generate placeholder textures (or load real assets)
 *   2. Create animated starfield background
 *   3. Show story beats one-by-one with visuals + typewriter text
 *   4. On completion, fade to black and transition to GameScene
 */
export default class IntroScene extends Phaser.Scene {
  // Current beat index
  private currentStep: number = 0;

  // State flags
  private isAnimating: boolean = false;
  private canSkip: boolean = false;

  // UI elements
  private skipText!: Phaser.GameObjects.Text;

  // Beat containers (one per beat, for clean teardown)
  private beatContainers: Phaser.GameObjects.Container[] = [];

  // Active typewriter renderer
  private activeTextRenderer: IntroTextRenderer | null = null;

  // Animated starfield background
  private starfield!: IntroStarfield;

  // Beat ID → visual builder mapping
  private readonly beatBuilders: Record<
    BeatId,
    (scene: Phaser.Scene, container: Phaser.GameObjects.Container) => void
  > = {
    void_approach: buildVoidApproachVisuals,
    planetary_cores: buildPlanetaryCoresVisuals,
    ss_astra: buildSSAstraVisuals,
    shockwave: buildShockwaveVisuals,
    crash: buildCrashLandingVisuals,
  };

  constructor() {
    super({ key: "IntroScene" });
  }

  /* ================================================================== */
  /*  PRELOAD                                                            */
  /* ================================================================== */

  preload(): void {
    // Load real planet sprites from assets/ui/
    this.load.image("intro_mercury", "assets/ui/mercury.png");
    this.load.image("intro_venus", "assets/ui/venus.png");
    this.load.image("intro_earth", "assets/ui/earth.png");
    this.load.image("intro_mars", "assets/ui/mars.png");
    this.load.image("intro_jupiter", "assets/ui/jupiter.png");
    this.load.image("intro_saturn", "assets/ui/saturn.png");
    this.load.image("intro_uranus", "assets/ui/uranus.png");
    this.load.image("intro_neptune", "assets/ui/neptune.png");
    this.load.image("intro_ship", "assets/ui/ss_astra.png");

    // Generate remaining procedural/placeholder textures
    generatePlaceholderTextures(this);
  }

  /* ================================================================== */
  /*  CREATE                                                             */
  /* ================================================================== */

  create(): void {
    // Reset state
    this.currentStep = 0;
    this.isAnimating = false;
    this.canSkip = false;
    this.beatContainers = [];
    this.activeTextRenderer = null;

    const { width, height } = this.scale;

    // ── Animated starfield background ──
    this.starfield = new IntroStarfield(this);

    // ── "Continue" prompt ──
    this.skipText = this.add
      .text(width - 20, height - 20, "[ SPACE / Click ]", {
        fontFamily: "monospace",
        fontSize: "12px",
        color: "#666666",
      })
      .setOrigin(1, 1)
      .setDepth(1000)
      .setAlpha(0);

    // Delay before allowing input
    this.time.delayedCall(INTRO_CONFIG.PROMPT_DELAY, () => {
      this.canSkip = true;
      this.tweens.add({
        targets: this.skipText,
        alpha: 1,
        duration: 500,
      });
    });

    // ── Input bindings ──
    this.input.keyboard?.on("keydown-SPACE", this.handleAdvance, this);
    this.input.on("pointerdown", this.handleAdvance, this);

    // ── Start the first beat ──
    this.showBeat(this.currentStep);
  }

  /* ================================================================== */
  /*  UPDATE (drives the starfield animation)                            */
  /* ================================================================== */

  update(_time: number, delta: number): void {
    this.starfield.update(delta);
  }

  /* ================================================================== */
  /*  BEAT RENDERER                                                      */
  /* ================================================================== */

  /**
   * Display a story beat by index.
   * Creates a container with the beat's visuals and typewriter text.
   */
  private showBeat(index: number): void {
    if (index >= STORY_BEATS.length) {
      this.transitionToGame();
      return;
    }

    this.isAnimating = true;
    const beat = STORY_BEATS[index];
    const { width, height } = this.scale;

    // Create a container for this beat's content
    const container = this.add.container(0, 0).setDepth(100);
    this.beatContainers.push(container);

    // Semi-transparent subtitle bar at the bottom for text readability
    const overlay = this.add.rectangle(
      width / 2,
      height * 0.85,
      width,
      height * 0.2,
      0x000000,
      0.6
    );
    container.add(overlay);

    // ── Build beat-specific visuals ──
    const builder = this.beatBuilders[beat.id];
    builder(this, container);

    // ── Typewriter text (subtitle position — lower third) ──
    this.activeTextRenderer = new IntroTextRenderer(
      this,
      width / 2,
      height * 0.85,
      beat.text,
      width * 0.7
    );
    container.add(this.activeTextRenderer.getTextObject());

    // ── Fade-in the container ──
    container.setAlpha(0);
    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 800,
      onComplete: () => {
        // Wait for typing to finish, then allow advancing
        const typingDuration = this.activeTextRenderer!.getTotalDuration();
        const bufferAfterFade = Math.max(typingDuration - 800, 0);

        this.time.delayedCall(
          bufferAfterFade + INTRO_CONFIG.POST_TYPE_BUFFER,
          () => {
            this.isAnimating = false;
          }
        );
      },
    });
  }

  /* ================================================================== */
  /*  INPUT HANDLING                                                     */
  /* ================================================================== */

  /**
   * Called when the player presses SPACE or clicks.
   * Either skips the typewriter or advances to the next beat.
   */
  private handleAdvance = (): void => {
    if (!this.canSkip) return;

    // If text is still typing, skip to the end instead of advancing
    if (this.isAnimating) {
      if (this.activeTextRenderer && !this.activeTextRenderer.getIsComplete()) {
        this.activeTextRenderer.skipToEnd();
      }
      this.isAnimating = false;
      return;
    }

    // Fade out the current beat, then show the next
    const currentContainer = this.beatContainers[this.currentStep];
    if (currentContainer) {
      this.tweens.add({
        targets: currentContainer,
        alpha: 0,
        duration: INTRO_CONFIG.FADE_DURATION,
        onComplete: () => {
          currentContainer.destroy();
          if (this.activeTextRenderer) {
            this.activeTextRenderer.destroy();
            this.activeTextRenderer = null;
          }
          this.currentStep++;
          this.showBeat(this.currentStep);
        },
      });
    } else {
      this.currentStep++;
      this.showBeat(this.currentStep);
    }
  };

  /* ================================================================== */
  /*  SCENE TRANSITION                                                   */
  /* ================================================================== */

  /**
   * Final cinematic transition: fade to black, show title card,
   * then launch the GameScene.
   */
  private transitionToGame(): void {
    const { width, height } = this.scale;

    // Full-screen black fade
    const fadeRect = this.add
      .rectangle(width / 2, height / 2, width, height, 0x000000, 0)
      .setDepth(9999);

    // "The Journey Begins" title card
    const titleCard = this.add
      .text(width / 2, height / 2, "THE JOURNEY BEGINS…", {
        fontFamily: "monospace",
        fontSize: "24px",
        color: "#ffffff",
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setAlpha(0)
      .setDepth(10000);

    // Fade to black
    this.tweens.add({
      targets: fadeRect,
      alpha: 1,
      duration: 1000,
      onComplete: () => {
        // Show title card, hold, then fade out and start game
        this.tweens.add({
          targets: titleCard,
          alpha: 1,
          duration: 1000,
          yoyo: true,
          hold: 1500,
          onComplete: () => {
            // Clean up starfield
            this.starfield.destroy();
            this.scene.start("GameScene");
          },
        });
      },
    });
  }
}
