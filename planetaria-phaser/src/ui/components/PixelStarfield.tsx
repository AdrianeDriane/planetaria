import React, { useRef, useEffect, useCallback } from "react";

// ─── Star Interface ───
interface Star {
  x: number;
  y: number;
  speed: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
  color: [number, number, number];
}

// ─── Asteroid Interface ───
interface Asteroid {
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotationSpeed: number;
  variant: number; // which shape to use
  size: number; // scale multiplier (1-3)
  color: [number, number, number];
  tumblePhase: number;
}

// ─── Shooting Star Interface ───
interface ShootingStar {
  x: number;
  y: number;
  speed: number;
  tailLength: number;
  life: number;
  maxLife: number;
  active: boolean;
  color: [number, number, number];
}

// ─── Distant Planet Interface ───
interface DistantPlanet {
  x: number;
  y: number;
  radius: number;
  speed: number;
  baseColor: [number, number, number];
  ringColor: [number, number, number] | null;
  hasRing: boolean;
  phase: number;
}

// ─── Space Dust Particle ───
interface SpaceDust {
  x: number;
  y: number;
  speed: number;
  alpha: number;
  drift: number;
  driftSpeed: number;
  driftPhase: number;
}

interface PixelStarfieldProps {
  starCount?: number;
  pixelScale?: number;
  speed?: number;
  opacity?: number;
  direction?: number;
  asteroidCount?: number;
  dustCount?: number;
  planetCount?: number;
  className?: string;
}

const STAR_COLORS: [number, number, number][] = [
  [255, 255, 255],
  [200, 200, 255],
  [255, 220, 180],
  [180, 180, 255],
  [255, 180, 180],
  [180, 255, 220],
  [220, 200, 255],
];

const ASTEROID_COLORS: [number, number, number][] = [
  [100, 90, 80],
  [120, 110, 95],
  [80, 75, 70],
  [110, 100, 85],
  [90, 85, 75],
  [130, 115, 100],
];

const PLANET_COLORS: [number, number, number][] = [
  [60, 40, 80],
  [40, 60, 80],
  [80, 50, 40],
  [40, 70, 60],
  [70, 40, 60],
];

const RING_COLORS: [number, number, number][] = [
  [120, 100, 140],
  [100, 120, 140],
  [140, 120, 100],
];

// Pixel-art asteroid shape templates (each is a 2D boolean grid)
// These are small so they look chunky and retro
const ASTEROID_SHAPES: boolean[][][] = [
  // Variant 0: Lumpy blob (5x5)
  [
    [false, true, true, true, false],
    [true, true, true, true, true],
    [true, true, true, true, false],
    [true, true, true, true, true],
    [false, true, true, false, false],
  ],
  // Variant 1: Angular rock (6x5)
  [
    [false, false, true, true, false, false],
    [false, true, true, true, true, false],
    [true, true, true, true, true, true],
    [false, true, true, true, true, false],
    [false, false, true, false, false, false],
  ],
  // Variant 2: Small chunk (4x4)
  [
    [false, true, true, false],
    [true, true, true, true],
    [true, true, true, false],
    [false, true, false, false],
  ],
  // Variant 3: Irregular shard (5x6)
  [
    [false, false, true, false, false],
    [false, true, true, true, false],
    [true, true, true, true, false],
    [true, true, true, true, true],
    [false, true, true, true, false],
    [false, false, true, false, false],
  ],
  // Variant 4: Tiny pebble (3x3)
  [
    [false, true, false],
    [true, true, true],
    [false, true, false],
  ],
  // Variant 5: Crescent fragment (5x4)
  [
    [false, true, true, true, false],
    [true, true, false, true, true],
    [true, true, true, true, false],
    [false, true, true, false, false],
  ],
];

