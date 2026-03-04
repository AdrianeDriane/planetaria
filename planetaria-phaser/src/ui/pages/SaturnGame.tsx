import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  playCelebrationSfx,
  playCorrectSfx,
  playWrongSfx,
} from "../../audio/Sfx";

// ─── Types ───

interface RingMaterial {
  id: string;
  label: string;
  icon: string;
  description: string;
  question: string;
  options: string[];
  correctIndex: number;
  collected: boolean;
  ringColor: string;
  x: number;
  y: number;
}

interface SaturnGameProps {
  onComplete: () => void;
  onBack: () => void;
}

// ─── Ring Material Data ───

const RING_MATERIALS: Omit<RingMaterial, "collected">[] = [
  {
    id: "gas",
    label: "Gas",
    icon: "💨",
    description:
      "Saturn is a gaseous planet with a thick atmosphere made of hydrogen, helium, methane, and some water vapor. It's so light it could float in a giant bathtub!",
    question: "Saturn is made mostly of ___?",
    options: ["Rocks and metal", "Gas", "Liquid water", "Sand"],
    correctIndex: 1,
    ringColor: "rgba(255, 200, 100, 0.8)",
    x: 22,
    y: 28,
  },
  {
    id: "ice",
    label: "Ice",
    icon: "🧊",
    description:
      "Saturn's rings are mostly made of ice particles, ranging from tiny grains to chunks as big as houses! The ice reflects sunlight, making the rings sparkle brilliantly.",
    question: "What are Saturn's rings mostly made of?",
    options: ["Fire and lava", "Cotton candy", "Ice", "Metal"],
    correctIndex: 2,
    ringColor: "rgba(200, 230, 255, 0.85)",
    x: 78,
    y: 22,
  },
  {
    id: "dust",
    label: "Dust",
    icon: "🌫️",
    description:
      "Tiny dust particles fill the gaps between larger ring chunks. This cosmic dust comes from micrometeorite impacts and helps give the rings their smooth, continuous appearance.",
    question: "What fills the gaps between the big chunks in Saturn's rings?",
    options: [
      "Nothing — it's empty",
      "Tiny dust particles",
      "Clouds",
      "Bubbles",
    ],
    correctIndex: 1,
    ringColor: "rgba(180, 160, 140, 0.75)",
    x: 82,
    y: 62,
  },
  {
    id: "stone",
    label: "Stone",
    icon: "🪨",
    description:
      "Rocky debris is mixed throughout Saturn's rings. These stone fragments may be remnants of comets, asteroids, or even shattered moons that wandered too close to Saturn.",
    question: "Rocky pieces in Saturn's rings might come from broken ___?",
    options: ["Planets", "Stars", "Moons and asteroids", "Spaceships"],
    correctIndex: 2,
    ringColor: "rgba(160, 140, 120, 0.8)",
    x: 18,
    y: 72,
  },
  {
    id: "water",
    label: "Water",
    icon: "💧",
    description:
      "Saturn's atmosphere contains water vapor, and water ice is a major component of the rings. Some of Saturn's moons, like Enceladus, even shoot geysers of water into space!",
    question: "Which Saturn moon shoots water into space like a fountain?",
    options: ["Titan", "Enceladus", "Our Moon", "Mars"],
    correctIndex: 1,
    ringColor: "rgba(100, 180, 255, 0.8)",
    x: 12,
    y: 50,
  },
  {
    id: "sun",
    label: "Sun",
    icon: "☀️",
    description:
      "Saturn is the 6th planet from the Sun. Sunlight reflecting off ice particles is what makes the rings visible! It takes light about 80 minutes to travel from the Sun to Saturn.",
    question: "What number planet from the Sun is Saturn?",
    options: ["3rd", "6th", "1st", "9th"],
    correctIndex: 1,
    ringColor: "rgba(255, 220, 100, 0.85)",
    x: 88,
    y: 42,
  },
];

// ─── Component ───

