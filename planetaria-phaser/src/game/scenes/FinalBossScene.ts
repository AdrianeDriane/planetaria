import Phaser from "phaser";
import { EventBus } from "../EventBus";

// ─── Configuration ───

/** Number of correct answers needed to defeat the boss */
const CORRECT_TO_WIN = 12;
/** Total number of lives (one per planet) */
const MAX_LIVES = 8;
/** Total questions available */
const TOTAL_QUESTIONS = 20;

// ─── Quiz Data ───

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  planet: string; // which planet this question is about
}

/**
 * 20 questions across all 8 planets.
 * Ordered from easier to slightly harder (6th-grade appropriate).
 * Each planet gets 2–3 questions.
 */
const QUESTIONS: QuizQuestion[] = [
  // ── Mercury (2) ──
  {
    question: "Mercury is the _____ planet from the Sun.",
    options: ["Closest", "Farthest", "Third", "Fifth"],
    correctIndex: 0,
    planet: "Mercury",
  },
  {
    question: "Why does Mercury have almost no atmosphere?",
    options: [
      "It's too cold",
      "Its gravity is too weak to hold gas",
      "It has too much water",
      "It spins too fast",
    ],
    correctIndex: 1,
    planet: "Mercury",
  },

  // ── Venus (2) ──
  {
    question:
      "Venus is often called Earth's _____ because of its similar size.",
    options: ["Brother", "Twin", "Copy", "Shadow"],
    correctIndex: 1,
    planet: "Venus",
  },
  {
    question: "What makes Venus the hottest planet in our solar system?",
    options: [
      "It's closest to the Sun",
      "Its thick atmosphere traps heat",
      "It has active volcanoes everywhere",
      "It has no water at all",
    ],
    correctIndex: 1,
    planet: "Venus",
  },

  // ── Earth (3) ──
  {
    question: "What percentage of Earth's surface is covered by water?",
    options: ["About 50%", "About 71%", "About 90%", "About 30%"],
    correctIndex: 1,
    planet: "Earth",
  },
  {
    question: "Earth's atmosphere is mostly made of which gas?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"],
    correctIndex: 2,
    planet: "Earth",
  },
  {
    question: "What protects Earth from harmful solar radiation?",
    options: [
      "The oceans",
      "The magnetic field",
      "The clouds",
      "The mountains",
    ],
    correctIndex: 1,
    planet: "Earth",
  },

  // ── Mars (3) ──
  {
    question: "Mars is known as the _____ Planet.",
    options: ["Blue", "Red", "Green", "Gold"],
    correctIndex: 1,
    planet: "Mars",
  },
  {
    question: "What is the tallest volcano in the solar system, found on Mars?",
    options: ["Mount Everest", "Olympus Mons", "Mauna Kea", "Valles Marineris"],
    correctIndex: 1,
    planet: "Mars",
  },
  {
    question: "Mars has two small moons. What are they called?",
    options: [
      "Titan and Europa",
      "Phobos and Deimos",
      "Io and Ganymede",
      "Luna and Sol",
    ],
    correctIndex: 1,
    planet: "Mars",
  },

  // ── Jupiter (3) ──
  {
    question: "Jupiter is the _____ planet in our solar system.",
    options: ["Smallest", "Hottest", "Largest", "Closest"],
    correctIndex: 2,
    planet: "Jupiter",
  },
  {
    question: "What is Jupiter's Great Red Spot?",
    options: [
      "A giant volcano",
      "A massive storm",
      "A red ocean",
      "A crater from an asteroid",
    ],
    correctIndex: 1,
    planet: "Jupiter",
  },
  {
    question: "How many Earth-sized planets could fit inside Jupiter?",
    options: ["About 50", "About 500", "About 1,300", "About 10,000"],
    correctIndex: 2,
    planet: "Jupiter",
  },

  // ── Saturn (2) ──
  {
    question: "Saturn's rings are mostly made of what material?",
    options: ["Rock and metal", "Gas clouds", "Ice particles", "Liquid lava"],
    correctIndex: 2,
    planet: "Saturn",
  },
  {
    question: "Saturn is so light that it could theoretically _____ in water.",
    options: ["Sink", "Float", "Dissolve", "Freeze"],
    correctIndex: 1,
    planet: "Saturn",
  },

  // ── Uranus (2) ──
  {
    question: "What makes Uranus unique among all the planets?",
    options: [
      "It has no moons",
      "It rotates on its side",
      "It has the most rings",
      "It's the hottest planet",
    ],
    correctIndex: 1,
    planet: "Uranus",
  },
  {
    question: "What gives Uranus its blue-green color?",
    options: [
      "Water on the surface",
      "Methane in the atmosphere",
      "Copper in the rocks",
      "Reflected light from Neptune",
    ],
    correctIndex: 1,
    planet: "Uranus",
  },

  // ── Neptune (3) ──
  {
    question: "Neptune has the strongest _____ in the solar system.",
    options: ["Gravity", "Winds", "Magnetic field", "Tides"],
    correctIndex: 1,
    planet: "Neptune",
  },
  {
    question: "How long does it take Neptune to orbit the Sun once?",
    options: [
      "12 Earth years",
      "84 Earth years",
      "165 Earth years",
      "365 Earth days",
    ],
    correctIndex: 2,
    planet: "Neptune",
  },
  {
    question: "Neptune is classified as what type of planet?",
    options: ["Rocky planet", "Gas giant", "Ice giant", "Dwarf planet"],
    correctIndex: 2,
    planet: "Neptune",
  },
];