const PixelStarfield: React.FC<PixelStarfieldProps> = ({
  starCount = 200,
  pixelScale = 3,
  speed = 0.3,
  opacity = 0.25,
  direction = 225, // diagonal: upper-left
  asteroidCount = 8,
  dustCount = 60,
  planetCount = 2,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const asteroidsRef = useRef<Asteroid[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const planetsRef = useRef<DistantPlanet[]>([]);
  const dustRef = useRef<SpaceDust[]>([]);
  const animFrameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const shootingStarTimerRef = useRef<number>(0);

  const dirRad = (direction * Math.PI) / 180;
  const dx = Math.cos(dirRad);
  const dy = Math.sin(dirRad);

  // ─── Star Creation ───
  const createStar = useCallback(
    (canvasW: number, canvasH: number, randomizePosition: boolean): Star => {
      const size = Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 3;
      let x: number, y: number;

      if (randomizePosition) {
        x = Math.random() * canvasW;
        y = Math.random() * canvasH;
      } else {
        // Spawn from the edge opposite to movement direction
        // For diagonal movement, we need to spawn from two edges
        const edge = Math.random();
        if (Math.abs(dx) > 0.1 && Math.abs(dy) > 0.1) {
          // Diagonal: spawn from either of the two source edges
          if (edge < 0.5) {
            x = dx > 0 ? -size : canvasW + size;
            y = Math.random() * canvasH;
          } else {
            x = Math.random() * canvasW;
            y = dy > 0 ? -size : canvasH + size;
          }
        } else if (Math.abs(dx) > 0.1) {
          x = dx > 0 ? -size : canvasW + size;
          y = Math.random() * canvasH;
        } else {
          x = Math.random() * canvasW;
          y = dy > 0 ? -size : canvasH + size;
        }
      }

      return {
        x,
        y,
        speed: 0.2 + Math.random() * 0.8,
        size,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.5 + Math.random() * 2.0,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      };
    },
    [dx, dy]
  );

  // ─── Asteroid Creation ───
  const createAsteroid = useCallback(
    (
      canvasW: number,
      canvasH: number,
      randomizePosition: boolean
    ): Asteroid => {
      const variant = Math.floor(Math.random() * ASTEROID_SHAPES.length);
      const size = 1 + Math.floor(Math.random() * 2); // 1-2
      let x: number, y: number;

      const shapeW = ASTEROID_SHAPES[variant][0].length * size;
      const shapeH = ASTEROID_SHAPES[variant].length * size;

      if (randomizePosition) {
        x = Math.random() * canvasW;
        y = Math.random() * canvasH;
      } else {
        const edge = Math.random();
        if (edge < 0.5) {
          x = dx > 0 ? -shapeW - 5 : canvasW + 5;
          y = Math.random() * canvasH;
        } else {
          x = Math.random() * canvasW;
          y = dy > 0 ? -shapeH - 5 : canvasH + 5;
        }
      }

      return {
        x,
        y,
        speed: 0.15 + Math.random() * 0.4,
        rotation: Math.floor(Math.random() * 4) * 90, // 0, 90, 180, 270
        rotationSpeed:
          (0.5 + Math.random() * 1.5) * (Math.random() > 0.5 ? 1 : -1),
        variant,
        size,
        color:
          ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)],
        tumblePhase: Math.random() * Math.PI * 2,
      };
    },
    [dx, dy]
  );

  // ─── Shooting Star Creation ───
  const createShootingStar = useCallback(
    (canvasW: number, canvasH: number): ShootingStar => {
      // Always shoot diagonally, roughly in the star movement direction but faster
      const edge = Math.random();
      let x: number, y: number;
      if (edge < 0.5) {
        x = dx > 0 ? -2 : canvasW + 2;
        y = Math.random() * canvasH * 0.6; // upper portion
      } else {
        x = Math.random() * canvasW;
        y = dy > 0 ? -2 : canvasH * 0.3;
      }

      return {
        x,
        y,
        speed: 3 + Math.random() * 4,
        tailLength: 6 + Math.floor(Math.random() * 10),
        life: 0,
        maxLife: 40 + Math.random() * 60,
        active: true,
        color: Math.random() > 0.5 ? [255, 255, 200] : [200, 220, 255],
      };
    },
    [dx, dy]
  );

  // ─── Distant Planet Creation ───
  const createPlanet = useCallback(
    (canvasW: number, canvasH: number, randomize: boolean): DistantPlanet => {
      const hasRing = Math.random() > 0.5;
      const radius = 4 + Math.floor(Math.random() * 6);
      return {
        x: randomize
          ? Math.random() * canvasW
          : dx > 0
            ? -radius * 3
            : canvasW + radius * 3,
        y: Math.random() * canvasH,
        radius,
        speed: 0.02 + Math.random() * 0.06,
        baseColor:
          PLANET_COLORS[Math.floor(Math.random() * PLANET_COLORS.length)],
        ringColor: hasRing
          ? RING_COLORS[Math.floor(Math.random() * RING_COLORS.length)]
          : null,
        hasRing,
        phase: Math.random() * Math.PI * 2,
      };
    },
    [dx]
  );

  // ─── Space Dust Creation ───
  const createDust = useCallback(
    (canvasW: number, canvasH: number, randomize: boolean): SpaceDust => {
      let x: number, y: number;
      if (randomize) {
        x = Math.random() * canvasW;
        y = Math.random() * canvasH;
      } else {
        const edge = Math.random();
        if (edge < 0.5) {
          x = dx > 0 ? -1 : canvasW + 1;
          y = Math.random() * canvasH;
        } else {
          x = Math.random() * canvasW;
          y = dy > 0 ? -1 : canvasH + 1;
        }
      }
      return {
        x,
        y,
        speed: 0.1 + Math.random() * 0.3,
        alpha: 0.05 + Math.random() * 0.15,
        drift: 0,
        driftSpeed: 0.5 + Math.random() * 1.5,
        driftPhase: Math.random() * Math.PI * 2,
      };
    },
    [dx, dy]
  );

  // ─── Initialization ───
  const initAll = useCallback(
    (canvasW: number, canvasH: number) => {
      const stars: Star[] = [];
      for (let i = 0; i < starCount; i++) {
        stars.push(createStar(canvasW, canvasH, true));
      }
      starsRef.current = stars;

      const asteroids: Asteroid[] = [];
      for (let i = 0; i < asteroidCount; i++) {
        asteroids.push(createAsteroid(canvasW, canvasH, true));
      }
      asteroidsRef.current = asteroids;

      shootingStarsRef.current = [];
      shootingStarTimerRef.current = 100 + Math.random() * 200;

      const planets: DistantPlanet[] = [];
      for (let i = 0; i < planetCount; i++) {
        planets.push(createPlanet(canvasW, canvasH, true));
      }
      planetsRef.current = planets;

      const dust: SpaceDust[] = [];
      for (let i = 0; i < dustCount; i++) {
        dust.push(createDust(canvasW, canvasH, true));
      }
      dustRef.current = dust;
    },
    [
      starCount,
      asteroidCount,
      planetCount,
      dustCount,
      createStar,
      createAsteroid,
      createPlanet,
      createDust,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const resize = () => {
      canvas.width = Math.floor(canvas.offsetWidth / pixelScale);
      canvas.height = Math.floor(canvas.offsetHeight / pixelScale);
      canvas.style.imageRendering = "pixelated";
      initAll(canvas.width, canvas.height);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const render = (time: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = time;
      const delta = Math.min((time - lastTimeRef.current) / 16.667, 3);
      lastTimeRef.current = time;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // ─── Draw Nebulae ───
      drawNebula(ctx, w, h, time);

      // ─── Draw Distant Planets ───
      const planets = planetsRef.current;
      for (let i = 0; i < planets.length; i++) {
        const planet = planets[i];
        planet.x += dx * planet.speed * speed * delta;
        planet.y += dy * planet.speed * speed * delta;

        const margin = planet.radius * 3;
        if (
          planet.x < -margin ||
          planet.x > w + margin ||
          planet.y < -margin ||
          planet.y > h + margin
        ) {
          planets[i] = createPlanet(w, h, false);
          continue;
        }

        drawPixelPlanet(ctx, planet, time);
      }

      // ─── Draw Space Dust ───
      const dustParticles = dustRef.current;
      for (let i = 0; i < dustParticles.length; i++) {
        const d = dustParticles[i];
        d.x += dx * d.speed * speed * delta;
        d.y += dy * d.speed * speed * delta;

        // Perpendicular drift for floaty feel
        const perpDx = -dy;
        const perpDy = dx;
        d.drift = Math.sin(time * 0.001 * d.driftSpeed + d.driftPhase) * 0.3;
        const drawX = Math.floor(d.x + perpDx * d.drift);
        const drawY = Math.floor(d.y + perpDy * d.drift);

        const margin = 2;
        if (
          drawX < -margin ||
          drawX > w + margin ||
          drawY < -margin ||
          drawY > h + margin
        ) {
          dustParticles[i] = createDust(w, h, false);
          continue;
        }

        ctx.fillStyle = `rgba(150, 140, 180, ${d.alpha})`;
        ctx.fillRect(drawX, drawY, 1, 1);
      }

      // ─── Draw Stars ───
      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        star.x += dx * star.speed * speed * delta;
        star.y += dy * star.speed * speed * delta;

        const margin = star.size + 2;
        if (
          star.x < -margin ||
          star.x > w + margin ||
          star.y < -margin ||
          star.y > h + margin
        ) {
          stars[i] = createStar(w, h, false);
          continue;
        }

        const twinkle =
          0.5 +
          0.5 * Math.sin(time * 0.001 * star.twinkleSpeed + star.twinkleOffset);
        const alpha = star.brightness * (0.4 + 0.6 * twinkle);
        const [r, g, b] = star.color;
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;

        const px = Math.floor(star.x);
        const py = Math.floor(star.y);

        if (star.size === 1) {
          ctx.fillRect(px, py, 1, 1);
        } else if (star.size === 2) {
          ctx.fillRect(px, py, 2, 2);
        } else {
          ctx.fillRect(px, py - 1, 1, 1);
          ctx.fillRect(px - 1, py, 3, 1);
          ctx.fillRect(px, py + 1, 1, 1);
          ctx.fillStyle = `rgba(${Math.min(r + 40, 255)},${Math.min(g + 40, 255)},${Math.min(b + 40, 255)},${Math.min(alpha * 1.3, 1)})`;
          ctx.fillRect(px, py, 1, 1);
        }
      }

      // ─── Draw Asteroids ───
      const asteroids = asteroidsRef.current;
      for (let i = 0; i < asteroids.length; i++) {
        const ast = asteroids[i];
        // Asteroids move diagonally but slightly differently than stars for parallax
        const astSpeedMult = 0.8;
        ast.x += dx * ast.speed * speed * astSpeedMult * delta;
        ast.y += dy * ast.speed * speed * astSpeedMult * delta;

        // Slow tumble rotation
        ast.rotation += ast.rotationSpeed * delta;

        const shape = ASTEROID_SHAPES[ast.variant];
        const shapeW = shape[0].length * ast.size;
        const shapeH = shape.length * ast.size;
        const margin = Math.max(shapeW, shapeH) + 5;

        if (
          ast.x < -margin ||
          ast.x > w + margin ||
          ast.y < -margin ||
          ast.y > h + margin
        ) {
          asteroids[i] = createAsteroid(w, h, false);
          continue;
        }

        drawPixelAsteroid(ctx, ast, time);
      }

      // ─── Draw Shooting Stars ───
      shootingStarTimerRef.current -= delta;
      if (shootingStarTimerRef.current <= 0) {
        shootingStarsRef.current.push(createShootingStar(w, h));
        shootingStarTimerRef.current = 150 + Math.random() * 400; // frames until next one
      }

      const shootingStars = shootingStarsRef.current;
      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const ss = shootingStars[i];
        ss.x += dx * ss.speed * delta;
        ss.y += dy * ss.speed * delta;
        ss.life += delta;

        if (
          ss.life >= ss.maxLife ||
          ss.x < -20 ||
          ss.x > w + 20 ||
          ss.y < -20 ||
          ss.y > h + 20
        ) {
          shootingStars.splice(i, 1);
          continue;
        }

        drawShootingStar(ctx, ss, dx, dy);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [
    pixelScale,
    speed,
    direction,
    dx,
    dy,
    initAll,
    createStar,
    createAsteroid,
    createShootingStar,
    createPlanet,
    createDust,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`h-full w-full ${className}`}
      style={{
        opacity,
        imageRendering: "pixelated",
      }}
    />
  );
};

// ─── Drawing Functions ───

function drawNebula(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number
) {
  const nebulaData: [number, number, string, number][] = [
    [0.25, 0.35, "rgba(60, 20, 80, 0.06)", 45],
    [0.7, 0.55, "rgba(20, 40, 80, 0.05)", 38],
    [0.5, 0.15, "rgba(80, 20, 40, 0.04)", 28],
    [0.85, 0.8, "rgba(20, 60, 60, 0.03)", 30],
  ];

  for (const [xRatio, yRatio, color, baseRadius] of nebulaData) {
    const driftX = Math.sin(time * 0.00008) * 4;
    const driftY = Math.cos(time * 0.00012) * 3;
    const cx = Math.floor(w * xRatio + driftX);
    const cy = Math.floor(h * yRatio + driftY);

    ctx.fillStyle = color;
    for (let py = -baseRadius; py <= baseRadius; py++) {
      for (let px = -baseRadius; px <= baseRadius; px++) {
        const dist = Math.sqrt(px * px + py * py);
        if (dist <= baseRadius) {
          const fade = 1 - dist / baseRadius;
          if (Math.random() < fade * 0.35) {
            ctx.fillRect(cx + px, cy + py, 1, 1);
          }
        }
      }
    }
  }
}

function drawPixelAsteroid(
  ctx: CanvasRenderingContext2D,
  ast: Asteroid,
  time: number
) {
  const shape = ASTEROID_SHAPES[ast.variant];
  const rows = shape.length;
  const cols = shape[0].length;
  const [r, g, b] = ast.color;

  // Determine rotation state (0, 1, 2, 3 = 0°, 90°, 180°, 270°)
  const rotState = ((Math.floor(ast.rotation / 90) % 4) + 4) % 4;

  // Subtle brightness wobble to simulate tumbling in light
  const lightWobble = 0.7 + 0.3 * Math.sin(time * 0.002 + ast.tumblePhase);

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      if (!shape[row][col]) continue;

      // Apply rotation transform
      let drawCol: number, drawRow: number;
      switch (rotState) {
        case 0:
          drawCol = col;
          drawRow = row;
          break;
        case 1:
          drawCol = rows - 1 - row;
          drawRow = col;
          break;
        case 2:
          drawCol = cols - 1 - col;
          drawRow = rows - 1 - row;
          break;
        case 3:
          drawCol = row;
          drawRow = cols - 1 - col;
          break;
        default:
          drawCol = col;
          drawRow = row;
      }

      const px = Math.floor(ast.x + drawCol * ast.size);
      const py = Math.floor(ast.y + drawRow * ast.size);

      // Edge highlighting: lighter on top-left edges, darker on bottom-right
      const isTopEdge = row === 0 || !shape[row - 1]?.[col];
      const isLeftEdge = col === 0 || !shape[row]?.[col - 1];
      const isBottomEdge = row === rows - 1 || !shape[row + 1]?.[col];
      const isRightEdge = col === cols - 1 || !shape[row]?.[col + 1];

      let shade = lightWobble;
      if (isTopEdge || isLeftEdge) shade = Math.min(shade + 0.25, 1.0);
      if (isBottomEdge || isRightEdge) shade = Math.max(shade - 0.2, 0.3);

      const fr = Math.floor(r * shade);
      const fg = Math.floor(g * shade);
      const fb = Math.floor(b * shade);

      ctx.fillStyle = `rgb(${fr},${fg},${fb})`;
      for (let sy = 0; sy < ast.size; sy++) {
        for (let sx = 0; sx < ast.size; sx++) {
          ctx.fillRect(px + sx, py + sy, 1, 1);
        }
      }

      // Add occasional crater spots (darker pixels)
      if ((row + col) % 3 === 0 && shape[row][col]) {
        ctx.fillStyle = `rgba(0, 0, 0, 0.2)`;
        ctx.fillRect(px, py, 1, 1);
      }
    }
  }
}

