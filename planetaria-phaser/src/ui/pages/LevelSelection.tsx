import React, { useState, useEffect, useCallback } from "react";
import PixelStarfield from "../components/PixelStarfield";
import mercurySprite from "/assets/ui/mercury.png";
import venusSprite from "/assets/ui/venus.png";
import earthSprite from "/assets/ui/earth.png";
import marsSprite from "/assets/ui/mars.png";
import jupiterSprite from "/assets/ui/jupiter.png";
import saturnSprite from "/assets/ui/saturn.png";
import uranusSprite from "/assets/ui/uranus.png";
import neptuneSprite from "/assets/ui/neptune.png";

// ─── Types ───

interface LevelData {
  id: number;
  name: string;
  subtitle: string;
  isBoss: boolean;
  posX: number;
  posY: number;
  colors: {
    body: string;
    accent: string;
    glow: string;
    ring?: string;
  };
  spriteSrc: string | undefined;
  spriteSize: number;
}

interface LevelProgress {
  [levelId: number]: "locked" | "unlocked";
}

// ─── Constants ───

const STORAGE_KEY = "planetaria_progress";

const LEVELS: LevelData[] = [
  {
    id: 1,
    name: "MERCURY",
    subtitle: "THE SCORCHED WORLD",
    isBoss: false,
    posX: 10,
    posY: 70,
    colors: {
      body: "#a8a29e",
      accent: "#78716c",
      glow: "rgba(168, 162, 158, 0.5)",
    },
    spriteSrc: mercurySprite,
    spriteSize: 70,
  },
  {
    id: 2,
    name: "VENUS",
    subtitle: "THE ACID VEIL",
    isBoss: false,
    posX: 22,
    posY: 45,
    colors: {
      body: "#fbbf24",
      accent: "#f59e0b",
      glow: "rgba(251, 191, 36, 0.5)",
    },
    spriteSrc: venusSprite,
    spriteSize: 100,
  },
  {
    id: 3,
    name: "EARTH",
    subtitle: "THE BLUE MARBLE",
    isBoss: false,
    posX: 35,
    posY: 28,
    colors: {
      body: "#4ade80",
      accent: "#22c55e",
      glow: "rgba(74, 222, 128, 0.5)",
    },
    spriteSrc: earthSprite,
    spriteSize: 105,
  },
  {
    id: 4,
    name: "MARS",
    subtitle: "THE RED FRONTIER",
    isBoss: false,
    posX: 40,
    posY: 60,
    colors: {
      body: "#fb923c",
      accent: "#f97316",
      glow: "rgba(251, 146, 60, 0.5)",
    },
    spriteSrc: marsSprite,
    spriteSize: 70,
  },
  {
    id: 5,
    name: "JUPITER",
    subtitle: "THE GAS GIANT",
    isBoss: false,
    posX: 52,
    posY: 35,
    colors: {
      body: "#c084fc",
      accent: "#a855f7",
      glow: "rgba(192, 132, 252, 0.5)",
    },
    spriteSrc: jupiterSprite,
    spriteSize: 250,
  },
  {
    id: 6,
    name: "SATURN",
    subtitle: "THE RINGED WORLD",
    isBoss: false,
    posX: 62,
    posY: 65,
    colors: {
      body: "#fbbf24",
      accent: "#d97706",
      glow: "rgba(251, 191, 36, 0.5)",
      ring: "#fde68a",
    },
    spriteSrc: saturnSprite,
    spriteSize: 220,
  },
  {
    id: 7,
    name: "URANUS",
    subtitle: "THE ICE GIANT",
    isBoss: false,
    posX: 75,
    posY: 40,
    colors: {
      body: "#7dd3fc",
      accent: "#38bdf8",
      glow: "rgba(125, 211, 252, 0.5)",
      ring: "#bae6fd",
    },
    spriteSrc: uranusSprite,
    spriteSize: 130,
  },
  {
    id: 8,
    name: "NEPTUNE",
    subtitle: "THE DEEP BLUE",
    isBoss: false,
    posX: 83,
    posY: 22,
    colors: {
      body: "#6366f1",
      accent: "#4f46e5",
      glow: "rgba(99, 102, 241, 0.5)",
    },
    spriteSrc: neptuneSprite,
    spriteSize: 150,
  },
  {
    id: 9,
    name: "? ? ?",
    subtitle: "UNKNOWN SIGNAL",
    isBoss: true,
    posX: 90,
    posY: 55,
    colors: {
      body: "#ef4444",
      accent: "#dc2626",
      glow: "rgba(239, 68, 68, 0.6)",
      ring: "#f87171",
    },
    spriteSrc: undefined,
    spriteSize: 72,
  },
];

// ─── Pixel Art Lock Icon ───