// ─── Color Palette ───

const COLORS = {
  VOID_BG: 0x050510,
  BOSS_RED: 0xef4444,
  BOSS_DARK: 0x1a0000,
  SHIELD_BLUE: 0x3b82f6,
  CORRECT_GREEN: 0x22c55e,
  WRONG_RED: 0xef4444,
  TEXT_WHITE: "#ffffff",
  TEXT_GRAY: "#94a3b8",
  TEXT_CYAN: "#22d3ee",
  UI_BG: 0x0f172a,
  UI_BORDER: 0x334155,
  OPTION_BG: 0x1e293b,
  OPTION_BORDER: 0x475569,
  OPTION_HOVER: 0x334155,
};

// Planet colors for the energy beam effect
const PLANET_BEAM_COLORS: Record<string, number> = {
  Mercury: 0xa8a29e,
  Venus: 0xfbbf24,
  Earth: 0x4ade80,
  Mars: 0xfb923c,
  Jupiter: 0xc084fc,
  Saturn: 0xfde68a,
  Uranus: 0x7dd3fc,
  Neptune: 0x6366f1,
};

// ─── Scene ───

export default class FinalBossScene extends Phaser.Scene {
  // Game state
  private lives: number = MAX_LIVES;
  private bossHealth: number = CORRECT_TO_WIN;
  private currentQuestionIndex: number = 0;
  private questionsAnswered: number = 0;
  private correctAnswers: number = 0;
  private isAnswering: boolean = false;
  private isGameOver: boolean = false;
  private shuffledQuestions: QuizQuestion[] = [];

  // Sprites
  /** Player ship sprite — replace texture key with your asset */
  private playerShip!: Phaser.GameObjects.Sprite;
  /** Boss sprite — replace texture key with your asset */
  private bossSprite!: Phaser.GameObjects.Sprite;
  private bossInitialX: number = 0;

  // UI elements
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBg!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;
  private livesIcons: Phaser.GameObjects.Sprite[] = [];
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private questionCounter!: Phaser.GameObjects.Text;

  // Background
  private stars: Phaser.GameObjects.Circle[] = [];

  constructor() {
    super("FinalBossScene");
  }

  // ─── Preload ───

  preload(): void {
    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  PLACEHOLDER SPRITES                                        ║
    // ║  Replace these with your actual sprite assets:               ║
    // ║                                                              ║
    // ║  Player ship:                                                ║
    // ║    this.load.image("boss_player", "assets/ui/player.png");   ║
    // ║                                                              ║
    // ║  Boss (Void Devourer):                                       ║
    // ║    this.load.image("boss_enemy", "assets/ui/boss.png");      ║
    // ║                                                              ║
    // ║  Planet life icon:                                            ║
    // ║    this.load.image("life_icon", "assets/ui/life_planet.png");║
    // ╚═══════════════════════════════════════════════════════════════╝
    // We generate placeholder textures in create() if not loaded
  }

  // ─── Create ───

  create(): void {
    const { width, height } = this.scale;

    // Reset state
    this.lives = MAX_LIVES;
    this.bossHealth = CORRECT_TO_WIN;
    this.currentQuestionIndex = 0;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.isAnswering = false;
    this.isGameOver = false;
    this.optionButtons = [];
    this.livesIcons = [];
    this.stars = [];

    // Shuffle questions
    this.shuffledQuestions = Phaser.Utils.Array.Shuffle([...QUESTIONS]);

    // Create placeholder textures if real ones aren't loaded
    this.createPlaceholderTextures();

    // Build the scene
    this.createBackground(width, height);
    this.createBoss(width, height);
    this.createPlayer(width, height);
    this.createBossHealthBar(width, height);
    this.createLivesDisplay(width, height);
    this.createQuestionUI(width, height);
    this.createFeedbackText(width, height);

    // Start the intro sequence
    this.startIntro(width, height);
  }

  // ─── Placeholder Texture Generation ───