function drawShootingStar(
  ctx: CanvasRenderingContext2D,
  ss: ShootingStar,
  moveDx: number,
  moveDy: number
) {
  const [r, g, b] = ss.color;
  const fadeIn = Math.min(ss.life / 10, 1);
  const fadeOut = Math.max(1 - ss.life / ss.maxLife, 0);
  const alpha = fadeIn * fadeOut;

  // Draw head
  const hx = Math.floor(ss.x);
  const hy = Math.floor(ss.y);
  ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
  ctx.fillRect(hx, hy, 2, 2);

  // Bright core
  ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
  ctx.fillRect(hx, hy, 1, 1);

  // Draw tail (trail of fading pixels behind the head)
  for (let t = 1; t <= ss.tailLength; t++) {
    const tailAlpha = alpha * (1 - t / ss.tailLength) * 0.6;
    if (tailAlpha <= 0.01) break;

    const tx = Math.floor(ss.x - moveDx * t * 1.5);
    const ty = Math.floor(ss.y - moveDy * t * 1.5);

    ctx.fillStyle = `rgba(${r},${g},${b},${tailAlpha})`;
    ctx.fillRect(tx, ty, 1, 1);

    // Sparkle particles near the tail
    if (t % 2 === 0 && Math.random() > 0.3) {
      const sparkX = tx + Math.floor(Math.random() * 3 - 1);
      const sparkY = ty + Math.floor(Math.random() * 3 - 1);
      ctx.fillStyle = `rgba(255, 255, 200, ${tailAlpha * 0.5})`;
      ctx.fillRect(sparkX, sparkY, 1, 1);
    }
  }
}