const PixelLockIcon: React.FC<{ size?: number }> = ({ size = 3 }) => {
  const grid = [
    "..WWWW..",
    ".W....W.",
    ".W....W.",
    "WWWWWWWW",
    "WW.WW.WW",
    "WW.WW.WW",
    "WWWWWWWW",
  ];
  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {grid.map((row, y) => (
        <div key={y} className="flex" style={{ gap: 0 }}>
          {row.split("").map((cell, x) => (
            <div
              key={x}
              style={{
                width: size,
                height: size,
                backgroundColor: cell === "W" ? "#6b7280" : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Pixel Art Back Arrow ───

const PixelBackArrow: React.FC = () => {
  const grid = [
    "...W....",
    "..WW....",
    ".WWW....",
    "WWWWWWWW",
    "WWWWWWWW",
    ".WWW....",
    "..WW....",
    "...W....",
  ];
  return (
    <div className="flex flex-col" style={{ gap: 0 }}>
      {grid.map((row, y) => (
        <div key={y} className="flex" style={{ gap: 0 }}>
          {row.split("").map((cell, x) => (
            <div
              key={x}
              style={{
                width: 3,
                height: 3,
                backgroundColor: cell === "W" ? "#e2e8f0" : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// ─── Sprite Placeholder Component ───

const SpritePlaceholder: React.FC<{
  level: LevelData;
  isUnlocked: boolean;
}> = ({ level, isUnlocked }) => {
  const [spriteLoaded, setSpriteLoaded] = useState(false);
  const [spriteError, setSpriteError] = useState(false);

  const size = level.spriteSize;
  const displayChar = level.isBoss ? "?" : level.name[0];

  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: size,
        height: size,
        imageRendering: "pixelated",
      }}
    >
      {!spriteError && (
        <img
          src={level.spriteSrc}
          alt={level.name}
          className="absolute inset-0 h-full w-full object-contain"
          style={{
            imageRendering: "pixelated",
            opacity: spriteLoaded ? 1 : 0,
            filter: isUnlocked ? "brightness(1.2)" : "brightness(0.2)",
          }}
          onLoad={() => setSpriteLoaded(true)}
          onError={() => setSpriteError(true)}
          draggable={false}
        />
      )}

      {(!spriteLoaded || spriteError) && (
        <div
          className="flex items-center justify-center rounded-full border-2 border-dashed"
          style={{
            width: size,
            height: size,
            backgroundColor: isUnlocked
              ? level.colors.accent + "40"
              : level.colors.accent + "20",
            borderColor: isUnlocked
              ? level.colors.body
              : level.colors.body + "80",
          }}
        >
          <span
            className="font-['Press_Start_2P']"
            style={{
              fontSize: Math.max(size * 0.3, 10),
              color: isUnlocked ? level.colors.body : level.colors.body + "aa",
            }}
          >
            {displayChar}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Planet Node Component ───

interface PlanetNodeProps {
  level: LevelData;
  isUnlocked: boolean;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onLaunch: (id: number) => void;
}

const PlanetNode: React.FC<PlanetNodeProps> = ({
  level,
  isUnlocked,
  isSelected,
  onSelect,
  onLaunch,
}) => {
  // Stagger the float animation per planet so they don't all bob in sync
  const floatDelay = (level.id - 1) * 0.7;
  const floatDuration = 3 + (level.id % 3) * 0.5; // vary between 3s–4s

  return (
    <div
      className="absolute flex flex-col items-center"
      style={{
        left: `${level.posX}%`,
        top: `${level.posY}%`,
        transform: "translate(-50%, -50%)",
        zIndex: isSelected ? 30 : 10,
        animation: `planet-float ${floatDuration}s ease-in-out ${floatDelay}s infinite`,
      }}
    >
      <div
        className={`relative transition-all duration-300 ${
          isUnlocked ? "cursor-pointer" : "cursor-not-allowed"
        } ${isSelected && isUnlocked ? "scale-110" : ""}`}
        style={{
          filter: isUnlocked
            ? isSelected
              ? `drop-shadow(0 0 14px ${level.colors.glow}) drop-shadow(0 0 28px ${level.colors.glow})`
              : `drop-shadow(0 0 6px ${level.colors.glow})`
            : `drop-shadow(0 0 4px ${level.colors.glow})`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (isUnlocked) {
            if (isSelected) {
              onLaunch(level.id);
            } else {
              onSelect(level.id);
            }
          }
        }}
      >
        <SpritePlaceholder level={level} isUnlocked={isUnlocked} />

        {isSelected && isUnlocked && (
          <div
            className="pointer-events-none absolute inset-0 animate-spin rounded-full border-2"
            style={{
              borderColor: level.colors.body,
              borderStyle: "dashed",
              animationDuration: "8s",
              margin: -4,
            }}
          />
        )}

        {!isUnlocked && (
          <div className="absolute inset-0 flex items-center justify-center">
            <PixelLockIcon size={level.isBoss ? 4 : 3} />
          </div>
        )}
      </div>

      <div
        className={`mt-2 flex flex-col items-center transition-opacity duration-200 ${
          isSelected && isUnlocked
            ? "opacity-100"
            : isUnlocked
              ? "opacity-70"
              : "opacity-50"
        }`}
      >
        <p
          className={`text-center font-['Press_Start_2P'] tracking-wider ${
            level.isBoss
              ? "text-[8px] text-red-400 md:text-[10px]"
              : "text-[6px] text-gray-300 md:text-[8px]"
          }`}
          style={{
            textShadow: isUnlocked
              ? `0 0 6px ${level.colors.glow}`
              : `0 0 4px ${level.colors.glow}`,
          }}
        >
          {level.name}
        </p>
      </div>

      <div
        className={`absolute font-['Press_Start_2P'] text-[6px] ${
          isUnlocked ? "text-white/60" : "text-white/30"
        }`}
        style={{
          top: -10,
          right: -6,
        }}
      >
        {level.isBoss ? "★" : level.id}
      </div>
    </div>
  );
};

// ─── Path Connector ───

const PathConnector: React.FC<{
  from: LevelData;
  to: LevelData;
  isUnlocked: boolean;
}> = ({ from, to, isUnlocked }) => {
  const x1 = from.posX;
  const y1 = from.posY;
  const x2 = to.posX;
  const y2 = to.posY;

  const dots: { x: number; y: number }[] = [];
  const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  const dotCount = Math.floor(distance / 2);

  for (let i = 1; i < dotCount; i++) {
    const t = i / dotCount;
    dots.push({
      x: x1 + (x2 - x1) * t,
      y: y1 + (y2 - y1) * t,
    });
  }

  return (
    <>
      {dots.map((dot, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: isUnlocked ? 4 : 3,
            height: isUnlocked ? 4 : 3,
            backgroundColor: isUnlocked
              ? "rgba(192, 200, 220, 0.55)"
              : "rgba(148, 163, 184, 1)",
            boxShadow: isUnlocked
              ? "0 0 4px rgba(192, 200, 220, 0.4)"
              : "0 0 2px rgba(148, 163, 184, 0.15)",
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
    </>
  );
};

// ─── localStorage Helpers ───

function loadProgress(): LevelProgress {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as LevelProgress;
      parsed[1] = "unlocked";
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load progress from localStorage:", e);
  }
  const defaults: LevelProgress = {};
  for (let i = 1; i <= 9; i++) {
    defaults[i] = i === 1 ? "unlocked" : "locked";
  }
  return defaults;
}

function saveProgress(progress: LevelProgress): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    console.warn("Failed to save progress to localStorage:", e);
  }
}

// ─── Level Selection Component ───

interface LevelSelectionProps {
  onLevelSelect: (levelId: number) => void;
  onBack: () => void;
}

const LevelSelection: React.FC<LevelSelectionProps> = ({
  onLevelSelect,
  onBack,
}) => {
  const [progress, setProgress] = useState<LevelProgress>(loadProgress);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const handlePlanetSelect = useCallback((levelId: number) => {
    setSelectedLevel((prev) => (prev === levelId ? null : levelId));
  }, []);

  const handleLaunch = useCallback(
    (levelId: number) => {
      if (progress[levelId] === "unlocked") {
        onLevelSelect(levelId);
      }
    },
    [progress, onLevelSelect]
  );

  const handleBackgroundTap = useCallback(() => {
    setSelectedLevel(null);
  }, []);

  // Dev helpers
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__unlockNext = () => {
      setProgress((prev) => {
        const next = { ...prev };
        for (let i = 1; i <= 9; i++) {
          if (next[i] === "locked") {
            next[i] = "unlocked";
            console.log(`Unlocked level ${i}`);
            break;
          }
        }
        return next;
      });
    };
    (window as unknown as Record<string, unknown>).__resetProgress = () => {
      const defaults: LevelProgress = {};
      for (let i = 1; i <= 9; i++) {
        defaults[i] = i === 1 ? "unlocked" : "locked";
      }
      setProgress(defaults);
      setSelectedLevel(null);
      console.log("Progress reset.");
    };
  }, []);

  const unlockedCount = Object.values(progress).filter(
    (s) => s === "unlocked"
  ).length;

  const selectedData = selectedLevel
    ? LEVELS.find((l) => l.id === selectedLevel)
    : null;
  const isSelectedUnlocked = selectedLevel
    ? progress[selectedLevel] === "unlocked"
    : false;

  return (
    <div
      className={`relative flex h-screen w-full flex-col items-center justify-center overflow-hidden bg-[#050508] transition-opacity duration-700 select-none ${
        fadeIn ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackgroundTap}
    >
      <style>{`
                @keyframes boss-pulse {
                    0%, 100% {
                        filter: drop-shadow(0 0 8px rgba(239, 68, 68, 0.4));
                    }
                    50% {
                        filter: drop-shadow(0 0 20px rgba(239, 68, 68, 0.8))
                               drop-shadow(0 0 40px rgba(239, 68, 68, 0.4));
                    }
                }
                @keyframes planet-float {
                    0%, 100% {
                        transform: translate(-50%, -50%) translateY(0px);
                    }
                    50% {
                        transform: translate(-50%, -50%) translateY(-6px);
                    }
                }
                @keyframes info-slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(16px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-info-slide-up {
                    animation: info-slide-up 0.25s ease-out forwards;
                }
            `}</style>

      <div className="pointer-events-none absolute inset-0">
        <PixelStarfield
          starCount={180}
          pixelScale={3}
          speed={0.5}
          opacity={1}
          direction={225}
        />
      </div>

      <div className="absolute top-4 z-20 flex flex-col items-center md:top-6">
        <h1 className="font-['Press_Start_2P'] text-sm tracking-widest text-indigo-300 md:text-xl">
          PLANET MAP
        </h1>
        <p className="mt-1 font-['Press_Start_2P'] text-[6px] text-gray-500 md:mt-2 md:text-[7px]">
          SELECT A PLANET • {unlockedCount}/9 WORLDS DISCOVERED
        </p>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onBack();
        }}
        className="absolute top-4 left-4 z-20 flex cursor-pointer items-center gap-2 border-2 border-slate-600 bg-slate-900/80 px-3 py-2 font-['Press_Start_2P'] text-[7px] text-slate-400 transition-colors duration-150 hover:border-slate-400 hover:text-white md:top-6 md:left-6 md:gap-3 md:px-4 md:text-[8px]"
      >
        <PixelBackArrow />
        BACK
      </button>

      <div className="relative z-10 h-full w-full">
        {LEVELS.slice(0, -1).map((level, i) => (
          <PathConnector
            key={`path-${level.id}`}
            from={level}
            to={LEVELS[i + 1]}
            isUnlocked={
              progress[level.id] === "unlocked" &&
              progress[LEVELS[i + 1].id] === "unlocked"
            }
          />
        ))}

        {LEVELS.map((level) => (
          <PlanetNode
            key={level.id}
            level={level}
            isUnlocked={progress[level.id] === "unlocked"}
            isSelected={selectedLevel === level.id}
            onSelect={handlePlanetSelect}
            onLaunch={handleLaunch}
          />
        ))}
      </div>

      <div className="absolute bottom-4 z-20 flex flex-col items-center gap-1 md:bottom-6">
        {selectedData && isSelectedUnlocked ? (
          <div className="animate-info-slide-up flex flex-col items-center gap-2">
            <p
              className="font-['Press_Start_2P'] text-[10px] md:text-xs"
              style={{
                color: selectedData.colors.body,
                textShadow: `0 0 8px ${selectedData.colors.glow}`,
              }}
            >
              {selectedData.name}
            </p>
            <p className="font-['Press_Start_2P'] text-[6px] text-gray-400 md:text-[7px]">
              {selectedData.subtitle}
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleLaunch(selectedData.id);
              }}
              className="mt-1 cursor-pointer border-2 px-6 py-2 font-['Press_Start_2P'] text-[8px] tracking-wider transition-all duration-150 active:scale-95 md:text-[9px]"
              style={{
                borderColor: selectedData.colors.body,
                color: selectedData.colors.body,
                backgroundColor: selectedData.colors.accent + "20",
                boxShadow: `0 0 12px ${selectedData.colors.glow}`,
              }}
            >
              ▶ LAUNCH
            </button>
          </div>
        ) : selectedData && !isSelectedUnlocked ? (
          <div className="animate-info-slide-up flex flex-col items-center gap-1">
            <p className="font-['Press_Start_2P'] text-[9px] text-gray-500">
              {selectedData.isBoss ? "? ? ?" : selectedData.name}
            </p>
            <p className="font-['Press_Start_2P'] text-[6px] text-gray-600">
              🔒 COMPLETE PREVIOUS PLANET TO UNLOCK
            </p>
          </div>
        ) : (
          <p className="font-['Press_Start_2P'] text-[6px] text-gray-600 md:text-[7px]">
            TAP A PLANET TO VIEW DETAILS
          </p>
        )}
      </div>

      <div className="absolute bottom-4 left-4">
        <p className="font-['Press_Start_2P'] text-[8px] text-gray-700">
          BUILD v0.1.0
        </p>
      </div>
    </div>
  );
};

export default LevelSelection;
