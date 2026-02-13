import Phaser from "phaser";
import { INTRO_TEXTURES } from "../IntroTypes";

/**
 * CrashLandingBeat.ts
 *
 * Beat 5: "Crash landing on Mercury"
 *
 * Visuals:
 *   - Mercury surface (ground bar)
 *   - Ship falling at an angle, spinning and accelerating
 *   - Smoke trail behind the descending ship
 *   - Impact flash, camera shake, and debris on landing
 *   - Fire and smoke particles at crash site
 *
 * Assets used:
 *   PLACEHOLDER: intro_ship — S.S. Astra spaceship sprite
 */
export function buildCrashLandingVisuals(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container
): void {
  const { width, height } = scene.scale;

  // ── Mercury surface (procedural) ──
  const surfaceGfx = scene.add.graphics();
  const surfaceY = height * 0.46;

  // Seeded-random helper for deterministic terrain
  const seededRng = (seed: number) => {
    let s = seed;
    return () => {
      s = (s * 16807 + 0) % 2147483647;
      return (s - 1) / 2147483646;
    };
  };
  const rng = seededRng(42);

  // Generate jagged ridgeline points across the full width
  const leftEdge = 0;
  const rightEdge = width;
  const surfaceWidth = rightEdge - leftEdge;
  const ridgePoints: { x: number; y: number }[] = [];
  const segments = 40;
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = leftEdge + t * surfaceWidth;
    // Layered noise for natural feel
    const coarse = Math.sin(t * Math.PI * 3) * 6;
    const medium = Math.sin(t * Math.PI * 7 + 1.3) * 3;
    const fine = (rng() - 0.5) * 4;
    const y = surfaceY + coarse + medium + fine;
    ridgePoints.push({ x, y });
  }

  // Deep ground fill — dark Mercury crust
  surfaceGfx.fillStyle(0x3a3028, 1);
  surfaceGfx.beginPath();
  surfaceGfx.moveTo(ridgePoints[0].x, ridgePoints[0].y);
  for (const pt of ridgePoints) surfaceGfx.lineTo(pt.x, pt.y);
  surfaceGfx.lineTo(rightEdge, height);
  surfaceGfx.lineTo(leftEdge, height);
  surfaceGfx.closePath();
  surfaceGfx.fillPath();

  // Mid-layer — slightly lighter sub-surface
  surfaceGfx.fillStyle(0x4e4438, 0.7);
  surfaceGfx.beginPath();
  surfaceGfx.moveTo(ridgePoints[0].x, ridgePoints[0].y + 4);
  for (const pt of ridgePoints) surfaceGfx.lineTo(pt.x, pt.y + 4);
  surfaceGfx.lineTo(rightEdge, height);
  surfaceGfx.lineTo(leftEdge, height);
  surfaceGfx.closePath();
  surfaceGfx.fillPath();

  // Surface highlight — lighter top edge
  surfaceGfx.lineStyle(2, 0x9a8a72, 0.9);
  surfaceGfx.beginPath();
  surfaceGfx.moveTo(ridgePoints[0].x, ridgePoints[0].y);
  for (const pt of ridgePoints) surfaceGfx.lineTo(pt.x, pt.y);
  surfaceGfx.strokePath();

  // Secondary highlight line (faint)
  surfaceGfx.lineStyle(1, 0xbba882, 0.3);
  surfaceGfx.beginPath();
  surfaceGfx.moveTo(ridgePoints[0].x, ridgePoints[0].y - 1);
  for (const pt of ridgePoints) surfaceGfx.lineTo(pt.x, pt.y - 1);
  surfaceGfx.strokePath();

  // ── Craters ──
  const craterData = [
    { cx: 0.2, r: 18, depth: 3 },
    { cx: 0.45, r: 12, depth: 2 },
    { cx: 0.65, r: 22, depth: 4 },
    { cx: 0.8, r: 10, depth: 2 },
    { cx: 0.35, r: 8, depth: 1.5 },
  ];
  for (const c of craterData) {
    const cx = leftEdge + c.cx * surfaceWidth;
    const cy = surfaceY + c.depth + 6;

    // Crater shadow / depression (dark ellipse)
    surfaceGfx.fillStyle(0x2a2218, 0.6);
    surfaceGfx.fillEllipse(cx, cy, c.r * 2, c.r * 0.7);

    // Crater rim highlight (top arc)
    surfaceGfx.lineStyle(1, 0x8a7a62, 0.5);
    surfaceGfx.beginPath();
    surfaceGfx.arc(cx, cy - 1, c.r, Math.PI * 1.1, Math.PI * 1.9, false);
    surfaceGfx.strokePath();

    // Inner shadow
    surfaceGfx.fillStyle(0x1e1a14, 0.4);
    surfaceGfx.fillEllipse(cx + 1, cy + 1, c.r * 1.2, c.r * 0.4);
  }

  // ── Small rocks / boulders scattered on the surface ──
  for (let i = 0; i < 15; i++) {
    const rx = leftEdge + rng() * surfaceWidth;
    const ridgeIdx = Math.min(
      segments,
      Math.floor(((rx - leftEdge) / surfaceWidth) * segments)
    );
    const baseY = ridgePoints[ridgeIdx].y;
    const ry = baseY + 1 + rng() * 8;
    const rSize = 1 + rng() * 3;
    const shade = 0x50 + Math.floor(rng() * 0x20);
    const rockColor = (shade << 16) | ((shade - 0x10) << 8) | (shade - 0x20);
    surfaceGfx.fillStyle(rockColor, 0.7);
    surfaceGfx.fillRect(rx, ry, rSize, rSize * 0.7);
  }

  // ── Surface dust speckles ──
  for (let i = 0; i < 30; i++) {
    const dx = leftEdge + rng() * surfaceWidth;
    const ridgeIdx = Math.min(
      segments,
      Math.floor(((dx - leftEdge) / surfaceWidth) * segments)
    );
    const baseY = ridgePoints[ridgeIdx].y;
    const dy = baseY + 2 + rng() * 14;
    surfaceGfx.fillStyle(0x6a5a48, 0.3 + rng() * 0.3);
    surfaceGfx.fillPoint(dx, dy, 1 + rng());
  }

  container.add(surfaceGfx);

  // ── Ship falling and crashing ──
  const ship = scene.add
    .image(width * 0.6, height * 0.05, INTRO_TEXTURES.SHIP)
    .setScale(0.06)
    .setAngle(-25);
  container.add(ship);

  // Smoke trail behind the descending ship
  const smokeTrail = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_SMOKE, {
    follow: ship,
    followOffset: { x: 5, y: -10 },
    speed: { min: 5, max: 15 },
    angle: { min: 40, max: 60 },
    scale: { start: 0.6, end: 0.1 },
    lifespan: 1200,
    frequency: 60,
    quantity: 1,
    alpha: { start: 0.5, end: 0 },
  });
  container.add(smokeTrail);

  // Descent trajectory with spin
  scene.tweens.add({
    targets: ship,
    x: width * 0.45,
    y: height * 0.42,
    angle: { from: -25, to: 15 },
    duration: 2500,
    ease: "Quad.easeIn",
    onComplete: () => {
      smokeTrail.stop();
      onCrashImpact(scene, container, ship.x, height);
    },
  });

  // Ship spins during descent
  scene.tweens.add({
    targets: ship,
    angle: "+=360",
    duration: 1800,
    ease: "Cubic.easeIn",
  });

  // ── Title ──
  const title = scene.add
    .text(width / 2, height * 0.08, "CRASH LANDING", {
      fontFamily: "monospace",
      fontSize: "22px",
      color: "#ff6633",
      fontStyle: "bold",
    })
    .setOrigin(0.5);
  container.add(title);
}