const SaturnGame: React.FC<SaturnGameProps> = ({ onComplete, onBack }) => {
  // State
  const [materials, setMaterials] = useState<RingMaterial[]>(
    RING_MATERIALS.map((m) => ({ ...m, collected: false }))
  );
  const [activeQuiz, setActiveQuiz] = useState<RingMaterial | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<"idle" | "correct" | "wrong">(
    "idle"
  );
  const [showDiscovery, setShowDiscovery] = useState<RingMaterial | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [ringBuildAnim, setRingBuildAnim] = useState(false);
  const [pulseMap, setPulseMap] = useState<Record<string, number>>({});
  const [countdown, setCountdown] = useState(5);
  const [saturnRotation, setSaturnRotation] = useState(0);
  const [bandOffset, setBandOffset] = useState(0);

  // Refs to avoid stale closures
  const hasCompletedRef = useRef(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Derived
  const collectedCount = materials.filter((m) => m.collected).length;
  const allCollected = collectedCount === materials.length;

  // Saturn slow spin + atmospheric band drift
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const update = () => {
      const elapsed = (Date.now() - start) / 1000;
      setSaturnRotation(elapsed * 3);
      setBandOffset(elapsed * 8);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Trigger ring build animation, then summary
  useEffect(() => {
    if (!allCollected) return;

    console.log("[Saturn] All collected! Starting ring build animation...");
    setRingBuildAnim(true);

    const t = setTimeout(() => {
      console.log("[Saturn] Showing summary...");
      setShowSummary(true);
    }, 2500);

    return () => clearTimeout(t);
  }, [allCollected]);

  // Replace the countdown useEffect with this:
  useEffect(() => {
    if (!showSummary) return;
    if (hasCompletedRef.current) return;

    console.log("[Saturn] Summary shown, starting 5s countdown...");
    let remaining = 5;
    setCountdown(remaining);

    countdownRef.current = setInterval(() => {
      remaining -= 1;
      console.log("[Saturn] Countdown:", remaining);
      setCountdown(remaining);

      if (remaining <= 0) {
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          console.log("[Saturn] Countdown done! Calling onComplete...");
          onComplete();
        }
      }
    }, 1000);

    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };
  }, [showSummary, onComplete]);

  // Floating pulse animation for uncollected material nodes
  useEffect(() => {
    let frame: number;
    const start = Date.now();
    const update = () => {
      const elapsed = (Date.now() - start) / 1000;
      const newMap: Record<string, number> = {};
      materials.forEach((m, i) => {
        if (!m.collected) {
          newMap[m.id] = 0.6 + 0.4 * Math.sin(elapsed * 2 + i * 1.2);
        }
      });
      setPulseMap(newMap);
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [materials]);

  // Planet size
  const planetSize = isMobile ? Math.min(window.innerWidth * 0.55, 280) : 420;
  const containerSize = planetSize * 2.4;

  // Handle clicking a material node
  const handleMaterialClick = useCallback(
    (material: RingMaterial) => {
      if (material.collected || showSummary || activeQuiz) return;
      setActiveQuiz(material);
      setSelectedAnswer(null);
      setAnswerState("idle");
    },
    [showSummary, activeQuiz]
  );

  // Handle quiz answer
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      if (!activeQuiz || answerState !== "idle") return;
      setSelectedAnswer(optionIndex);

      if (optionIndex === activeQuiz.correctIndex) {
        const nextCollectedCount = collectedCount + 1;
        const isFinalCollection = nextCollectedCount >= materials.length;
        setAnswerState("correct");
        if (isFinalCollection) {
          playCelebrationSfx();
          window.setTimeout(() => {
            window.dispatchEvent(
              new CustomEvent("audio-transition", {
                detail: { situation: "victory" },
              })
            );
          }, 420);
        } else {
          playCorrectSfx();
          window.dispatchEvent(
            new CustomEvent("audio-stinger", {
              detail: { situation: "saturn" },
            })
          );
        }
        setTimeout(() => {
          setMaterials((prev) =>
            prev.map((m) =>
              m.id === activeQuiz.id ? { ...m, collected: true } : m
            )
          );
          setActiveQuiz(null);
          setShowDiscovery({ ...activeQuiz, collected: true });
          setAnswerState("idle");
          setSelectedAnswer(null);
        }, 1200);
      } else {
        playWrongSfx();
        setAnswerState("wrong");
        setTimeout(() => {
          setAnswerState("idle");
          setSelectedAnswer(null);
        }, 1500);
      }
    },
    [activeQuiz, answerState, collectedCount, materials.length]
  );

  // Ring segments to render
  const ringSegments = useMemo(() => {
    const collected = materials.filter((m) => m.collected);
    const segmentAngle = 360 / materials.length;
    return collected.map((m) => {
      const idx = materials.findIndex((mat) => mat.id === m.id);
      const startAngle = idx * segmentAngle - 90;
      return { ...m, startAngle, sweep: segmentAngle };
    });
  }, [materials]);

  // Helper: generate SVG arc path
  const arcPath = (
    cx: number,
    cy: number,
    rx: number,
    ry: number,
    startDeg: number,
    sweepDeg: number
  ) => {
    const startRad = (startDeg * Math.PI) / 180;
    const endRad = ((startDeg + sweepDeg) * Math.PI) / 180;
    const x1 = cx + rx * Math.cos(startRad);
    const y1 = cy + ry * Math.sin(startRad);
    const x2 = cx + rx * Math.cos(endRad);
    const y2 = cy + ry * Math.sin(endRad);
    const largeArc = sweepDeg > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${rx} ${ry} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  // Ring geometry
  const ringCx = containerSize / 2;
  const ringCy = containerSize / 2;
  const ringRx = planetSize * 0.95;
  const ringRy = planetSize * 0.28;

  const isTopHalf = (startAngle: number, sweep: number) => {
    const midAngle = startAngle + sweep / 2;
    const midRad = (midAngle * Math.PI) / 180;
    return Math.sin(midRad) < 0;
  };

  const backSegments = ringSegments.filter((s) =>
    isTopHalf(s.startAngle, s.sweep)
  );
  const frontSegments = ringSegments.filter(
    (s) => !isTopHalf(s.startAngle, s.sweep)
  );

  // Font sizes
  const fs = {
    banner: isMobile ? "text-[9px]" : "text-[9px]",
    bannerSub: isMobile ? "text-[10px]" : "text-[9px]",
    checklistTitle: isMobile ? "text-[9px]" : "text-[9px]",
    checklistSub: isMobile ? "text-[10px]" : "text-[9px]",
    checklistItem: isMobile ? "text-[10px]" : "text-[10px]",
    checklistArrow: isMobile ? "text-[9px]" : "text-[9px]",
    checklistIcon: isMobile ? "text-[10px]" : "text-sm",
    hint: isMobile ? "text-[9px]" : "text-[10px]",
    quizHeader: isMobile ? "text-[9px]" : "text-[10px]",
    quizTitle: isMobile ? "text-[10px]" : "text-[10px]",
    quizQuestion: isMobile ? "text-[9px]" : "text-[9px]",
    quizOption: isMobile ? "text-[10px]" : "text-[10px]",
    quizFeedback: isMobile ? "text-[9px]" : "text-[10px]",
    discoveryHeader: isMobile ? "text-[9px]" : "text-[10px]",
    discoveryTitle: isMobile ? "text-[10px]" : "text-[10px]",
    discoveryBody: isMobile ? "text-[9px]" : "text-[10px]",
    discoverySegment: isMobile ? "text-[10px]" : "text-[9px]",
    summaryHeader: isMobile ? "text-[9px]" : "text-sm",
    summaryBody: isMobile ? "text-[7px]" : "text-[10px]",
    summaryFacts: isMobile ? "text-[6px]" : "text-[9px]",
    summaryGrid: isMobile ? "text-[6px]" : "text-[9px]",
    countdown: isMobile ? "text-[8px]" : "text-[9px]",
    nodeLabel: isMobile ? 6 : 9,
  };

  return (
    <div
      className="relative z-50 h-dvh w-screen overflow-hidden select-none"
      style={{ touchAction: "none" }}
    >
      {/* ─── Animated background ─── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url(/assets/outerspace.png)",
          backgroundSize: "120%",
          backgroundPosition: "center",
          animation: "saturn-bg-pan 35s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.65)", pointerEvents: "none" }}
      />

      {/* ─── Keyframes ─── */}
      <style>{`
                @keyframes saturn-bg-pan {
                    0%   { background-position: 20% 30%; background-size: 120%; }
                    25%  { background-position: 55% 25%; background-size: 125%; }
                    50%  { background-position: 75% 55%; background-size: 130%; }
                    75%  { background-position: 35% 75%; background-size: 125%; }
                    100% { background-position: 20% 30%; background-size: 120%; }
                }
                @keyframes node-float {
                    0%, 100% { transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -54%) scale(1.08); }
                }
                @keyframes ring-segment-appear {
                    from { opacity: 0; stroke-dashoffset: 100; }
                    to { opacity: 1; stroke-dashoffset: 0; }
                }
                @keyframes ring-rebuild-flash {
                    0% { filter: drop-shadow(0 0 20px rgba(255,200,100,0.3)); }
                    50% { filter: drop-shadow(0 0 60px rgba(255,200,100,0.8)); }
                    100% { filter: drop-shadow(0 0 30px rgba(255,200,100,0.5)); }
                }
                @keyframes core-pulse {
                    0%, 100% { box-shadow: 0 0 30px rgba(255,200,100,0.3), 0 0 60px rgba(255,180,50,0.15); }
                    50% { box-shadow: 0 0 50px rgba(255,200,100,0.6), 0 0 100px rgba(255,180,50,0.3); }
                }
                .discovery-modal-enter {
                    animation: discovery-modal-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes discovery-modal-in {
                    from { transform: scale(0.7) translateY(40px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .summary-modal-enter {
                    animation: summary-modal-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes summary-modal-in {
                    from { transform: scale(0.6) translateY(60px); opacity: 0; }
                    to { transform: scale(1) translateY(0); opacity: 1; }
                }
                .fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse-opacity {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    20% { transform: translateX(-4px); }
                    40% { transform: translateX(4px); }
                    60% { transform: translateX(-3px); }
                    80% { transform: translateX(3px); }
                }
                @keyframes countdown-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.8; }
                    50% { transform: scale(1.15); opacity: 1; }
                }
                @keyframes saturn-titan-orbit {
                    from { transform: rotate(0deg) translateX(var(--orbit-r)) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(var(--orbit-r)) rotate(-360deg); }
                }
            `}</style>

      {/* ─── Story Banner (replaces HUD badges) ─── */}
      {!allCollected && (
        <div
          className={`pointer-events-none absolute z-40 ${
            isMobile ? "top-2 right-10 left-2" : "top-6 right-auto left-4"
          }`}
          style={isMobile ? {} : { maxWidth: 420 }}
        >
          <div
            className="rounded-lg border border-red-800/60 bg-slate-950/90 px-3 py-2"
            style={{ boxShadow: "0 0 15px rgba(180,0,60,0.2)" }}
          >
            <p
              className={`font-['Press_Start_2P'] text-red-400 ${fs.banner} leading-relaxed`}
              style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
            >
              ⚠️ The Void Devourer has stripped Saturn's famous rings!
            </p>
            <p
              className={`mt-1.5 font-['Press_Start_2P'] text-amber-300 ${fs.bannerSub} leading-relaxed`}
              style={{ textShadow: "0 0 4px rgba(0,0,0,0.8)" }}
            >
              Tap the glowing orbs to find {materials.length - collectedCount}{" "}
              missing ring material
              {materials.length - collectedCount !== 1 ? "s" : ""}!
            </p>
          </div>
        </div>
      )}

      {/* ─── Ambient glow behind planet ─── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: planetSize * 2.5,
          height: planetSize * 2.5,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(255,200,100,0.12) 0%, rgba(255,180,50,0.05) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* ─── Planet Container ─── */}
      <div
        className="absolute"
        style={{
          width: containerSize,
          height: containerSize,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* ═══ BACK RINGS — TOP half, BEHIND planet (zIndex 2) ═══ */}
        <svg
          className="pointer-events-none absolute"
          style={{
            width: containerSize,
            height: containerSize,
            left: 0,
            top: 0,
            zIndex: 2,
            animation: ringBuildAnim
              ? "ring-rebuild-flash 1.5s ease-in-out 2"
              : "none",
          }}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
        >
          <path
            d={arcPath(ringCx, ringCy, ringRx, ringRy, -180, 180)}
            fill="none"
            stroke="rgba(255,200,100,0.06)"
            strokeWidth={planetSize * 0.12}
            strokeDasharray="4 8"
          />
          {backSegments.map((seg) => (
            <path
              key={seg.id}
              d={arcPath(
                ringCx,
                ringCy,
                ringRx,
                ringRy,
                seg.startAngle,
                seg.sweep
              )}
              fill="none"
              stroke={seg.ringColor}
              strokeWidth={planetSize * 0.1}
              strokeLinecap="round"
              style={{
                animation: "ring-segment-appear 0.8s ease-out forwards",
                filter: `drop-shadow(0 0 8px ${seg.ringColor})`,
              }}
            />
          ))}
          {allCollected && (
            <path
              d={arcPath(
                ringCx,
                ringCy,
                ringRx * 1.05,
                ringRy * 1.07,
                -180,
                180
              )}
              fill="none"
              stroke="rgba(255,220,130,0.12)"
              strokeWidth={planetSize * 0.18}
              style={{ filter: "blur(8px)" }}
            />
          )}
        </svg>

        {/* ═══ SATURN PLANET BODY (zIndex 5) ═══ */}
        <div
          className="absolute"
          style={{
            width: planetSize,
            height: planetSize,
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            borderRadius: "50%",
            overflow: "hidden",
            zIndex: 5,
            animation: allCollected ? "core-pulse 2s infinite" : "none",
            boxShadow: allCollected
              ? "inset -20px -10px 40px rgba(0,0,0,0.4), 0 0 40px rgba(255,200,100,0.4)"
              : "inset -20px -10px 40px rgba(0,0,0,0.5), 0 0 15px rgba(255,200,100,0.15)",
            transition: "box-shadow 1s ease",
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #f5e6b8, #d4a843 35%, #c4913a 55%, #a07030 75%, #7a5428 100%)",
              transform: `rotate(${saturnRotation}deg)`,
            }}
          />
          <div
            className="absolute inset-0 overflow-hidden rounded-full"
            style={{ mixBlendMode: "overlay" }}
          >
            {[
              { top: 15, h: 4, color: "rgba(240,200,120,0.35)", speed: 1.0 },
              { top: 22, h: 3, color: "rgba(200,160,80,0.3)", speed: 0.7 },
              { top: 32, h: 5, color: "rgba(220,180,100,0.25)", speed: 1.2 },
              { top: 40, h: 3, color: "rgba(180,140,60,0.3)", speed: 0.5 },
              { top: 48, h: 6, color: "rgba(230,190,110,0.28)", speed: 1.4 },
              { top: 57, h: 4, color: "rgba(190,150,70,0.3)", speed: 0.8 },
              { top: 65, h: 3, color: "rgba(210,170,90,0.25)", speed: 1.1 },
              { top: 73, h: 5, color: "rgba(175,135,55,0.3)", speed: 0.6 },
              { top: 82, h: 3, color: "rgba(200,160,80,0.25)", speed: 0.9 },
            ].map((band, i) => (
              <div
                key={i}
                className="absolute w-[200%]"
                style={{
                  top: `${band.top}%`,
                  height: `${band.h}%`,
                  left: `${-50 + ((bandOffset * band.speed) % 50) - 25}%`,
                  background: `repeating-linear-gradient(90deg, ${band.color} 0px, transparent 60px, ${band.color} 120px)`,
                  filter: "blur(2px)",
                }}
              />
            ))}
          </div>
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.1) 100%)",
              transform: `rotate(${-saturnRotation * 0.3}deg)`,
            }}
          />
          {!allCollected && (
            <>
              {[
                { x: 30, y: 25, size: 18 },
                { x: 60, y: 55, size: 14 },
                { x: 45, y: 75, size: 20 },
              ].map((mark, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${mark.x}%`,
                    top: `${mark.y}%`,
                    width: mark.size,
                    height: mark.size,
                    background:
                      "radial-gradient(circle, rgba(80,0,120,0.4), transparent)",
                    boxShadow: "0 0 10px rgba(100,0,150,0.3)",
                    transform: "translate(-50%, -50%)",
                  }}
                />
              ))}
            </>
          )}
        </div>

        {/* ═══ FRONT RINGS — BOTTOM half, IN FRONT of planet (zIndex 10) ═══ */}
        <svg
          className="pointer-events-none absolute"
          style={{
            width: containerSize,
            height: containerSize,
            left: 0,
            top: 0,
            zIndex: 10,
            animation: ringBuildAnim
              ? "ring-rebuild-flash 1.5s ease-in-out 2"
              : "none",
          }}
          viewBox={`0 0 ${containerSize} ${containerSize}`}
        >
          <path
            d={arcPath(ringCx, ringCy, ringRx, ringRy, 0, 180)}
            fill="none"
            stroke="rgba(255,200,100,0.08)"
            strokeWidth={planetSize * 0.12}
            strokeDasharray="4 8"
          />
          {frontSegments.map((seg) => (
            <path
              key={seg.id}
              d={arcPath(
                ringCx,
                ringCy,
                ringRx,
                ringRy,
                seg.startAngle,
                seg.sweep
              )}
              fill="none"
              stroke={seg.ringColor}
              strokeWidth={planetSize * 0.1}
              strokeLinecap="round"
              style={{
                animation: "ring-segment-appear 0.8s ease-out forwards",
                filter: `drop-shadow(0 0 8px ${seg.ringColor})`,
              }}
            />
          ))}
          {allCollected && (
            <>
              <path
                d={arcPath(
                  ringCx,
                  ringCy,
                  ringRx * 1.05,
                  ringRy * 1.07,
                  0,
                  180
                )}
                fill="none"
                stroke="rgba(255,220,130,0.15)"
                strokeWidth={planetSize * 0.18}
                style={{ filter: "blur(8px)" }}
              />
              <path
                d={arcPath(ringCx, ringCy, ringRx * 0.9, ringRy * 0.93, 0, 180)}
                fill="none"
                stroke="rgba(255,200,100,0.1)"
                strokeWidth={planetSize * 0.08}
                style={{ filter: "blur(4px)" }}
              />
            </>
          )}
        </svg>

        {/* ─── Titan moon orbiting ─── */}
        <div
          className="pointer-events-none absolute"
          style={{
            width: isMobile ? 14 : 22,
            height: isMobile ? 14 : 22,
            left: "50%",
            top: "50%",
            transformOrigin: "center center",
            animation: "saturn-titan-orbit 20s linear infinite",
            zIndex: 15,
            marginLeft: -(isMobile ? 7 : 11),
            marginTop: -(isMobile ? 7 : 11),
            ["--orbit-r" as any]: `${planetSize * 1.05}px`,
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, #e8d5a3, #c4a060)",
              boxShadow: "0 0 8px rgba(200,170,80,0.5)",
            }}
          />
        </div>
      </div>

      {/* ─── Floating Material Nodes ─── */}
      {materials.map((mat) => {
        if (mat.collected) return null;
        const nodeSize = isMobile ? 48 : 68;
        const pulse = pulseMap[mat.id] ?? 0.8;

        return (
          <button
            key={mat.id}
            onClick={() => handleMaterialClick(mat)}
            className="absolute focus:outline-none"
            style={{
              left: `${mat.x}%`,
              top: `${mat.y}%`,
              width: nodeSize,
              height: nodeSize,
              transform: "translate(-50%, -50%)",
              animation: "node-float 3s ease-in-out infinite",
              animationDelay: `${materials.indexOf(mat) * 0.4}s`,
              zIndex: 30,
              cursor: "pointer",
              background: "none",
              border: "none",
              padding: 0,
            }}
            aria-label={`Collect ${mat.label}`}
          >
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${mat.ringColor.replace(
                  /0\.\d+\)/,
                  "0.3)"
                )}, transparent 70%)`,
                opacity: pulse,
                transform: `scale(${1.3 + pulse * 0.3})`,
                transition: "opacity 0.1s, transform 0.1s",
              }}
            />
            <div
              className="absolute inset-1 flex items-center justify-center rounded-full"
              style={{
                background: "rgba(15,23,42,0.85)",
                border: `2px solid ${mat.ringColor}`,
                boxShadow: `0 0 12px ${mat.ringColor}, inset 0 0 8px rgba(0,0,0,0.5)`,
              }}
            >
              <span className={isMobile ? "text-lg" : "text-2xl"}>
                {mat.icon}
              </span>
            </div>
            <span
              className="absolute font-['Press_Start_2P'] whitespace-nowrap text-amber-200"
              style={{
                bottom: -18,
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: fs.nodeLabel,
                textShadow: "0 0 6px rgba(0,0,0,1), 0 0 2px rgba(0,0,0,1)",
              }}
            >
              {mat.label}
            </span>
          </button>
        );
      })}

      {/* ─── Checklist Panel / Hamburger ─── */}
      {isMobile && (
        <button
          className="pointer-events-auto absolute top-2 right-2 z-50 flex flex-col items-center justify-center gap-[3px] rounded border border-amber-700 bg-slate-900/80 p-1.5"
          style={{ width: 36, height: 36 }}
          onClick={() => setIsChecklistOpen((v) => !v)}
          aria-label="Toggle checklist"
        >
          <span className="block h-[2px] w-4 rounded bg-amber-400" />
          <span className="block h-[2px] w-4 rounded bg-amber-400" />
          <span className="block h-[2px] w-4 rounded bg-amber-400" />
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 font-['Press_Start_2P'] text-[11px] text-white">
            {collectedCount}
          </span>
        </button>
      )}

      {(!isMobile || isChecklistOpen) && (
        <div
          className={`fade-in pointer-events-auto absolute z-40 font-['Press_Start_2P'] ${
            isMobile ? "top-10 right-2 w-52" : "top-12 right-4 w-72"
          }`}
        >
          <div
            className="overflow-hidden rounded-lg border-2 border-amber-600 bg-slate-950/95"
            style={{
              boxShadow:
                "0 0 20px rgba(245,158,11,0.2), 4px 4px 0 rgba(0,0,0,0.6)",
            }}
          >
            <div className="border-b border-amber-700 bg-amber-900/40 px-3 py-2">
              <div
                className={`tracking-widest text-amber-300 uppercase ${fs.checklistTitle}`}
              >
                Ring Materials
              </div>
              <div className={`mt-0.5 text-amber-500 ${fs.checklistSub}`}>
                {collectedCount}/{materials.length} collected
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-400"
                  style={{
                    width: `${(collectedCount / materials.length) * 100}%`,
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>
            </div>
            <ul className="space-y-1 p-2">
              {materials.map((m) => (
                <li
                  key={m.id}
                  onClick={() => m.collected && setShowDiscovery(m)}
                  className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                    m.collected
                      ? "cursor-pointer bg-green-900/20 text-green-400 hover:bg-green-900/40"
                      : "cursor-default text-amber-400/60"
                  } ${fs.checklistItem}`}
                >
                  <span className={fs.checklistIcon}>
                    {m.collected ? "✅" : "⬜"}
                  </span>
                  <span className={fs.checklistIcon}>{m.icon}</span>
                  <span className="tracking-wide">{m.label}</span>
                  {m.collected && (
                    <span className={`ml-auto opacity-50 ${fs.checklistArrow}`}>
                      ▶
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── Quiz Modal ─── */}
      {activeQuiz && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => {
              if (answerState === "idle") setActiveQuiz(null);
            }}
          />
          <div
            className={`discovery-modal-enter relative font-['Press_Start_2P'] ${
              isMobile ? "w-[92vw] max-w-sm" : "w-[460px]"
            }`}
            style={
              answerState === "wrong"
                ? { animation: "shake 0.5s ease-out" }
                : {}
            }
          >
            <div
              className="overflow-hidden rounded-lg border-2 border-amber-500 bg-slate-950"
              style={{
                boxShadow:
                  "0 0 40px rgba(245,158,11,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
              }}
            >
              <div className="flex items-center gap-3 border-b border-amber-700 bg-amber-900/40 px-4 py-3">
                <span className={isMobile ? "text-xl" : "text-3xl"}>
                  {activeQuiz.icon}
                </span>
                <div>
                  <div
                    className={`tracking-widest text-amber-300 uppercase ${fs.quizHeader} mb-0.5`}
                  >
                    ★ Ring Material Quiz ★
                  </div>
                  <div
                    className={`tracking-wide text-amber-200 ${fs.quizTitle}`}
                  >
                    {activeQuiz.label}
                  </div>
                </div>
              </div>
              <div className="px-4 py-4">
                <p
                  className={`mb-4 leading-relaxed text-amber-100 ${fs.quizQuestion}`}
                >
                  {activeQuiz.question}
                </p>
                <div className="space-y-2">
                  {activeQuiz.options.map((opt, i) => {
                    let borderColor = "border-amber-800/50";
                    let bgColor = "bg-slate-900/80";
                    let textColor = "text-amber-200";

                    if (selectedAnswer === i) {
                      if (answerState === "correct") {
                        borderColor = "border-green-500";
                        bgColor = "bg-green-900/40";
                        textColor = "text-green-300";
                      } else if (answerState === "wrong") {
                        borderColor = "border-red-500";
                        bgColor = "bg-red-900/40";
                        textColor = "text-red-300";
                      } else {
                        borderColor = "border-amber-500";
                        bgColor = "bg-amber-900/30";
                      }
                    }

                    if (
                      answerState === "wrong" &&
                      i === activeQuiz.correctIndex
                    ) {
                      borderColor = "border-green-500/50";
                      bgColor = "bg-green-900/20";
                      textColor = "text-green-400/70";
                    }

                    return (
                      <button
                        key={i}
                        onClick={() => handleAnswer(i)}
                        disabled={answerState !== "idle"}
                        className={`w-full text-left ${bgColor} border ${borderColor} rounded-lg px-3 py-3 ${textColor} transition-all hover:border-amber-500 hover:bg-amber-900/30 disabled:cursor-default ${fs.quizOption} leading-relaxed`}
                        style={{
                          transition: "all 0.3s ease",
                        }}
                      >
                        <span className="mr-2 text-amber-500">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {answerState === "correct" && (
                  <div
                    className={`mt-3 text-center text-green-400 ${fs.quizFeedback}`}
                    style={{
                      animation: "fade-in 0.3s ease-out",
                    }}
                  >
                    ✨ Correct! Ring material collected! ✨
                  </div>
                )}
                {answerState === "wrong" && (
                  <div
                    className={`mt-3 text-center text-red-400 ${fs.quizFeedback}`}
                    style={{
                      animation: "fade-in 0.3s ease-out",
                    }}
                  >
                    ❌ Not quite! Try again...
                  </div>
                )}
              </div>
              <div className="flex justify-end border-t border-amber-800 px-4 py-2">
                {answerState === "idle" && (
                  <button
                    className={`text-amber-400/60 transition-colors hover:text-amber-300 ${fs.quizOption} py-1 tracking-wider`}
                    onClick={() => setActiveQuiz(null)}
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Discovery Modal ─── */}
      {showDiscovery && !showSummary && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDiscovery(null)}
          />
          <div
            className={`discovery-modal-enter relative font-['Press_Start_2P'] ${
              isMobile ? "w-[90vw] max-w-xs" : "w-[420px]"
            }`}
          >
            <div
              className="overflow-hidden rounded-lg border-2 border-green-500 bg-slate-950"
              style={{
                boxShadow:
                  "0 0 40px rgba(74,222,128,0.25), 4px 4px 0 rgba(0,0,0,0.7)",
              }}
            >
              <div className="flex items-center gap-3 border-b border-green-700 bg-green-900/40 px-4 py-3">
                <span className={isMobile ? "text-xl" : "text-3xl"}>
                  {showDiscovery.icon}
                </span>
                <div>
                  <div
                    className={`mb-0.5 tracking-widest text-green-300 uppercase ${fs.discoveryHeader}`}
                  >
                    ★ Material Found ★
                  </div>
                  <div
                    className={`tracking-wide text-green-400 ${fs.discoveryTitle}`}
                  >
                    {showDiscovery.label}
                  </div>
                </div>
              </div>
              <div className="px-4 py-4">
                <p
                  className={`leading-relaxed text-amber-200 ${fs.discoveryBody}`}
                >
                  {showDiscovery.description}
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <div
                    className="rounded-full"
                    style={{
                      width: isMobile ? 40 : 60,
                      height: isMobile ? 10 : 14,
                      background: `linear-gradient(90deg, transparent, ${showDiscovery.ringColor}, transparent)`,
                      boxShadow: `0 0 10px ${showDiscovery.ringColor}`,
                    }}
                  />
                  <span className={`text-amber-400 ${fs.discoverySegment}`}>
                    Ring segment added!
                  </span>
                </div>
              </div>
              <div className="flex justify-end border-t border-green-800 px-4 py-3">
                <button
                  className={`rounded border-2 border-green-500 bg-green-700 px-4 py-2 text-white transition-colors hover:bg-green-600 active:bg-green-800 ${fs.discoveryBody} tracking-wider`}
                  onClick={() => setShowDiscovery(null)}
                >
                  GOT IT!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Summary / Completion Screen with Countdown ─── */}
      {showSummary && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />
          <div
            className={`summary-modal-enter relative font-['Press_Start_2P'] ${
              isMobile ? "w-[92vw] max-w-sm" : "w-[480px]"
            }`}
          >
            <div
              className="overflow-hidden rounded-lg border-2 border-green-500 bg-slate-950"
              style={{
                boxShadow:
                  "0 0 60px rgba(74,222,128,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
              }}
            >
              <div className="border-b border-green-700 bg-green-900/40 px-4 py-3 text-center">
                <div
                  className={`tracking-widest text-green-400 uppercase ${fs.summaryHeader}`}
                  style={{
                    animation: "pulse-scale 2s infinite",
                  }}
                >
                  ★ Planetary Core Reactivated ★
                </div>
              </div>
              <div className="space-y-3 px-4 py-4">
                <p
                  className={`leading-relaxed text-amber-200 ${fs.summaryBody}`}
                >
                  You&apos;ve restored Saturn&apos;s magnificent rings! All six
                  ring materials have been recovered and assembled. The second
                  largest planet shines brilliantly once more!
                </p>
                <div
                  className={`rounded-lg border border-amber-800/40 bg-slate-900/60 p-3 ${fs.summaryFacts} space-y-1 leading-loose text-amber-300`}
                >
                  <p>🪐 2nd largest planet, lowest density</p>
                  <p>📏 9½ times larger than Earth</p>
                  <p>🔄 Rotation: ~10 hours, 39 minutes</p>
                  <p>🌍 Revolution: 29 Earth years</p>
                  <p>🌙 At least 31 moons — largest is Titan</p>
                  <p>💨 Gas giant: hydrogen, helium, methane</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {materials.map((m) => (
                    <div
                      key={m.id}
                      className={`flex items-center gap-2 rounded border border-green-800/50 bg-slate-900 px-2 py-2 ${fs.summaryGrid} text-green-300`}
                    >
                      <span>{m.icon}</span>
                      <span>{m.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 border-t border-green-800 px-4 py-4">
                <div
                  className={`text-green-300 ${fs.countdown} tracking-wider`}
                  style={{
                    animation: "countdown-pulse 1s infinite",
                  }}
                >
                  Proceeding to Uranus in {countdown}...
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-cyan-400"
                    style={{
                      width: `${((5 - countdown) / 5) * 100}%`,
                      transition: "width 1s linear",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hint text ─── */}
      {!allCollected && !activeQuiz && !showDiscovery && collectedCount > 0 && (
        <div
          className="pointer-events-none absolute bottom-8 left-1/2 z-30"
          style={{
            transform: "translateX(-50%)",
            animation: "pulse-opacity 3s infinite",
          }}
        >
          <span
            className={`font-['Press_Start_2P'] text-amber-400/70 ${fs.hint}`}
            style={{
              textShadow: "0 0 8px rgba(0,0,0,1)",
            }}
          >
            Tap the glowing orbs to collect ring materials
          </span>
        </div>
      )}
    </div>
  );
};

export default SaturnGame;
