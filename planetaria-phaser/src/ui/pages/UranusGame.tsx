import React, { useState, useEffect, useCallback, useRef } from "react";
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
        CHECKLIST_ITEMS.map((z) => ({ ...z, found: false })),
    );
    const [activeDiscovery, setActiveDiscovery] = useState<DiscoveryZone | null>(null);
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
            const val = 7.5 + 7.5 * Math.sin((2 * Math.PI * elapsed) / period - Math.PI / 2);
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
            setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, found: true } : z)));
            setActiveDiscovery({ ...zone, found: true });
        },
        [showSummary],
    );

    return (
        <div className="w-screen h-dvh relative overflow-hidden select-none z-50" style={{ touchAction: "none" }}>
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
            <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.68)", pointerEvents: "none" }} />

            {/* ─── Wind Gust — sweeps across screen, click to discover Cold Temperature ─── */}
            {gustActive && (() => {
                const coldZone = zones.find((z) => z.id === "cold")!;
                // 6 streaks at different vertical positions, widths, speeds
                const streaks = [
                    { top: "18%", width: "55%", duration: "1.1s", delay: "0s",    height: isMobile ? 2 : 3,  opacity: 0.85 },
                    { top: "28%", width: "40%", duration: "0.9s", delay: "0.15s", height: isMobile ? 1 : 2,  opacity: 0.6  },
                    { top: "38%", width: "65%", duration: "1.3s", delay: "0.05s", height: isMobile ? 2 : 4,  opacity: 0.9  },
                    { top: "50%", width: "35%", duration: "1.0s", delay: "0.25s", height: isMobile ? 1 : 2,  opacity: 0.5  },
                    { top: "62%", width: "50%", duration: "1.2s", delay: "0.1s",  height: isMobile ? 2 : 3,  opacity: 0.75 },
                    { top: "74%", width: "45%", duration: "0.95s",delay: "0.2s",  height: isMobile ? 1 : 2,  opacity: 0.55 },
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
                                        "linear-gradient(90deg, transparent 0%, rgba(186,230,253," + s.opacity + ") 30%, rgba(224,242,254," + s.opacity + ") 60%, transparent 100%)",
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
                            background: "radial-gradient(circle at 40% 40%, #fff9c4, #fde68a 40%, #f59e0b 70%, #b45309 100%)",
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
                className="absolute pointer-events-none"
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
                                    boxShadow: "0 0 8px rgba(125,211,252,0.8), 0 0 20px rgba(125,211,252,0.3)",
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
                    className="absolute pointer-events-none"
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
                    { name: "Titania",  dist: 1.10, speed: 18, size: isMobile ? 10 : 20, delay: 0  },
                    { name: "Oberon",   dist: 1.30, speed: 26, size: isMobile ? 4  : 8,  delay: -4  },
                    { name: "Miranda",  dist: 1.50, speed: 36, size: isMobile ? 7  : 13, delay: -8  },
                    { name: "Ariel",    dist: 1.70, speed: 22, size: isMobile ? 3  : 6,  delay: -2  },
                    { name: "Umbriel",  dist: 1.90, speed: 30, size: isMobile ? 8  : 15, delay: -6  },
                    { name: "Puck",     dist: 2.10, speed: 15, size: isMobile ? 2  : 4,  delay: -10 },
                    { name: "Caliban",  dist: 2.30, speed: 42, size: isMobile ? 5  : 10,  delay: -14 },
                ].map((m) => {
                    const moonZone = zones.find((z) => z.id === "moons")!;
                    const elapsed = (Date.now() / 1000 + m.delay) % m.speed;
                    const progress = elapsed / m.speed;
                    const angle = progress * 2 * Math.PI;
                    
                    const x = Math.cos(angle) * imgSize * 0.15 * m.dist;
                    const y = Math.sin(angle) * imgSize * 0.03 * m.dist;
                    
                    // zIndex snap logic
                    let zIndex = 15;
                    if (progress > 0.30 && progress < 0.70) {
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
                                    background: "radial-gradient(circle at 35% 35%, #e2e8f0, #94a3b8)",
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
                className="absolute pointer-events-none"
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
                                height: imgSize * 0.40,
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
                className={`absolute z-40 pointer-events-none flex gap-2 ${
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
                            isMobile ? "text-[4px]" : "text-[8px]"
                        } bg-slate-900/70 border border-cyan-800/50 rounded px-2 py-1`}
                    >
                        {badge.label}
                    </span>
                ))}
            </div>

            {/* ─── Checklist Panel (desktop) / Hamburger (mobile) ─── */}
            {isMobile && (
                <button
                    className="absolute top-2 right-2 z-50 pointer-events-auto bg-slate-900/80 border border-cyan-700 rounded p-1.5 flex flex-col gap-[3px] items-center justify-center"
                    style={{ width: 32, height: 32 }}
                    onClick={() => setIsChecklistOpen((v) => !v)}
                    aria-label="Toggle checklist"
                >
                    <span className="block w-4 h-[2px] bg-cyan-400 rounded" />
                    <span className="block w-4 h-[2px] bg-cyan-400 rounded" />
                    <span className="block w-4 h-[2px] bg-cyan-400 rounded" />
                    {/* Badge */}
                    <span
                        className="absolute -top-1 -right-1 bg-cyan-500 text-[6px] text-white font-['Press_Start_2P'] rounded-full w-4 h-4 flex items-center justify-center"
                    >
                        {foundCount}
                    </span>
                </button>
            )}

            {(!isMobile || isChecklistOpen) && (
                <div
                    className={`absolute z-40 pointer-events-auto font-['Press_Start_2P'] fade-in ${
                        isMobile
                            ? "top-9 right-2 w-44"
                            : "top-12 right-4 w-72"
                    }`}
                    style={{ transition: "opacity 0.25s, transform 0.25s" }}
                >
                    <div
                        className="bg-slate-950/95 border-2 border-cyan-600 rounded-lg overflow-hidden"
                        style={{
                            boxShadow:
                                "0 0 20px rgba(34,211,238,0.2), 4px 4px 0 rgba(0,0,0,0.6)",
                        }}
                    >
                        {/* Header */}
                        <div className="bg-cyan-900/50 px-3 py-2 border-b border-cyan-700">
                            <div
                                className={`text-cyan-300 tracking-widest uppercase ${
                                    isMobile ? "text-[5px]" : "text-[9px]"
                                }`}
                            >
                                Discovery Checklist
                            </div>
                            <div
                                className={`text-cyan-500 mt-0.5 ${
                                    isMobile ? "text-[4px]" : "text-[7px]"
                                }`}
                            >
                                {foundCount}/{zones.length} found
                            </div>
                            {/* Progress bar */}
                            <div className="mt-1.5 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-green-400 rounded-full"
                                    style={{ 
                                        width: `${(foundCount / zones.length) * 100}%`,
                                        transition: "width 0.5s ease-out"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Items */}
                        <ul className="p-2 space-y-1">
                            {zones.map((z) => (
                                <li
                                    key={z.id}
                                    onClick={() => z.found && setActiveDiscovery(z)}
                                    className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
                                        z.found
                                            ? "bg-green-900/20 text-green-400 cursor-pointer hover:bg-green-900/40"
                                            : "text-cyan-400/60 cursor-default"
                                    } ${isMobile ? "text-[4px]" : "text-[8px]"}`}
                                >
                                    <span className={isMobile ? "text-[6px]" : "text-xs"}>
                                        {z.found ? "✅" : "⬜"}
                                    </span>
                                    <span className="tracking-wide">{z.label}</span>
                                    {z.found && (
                                        <span className={`ml-auto opacity-50 ${isMobile ? "text-[5px]" : "text-[7px]"}`}>▶</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* ─── Discovery Modal ─── */}
            {activeDiscovery && !showSummary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setActiveDiscovery(null)}
                    />

                    <div
                        className={`relative font-['Press_Start_2P'] discovery-modal-enter ${
                            isMobile ? "w-[90vw] max-w-xs" : "w-96"
                        }`}
                    >
                        <div
                            className="bg-slate-950 border-2 border-cyan-500 rounded-lg overflow-hidden"
                            style={{
                                boxShadow:
                                    "0 0 40px rgba(34,211,238,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
                            }}
                        >
                            {/* Header */}
                            <div className="bg-cyan-900/50 px-4 py-3 border-b border-cyan-700 flex items-center gap-3">
                                <span className={isMobile ? "text-lg" : "text-2xl"}>
                                    {activeDiscovery.icon}
                                </span>
                                <div>
                                    <div className="text-cyan-300 text-[8px] tracking-widest uppercase mb-0.5">
                                        ★ Discovery ★
                                    </div>
                                    <div
                                        className={`text-green-400 tracking-wide ${
                                            isMobile ? "text-[6px]" : "text-[10px]"
                                        }`}
                                    >
                                        {activeDiscovery.label}
                                    </div>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="px-4 py-4">
                                <p
                                    className={`text-cyan-200 leading-relaxed ${
                                        isMobile ? "text-[5px]" : "text-[8px]"
                                    }`}
                                >
                                    {activeDiscovery.description}
                                </p>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-cyan-800 flex justify-end">
                                <button
                                    className={`bg-cyan-700 hover:bg-cyan-600 active:bg-cyan-800 text-white px-4 py-2 rounded border-2 border-cyan-500 transition-colors ${
                                        isMobile ? "text-[5px]" : "text-[8px]"
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
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 fade-in">
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

                    <div
                        className={`relative font-['Press_Start_2P'] summary-modal-enter ${
                            isMobile ? "w-[92vw] max-w-sm" : "w-[460px]"
                        }`}
                    >
                        <div
                            className="bg-slate-950 border-2 border-green-500 rounded-lg overflow-hidden"
                            style={{
                                boxShadow:
                                    "0 0 60px rgba(74,222,128,0.3), 4px 4px 0 rgba(0,0,0,0.7)",
                            }}
                        >
                            {/* Header */}
                            <div className="bg-green-900/40 px-4 py-3 border-b border-green-700 text-center">
                                <div
                                    className={`text-green-400 tracking-widest uppercase ${
                                        isMobile ? "text-[7px]" : "text-xs"
                                    }`}
                                    style={{ animation: "pulse-scale 2s infinite" }}
                                >
                                    ★ Planetary Core Reactivated ★
                                </div>
                            </div>

                            {/* Recap */}
                            <div className="px-4 py-4 space-y-3">
                                <p
                                    className={`text-cyan-200 leading-relaxed ${
                                        isMobile ? "text-[5px]" : "text-[8px]"
                                    }`}
                                >
                                    You&apos;ve stabilized Uranus&apos;s extreme tilt and restored its Planetary Core!
                                    The Sideways Planet can once again roll serenely on its axis.
                                </p>

                                {/* Quick facts recap */}
                                <div className="grid grid-cols-2 gap-2">
                                    {zones.map((z) => (
                                        <div
                                            key={z.id}
                                            className={`bg-slate-900 border border-green-800/50 rounded px-2 py-1.5 flex items-center gap-2 ${
                                                isMobile ? "text-[4px]" : "text-[7px]"
                                            } text-green-300`}
                                        >
                                            <span>{z.icon}</span>
                                            <span>{z.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* CTA */}
                            <div className="px-4 py-3 border-t border-green-800 flex justify-center">
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
                    className="absolute bottom-16 left-1/2 z-30 pointer-events-none"
                    style={{ transform: "translateX(-50%)", animation: "pulse-opacity 3s infinite" }}
                >
                    <span
                        className={`font-['Press_Start_2P'] text-cyan-400/70 ${
                            isMobile ? "text-[5px]" : "text-[8px]"
                        }`}
                    >
                        Tap the glowing zones on Uranus to discover its secrets
                    </span>
                </div>
            )}

            {/* ─── Bottom Nav ─── */}
            <div
                className={`absolute ${
                    isMobile ? "bottom-1" : "bottom-4"
                } left-1/2 z-40 flex flex-row gap-2 pointer-events-auto`}
                style={{ transform: "translateX(-50%)" }}
            >
                <PixelButton label="Back" onClick={onBack} variant="secondary" />
                <PixelButton
                    label={isMobile ? "Next" : "Proceed to Neptune"}
                    onClick={onComplete}
                />
            </div>
            
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