/**
 * Called when the ship reaches the ground.
 * Creates the impact flash, camera shake, debris, and particle effects.
 */
function onCrashImpact(
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  impactX: number,
  sceneHeight: number
): void {
  const { width } = scene.scale;
  const impactY = sceneHeight * 0.42;

  // ── White impact flash ──
  const impactFlash = scene.add.rectangle(
    width / 2,
    sceneHeight / 2,
    width,
    sceneHeight,
    0xffffff,
    0.8
  );
  container.add(impactFlash);

  scene.tweens.add({
    targets: impactFlash,
    alpha: 0,
    duration: 400,
    ease: "Power2",
  });

  // ── Camera shake (initial impact + aftershock) ──
  scene.cameras.main.shake(600, 0.03);
  scene.time.delayedCall(700, () => {
    scene.cameras.main.shake(300, 0.01);
  });

  // ── Smoke particles ──
  const smokeEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_SMOKE,
    {
      x: impactX,
      y: impactY,
      speed: { min: 20, max: 60 },
      angle: { min: 230, max: 310 },
      scale: { start: 1.2, end: 0.2 },
      lifespan: 1800,
      frequency: 60,
      quantity: 3,
      alpha: { start: 0.7, end: 0 },
    }
  );
  container.add(smokeEmitter);

  // ── Fire particles ──
  const fireEmitter = scene.add.particles(0, 0, INTRO_TEXTURES.PARTICLE_FIRE, {
    x: impactX,
    y: impactY,
    speed: { min: 30, max: 100 },
    angle: { min: 230, max: 310 },
    scale: { start: 0.8, end: 0 },
    lifespan: 900,
    frequency: 40,
    quantity: 4,
    alpha: { start: 0.9, end: 0 },
  });
  container.add(fireEmitter);

  // ── Debris sparks flying outward ──
  const debrisEmitter = scene.add.particles(
    0,
    0,
    INTRO_TEXTURES.PARTICLE_FIRE,
    {
      x: impactX,
      y: impactY,
      speed: { min: 60, max: 180 },
      angle: { min: 200, max: 340 },
      scale: { start: 0.4, end: 0 },
      lifespan: 600,
      frequency: -1,
      quantity: 12,
      alpha: { start: 1, end: 0 },
    }
  );
  container.add(debrisEmitter);
  debrisEmitter.explode(12);

  // Stop continuous emission after a few seconds
  scene.time.delayedCall(3000, () => {
    smokeEmitter.stop();
    fireEmitter.stop();
  });
}