function drawPixelPlanet(
  ctx: CanvasRenderingContext2D,
  planet: DistantPlanet,
  time: number
) {
  const { x, y, radius, baseColor, ringColor, hasRing, phase } = planet;
  const [r, g, b] = baseColor;
  const cx = Math.floor(x);
  const cy = Math.floor(y);

  // Draw the planet body as a pixelated circle with shading
  for (let py = -radius; py <= radius; py++) {
    for (let px = -radius; px <= radius; px++) {
      const dist = Math.sqrt(px * px + py * py);
      if (dist > radius) continue;

      // Simple directional shading (light from upper-left)
      const normDist = dist / radius;
      const lightAngle = Math.atan2(py, px);
      const lightFactor = 0.5 + 0.5 * Math.cos(lightAngle - Math.PI * 0.75);
      const shade = (0.3 + 0.7 * lightFactor) * (1 - normDist * 0.3);

      // Subtle surface bands
      const bandPattern =
        Math.sin((py + Math.sin(time * 0.0003 + phase) * 2) * 0.8) * 0.1;

      const fr = Math.floor(Math.min(r * (shade + bandPattern), 255));
      const fg = Math.floor(Math.min(g * (shade + bandPattern), 255));
      const fb = Math.floor(Math.min(b * (shade + bandPattern), 255));

      ctx.fillStyle = `rgba(${fr},${fg},${fb},0.7)`;
      ctx.fillRect(cx + px, cy + py, 1, 1);
    }
  }

  // Draw ring if present
  if (hasRing && ringColor) {
    const [rr, rg, rb] = ringColor;
    const ringInner = radius + 2;
    const ringOuter = radius + 4;

    for (let px = -ringOuter - 1; px <= ringOuter + 1; px++) {
      // Ring is a horizontal ellipse (flattened vertically)
      const ringY = Math.floor(px * 0.3); // flatten
      const absPx = Math.abs(px);

      if (absPx >= ringInner && absPx <= ringOuter) {
        // Skip pixels that would be behind the planet
        const behindPlanet = Math.abs(ringY) < 1 && absPx < radius;
        if (!behindPlanet) {
          const ringAlpha = 0.4 - Math.abs(ringY) * 0.05;
          if (ringAlpha > 0.05) {
            ctx.fillStyle = `rgba(${rr},${rg},${rb},${ringAlpha})`;
            ctx.fillRect(cx + px, cy + ringY, 1, 1);
            // Thickness
            if (ringAlpha > 0.15) {
              ctx.fillStyle = `rgba(${rr},${rg},${rb},${ringAlpha * 0.6})`;
              ctx.fillRect(cx + px, cy + ringY + 1, 1, 1);
            }
          }
        }
      }
    }
  }
}

export default PixelStarfield;