  private createPlaceholderTextures(): void {
    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  PLAYER SHIP PLACEHOLDER                                     ║
    // ║  This creates a simple triangle ship shape.                  ║
    // ║  To replace: load your image in preload() with key           ║
    // ║  "boss_player" and remove this block.                        ║
    // ╚═══════════════════════════════════════════════════════════════╝
    if (!this.textures.exists("boss_player")) {
      const playerGfx = this.make.graphics({ x: 0, y: 0 });
      // Ship body
      playerGfx.fillStyle(0x3b82f6);
      playerGfx.fillTriangle(60, 30, 0, 0, 0, 60);
      // Engine glow
      playerGfx.fillStyle(0x22d3ee);
      playerGfx.fillRect(0, 22, 8, 16);
      // Cockpit
      playerGfx.fillStyle(0xbae6fd);
      playerGfx.fillTriangle(50, 30, 30, 22, 30, 38);
      playerGfx.generateTexture("boss_player", 64, 64);
      playerGfx.destroy();
    }

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  BOSS (VOID DEVOURER) PLACEHOLDER                           ║
    // ║  This creates a menacing dark circle with red accents.       ║
    // ║  To replace: load your image in preload() with key           ║
    // ║  "boss_enemy" and remove this block.                         ║
    // ╚═══════════════════════════════════════════════════════════════╝
    if (!this.textures.exists("boss_enemy")) {
      const bossGfx = this.make.graphics({ x: 0, y: 0 });
      // Dark body
      bossGfx.fillStyle(0x1a0000);
      bossGfx.fillCircle(64, 64, 60);
      // Red outer ring
      bossGfx.lineStyle(4, 0xef4444);
      bossGfx.strokeCircle(64, 64, 58);
      // Inner red glow
      bossGfx.fillStyle(0x450a0a);
      bossGfx.fillCircle(64, 64, 40);
      // Evil eye
      bossGfx.fillStyle(0xef4444);
      bossGfx.fillCircle(64, 64, 14);
      bossGfx.fillStyle(0xfca5a5);
      bossGfx.fillCircle(60, 60, 5);
      // Dark tendrils (simple lines)
      bossGfx.lineStyle(3, 0x7f1d1d);
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const x1 = 64 + Math.cos(angle) * 50;
        const y1 = 64 + Math.sin(angle) * 50;
        const x2 = 64 + Math.cos(angle) * 75;
        const y2 = 64 + Math.sin(angle) * 75;
        bossGfx.lineBetween(x1, y1, x2, y2);
      }
      bossGfx.generateTexture("boss_enemy", 128, 128);
      bossGfx.destroy();
    }

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  LIFE ICON PLACEHOLDER                                       ║
    // ║  Small colored circle representing a planet life.            ║
    // ║  To replace: load your image in preload() with key           ║
    // ║  "life_icon" and remove this block.                          ║
    // ╚═══════════════════════════════════════════════════════════════╝
    if (!this.textures.exists("life_icon")) {
      const lifeGfx = this.make.graphics({ x: 0, y: 0 });
      lifeGfx.fillStyle(0x3b82f6);
      lifeGfx.fillCircle(10, 10, 9);
      lifeGfx.lineStyle(2, 0x60a5fa);
      lifeGfx.strokeCircle(10, 10, 9);
      lifeGfx.generateTexture("life_icon", 20, 20);
      lifeGfx.destroy();
    }

    // Beam particle texture
    if (!this.textures.exists("beam_particle")) {
      const beamGfx = this.make.graphics({ x: 0, y: 0 });
      beamGfx.fillStyle(0xffffff);
      beamGfx.fillCircle(4, 4, 4);
      beamGfx.generateTexture("beam_particle", 8, 8);
      beamGfx.destroy();
    }

