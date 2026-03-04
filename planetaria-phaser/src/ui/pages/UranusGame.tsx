import React, { useState, useEffect, useCallback } from "react";
import PixelButton from "../components/PixelButton";

// ─── Types ───

interface DiscoveryZone {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** Position as % of the planet container */
  x: number;
  y: number;
  /** Hit-target radius in px (scaled by planet size) */
  radiusPct: number;
  found: boolean;
}

interface UranusGameProps {
  onComplete: () => void;
  onBack: () => void;
}

// ─── Discovery Data ───

const CHECKLIST_ITEMS: Omit<DiscoveryZone, "found">[] = [
  {
    id: "tilted",
    label: "Tilted Planet",
    description:
      "Uranus spins on its side at a 98° tilt! It's called the 'Sideways Planet' because it rolls around the Sun like a ball.",
    icon: "🔄",
    x: 50,
    y: 15,
    radiusPct: 12,
  },
  {
    id: "color",
    label: "Blue-Green Color",
    description:
      "Uranus gets its beautiful blue-green color from methane gas in its atmosphere, which absorbs red light and reflects blue-green.",
    icon: "🟢",
    x: 42,
    y: 48,
    radiusPct: 14,
  },
  {
    id: "rings",
    label: "Rings",
    description:
      "Uranus has 13 thin, dark rings made of ice and dust. They were only discovered in 1977!",
    icon: "💍",
    x: 110,
    y: -10,
    radiusPct: 12,
  },
  {
    id: "moons",
    label: "Moons",
    description:
      "Uranus has 27 known moons, all named after characters from Shakespeare and Alexander Pope. The largest are Titania and Oberon.",
    icon: "🌙",
    x: -20,
    y: 45,
    radiusPct: 12,
  },
  {
    id: "cold",
    label: "Cold Temperature",
    description:
      "Uranus is the coldest planet in the solar system, reaching temperatures as low as −224 °C (−371 °F). Brrr!",
    icon: "🥶",
    x: 58,
    y: 78,
    radiusPct: 12,
  },
  {
    id: "position",
    label: "Position from the Sun",
    description:
      "Uranus is the 7th planet from the Sun. It takes about 84 Earth years to orbit the Sun once — and one day lasts about 17 hours.",
    icon: "☀️",
    x: -15,
    y: 110,
    radiusPct: 12,
  },
];

// ─── Component ───

