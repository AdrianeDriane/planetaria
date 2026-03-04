import Phaser from "phaser";
import { EventBus } from "../EventBus";

// ─── Configuration ───

const CORRECT_TO_WIN = 12;
const MAX_LIVES = 8;

// ─── Quiz Data ───

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  planet: string;
}

const QUESTIONS: QuizQuestion[] = [
  // ── Mercury (from GameScene summary) ──
  {
    question: "What is Mercury's atmosphere like?",
    options: [
      "It has no atmosphere",
      "It is thick with clouds",
      "It is mostly nitrogen",
      "It is similar to Earth's",
    ],
    correctIndex: 0,
    planet: "Mercury",
  },
  {
    question: "How long does it take Mercury to orbit the Sun?",
    options: ["365 days", "88 days", "243 days", "687 days"],
    correctIndex: 1,
    planet: "Mercury",
  },
  {
    question: "How long does one rotation of Mercury take?",
    options: [
      "24 hours",
      "58 days, 15 hours, and 30 minutes",
      "88 days",
      "243 days",
    ],
    correctIndex: 1,
    planet: "Mercury",
  },
  // ── Venus (from VenusGame summary) ──
  {
    question: "How hot can Venus get, making it the hottest planet?",
    options: ["Over 900 °F", "About 200 °F", "About 500 °F", "Over 2,000 °F"],
    correctIndex: 0,
    planet: "Venus",
  },
  {
    question: "What kind of precipitation falls on Venus?",
    options: [
      "Water rain",
      "Sulfuric acid rain",
      "Methane rain",
      "No precipitation at all",
    ],
    correctIndex: 1,
    planet: "Venus",
  },
  {
    question: "How long does one day on Venus last?",
    options: [
      "24 Earth hours",
      "88 Earth days",
      "243 Earth days",
      "365 Earth days",
    ],
    correctIndex: 2,
    planet: "Venus",
  },
  // ── Earth (from EarthScene / EarthChecklist summary) ──
  {
    question: "How much of Earth's surface is covered by water?",
    options: ["About 30%", "About 50%", "About 70%", "About 90%"],
    correctIndex: 2,
    planet: "Earth",
  },
  {
    question: "What is Earth's position from the Sun?",
    options: [
      "First planet",
      "Second planet",
      "Third planet",
      "Fourth planet",
    ],
    correctIndex: 2,
    planet: "Earth",
  },
  {
    question: "How long does Earth take to complete one rotation?",
    options: [
      "Exactly 24 hours",
      "23 hours, 56 minutes",
      "22 hours, 30 minutes",
      "25 hours, 10 minutes",
    ],
    correctIndex: 1,
    planet: "Earth",
  },
  // ── Mars (from MarsRedPuzzle summary) ──
  {
    question: "Why does Mars appear red-yellow in color?",
    options: [
      "Iron oxide in its soil and dust",
      "Its atmosphere filters sunlight",
      "It reflects the Sun's red light",
      "Its volcanoes emit red lava",
    ],
    correctIndex: 0,
    planet: "Mars",
  },
  {
    question:
      "What is the largest volcano in the solar system, located on Mars?",
    options: ["Mount Everest", "Valles Marineris", "Mauna Kea", "Olympus Mons"],
    correctIndex: 3,
    planet: "Mars",
  },
  {
    question:
      "How long does Mars take to complete one revolution around the Sun?",
    options: ["365 days", "88 days", "687 days", "243 days"],
    correctIndex: 2,
    planet: "Mars",
  },
  // ── Jupiter (from JupiterGame summary) ──
  {
    question: "How many Earths could fit inside Jupiter?",
    options: ["About 100", "About 500", "Over 1,300", "About 10,000"],
    correctIndex: 2,
    planet: "Jupiter",
  },
  {
    question: "How long has Jupiter's Great Red Spot storm been raging?",
    options: [
      "About 50 years",
      "Over 300 years",
      "About 1,000 years",
      "About 10 years",
    ],
    correctIndex: 1,
    planet: "Jupiter",
  },
  {
    question: "How long does one full rotation of Jupiter take?",
    options: [
      "24 hours",
      "9 hours, 56 minutes",
      "48 hours",
      "88 days",
    ],
    correctIndex: 1,
    planet: "Jupiter",
  },
  // ── Saturn (from SaturnGame summary) ──
  {
    question: "What are Saturn's rings mostly made of?",
    options: ["Rock and metal", "Gas clouds", "Ice particles", "Liquid lava"],
    correctIndex: 2,
    planet: "Saturn",
  },
  {
    question: "Which moon of Saturn shoots geysers of water into space?",
    options: ["Titan", "Enceladus", "Europa", "Io"],
    correctIndex: 1,
    planet: "Saturn",
  },
  {
    question: "What is Saturn's position from the Sun?",
    options: [
      "3rd planet",
      "5th planet",
      "6th planet",
      "8th planet",
    ],
    correctIndex: 2,
    planet: "Saturn",
  },
  // ── Uranus (from UranusGame summary) ──
  {
    question: "At what angle is Uranus tilted on its axis?",
    options: ["23°", "45°", "98°", "180°"],
    correctIndex: 2,
    planet: "Uranus",
  },
  {
    question: "What gives Uranus its blue-green color?",
    options: [
      "Water on the surface",
      "Methane gas in the atmosphere",
      "Copper in the rocks",
      "Reflected light from Neptune",
    ],
    correctIndex: 1,
    planet: "Uranus",
  },
  {
    question: "How many known moons does Uranus have?",
    options: ["5 moons", "13 moons", "27 moons", "63 moons"],
    correctIndex: 2,
    planet: "Uranus",
  },
  // ── Neptune (from NeptuneGame summary) ──
  {
    question: "How fast can Neptune's winds reach?",
    options: [
      "Up to 500 km/h",
      "Up to 1,000 km/h",
      "Up to 2,100 km/h",
      "Up to 5,000 km/h",
    ],
    correctIndex: 2,
    planet: "Neptune",
  },
  {
    question: "How long does Neptune take to orbit the Sun once?",
    options: [
      "12 Earth years",
      "84 Earth years",
      "165 Earth years",
      "365 Earth years",
    ],
    correctIndex: 2,
    planet: "Neptune",
  },
  {
    question: "What type of planet is Neptune classified as?",
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

interface BGStar {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
  color: number;
  baseAlpha: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

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
  // Flag to pause boss idle animation during attack/hit tweens
  private isBossAnimating: boolean = false;
  // Store the player's resting X so we can always return to it
  private playerRestX: number = 0;
  private bossBaseScale: number = 0.2;

  // Sprites
  private playerShip!: Phaser.GameObjects.Sprite;
  private bossSprite!: Phaser.GameObjects.Sprite;
  private bossInitialX: number = 0;
  private bossAura!: Phaser.GameObjects.Arc;

  // UI elements
  private bossHealthBar!: Phaser.GameObjects.Graphics;
  private bossHealthBg!: Phaser.GameObjects.Graphics;
  private bossHealthText!: Phaser.GameObjects.Text;
  private livesIcons: Phaser.GameObjects.Sprite[] = [];
  private questionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private feedbackText!: Phaser.GameObjects.Text;
  private questionCounter!: Phaser.GameObjects.Text;

  // Background starfield
  private bgStars: BGStar[] = [];
  private starRT!: Phaser.GameObjects.RenderTexture;
  private starGfx!: Phaser.GameObjects.Graphics;
  private elapsed: number = 0;

  // Intensity effects
  private warningOverlay!: Phaser.GameObjects.Rectangle;
  private voidParticles!: Phaser.GameObjects.Particles.ParticleEmitter;

  private static STAR_COLORS = [
    0xffffff, 0xc8c8ff, 0xffdcb4, 0xb4b4ff, 0xffb4b4, 0xb4ffdc, 0xdcc8ff,
  ];

  constructor() {
    super("FinalBossScene");
  }

  preload(): void {
    // ╔═══════════════════════════════════════════════════════════════╗
    // ║  PLACEHOLDER SPRITES                                        ║
    // ║  Replace these with your actual sprite assets:               ║
    // ║  this.load.image("boss_player", "assets/ui/player.png");     ║
    // ║  this.load.image("boss_enemy", "assets/ui/boss.png");        ║
    // ║  this.load.image("life_icon", "assets/ui/life_planet.png");  ║
    // ╚═══════════════════════════════════════════════════════════════╝
    this.load.image("boss_player", "assets/ui/riding_ss_astra.png");
    this.load.image("boss_enemy", "assets/ui/kirby.png");

    const planetKeys = [
      "mercury",
      "venus",
      "earth",
      "mars",
      "jupiter",
      "saturn",
      "uranus",
      "neptune",
    ];

    planetKeys.forEach((key) => {
      this.load.image(key, `assets/ui/${key}.png`);
    });
  }

  create(): void {
    const { width, height } = this.scale;

    this.lives = MAX_LIVES;
    this.bossHealth = CORRECT_TO_WIN;
    this.currentQuestionIndex = 0;
    this.questionsAnswered = 0;
    this.correctAnswers = 0;
    this.isAnswering = false;
    this.isGameOver = false;
    this.isBossAnimating = false;
    this.optionButtons = [];
    this.livesIcons = [];
    this.bgStars = [];
    this.elapsed = 0;
    this.playerRestX = width * 0.15;

    this.shuffledQuestions = Phaser.Utils.Array.Shuffle([...QUESTIONS]);

    this.createPlaceholderTextures();
    this.createStarfield(width, height);
    this.createWarningOverlay(width, height);
    this.createVoidParticles(width, height);
    this.createBoss(width, height);
    this.createPlayer(width, height);
    this.createBossHealthBar(width, height);
    this.createLivesDisplay(width, height);
    this.createQuestionUI(width, height);
    this.createFeedbackText(width, height);
    this.startIntro(width, height);
  }

  update(_time: number, delta: number): void {
    this.elapsed += delta;
    this.updateStarfield(delta);
    this.updateAmbientShake();
    this.updateBossIdle();
  }

  // ─── Animated Starfield Background ───

  private createStarfield(width: number, height: number): void {
    this.starRT = this.add
      .renderTexture(0, 0, width, height)
      .setOrigin(0)
      .setDepth(-10)
      .setScrollFactor(0);

    this.starGfx = this.add.graphics().setVisible(false);

    let seed = 42;
    const rng = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    for (let i = 0; i < 300; i++) {
      this.bgStars.push({
        x: rng() * width,
        y: rng() * height,
        speed: 0.15 + rng() * 0.6,
        size: rng() < 0.7 ? 1 : rng() < 0.9 ? 1.5 : 2,
        brightness: 0.15 + rng() * 0.55,
        color:
          FinalBossScene.STAR_COLORS[
            Math.floor(rng() * FinalBossScene.STAR_COLORS.length)
          ],
        baseAlpha: 0.15 + rng() * 0.55,
        twinkleSpeed: 1.5 + rng() * 3,
        twinkleOffset: rng() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 25; i++) {
      this.bgStars.push({
        x: rng() * width,
        y: rng() * height,
        speed: 0.08 + rng() * 0.25,
        size: 2.5,
        brightness: 0.5 + rng() * 0.5,
        color:
          FinalBossScene.STAR_COLORS[
            Math.floor(rng() * FinalBossScene.STAR_COLORS.length)
          ],
        baseAlpha: 0.5 + rng() * 0.5,
        twinkleSpeed: 1 + rng() * 2,
        twinkleOffset: rng() * Math.PI * 2,
      });
    }
  }

  private updateStarfield(delta: number): void {
    const { width, height } = this.scale;
    const dt = delta / 16.667;
    const time = this.elapsed / 1000;

    const intensityMul = 1 + (1 - this.bossHealth / CORRECT_TO_WIN) * 2;
    const dx = -0.25 * intensityMul;
    const dy = -0.12 * intensityMul;

    this.starRT.clear();
    this.starGfx.clear();

    this.starGfx.fillStyle(0x000008, 1);
    this.starGfx.fillRect(0, 0, width, height);

    const nebulaAlpha = 0.03 + (1 - this.bossHealth / CORRECT_TO_WIN) * 0.06;
    const nebs = [
      {
        x: width * 0.7,
        y: height * 0.3,
        r: 120,
        c: 0x501020,
        a: nebulaAlpha,
      },
      {
        x: width * 0.85,
        y: height * 0.5,
        r: 90,
        c: 0x3c0a14,
        a: nebulaAlpha * 0.8,
      },
      { x: width * 0.15, y: height * 0.25, r: 80, c: 0x142850, a: 0.035 },
      { x: width * 0.4, y: height * 0.7, r: 60, c: 0x143c3c, a: 0.025 },
    ];
    for (const n of nebs) {
      this.starGfx.fillStyle(n.c, n.a);
      this.starGfx.fillCircle(n.x, n.y, n.r);
      this.starGfx.fillStyle(n.c, n.a * 1.3);
      this.starGfx.fillCircle(n.x, n.y, n.r * 0.6);
    }

    for (const s of this.bgStars) {
      s.x += dx * s.speed * dt;
      s.y += dy * s.speed * dt;

      if (s.x < -2) s.x += width + 4;
      if (s.x > width + 2) s.x -= width + 4;
      if (s.y < -2) s.y += height + 4;
      if (s.y > height + 2) s.y -= height + 4;

      const twinkle =
        s.baseAlpha *
        (0.6 + 0.4 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset));

      if (s.size > 2) {
        this.starGfx.fillStyle(s.color, twinkle * 0.15);
        this.starGfx.fillCircle(s.x, s.y, 3);
        this.starGfx.fillStyle(s.color, twinkle);
        this.starGfx.fillPoint(s.x, s.y, 2);
        this.starGfx.fillStyle(0xffffff, twinkle * 0.8);
        this.starGfx.fillPoint(s.x, s.y, 1);
      } else {
        this.starGfx.fillStyle(s.color, twinkle);
        this.starGfx.fillPoint(s.x, s.y, s.size);
      }
    }

    this.starRT.draw(this.starGfx);
  }

  // ─── Ambient Intensity Effects ───

  private createWarningOverlay(width: number, height: number): void {
    this.warningOverlay = this.add
      .rectangle(0, 0, width, height, 0xff0000, 0)
      .setOrigin(0)
      .setDepth(28)
      .setBlendMode(Phaser.BlendModes.ADD);
  }

  private createVoidParticles(width: number, height: number): void {
    if (!this.textures.exists("void_dust")) {
      const gfx = this.make.graphics({ x: 0, y: 0 });
      gfx.fillStyle(0xef4444, 0.6);
      gfx.fillCircle(3, 3, 3);
      gfx.generateTexture("void_dust", 6, 6);
      gfx.destroy();
    }

    this.voidParticles = this.add
      .particles(width + 10, height / 2, "void_dust", {
        x: { min: width * 0.6, max: width + 20 },
        y: { min: 0, max: height },
        speedX: { min: -40, max: -15 },
        speedY: { min: -10, max: 10 },
        scale: { start: 0.4, end: 0 },
        alpha: { start: 0.3, end: 0 },
        blendMode: "ADD",
        lifespan: { min: 2000, max: 4000 },
        frequency: 200,
        quantity: 1,
      })
      .setDepth(3);
  }

  private updateAmbientShake(): void {
    const healthPercent = this.bossHealth / CORRECT_TO_WIN;
    const baseShake = (1 - healthPercent) * 0.3;

    if (baseShake > 0.05 && !this.isGameOver) {
      const ox = (Math.random() - 0.5) * baseShake * 2;
      const oy = (Math.random() - 0.5) * baseShake * 2;
      this.cameras.main.setScroll(ox, oy);
    }

    if (healthPercent < 0.4 && !this.isGameOver) {
      const pulse = Math.sin(this.elapsed / 800) * 0.015 * (1 - healthPercent);
      this.warningOverlay.setAlpha(Math.max(0, pulse));
    }

    if (this.voidParticles) {
      const freq = Math.max(40, 200 - (1 - healthPercent) * 160);
      this.voidParticles.frequency = freq;
    }
  }

  // Only update boss idle when NOT in an attack/hit animation
  private updateBossIdle(): void {
    if (!this.bossSprite || this.isGameOver || this.isBossAnimating) return;

    const time = this.elapsed / 1000;
    const bobY = Math.sin(time * 1.2) * 4;
    const bobX = Math.sin(time * 0.7) * 2;
    this.bossSprite.y = this.scale.height * 0.38 + bobY;
    this.bossSprite.x = this.bossInitialX + bobX;

    const pulse = 1 + Math.sin(time * 2) * 0.05;
    this.bossSprite.setScale(this.bossBaseScale * pulse);

    if (this.bossAura) {
      this.bossAura.setPosition(this.bossSprite.x, this.bossSprite.y);
      const auraAlpha = 0.06 + Math.sin(time * 1.5) * 0.04;
      this.bossAura.setAlpha(auraAlpha);
      const auraScale = 1.0 + Math.sin(time * 1.8) * 0.15;
      this.bossAura.setScale(auraScale);
    }
  }

  // ─── Placeholder Texture Generation ───

  private createPlaceholderTextures(): void {
    // if (!this.textures.exists("boss_player")) {
    //   const playerGfx = this.make.graphics({ x: 0, y: 0 });
    //   playerGfx.fillStyle(0x3b82f6);
    //   playerGfx.fillTriangle(60, 30, 0, 0, 0, 60);
    //   playerGfx.fillStyle(0x22d3ee);
    //   playerGfx.fillRect(0, 22, 8, 16);
    //   playerGfx.fillStyle(0xbae6fd);
    //   playerGfx.fillTriangle(50, 30, 30, 22, 30, 38);
    //   playerGfx.generateTexture("boss_player", 64, 64);
    //   playerGfx.destroy();
    // }

    // if (!this.textures.exists("boss_enemy")) {
    //   const bossGfx = this.make.graphics({ x: 0, y: 0 });
    //   bossGfx.fillStyle(0x1a0000);
    //   bossGfx.fillCircle(64, 64, 60);
    //   bossGfx.lineStyle(4, 0xef4444);
    //   bossGfx.strokeCircle(64, 64, 58);
    //   bossGfx.fillStyle(0x450a0a);
    //   bossGfx.fillCircle(64, 64, 40);
    //   bossGfx.fillStyle(0xef4444);
    //   bossGfx.fillCircle(64, 64, 14);
    //   bossGfx.fillStyle(0xfca5a5);
    //   bossGfx.fillCircle(60, 60, 5);
    //   bossGfx.lineStyle(3, 0x7f1d1d);
    //   for (let i = 0; i < 8; i++) {
    //     const angle = (i / 8) * Math.PI * 2;
    //     const x1 = 64 + Math.cos(angle) * 50;
    //     const y1 = 64 + Math.sin(angle) * 50;
    //     const x2 = 64 + Math.cos(angle) * 75;
    //     const y2 = 64 + Math.sin(angle) * 75;
    //     bossGfx.lineBetween(x1, y1, x2, y2);
    //   }
    //   bossGfx.generateTexture("boss_enemy", 128, 128);
    //   bossGfx.destroy();
    // }

    // if (!this.textures.exists("life_icon")) {
    //   const lifeGfx = this.make.graphics({ x: 0, y: 0 });
    //   lifeGfx.fillStyle(0x3b82f6);
    //   lifeGfx.fillCircle(10, 10, 9);
    //   lifeGfx.lineStyle(2, 0x60a5fa);
    //   lifeGfx.strokeCircle(10, 10, 9);
    //   lifeGfx.generateTexture("life_icon", 20, 20);
    //   lifeGfx.destroy();
    // }

    if (!this.textures.exists("beam_particle")) {
      const beamGfx = this.make.graphics({ x: 0, y: 0 });
      beamGfx.fillStyle(0xffffff);
      beamGfx.fillCircle(4, 4, 4);
      beamGfx.generateTexture("beam_particle", 8, 8);
      beamGfx.destroy();
    }

    if (!this.textures.exists("spark_particle")) {
      const sparkGfx = this.make.graphics({ x: 0, y: 0 });
      sparkGfx.fillStyle(0xef4444);
      sparkGfx.fillCircle(3, 3, 3);
      sparkGfx.generateTexture("spark_particle", 6, 6);
      sparkGfx.destroy();
    }
  }

  // ─── Boss ───

  private createBoss(width: number, height: number): void {
    this.bossInitialX = width * 0.78;

    this.bossSprite = this.add
      .sprite(width + 100, height * 0.38, "boss_enemy")
      .setScale(this.bossBaseScale)
      .setDepth(5);

    this.bossAura = this.add
      .circle(this.bossSprite.x, this.bossSprite.y, 90, COLORS.BOSS_RED, 0.08)
      .setDepth(4)
      .setBlendMode(Phaser.BlendModes.ADD);
  }

  // ─── Player ───

  private createPlayer(width: number, height: number): void {
    this.playerShip = this.add
      .sprite(-80, height * 0.38, "boss_player")
      .setScale(0.25)
      .setDepth(5);

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

    this.add
      .text(width / 2, barY - 2, "VOID DEVOURER", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "8px",
        color: "#fca5a5",
        align: "center",
      })
      .setOrigin(0.5, 1)
      .setDepth(20);

    this.bossHealthBg = this.add.graphics().setDepth(20);
    this.bossHealthBg.fillStyle(0x1e293b, 0.9);
    this.bossHealthBg.fillRoundedRect(barX, barY, barWidth, barHeight, 4);
    this.bossHealthBg.lineStyle(2, 0x475569);
    this.bossHealthBg.strokeRoundedRect(barX, barY, barWidth, barHeight, 4);

    this.bossHealthBar = this.add.graphics().setDepth(21);
    this.drawBossHealth(barX, barY, barWidth, barHeight);

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

  // ─── Lives Display (vertical, bottom-left) ───

  private createLivesDisplay(_width: number, height: number): void {
    const x = 22;
    const startY = height - 30;

    this.add
      .text(x, startY - MAX_LIVES * 26 - 12, "SHIELD", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "5px",
        color: COLORS.TEXT_GRAY,
      })
      .setOrigin(0.5)
      .setDepth(20);

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
      const yPos = startY - i * 26;

      const planetKey = planetNames[i].toLowerCase();

      const icon = this.add.sprite(x, yPos, planetKey).setDepth(20);
      icon.setDisplaySize(22, 22 * (icon.height / icon.width));
      this.add
        .text(x + 16, yPos, planetNames[i].substring(0, 3).toUpperCase(), {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "4px",
          color: "#64748b",
        })
        .setOrigin(0, 0.5)
        .setDepth(20);

      this.livesIcons.push(icon);
    }
  }

  // ─── Question UI ───

  private createQuestionUI(width: number, height: number): void {
    this.questionCounter = this.add
      .text(60, 16, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "9px",
        color: COLORS.TEXT_CYAN,
      })
      .setDepth(20);

    const questionY = height * 0.52;

    this.questionText = this.add
      .text(width / 2, questionY, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "12px",
        color: COLORS.TEXT_WHITE,
        align: "center",
        wordWrap: { width: width * 0.8 },
        lineSpacing: 8,
      })
      .setOrigin(0.5, 0)
      .setDepth(20);
  }

  private createFeedbackText(width: number, height: number): void {
    this.feedbackText = this.add
      .text(width / 2, height * 0.47, "", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "14px",
        color: COLORS.TEXT_WHITE,
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(25)
      .setAlpha(0);
  }

  // ─── Intro Sequence ───

  private startIntro(width: number, height: number): void {
    const titleText = this.add
      .text(width / 2, height * 0.15, "FINAL STAND", {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "14px",
        color: "#ef4444",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(30)
      .setAlpha(0);

    this.tweens.add({
      targets: titleText,
      alpha: 1,
      duration: 800,
      hold: 1500,
      yoyo: true,
      onComplete: () => titleText.destroy(),
    });

    this.tweens.add({
      targets: this.playerShip,
      x: this.playerRestX,
      duration: 2000,
      ease: "Cubic.easeOut",
    });

    // Boss intro — pause idle during entrance tween
    this.isBossAnimating = true;
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossInitialX,
      duration: 2500,
      ease: "Back.easeOut",
      delay: 800,
      onComplete: () => {
        this.isBossAnimating = false;
        this.cameras.main.shake(600, 0.008);
        this.cameras.main.flash(300, 40, 0, 0);
      },
    });

    this.time.delayedCall(4000, () => {
      this.showQuestion();
    });
  }

  // ─── Show Question ───

  private showQuestion(): void {
    if (this.isGameOver) return;

    const { width, height } = this.scale;

    if (this.currentQuestionIndex >= this.shuffledQuestions.length) {
      this.triggerGameOver(false);
      return;
    }

    const q = this.shuffledQuestions[this.currentQuestionIndex];

    this.questionCounter.setText(
      `Q${this.questionsAnswered + 1}  |  ${this.correctAnswers}/${CORRECT_TO_WIN} hits`
    );

    this.questionText.setText(q.question);
    this.questionText.setAlpha(0);
    this.questionText.setScale(0.9);
    this.tweens.add({
      targets: this.questionText,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: "Back.easeOut",
    });

    // Clear old option buttons safely
    this.optionButtons.forEach((btn) => {
      if (btn && btn.active) btn.destroy();
    });
    this.optionButtons = [];

    // 2x2 grid layout
    const gridCols = 2;
    const optionWidth = Math.min((width - 60) / 2, 260);
    const optionHeight = 46;
    const gapX = 12;
    const gapY = 10;
    const gridWidth = gridCols * optionWidth + (gridCols - 1) * gapX;
    const gridStartX = (width - gridWidth) / 2;
    const gridStartY = height * 0.68;

    q.options.forEach((optionText, i) => {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = gridStartX + col * (optionWidth + gapX) + optionWidth / 2;
      const y = gridStartY + row * (optionHeight + gapY) + optionHeight / 2;

      const container = this.add.container(x, y).setDepth(20);

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

      const label = String.fromCharCode(65 + i);
      const text = this.add
        .text(0, 0, `${label}. ${optionText}`, {
          fontFamily: "'Press Start 2P', monospace",
          fontSize: "9px",
          color: "#e2e8f0",
          align: "center",
          wordWrap: { width: optionWidth - 20 },
          lineSpacing: 4,
        })
        .setOrigin(0.5);

      container.add([bg, text]);

      const hitZone = this.add
        .rectangle(0, 0, optionWidth, optionHeight)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .setAlpha(0.001);

      container.add(hitZone);

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
          container.setScale(1.03);
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
          container.setScale(1);
        }
      });

      hitZone.on("pointerdown", () => {
        if (this.isAnswering || this.isGameOver) return;
        this.handleAnswer(i, q, bg, optionWidth, optionHeight);
      });

      container.setAlpha(0);
      container.setScale(0.8);
      this.tweens.add({
        targets: container,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 250,
        delay: i * 100,
        ease: "Back.easeOut",
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

    // Also highlight the correct answer if wrong
    if (!isCorrect) {
      const correctBtn = this.optionButtons[question.correctIndex];
      if (correctBtn && correctBtn.active) {
        const correctBg = correctBtn.getAt(0) as Phaser.GameObjects.Graphics;
        if (correctBg) {
          correctBg
            .clear()
            .fillStyle(COLORS.CORRECT_GREEN, 0.2)
            .fillRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            )
            .lineStyle(2, 0x4ade80)
            .strokeRoundedRect(
              -optionWidth / 2,
              -optionHeight / 2,
              optionWidth,
              optionHeight,
              6
            );
        }
      }
    }

    // Disable all buttons
    this.optionButtons.forEach((btn) => {
      if (btn && btn.active) {
        const hitZone = btn.getAt(2) as Phaser.GameObjects.Rectangle;
        if (hitZone && hitZone.input) hitZone.disableInteractive();
      }
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

    this.showFeedback("DIRECT HIT!", "#4ade80");
    this.fireBeam(question.planet);

    const barX = width * 0.3;
    const barWidth = width * 0.4;
    this.drawBossHealth(barX, 20, barWidth, 16);
    this.bossHealthText.setText(`${this.bossHealth}/${CORRECT_TO_WIN}`);

    // Pause idle so tween works, then resume
    this.isBossAnimating = true;
    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossSprite.x + 20,
      tint: 0xffffff,
      duration: 60,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.bossSprite.clearTint();
        this.isBossAnimating = false;
      },
    });

    this.cameras.main.shake(300, 0.008);

    this.warningOverlay.setAlpha(0.1);
    this.tweens.add({
      targets: this.warningOverlay,
      alpha: 0,
      duration: 500,
    });

    if (this.bossHealth <= 0) {
      this.time.delayedCall(1200, () => {
        this.triggerVictory();
      });
      return;
    }

    // Transition to next question
    this.time.delayedCall(1800, () => {
      this.clearQuestionUI();
      this.time.delayedCall(400, () => this.showQuestion());
    });
  }

  // ─── Wrong Answer ───

  private onWrongAnswer(_question: QuizQuestion): void {
    this.lives--;

    this.showFeedback("SHIELD HIT!", "#ef4444");

    // Boss attack animation
    this.bossAttackAnimation();

    // Remove a life icon (remove from top = last index first)
    const iconIndex = this.lives;
    if (iconIndex >= 0 && iconIndex < this.livesIcons.length) {
      const lostIcon = this.livesIcons[iconIndex];

      if (lostIcon && lostIcon.active) {
        // Subtle shrink + fade
        this.tweens.add({
          targets: lostIcon,
          alpha: 0,
          scaleX: 0.6,
          scaleY: 0.6,
          duration: 250,
          ease: "Cubic.easeOut",
          onComplete: () => {
            lostIcon.setVisible(false);
          },
        });

        // Small spark pop (optional, subtle)
        const sparkEmitter = this.add
          .particles(lostIcon.x, lostIcon.y, "spark_particle", {
            speed: { min: 20, max: 80 },
            scale: { start: 0.3, end: 0 },
            blendMode: "ADD",
            lifespan: 300,
            tint: [0xef4444],
            quantity: 4,
            emitting: false,
          })
          .setDepth(21);

        sparkEmitter.explode(4);
      }
    }

    // Heavy camera shake
    this.cameras.main.shake(500, 0.015);
    this.cameras.main.flash(300, 80, 0, 0);

    // Warning overlay pulse
    this.warningOverlay.setAlpha(0.15);
    this.tweens.add({
      targets: this.warningOverlay,
      alpha: 0,
      duration: 800,
      ease: "Cubic.easeOut",
    });

    // Check lose condition
    if (this.lives <= 0) {
      this.time.delayedCall(1500, () => {
        this.triggerGameOver(true);
      });
      return;
    }

    // Transition to next question — this is the key fix:
    // Use a single delayedCall chain that always fires
    this.time.delayedCall(2000, () => {
      if (this.isGameOver) return;
      this.clearQuestionUI();
      this.time.delayedCall(400, () => {
        if (this.isGameOver) return;
        this.showQuestion();
      });
    });
  }

  // ─── Beam Attack Animation ───

  private fireBeam(planet: string): void {
    const beamColor = PLANET_BEAM_COLORS[planet] || 0x3b82f6;

    const startX = this.playerShip.x + 30;
    const startY = this.playerShip.y;
    const endX = this.bossSprite.x;
    const endY = this.bossSprite.y;

    // Player recoil — use absolute position to avoid drift
    this.tweens.add({
      targets: this.playerShip,
      x: this.playerRestX - 8,
      duration: 80,
      yoyo: true,
      onComplete: () => {
        this.playerShip.x = this.playerRestX;
      },
    });

    const beam = this.add.graphics().setDepth(15);

    const beamProgress = { t: 0 };
    this.tweens.add({
      targets: beamProgress,
      t: 1,
      duration: 250,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        const cx = Phaser.Math.Linear(startX, endX, beamProgress.t);
        const cy = Phaser.Math.Linear(startY, endY, beamProgress.t);
        beam.clear();
        beam.lineStyle(12, beamColor, 0.15);
        beam.lineBetween(startX, startY, cx, cy);
        beam.lineStyle(4, beamColor, 0.9);
        beam.lineBetween(startX, startY, cx, cy);
        beam.lineStyle(2, 0xffffff, 0.6);
        beam.lineBetween(startX, startY, cx, cy);
      },
      onComplete: () => {
        this.add
          .particles(endX, endY, "beam_particle", {
            speed: { min: 80, max: 250 },
            scale: { start: 0.8, end: 0 },
            blendMode: "ADD",
            lifespan: 500,
            tint: beamColor,
            quantity: 16,
            emitting: false,
          })
          .explode(16);

        const flash = this.add
          .circle(endX, endY, 30, 0xffffff, 0.5)
          .setDepth(16)
          .setBlendMode(Phaser.BlendModes.ADD);
        this.tweens.add({
          targets: flash,
          alpha: 0,
          scaleX: 2,
          scaleY: 2,
          duration: 300,
          onComplete: () => flash.destroy(),
        });

        this.tweens.add({
          targets: beam,
          alpha: 0,
          duration: 200,
          onComplete: () => beam.destroy(),
        });
      },
    });

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
      y: startY - 40,
      duration: 400,
      yoyo: true,
      hold: 400,
      onComplete: () => planetLabel.destroy(),
    });
  }

  // ─── Boss Attack Animation ───

  private bossAttackAnimation(): void {
    // Pause idle so tweens can work
    this.isBossAnimating = true;

    const lungeTarget = this.bossInitialX - 80;

    this.tweens.add({
      targets: this.bossSprite,
      x: lungeTarget,
      duration: 150,
      ease: "Cubic.easeOut",
      onComplete: () => {
        // At closest point, spawn spark barrage
        this.add
          .particles(
            this.bossSprite.x - 30,
            this.bossSprite.y,
            "spark_particle",
            {
              speed: { min: 150, max: 350 },
              angle: { min: 155, max: 205 },
              scale: { start: 1, end: 0 },
              blendMode: "ADD",
              lifespan: 700,
              tint: [0xef4444, 0xfca5a5, 0xff6b6b, 0xfbbf24],
              quantity: 14,
              emitting: false,
            }
          )
          .explode(14);

        this.time.delayedCall(100, () => {
          this.add
            .particles(
              this.bossSprite.x - 50,
              this.bossSprite.y + 10,
              "spark_particle",
              {
                speed: { min: 100, max: 250 },
                angle: { min: 140, max: 220 },
                scale: { start: 0.6, end: 0 },
                blendMode: "ADD",
                lifespan: 500,
                tint: [0xff0000, 0xff4444],
                quantity: 8,
                emitting: false,
              }
            )
            .explode(8);
        });

        // Return boss to position
        this.tweens.add({
          targets: this.bossSprite,
          x: this.bossInitialX,
          duration: 300,
          ease: "Cubic.easeIn",
          onComplete: () => {
            this.isBossAnimating = false;
          },
        });
      },
    });

    // Boss temporarily turns angrier
    this.bossSprite.setTint(0xff4444);
    this.time.delayedCall(500, () => {
      if (this.bossSprite && this.bossSprite.active) {
        this.bossSprite.clearTint();
      }
    });

    // Impact on player — use absolute position to avoid drift
    this.time.delayedCall(300, () => {
      if (this.isGameOver) return;
      this.playerShip.setTint(0xff0000);
      this.tweens.add({
        targets: this.playerShip,
        x: this.playerRestX - 10,
        duration: 80,
        yoyo: true,
        repeat: 3,
        onComplete: () => {
          if (this.playerShip && this.playerShip.active) {
            this.playerShip.clearTint();
            this.playerShip.x = this.playerRestX;
          }
        },
      });
    });
  }

  // ─── Feedback Text ───

  private showFeedback(message: string, color: string): void {
    const baseY = this.scale.height * 0.47;
    this.feedbackText.setText(message);
    this.feedbackText.setColor(color);
    this.feedbackText.setAlpha(1);
    this.feedbackText.setScale(1.3);
    this.feedbackText.setY(baseY);

    this.tweens.add({
      targets: this.feedbackText,
      alpha: 0,
      scaleX: 1,
      scaleY: 1,
      y: baseY - 20,
      duration: 1200,
      ease: "Cubic.easeOut",
    });
  }

  // ─── Clear Question UI ───

  private clearQuestionUI(): void {
    this.optionButtons.forEach((btn) => {
      if (btn && btn.active) {
        this.tweens.add({
          targets: btn,
          alpha: 0,
          scaleX: 0.8,
          scaleY: 0.8,
          duration: 200,
          onComplete: () => {
            if (btn && btn.active) btn.destroy();
          },
        });
      }
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
    this.isBossAnimating = true;
    this.clearQuestionUI();

    const { width, height } = this.scale;

    if (this.voidParticles) this.voidParticles.stop();
    this.cameras.main.setScroll(0, 0);
    this.warningOverlay.setAlpha(0);

    this.cameras.main.flash(600, 255, 100, 100);

    this.tweens.add({
      targets: this.bossSprite,
      x: this.bossSprite.x + 6,
      duration: 40,
      yoyo: true,
      repeat: 20,
    });

    let flashCount = 0;
    const flashTimer = this.time.addEvent({
      delay: 80,
      repeat: 12,
      callback: () => {
        flashCount++;
        if (this.bossSprite && this.bossSprite.active) {
          this.bossSprite.setTint(flashCount % 2 === 0 ? 0xffffff : 0xff0000);
        }
      },
    });

    this.time.delayedCall(1200, () => {
      flashTimer.destroy();
      if (this.bossSprite && this.bossSprite.active) {
        this.bossSprite.clearTint();
      }

      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 200, () => {
          const ox = (Math.random() - 0.5) * 60;
          const oy = (Math.random() - 0.5) * 60;

          const burstEmitter = this.add.particles(
            this.bossSprite.x + ox,
            this.bossSprite.y + oy,
            "spark_particle",
            {
              speed: { min: 100, max: 400 },
              scale: { start: 1.5, end: 0 },
              blendMode: "ADD",
              lifespan: 1000,
              tint: [0xef4444, 0xfca5a5, 0xff6b6b, 0xfbbf24, 0xffffff],
              quantity: 20,
              emitting: false,
            }
          );
          burstEmitter.explode(20);
          this.cameras.main.shake(200, 0.01);
        });
      }

      this.time.delayedCall(600, () => {
        this.cameras.main.flash(800, 255, 200, 200);
      });

      this.tweens.add({
        targets: this.bossSprite,
        alpha: 0,
        scaleX: 3,
        scaleY: 3,
        duration: 800,
        ease: "Cubic.easeOut",
      });

      this.tweens.add({
        targets: this.bossAura,
        alpha: 0,
        duration: 600,
      });

      this.time.delayedCall(1800, () => {
        this.showVictoryScreen(width, height);
      });
    });
  }

  private showVictoryScreen(width: number, height: number): void {
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(30);

    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.8,
      duration: 600,
    });

    const panelWidth = Math.min(width - 40, 360);
    const panelHeight = 180;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    const panel = this.add.graphics().setDepth(31).setAlpha(0);
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    panel.lineStyle(2, 0x4ade80);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);

    this.tweens.add({ targets: panel, alpha: 1, duration: 400, delay: 200 });

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

    this.tweens.add({ targets: title, alpha: 1, duration: 400, delay: 400 });

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

    this.tweens.add({ targets: stats, alpha: 1, duration: 400, delay: 600 });

    this.createEndButton(
      width / 2,
      panelY + panelHeight - 30,
      "SAVE THE SOLAR SYSTEM",
      0x22c55e,
      () => {
        // Mark boss as defeated immediately
        try {
          const STORAGE_KEY = "planetaria_progress";
          const stored = localStorage.getItem(STORAGE_KEY);
          const progress = stored ? JSON.parse(stored) : {};
          progress["bossDefeated"] = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
        } catch (e) {
          console.warn("Failed to save boss defeated:", e);
        }

        // Fade out and transition to outro scene
        this.cameras.main.fadeOut(600, 0, 0, 0);
        this.cameras.main.once("camerafadeoutcomplete", () => {
          this.scene.start("FinalOutroScene");
        });
      }
    );
  }

  // ─── Game Over ───

  private triggerGameOver(fromDamage: boolean): void {
    this.isGameOver = true;
    this.isBossAnimating = true;
    this.clearQuestionUI();

    const { width, height } = this.scale;

    if (this.voidParticles) this.voidParticles.stop();
    this.cameras.main.setScroll(0, 0);
    this.warningOverlay.setAlpha(0);

    if (fromDamage) {
      this.cameras.main.shake(600, 0.02);
      this.cameras.main.flash(400, 60, 0, 0);

      this.add
        .particles(this.playerShip.x, this.playerShip.y, "beam_particle", {
          speed: { min: 60, max: 200 },
          scale: { start: 0.8, end: 0 },
          blendMode: "ADD",
          lifespan: 600,
          tint: [0x3b82f6, 0x22d3ee, 0xffffff],
          quantity: 12,
          emitting: false,
        })
        .explode(12);

      this.tweens.add({
        targets: this.playerShip,
        alpha: 0,
        scaleX: 0.3,
        scaleY: 0.3,
        angle: 45,
        duration: 600,
      });

      this.tweens.add({
        targets: this.bossSprite,
        scaleX: 2.2,
        scaleY: 2.2,
        duration: 800,
        ease: "Bounce.easeOut",
      });
    }

    this.time.delayedCall(1500, () => {
      this.showGameOverScreen(width, height);
    });
  }

  private showGameOverScreen(width: number, height: number): void {
    const overlay = this.add
      .rectangle(0, 0, width, height, 0x000000, 0)
      .setOrigin(0)
      .setDepth(30);

    this.tweens.add({
      targets: overlay,
      fillAlpha: 0.85,
      duration: 600,
    });

    const panelWidth = Math.min(width - 40, 360);
    const panelHeight = 200;
    const panelX = width / 2 - panelWidth / 2;
    const panelY = height / 2 - panelHeight / 2;

    const panel = this.add.graphics().setDepth(31).setAlpha(0);
    panel.fillStyle(0x0f172a, 0.95);
    panel.fillRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);
    panel.lineStyle(2, 0xef4444);
    panel.strokeRoundedRect(panelX, panelY, panelWidth, panelHeight, 8);

    this.tweens.add({ targets: panel, alpha: 1, duration: 400, delay: 200 });

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

    this.tweens.add({ targets: title, alpha: 1, duration: 400, delay: 400 });

    const message = this.add
      .text(
        width / 2,
        panelY + 60,
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

    this.tweens.add({ targets: message, alpha: 1, duration: 400, delay: 500 });

    const statsText = `Hit ${this.correctAnswers} of ${CORRECT_TO_WIN} needed`;
    const stats = this.add
      .text(width / 2, panelY + 110, statsText, {
        fontFamily: "'Press Start 2P', monospace",
        fontSize: "7px",
        color: "#fbbf24",
        align: "center",
      })
      .setOrigin(0.5)
      .setDepth(32)
      .setAlpha(0);

    this.tweens.add({ targets: stats, alpha: 1, duration: 400, delay: 600 });

    this.createEndButton(
      width / 2 - 80,
      panelY + panelHeight - 30,
      "RETRY",
      0xfbbf24,
      () => {
        this.scene.restart();
      }
    );

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