    // Spark particle texture (for boss attack)
    if (!this.textures.exists("spark_particle")) {
      const sparkGfx = this.make.graphics({ x: 0, y: 0 });
      sparkGfx.fillStyle(0xef4444);
      sparkGfx.fillCircle(3, 3, 3);
      sparkGfx.generateTexture("spark_particle", 6, 6);
      sparkGfx.destroy();
    }
  }

  // ─── Background ───

  private createBackground(width: number, height: number): void {
    // Deep space gradient background
    this.add.rectangle(0, 0, width, height, COLORS.VOID_BG).setOrigin(0);

    // Add a subtle red nebula effect for the boss area
    const nebula = this.add.graphics();
    nebula.fillGradientStyle(
      0x1a0000,
      0x1a0000,
      COLORS.VOID_BG,
      COLORS.VOID_BG,
      0.3,
      0.3,
      0,
      0
    );
    nebula.fillRect(width * 0.5, 0, width * 0.5, height);

    // Parallax stars
    for (let i = 0; i < 80; i++) {
      const star = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.FloatBetween(0.5, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.1, 0.5)
      );
      this.stars.push(star);

      // Twinkle animation
      this.tweens.add({
        targets: star,
        alpha: Phaser.Math.FloatBetween(0.05, 0.2),
        duration: Phaser.Math.Between(1500, 4000),
        yoyo: true,
        repeat: -1,
        delay: Phaser.Math.Between(0, 2000),
      });
    }
  }

  // ─── Boss ───

  private createBoss(width: number, height: number): void {
    // Boss starts off-screen to the right
    this.bossInitialX = width * 0.78;

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  BOSS SPRITE                                                 ║
    // ║  Uses "boss_enemy" texture key.                              ║
    // ║  Adjust setScale() for your actual sprite dimensions.        ║
    // ╚═══════════════════════════════════════════════════════════════╝
    this.bossSprite = this.add
      .sprite(width + 100, height * 0.38, "boss_enemy")
      .setScale(1.8)
      .setDepth(5);

    // Boss idle animation — menacing pulse
    this.tweens.add({
      targets: this.bossSprite,
      scaleX: 1.9,
      scaleY: 1.7,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Boss red glow aura
    const aura = this.add
      .circle(this.bossSprite.x, this.bossSprite.y, 80, COLORS.BOSS_RED, 0.08)
      .setDepth(4);

    this.tweens.add({
      targets: aura,
      alpha: 0.15,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
    });

    // Bind aura position to boss
    this.events.on("update", () => {
      aura.setPosition(this.bossSprite.x, this.bossSprite.y);
    });
  }

  // ─── Player ───

  private createPlayer(width: number, height: number): void {
    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  PLAYER SPRITE                                               ║
    // ║  Uses "boss_player" texture key.                             ║
    // ║  Adjust setScale() for your actual sprite dimensions.        ║
    // ╚═══════════════════════════════════════════════════════════════╝
    this.playerShip = this.add
      .sprite(-80, height * 0.38, "boss_player")
      .setScale(1.2)
      .setDepth(5);

    // Engine particle trail
    this.add.particles(0, 0, "beam_particle", {
      speed: { min: 30, max: 80 },
      scale: { start: 0.3, end: 0 },
      blendMode: "ADD",
      lifespan: 400,
      tint: 0x22d3ee,
      follow: this.playerShip,
      followOffset: { x: -30, y: 0 },
      frequency: 50,
    });
  }

  // ─── Boss Health Bar ───

  private createBossHealthBar(width: number, _height: number): void {
    const barX = width * 0.3;
    const barY = 20;
    const barWidth = width * 0.4;
    const barHeight = 16;

    // Label
    this.add
      .text(width / 2, barY - 2, "VOID DEVOURER", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "8px",
        color: "#fca5a5",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(20);

    // Background
    this.bossHealthBg = this.add.graphics().setDepth(20);
    this.bossHealthBg.fillStyle(0x1e293b, 0.9);
    this.bossHealthBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    this.bossHealthBg.lineStyle(2, 0x475569);
    this.bossHealthBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 4);

    // Health fill
    this.bossHealthBar = this.add.graphics().setDepth(21);
    this.drawBossHealth(barX, barY, barWidth, barHeight);

    // Health text
    this.bossHealthText = this.add
      .text(
        width / 2,
        barY + barHeight / 2,
        `${this.bossHealth}/${CORRECT_TO_WIN}`,
        {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "7px",
          color: COLORS.TEXT_WHITE,
        }
      )
      .setOrigin(0.5)
      .setDepth(22);
  }

  private drawBossHealth(
    barX: number,
    barY: number,
    barWidth: number,
    barHeight: number
  ): void {
    this.bossHealthBar.clear();
    const healthPercent = this.bossHealth / CORRECT_TO_WIN;
    const fillWidth = Math.max(0, (barWidth - 4) * healthPercent);

    if (fillWidth > 0) {
      this.bossHealthBar.fillStyle(COLORS.BOSS_RED, 0.9);
      this.bossHealthBar.fillRoundedRect(
        barX + 2,
        barY + 2,
        fillWidth,
        barHeight - 4,
        3
      );
      // Inner glow
      this.bossHealthBar.fillStyle(0xfca5a5, 0.3);
      this.bossHealthBar.fillRoundedRect(
        barX + 2,
        barY + 2,
        fillWidth,
        (barHeight - 4) / 2,
        3
      );
    }
  }

  // ─── Lives Display ───

  private createLivesDisplay(width: number, height: number): void {
    const startX = 16;
    const y = height - 24;

    // Label
    this.add
      .text(startX, y - 14, "SOLAR SHIELD", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "6px",
        color: COLORS.TEXT_GRAY,
      })
      .setDepth(20);

    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  LIFE ICONS                                                  ║
    // ║  Uses "life_icon" texture key.                               ║
    // ║  Each icon represents one planet/life.                       ║
    // ║  To use custom planet sprites per life, change the texture   ║
    // ║  key for each icon individually.                             ║
    // ╚═══════════════════════════════════════════════════════════════╝
    const planetNames = [
      "Mercury",
      "Venus",
      "Earth",
      "Mars",
      "Jupiter",
      "Saturn",
      "Uranus",
      "Neptune",
    ];

    for (let i = 0; i < MAX_LIVES; i++) {
      const icon = this.add
        .sprite(startX + i * 28 + 10, y, "life_icon")
        .setScale(1)
        .setDepth(20);

      // Tooltip on hover (planet name)
      icon.setInteractive({ useHandCursor: false });
      const tooltip = this.add
        .text(icon.x, icon.y - 16, planetNames[i], {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "5px",
          color: "#94a3b8",
        })
        .setOrigin(0.5)
        .setDepth(21)
        .setVisible(false);

      icon.on("pointerover", () => tooltip.setVisible(true));
      icon.on("pointerout", () => tooltip.setVisible(false));

      this.livesIcons.push(icon);
    }
  }

  // ─── Question UI ───

  private createQuestionUI(width: number, height: number): void {
    // Question counter (top-left)
    this.questionCounter = this.add
      .text(16, 16, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px",
        color: COLORS.TEXT_CYAN,
      })
      .setDepth(20);

    // Question text (bottom area)
    const questionY = height * 0.62;

    this.questionText = this.add
      .text(width / 2, questionY, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "9px",
        color: COLORS.TEXT_WHITE,
        align: "center",
        wordWrap: { width: width - 60 },
        lineSpacing: 6,
      })
      .setOrigin(0.5, 0)
      .setDepth(20);
  }

  private createFeedbackText(width: number, height: number): void {
    this.feedbackText = this.add
      .text(width / 2, height * 0.55, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "10px",
        color: COLORS.TEXT_WHITE,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(25)
      .setAlpha(0);
  }

  // ─── Intro Sequence ───

  private startIntro(width: number, height: number): void {
    // Fly player in from the left
    this.tweens.add({
      targets: this.playerShip,
      x: width * 0.15,
      duration: 2000,
      ease: "Cubic.easeOut",
    });

    // Bring boss in from the right
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossInitialX,
      duration: 2500,
      ease: "Back.easeOut",
      delay: 800,
    });

    // Flash screen
    this.cameras.main.flash(500, 40, 0, 0);

    // Start the battle after intro
    this.time.delayedCall(3500, () => {
      this.showQuestion();
    });
  }

  // ─── Show Question ───

  private showQuestion(): void {
    if (this.isGameOver) return;

    const { width, height } = this.scale;

    // Check if we've run out of questions
    if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
      // If boss still alive but questions exhausted, player loses
      this.triggerGameOver(false);
      return;
    }

    const q = this.shuffledQuestions[this.currentQuestionIndex];

    // Update counter
    this.questionCounter.setText(
      `Q${this.questionsAnswered + 1}  |  ${this.correctAnswers}/${CORRECT_TO_WIN} hits`
    );

    // Show question text
    this.questionText.setText(q.question);
    this.questionText.setAlpha(0);
    this.tweens.add({
      targets: this.questionText,
      alpha: 1,
      duration: 300,
    });

    // Clear old option buttons
    this.optionButtons.forEach((btn) => btn.destroy());
    this.optionButtons = [];

    // Create option buttons
    const optionStartY = height * 0.75;
    const optionWidth = Math.min(width - 40, 380);
    const optionHeight = 32;
    const optionGap = 8;

    q.options.forEach((optionText, i) => {
      const y = optionStartY + i * (optionHeight + optionGap);

      const container = this.add.container(width / 2, y).setDepth(20);

      // Button background
      const bg = this.add
        .graphics()
        .fillStyle(COLORS.OPTION_BG, 0.95)
        .fillRoundedRect(
          -optionWidth / 2,
          -optionHeight / 2,
          optionWidth,
          optionHeight,
          6
        )
        .lineStyle(2, COLORS.OPTION_BORDER)
        .strokeRoundedRect(
          -optionWidth / 2,
          -optionHeight / 2,
          optionWidth,
          optionHeight,
          6
        );

      // Option label
      const label = String.fromCharCode(65 + i); // A, B, C, D
      const text = this.add
        .text(0, 0, `${label}. ${optionText}`, {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "7px",
          color: "#e2e8f0",
          align: "center",
          wordWrap: { width: optionWidth - 24 },
        })
        .setOrigin(0.5);

      container.add([bg, text]);

      // Make interactive
      const hitZone = this.add
        .rectangle(0, 0, optionWidth, optionHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001); // invisible hit area

      container.add(hitZone);

      // Hover effects
      hitZone.on("pointerover", () => {
        if (!this.isAnswering) {
          bg.clear()
            .fillStyle(COLORS.OPTION_HOVER, 0.95)
            .fillRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            )
            .lineStyle(2, 0x60a5fa)
            .strokeRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            );
        }
      });

      hitZone.on("pointerout", () => {
        if (!this.isAnswering) {
          bg.clear()
            .fillStyle(COLORS.OPTION_BG, 0.95)
            .fillRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            )
            .lineStyle(2, COLORS.OPTION_BORDER)
            .strokeRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            );
        }
      });

      // Click handler
      hitZone.on("pointerdown", () => {
        if (this.isAnswering || this.isGameOver) return;
        this.handleAnswer(i, q, bg, optionWidth, optionHeight);
      });

      // Fade in
      container.setAlpha(0);
      this.tweens.add({
        targets: container,
        alpha: 1,
        duration: 200,
        delay: i * 80,
      });

      this.optionButtons.push(container);
    });

    this.isAnswering = false;
  }

  // ─── Handle Answer ───

  private handleAnswer(
    selectedIndex: number,
    question: QuizQuestion,
    selectedBg: Phaser.GameObjects.Graphics,
    optionWidth: number,
    optionHeight: number
  ): void {
    this.isAnswering = true;
    this.questionsAnswered++;
    this.currentQuestionIndex++;

    const isCorrect = selectedIndex === question.correctIndex;

    // Visual feedback on the selected button
    const color = isCorrect ? COLORS.CORRECT_GREEN : COLORS.WRONG_RED;
    const borderColor = isCorrect ? 0x4ade80 : 0xf87171;

    selectedBg
      .clear()
      .fillStyle(color, 0.3)
      .fillRoundedRect(
        -optionWidth / 2,
        -optionHeight / 2,
        optionWidth,
        optionHeight,
        6
      )
      .lineStyle(2, borderColor)
      .strokeRoundedRect(
        -optionWidth / 2,
        -optionHeight / 2,
        optionWidth,
        optionHeight,
        6
      );

    // Disable all buttons
    this.optionButtons.forEach((btn) => {
      const hitZone = btn.getAt(2) as Phaser.GameObjects.Rectangle;
      if (hitZone) hitZone.disableInteractive();
    });

    if (isCorrect) {
      this.onCorrectAnswer(question);
    } else {
      this.onWrongAnswer(question);
    }
  }

  // ─── Correct Answer ───

  private onCorrectAnswer(question: QuizQuestion): void {
    this.correctAnswers++;
    this.bossHealth = Math.max(0, this.bossHealth - 1);

    const { width } = this.scale;

    // Show feedback
    this.showFeedback("DIRECT HIT!", "#4ade80");

    // Fire beam from player to boss
    this.fireBeam(question.planet);

    // Update boss health bar
    const barX = width * 0.3;
    const barWidth = width * 0.4;
    this.drawBossHealth(barX, 20, barWidth, 16);
    this.bossHealthText.setText(`${this.bossHealth}/${CORRECT_TO_WIN}`);

    // Boss hit reaction
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossSprite.x + 15,
      tint: 0xffffff,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.bossSprite.clearTint();
      },
    });

    // Camera shake
    this.cameras.main.shake(200, 0.005);

    // Check win condition
    if (this.bossHealth <= 0) {
      this.time.delayedCall(1200, () => {
        this.triggerVictory();
      });
      return;
    }

    // Next question
    this.time.delayedCall(1800, () => {
      this.clearQuestionUI();
      this.time.delayedCall(400, () => this.showQuestion());
    });
  }

  // ─── Wrong Answer ───

  private onWrongAnswer(_question: QuizQuestion): void {
    this.lives--;

    // Show feedback
    this.showFeedback("SHIELD HIT!", "#ef4444");

    // Boss attack animation — lunges toward player with sparks
    this.bossAttackAnimation();

    // Remove a life icon
    if (this.livesIcons.length > this.lives) {
      const lostIcon = this.livesIcons[this.lives];
      if (lostIcon) {
        this.tweens.add({
          targets: lostIcon,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          tint: 0xff0000,
          duration: 400,
          ease: "Back.easeIn",
          onComplete: () => {
            lostIcon.setVisible(false);
          },
        });
      }
    }

    // Camera shake (stronger)
    this.cameras.main.shake(300, 0.01);
    this.cameras.main.flash(200, 60, 0, 0);

    // Check lose condition
    if (this.lives <= 0) {
      this.time.delayedCall(1500, () => {
        this.triggerGameOver(true);
      });
      return;
    }

    // Next question
    this.time.delayedCall(2000, () => {
      this.clearQuestionUI();
      this.time.delayedCall(400, () => this.showQuestion());
    });
  }

  // ─── Beam Attack Animation ───

  private fireBeam(planet: string): void {
    const beamColor = PLANET_BEAM_COLORS[planet] || 0x3b82f6;

    const startX = this.playerShip.x + 30;
    const startY = this.playerShip.y;
    const endX = this.bossSprite.x;
    const endY = this.bossSprite.y;

    // Main beam line
    const beam = this.add.graphics().setDepth(15);
    beam.lineStyle(4, beamColor, 0.9);
    beam.lineBetween(startX, startY, startX, startY);

    // Animate beam extending to boss
    const beamProgress = { t: 0 };
    this.tweens.add({
      targets: beamProgress,
      t: 1,
      duration: 300,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        const cx = Phaser.Math.Linear(startX, endX, beamProgress.t);
        const cy = Phaser.Math.Linear(startY, endY, beamProgress.t);
        beam.clear();
        beam.lineStyle(4, beamColor, 0.9);
        beam.lineBetween(startX, startY, cx, cy);
        // Glow line
        beam.lineStyle(8, beamColor, 0.2);
        beam.lineBetween(startX, startY, cx, cy);
      },
      onComplete: () => {
        // Impact burst at boss position
        this.add
          .particles(endX, endY, "beam_particle", {
            speed: { min: 80, max: 200 },
            scale: { start: 0.6, end: 0 },
            blendMode: "ADD",
            lifespan: 400,
            tint: beamColor,
            quantity: 12,
            emitting: false,
          })
          .explode(12);

        // Fade beam
        this.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 200,
          onComplete: () => beam.destroy(),
        });
      },
    });

    // Planet name flash near the beam
    const planetLabel = this.add
      .text(startX + 40, startY - 20, `${planet} ENERGY!`, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "6px",
        color: `#${beamColor.toString(16).padStart(6, "0")}`,
      })
      .setDepth(16)
      .setAlpha(0);

    this.tweens.add({
      targets: planetLabel,
      alpha: 1,
      y: startY - 35,
      duration: 400,
      yoyo: true,
      hold: 300,
      onComplete: () => planetLabel.destroy(),
    });
  }

  // ─── Boss Attack Animation ───

  private bossAttackAnimation(): void {
    const { width } = this.scale;

    // Boss lunges toward player
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossSprite.x - 60,
      duration: 200,
      ease: "Cubic.easeOut",
      yoyo: true,
      hold: 100,
    });

    // Spark particles from boss toward player
    const sparks = this.add.particles(
      this.bossSprite.x - 40,
      this.bossSprite.y,
      "spark_particle",
      {
        speed: { min: 150, max: 300 },
        angle: { min: 160, max: 200 },
        scale: { start: 0.8, end: 0 },
        blendMode: "ADD",
        lifespan: 600,
        tint: [0xef4444, 0xfca5a5, 0xff6b6b],
        quantity: 8,
        emitting: false,
      }
    );
    sparks.explode(8);

    // Impact flash on player
    this.time.delayedCall(250, () => {
      this.tweens.add({
        targets: this.playerShip,
        tint: 0xff0000,
        x: this.playerShip.x - 8,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.playerShip.clearTint();
        },
      });
    });
  }

  // ─── Feedback Text ───

  private showFeedback(message: string, color: string): void {
    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1);
    this.feedbackText.setScale(1.2);

    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      scaleX: 1,
      scaleY: 1,
      y: this.feedbackText.y - 15,
      duration: 1000,
      ease: "Cubic.easeOut",
      onComplete: () => {
        this.feedbackText.y += 15; // reset position
      },
    });
  }

  // ─── Clear Question UI ───

  private clearQuestionUI(): void {
    this.optionButtons.forEach((btn) => {
      this.tweens.add({
        targets: btn,
        alpha: 0,
        duration: 200,
        onComplete: () => btn.destroy(),
      });
    });
    this.optionButtons = [];

    this.tweens.add({
      targets: this.questionText,
      alpha: 0,
      duration: 200,
    });
  }

  // ─── Victory ───

  private triggerVictory(): void {
    this.isGameOver = true;
    this.clearQuestionUI();

    const { width, height } = this.scale;

    // Boss death animation
    this.cameras.main.flash(600, 255, 100, 100);

    // Boss shakes violently
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossSprite.x + 5,
      duration: 50,
      yoyo: true,
      repeat: 15,
    });

    // Boss explodes after shaking
    this.time.delayedCall(1000, () => {
      // Explosion particles
      this.add
        .particles(this.bossSprite.x, this.bossSprite.y, "spark_particle", {
          speed: { min: 100, max: 400 },
          scale: { start: 1.5, end: 0 },
          blendMode: "ADD",
          lifespan: 1000,
          tint: [0xef4444, 0xfca5a5, 0xff6b6b, 0xfbbf24, 0xffffff],
          quantity: 30,
          emitting: false,
        })
        .explode(30);

      // Screen flash
      this.cameras.main.flash(800, 255, 200, 200);

      // Fade out boss
      this.tweens.add({
        targets: this.bossSprite,
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: 800,
        ease: "Cubic.easeOut",
      });

      // Show victory screen after explosion
      this.time.delayedCall(1500, () => {
        this.showVictoryScreen(width, height);
      });
    });
  }

  private showVictoryScreen(width: number, height: number): void {
    // Dark overlay
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(30);

    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.8,
      duration: 600,
    });

    // Victory panel
    const panelWidth = Math.min(width - 40, 360);
    const panelHeight = 180;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    const panel = this.add.graphics().setDepth(31).setAlpha(0);
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    panel.lineStyle(2, 0x4ade80);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);

    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 400,
      delay: 200,
    });

    // Title
    const title = this.add
      .text(width / 2, panelY + 24, "THE VOID IS VANQUISHED!", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "9px",
        color: "#4ade80",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 400,
      delay: 400,
    });

    // Stats
    const statsText = [
      `Correct: ${this.correctAnswers}/${this.questionsAnswered}`,
      `Shield Remaining: ${this.lives}/${MAX_LIVES}`,
      `Accuracy: ${Math.round((this.correctAnswers / Math.max(1, this.questionsAnswered)) * 100)}%`,
    ].join("\n");

    const stats = this.add
      .text(width / 2, panelY + 70, statsText, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px",
        color: "#94a3b8",
        align: "center",
        lineSpacing: 8,
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({
      targets: stats,
      alpha: 1,
      duration: 400,
      delay: 600,
    });

    // "Continue" button
    this.createEndButton(
      width / 2,
      panelY + panelHeight - 30,
      "SAVE THE SOLAR SYSTEM",
      0x22c55e,
      () => {
        // Emit event to App.tsx for the final victory scene
        EventBus.emit("boss-defeated");
      }
    );
  }

  // ─── Game Over ───

  private triggerGameOver(fromDamage: boolean): void {
    this.isGameOver = true;
    this.clearQuestionUI();

    const { width, height } = this.scale;

    if (fromDamage) {
      // Player ship destruction
      this.cameras.main.shake(500, 0.015);
      this.cameras.main.flash(400, 60, 0, 0);

      this.tweens.add({
        targets: this.playerShip,
        alpha: 0,
        scaleX: 0.5,
        scaleY: 0.5,
        angle: 45,
        duration: 600,
      });
    }

    this.time.delayedCall(1200, () => {
      this.showGameOverScreen(width, height);
    });
  }

  private showGameOverScreen(width: number, height: number): void {
    // Dark overlay
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(30);

    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.85,
      duration: 600,
    });

    // Game over panel
    const panelWidth = Math.min(width - 40, 360);
    const panelHeight = 200;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    const panel = this.add.graphics().setDepth(31).setAlpha(0);
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    panel.lineStyle(2, 0xef4444);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);

    this.tweens.add({
      targets: panel,
      alpha: 1,
      duration: 400,
      delay: 200,
    });

    // Title
    const title = this.add
      .text(width / 2, panelY + 24, "SHIELD BROKEN!", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "10px",
        color: "#ef4444",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({
      targets: title,
      alpha: 1,
      duration: 400,
      delay: 400,
    });

    // Message
    const message = this.add
      .text(
        width / 2,
        panelY + 55,
        "The Void Devourer overwhelmed\nyour defenses. But the Solar\nSystem still needs you!",
        {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "6px",
          color: "#94a3b8",
          align: "center",
          lineSpacing: 6,
        }
      )
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({
      targets: message,
      alpha: 1,
      duration: 400,
      delay: 500,
    });

    // Stats
    const statsText = `Hit ${this.correctAnswers} of ${CORRECT_TO_WIN} needed`;
    const stats = this.add
      .text(width / 2, panelY + 105, statsText, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px",
        color: "#fbbf24",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({
      targets: stats,
      alpha: 1,
      duration: 400,
      delay: 600,
    });

    // Retry button
    this.createEndButton(
      width / 2 - 80,
      panelY + panelHeight - 30,
      "RETRY",
      0xfbbf24,
      () => {
        this.scene.restart();
      }
    );

    // Back to map button
    this.createEndButton(
      width / 2 + 80,
      panelY + panelHeight - 30,
      "PLANET MAP",
      0x64748b,
      () => {
        EventBus.emit("boss-return-to-menu");
      }
    );
  }

  // ─── Reusable End-Screen Button ───

  private createEndButton(
    x: number,
    y: number,
    label: string,
    color: number,
    callback: () => void
  ): void {
    const btnWidth = 140;
    const btnHeight = 28;

    const container = this.add.container(x, y).setDepth(33).setAlpha(0);

    const bg = this.add.graphics();
    bg.fillStyle(color, 0.2);
    bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
    bg.lineStyle(2, color);
    bg.strokeRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);

    const text = this.add
      .text(0, 0, label, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "6px",
        color: `#${color.toString(16).padStart(6, "0")}`,
        align: "center",
      })
      .setOrigin(0.5);

    const hitZone = this.add
      .rectangle(0, 0, btnWidth, btnHeight)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .setAlpha(0.001);

    hitZone.on("pointerover", () => {
      bg.clear();
      bg.fillStyle(color, 0.35);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
      bg.lineStyle(2, color);
      bg.strokeRoundedRect(
        -btnWidth / 2,
        -btnHeight / 2,
        btnWidth,
        btnHeight,
        4
      );
    });

    hitZone.on("pointerout", () => {
      bg.clear();
      bg.fillStyle(color, 0.2);
      bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 4);
      bg.lineStyle(2, color);
      bg.strokeRoundedRect(
        -btnWidth / 2,
        -btnHeight / 2,
        btnWidth,
        btnHeight,
        4
      );
    });

    hitZone.on("pointerdown", callback);

    container.add([bg, text, hitZone]);

    this.tweens.add({
      targets: container,
      alpha: 1,
      duration: 400,
      delay: 800,
    });
  }
}