const UranusGame: React.FC<UranusGameProps> = ({ onComplete, onBack }) => {
  // State
  const [zones, setZones] = useState<DiscoveryZone[]>(
    CHECKLIST_ITEMS.map((z) => ({ ...z, found: false }))
  );
  const [activeDiscovery, setActiveDiscovery] = useState<DiscoveryZone | null>(
    null
  );
  const [showSummary, setShowSummary] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [gustActive, setGustActive] = useState(false);
  const [gustKey, setGustKey] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);

  // Responsive
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  // Derived
  const foundCount = zones.filter((z) => z.found).length;
  const allFound = foundCount === zones.length;

  // Trigger summary after all found
  useEffect(() => {
    if (allFound && !showSummary) {
      const t = setTimeout(() => setShowSummary(true), 800);
      return () => clearTimeout(t);
    }
  }, [allFound, showSummary]);

  // Occasional wind gust — fires every 7-13 s, lasts 2.4 s
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    const schedule = () => {
      const delay = 7000 + Math.random() * 6000;
      timeout = setTimeout(() => {
        setGustActive(true);
        setGustKey((k) => k + 1);
        setTimeout(() => setGustActive(false), 2400);
        schedule();
      }, delay);
    };
    schedule();
    return () => clearTimeout(timeout);
  }, []);

  // Slow sideways-tilt drift animation replacement
  useEffect(() => {
    let startTime = Date.now();
    let frame: number;

    const update = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const period = 10;
      // Sine wave from 0 to 15 and back
      const val =
        7.5 + 7.5 * Math.sin((2 * Math.PI * elapsed) / period - Math.PI / 2);
      setRotateValue(val);
      frame = requestAnimationFrame(update);
    };

    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Axis opacity replacement logic
  const getAxisOpacity = (v: number) => {
    const absV = Math.abs(v);
    if (absV <= 4) return 0;
    if (absV >= 5) return 1;
    // Linear fade between 4 and 5
    return absV - 4;
  };

  const axisOpacity = getAxisOpacity(rotateValue);
  const axisPointerEvents = Math.abs(rotateValue) > 4 ? "auto" : "none";

  // Planet dimensions based on viewport
  const planetSize = isMobile ? Math.min(window.innerWidth * 0.7, 360) : 700;
  const imgSize = planetSize * 2.4;

  // Click handler
  const handleZoneClick = useCallback(
    (zone: DiscoveryZone) => {
      if (zone.found || showSummary) return;
      setZones((prev) =>
        prev.map((z) => (z.id === zone.id ? { ...z, found: true } : z))
      );
      setActiveDiscovery({ ...zone, found: true });
    },
    [showSummary]
  );

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
          animation: "uranus-bg-pan 30s ease-in-out infinite alternate",
        }}
      />
      {/* Dark overlay to deepen the background */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.68)", pointerEvents: "none" }}
      />

      {/* ─── Wind Gust — sweeps across screen, click to discover Cold Temperature ─── */}
      {gustActive &&
        (() => {
          const coldZone = zones.find((z) => z.id === "cold")!;
          // 6 streaks at different vertical positions, widths, speeds
          const streaks = [
            {
              top: "18%",
              width: "55%",
              duration: "1.1s",
              delay: "0s",
              height: isMobile ? 2 : 3,
              opacity: 0.85,
            },
            {
              top: "28%",
              width: "40%",
              duration: "0.9s",
              delay: "0.15s",
              height: isMobile ? 1 : 2,
              opacity: 0.6,
            },
            {
              top: "38%",
              width: "65%",
              duration: "1.3s",
              delay: "0.05s",
              height: isMobile ? 2 : 4,
              opacity: 0.9,
            },
            {
              top: "50%",
              width: "35%",
              duration: "1.0s",
              delay: "0.25s",
              height: isMobile ? 1 : 2,
              opacity: 0.5,
            },
            {
              top: "62%",
              width: "50%",
              duration: "1.2s",
              delay: "0.1s",
              height: isMobile ? 2 : 3,
              opacity: 0.75,
            },
            {
              top: "74%",
              width: "45%",
              duration: "0.95s",
              delay: "0.2s",
              height: isMobile ? 1 : 2,
              opacity: 0.55,
            },
          ];
          return (
            <button
              key={gustKey}
              onClick={() => handleZoneClick(coldZone)}
              aria-label="Discover Cold Temperature"
              className="absolute inset-0"
              style={{
                background: "transparent",
                border: "none",
                cursor: coldZone.found ? "default" : "pointer",
                zIndex: 25,
                padding: 0,
              }}
            >
              {streaks.map((s, i) => (
                <span
                  key={i}
                  style={{
                    position: "absolute",
                    top: s.top,
                    left: 0,
                    width: s.width,
                    height: s.height,
                    borderRadius: 99,
                    background:
                      "linear-gradient(90deg, transparent 0%, rgba(186,230,253," +
                      s.opacity +
                      ") 30%, rgba(224,242,254," +
                      s.opacity +
                      ") 60%, transparent 100%)",
                    boxShadow: "0 0 6px rgba(186,230,253,0.4)",
                    animation: `gust-sweep ${s.duration} ${s.delay} ease-out forwards`,
                    pointerEvents: "none",
                  }}
                />
              ))}
            </button>
          );
        })()}

      {/* ─── Distant Sun — upper left, tiny since Uranus is ~19 AU away ─── */}
      {(() => {
        const sunZone = zones.find((z) => z.id === "position")!;
        return (
          <button
            onClick={() => handleZoneClick(sunZone)}
            aria-label="Discover Position from the Sun"
            style={{
              position: "absolute",
              left: isMobile ? 20 : 44,
              top: isMobile ? 100 : 100,
              width: isMobile ? 40 : 60,
              height: isMobile ? 40 : 60,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 40%, #fff9c4, #fde68a 40%, #f59e0b 70%, #b45309 100%)",
              boxShadow:
                "0 0 14px 6px rgba(253,230,138,0.9), 0 0 40px 14px rgba(245,158,11,0.5), 0 0 80px 28px rgba(180,83,9,0.25)",
              border: "none",
              cursor: sunZone.found ? "default" : "pointer",
              padding: 0,
              zIndex: 10,
            }}
          />
        );
      })()}

      {/* Background animation keyframes — slow pan + subtle zoom */}
      <style>{`
                @keyframes uranus-bg-pan {
                    0%   { background-position: 20% 30%; background-size: 120%; }
                    25%  { background-position: 60% 20%; background-size: 125%; }
                    50%  { background-position: 80% 60%; background-size: 130%; }
                    75%  { background-position: 40% 80%; background-size: 125%; }
                    100% { background-position: 20% 30%; background-size: 120%; }
                }
                @keyframes gust-sweep {
                    0%   { transform: translateX(-110%) scaleX(0.6); opacity: 0; }
                    15%  { opacity: 1; }
                    80%  { opacity: 0.7; }
                    100% { transform: translateX(110vw) scaleX(1.2); opacity: 0; }
                }
                @keyframes moon-orbit {
                    from { transform: rotate(0deg) translateX(var(--orbit-radius)) rotate(0deg); }
                    to   { transform: rotate(360deg) translateX(var(--orbit-radius)) rotate(-360deg); }
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
            `}</style>

      {/* ─── Ambient glow behind planet ─── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: planetSize * 2.2,
          height: planetSize * 2.2,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(125,211,252,0.15) 0%, rgba(56,189,248,0.06) 40%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* ─── Planet Container ─── */}
      <div
        className="absolute"
        style={{
          width: planetSize,
          height: planetSize,
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {/* ─── Axis line — vertical, behind planet, visible only when tilted ─── */}
        {(() => {
          const axisZone = zones.find((z) => z.id === "tilted")!;
          return (
            <button
              onClick={() => handleZoneClick(axisZone)}
              aria-label="Discover Tilted Axis"
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: isMobile ? 20 : 32,
                height: imgSize * 1.15,
                transform: `translate(-50%, -50%) rotate(${rotateValue}deg)`,
                background: "transparent",
                border: "none",
                padding: 0,
                cursor: axisZone.found ? "default" : "pointer",
                zIndex: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: axisOpacity,
                pointerEvents: axisPointerEvents as any,
              }}
            >
              {/* The visible vertical line */}
              <span
                style={{
                  display: "block",
                  width: isMobile ? 2 : 3,
                  height: "100%",
                  background:
                    "linear-gradient(180deg, transparent 0%, rgba(125,211,252,0.6) 10%, rgba(186,230,253,0.9) 50%, rgba(125,211,252,0.6) 90%, transparent 100%)",
                  boxShadow:
                    "0 0 8px rgba(125,211,252,0.8), 0 0 20px rgba(125,211,252,0.3)",
                  borderRadius: 99,
                  pointerEvents: "none",
                }}
              />
            </button>
          );
        })()}

        {/* Uranus planet image — mix-blend-mode:multiply removes white bg */}
        <img
          src="/assets/uranus.png"
          alt="Uranus"
          className="pointer-events-none absolute"
          style={{
            width: planetSize * 2.4,
            height: "auto",
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) rotate(${rotateValue}deg)`,
            mixBlendMode: "multiply",
            zIndex: 1,
            filter: "drop-shadow(0 0 40px rgba(125,211,252,0.35))",
          }}
        />

        {/* Small moons orbiting — click any to discover Moons */}
        {[
          {
            name: "Titania",
            dist: 1.1,
            speed: 18,
            size: isMobile ? 10 : 20,
            delay: 0,
          },
          {
            name: "Oberon",
            dist: 1.3,
            speed: 26,
            size: isMobile ? 4 : 8,
            delay: -4,
          },
          {
            name: "Miranda",
            dist: 1.5,
            speed: 36,
            size: isMobile ? 7 : 13,
            delay: -8,
          },
          {
            name: "Ariel",
            dist: 1.7,
            speed: 22,
            size: isMobile ? 3 : 6,
            delay: -2,
          },
          {
            name: "Umbriel",
            dist: 1.9,
            speed: 30,
            size: isMobile ? 8 : 15,
            delay: -6,
          },
          {
            name: "Puck",
            dist: 2.1,
            speed: 15,
            size: isMobile ? 2 : 4,
            delay: -10,
          },
          {
            name: "Caliban",
            dist: 2.3,
            speed: 42,
            size: isMobile ? 5 : 10,
            delay: -14,
          },
        ].map((m) => {
          const moonZone = zones.find((z) => z.id === "moons")!;
          const elapsed = (Date.now() / 1000 + m.delay) % m.speed;
          const progress = elapsed / m.speed;
          const angle = progress * 2 * Math.PI;

          const x = Math.cos(angle) * imgSize * 0.15 * m.dist;
          const y = Math.sin(angle) * imgSize * 0.03 * m.dist;

          // zIndex snap logic
          let zIndex = 15;
          if (progress > 0.3 && progress < 0.7) {
            zIndex = 0;
          }

          return (
            <button
              key={m.name}
              className="absolute rounded-full focus:outline-none"
              style={{
                width: m.size + 10,
                height: m.size + 10,
                background: "transparent",
                border: "none",
                padding: 0,
                left: "50%",
                top: "50%",
                transform: `translate(${x - (m.size + 10) / 2}px, ${y - (m.size + 10) / 2}px)`,
                zIndex: zIndex,
                cursor: moonZone.found ? "default" : "pointer",
              }}
              onClick={() => handleZoneClick(moonZone)}
              aria-label={`Moon: ${m.name}`}
            >
              <span
                style={{
                  display: "block",
                  width: m.size,
                  height: m.size,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8)",
                  boxShadow: "0 0 6px rgba(148,163,184,0.5)",
                  margin: "auto",
                  pointerEvents: "none",
                }}
              />
            </button>
          );
        })}
      </div>

      {/* ─── Hit overlay — rotates with planet ─── */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: imgSize,
          height: imgSize,
          left: "50%",
          top: "50%",
          transform: `translate(-50%, -50%) rotate(${rotateValue}deg)`,
          zIndex: 20,
        }}
      >
        {/* Blue-Green Color — planet sphere */}
        {(() => {
          const zone = zones.find((z) => z.id === "color")!;
          return (
            <button
              onClick={() => handleZoneClick(zone)}
              aria-label="Discover Blue-Green Color"
              style={{
                position: "absolute",
                left: "51%",
                top: "50%",
                width: imgSize * 0.18,
                height: imgSize * 0.18,
                transform: "translate(-50%, -50%)",
                borderRadius: "50%",
                background: "transparent",
                cursor: zone.found ? "default" : "pointer",
                pointerEvents: "auto",
              }}
            />
          );
        })()}

        {/* Rings — vertical oval ring arc */}
        {(() => {
          const zone = zones.find((z) => z.id === "rings")!;
          return (
            <button
              onClick={() => handleZoneClick(zone)}
              aria-label="Discover Rings"
              style={{
                position: "absolute",
                left: "51%",
                top: "30%",
                width: imgSize * 0.04,
                height: imgSize * 0.4,
                transform: "translateX(-50%)",
                borderRadius: "50%",
                background: "transparent",
                cursor: zone.found ? "default" : "pointer",
                pointerEvents: "auto",
              }}
            />
          );
        })()}
      </div>

      {/* ─── HUD: Info Badges ─── */}
      <div
        className={`pointer-events-none absolute z-40 flex gap-2 ${
          isMobile ? "top-8 left-2" : "top-12 left-4"
        }`}
      >
        {[
          { label: "Ice Giant", color: "text-sky-300" },
          { label: "Day: ~17 hrs", color: "text-cyan-300" },
          { label: "Year: ~84 yrs", color: "text-teal-300" },
        ].map((badge) => (
          <span
            key={badge.label}
            className={`font-['Press_Start_2P'] ${badge.color} ${
              isMobile ? "text-[10px]" : "text-[12px]"
            } rounded border border-cyan-800/50 bg-slate-900/70 px-2 py-1`}
          >
            {badge.label}
          </span>
        ))}
      </div>

      {/* ─── Checklist Panel (desktop) / Hamburger (mobile) ─── */}
      {isMobile && (
        <button
          className="pointer-events-auto absolute top-2 right-2 z-50 flex flex-col items-center justify-center gap-[3px] rounded border border-cyan-700 bg-slate-900/80 p-1.5"
          style={{ width: 32, height: 32 }}
          onClick={() => setIsChecklistOpen((v) => !v)}
          aria-label="Toggle checklist"
        >
          <span className="block h-[2px] w-4 rounded bg-cyan-400" />
          <span className="block h-[2px] w-4 rounded bg-cyan-400" />
          <span className="block h-[2px] w-4 rounded bg-cyan-400" />
          {/* Badge */}
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-500 font-['Press_Start_2P'] text-[12px] text-white">
            {foundCount}
          </span>
        </button>
      )}

      {(!isMobile || isChecklistOpen) && (
        <div
          className={`fade-in pointer-events-auto absolute z-40 font-['Press_Start_2P'] ${
            isMobile ? "top-9 right-2 w-44" : "top-12 right-4 w-72"
          }`}
          style={{ transition: "opacity 0.25s, transform 0.25s" }}
        >
          <div
            className="overflow-hidden rounded-lg border-2 border-cyan-600 bg-slate-950/95"
            style={{
              boxShadow:
                "0 0 20px rgba(34,211,238,0.2), 4px 4px 0 rgba(0,0,0,0.6)",
            }}
          >
            {/* Header */}
            <div className="border-b border-cyan-700 bg-cyan-900/50 px-3 py-2">
              <div
                className={`tracking-widest text-cyan-300 uppercase ${
                  isMobile ? "text-[11px]" : "text-[11px]"
                }`}
              >
                Discovery Checklist
              </div>
              <div
                className={`mt-0.5 text-cyan-500 ${
                  isMobile ? "text-[10px]" : "text-[11px]"
                }`}
              >
                {foundCount}/{zones.length} found
              </div>
              {/* Progress bar */}
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-400"
                  style={{
                    width: `${(foundCount / zones.length) * 100}%`,
                    transition: "width 0.5s ease-out",
                  }}
                />
              </div>
            </div>

            {/* Items */}
            <ul className="space-y-1 p-2">
              {zones.map((z) => (
                <li
                  key={z.id}
                  onClick={() => z.found && setActiveDiscovery(z)}
                  className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
                    z.found
                      ? "cursor-pointer bg-green-900/20 text-green-400 hover:bg-green-900/40"
                      : "cursor-default text-cyan-400/60"
                  } ${isMobile ? "text-[10px]" : "text-[12px]"}`}
                >
                  <span className={isMobile ? "text-[12px]" : "text-xs"}>
                    {z.found ? "✅" : "⬜"}
                  </span>
                  <span className="tracking-wide">{z.label}</span>
                  {z.found && (
                    <span
                      className={`ml-auto opacity-50 ${isMobile ? "text-[11px]" : "text-[11px]"}`}
                    >
                      ▶
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ─── Discovery Modal ─── */}
      {activeDiscovery && !showSummary && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveDiscovery(null)}
          />

          <div
            className={`discovery-modal-enter relative font-['Press_Start_2P'] ${
              isMobile ? "w-[90vw] max-w-xs" : "w-96"
            }`}
          >
            <div
              className="overflow-hidden rounded-lg border-2 border-cyan-500 bg-slate-950"
              style={{
                boxShadow:
                  "0 0 40px rgba(34,211,238,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
              }}
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-cyan-700 bg-cyan-900/50 px-4 py-3">
                <span className={isMobile ? "text-lg" : "text-2xl"}>
                  {activeDiscovery.icon}
                </span>
                <div>
                  <div className="mb-0.5 text-[12px] tracking-widest text-cyan-300 uppercase">
                    ★ Discovery ★
                  </div>
                  <div
                    className={`tracking-wide text-green-400 ${
                      isMobile ? "text-[12px]" : "text-[12px]"
                    }`}
                  >
                    {activeDiscovery.label}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="px-4 py-4">
                <p
                  className={`leading-relaxed text-cyan-200 ${
                    isMobile ? "text-[11px]" : "text-[12px]"
                  }`}
                >
                  {activeDiscovery.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex justify-end border-t border-cyan-800 px-4 py-3">
                <button
                  className={`rounded border-2 border-cyan-500 bg-cyan-700 px-4 py-2 text-white transition-colors hover:bg-cyan-600 active:bg-cyan-800 ${
                    isMobile ? "text-[11px]" : "text-[12px]"
                  } tracking-wider`}
                  onClick={() => setActiveDiscovery(null)}
                >
                  GOT IT!
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Summary / Completion Screen ─── */}
      {showSummary && (
        <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

          <div
            className={`summary-modal-enter relative font-['Press_Start_2P'] ${
              isMobile ? "w-[98vw] max-w-[640px]" : "w-[620px]"
            }`}
          >
            <div
              className="max-h-[92vh] overflow-y-auto rounded-lg border-2 border-green-500 bg-slate-950"
              style={{
                boxShadow:
                  "0 0 60px rgba(74,222,128,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
              }}
            >
              {/* Header */}
              <div className="border-b border-green-700 bg-green-900/40 px-4 py-3 text-center">
                <div
                  className={`tracking-widest text-green-400 uppercase ${
                    isMobile ? "text-[11px]" : "text-xs"
                  }`}
                  style={{ animation: "pulse-scale 2s infinite" }}
                >
                  ★ Planetary Core Reactivated ★
                </div>
              </div>

              {/* Recap */}
              <div className="space-y-3 px-4 py-4">
                {/* Quick facts recap with descriptions */}
                <div className="grid w-full grid-cols-2 gap-2">
                  {zones.map((z) => (
                    <div
                      key={z.id}
                      className={`flex items-start gap-2 rounded border border-green-800/50 bg-slate-900 px-0 py-0`}
                    >
                      <span className="mt-0.5 shrink-0">{z.icon}</span>
                      <div>
                        <span
                          className={`text-green-300 ${
                            isMobile ? "text-[8px]" : "text-[11px]"
                          }`}
                        >
                          {z.label}
                        </span>
                        <p
                          className={`mt-1 leading-relaxed text-green-200/70 ${
                            isMobile ? "text-[7px]" : "text-[9px]"
                          }`}
                        >
                          {z.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-center border-t border-green-800 px-4 py-3">
                <PixelButton
                  label={isMobile ? "Next" : "Proceed to Neptune"}
                  onClick={onComplete}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hint text ─── */}
      {!allFound && !activeDiscovery && (
        <div
          className="pointer-events-none absolute bottom-16 left-1/2 z-30"
          style={{
            transform: "translateX(-50%)",
            animation: "pulse-opacity 3s infinite",
          }}
        >
          <span
            className={`font-['Press_Start_2P'] text-cyan-400/70 ${
              isMobile ? "text-[12px]" : "text-[12px]"
            }`}
          >
            Tap the glowing zones on Uranus to discover its secrets
          </span>
        </div>
      )}

      <style>{`
                @keyframes pulse-opacity {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
            `}</style>
    </div>
  );
};

export default UranusGame;
