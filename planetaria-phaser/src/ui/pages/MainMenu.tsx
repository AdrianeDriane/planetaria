import React, { useEffect, useState } from "react";
import PixelStarfield from "../components/PixelStarfield";
import spaceOdysseyLogo from "/assets/ui/space_odyssey_logo.png";

interface MainMenuProps {
  onPlay: () => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const INFO_DESCRIPTION =
  "This website serves as the official platform for Space Odyssey, an innovative digital intervention designed to elevate student engagement and mastery of astronomical concepts through the principles of experiential learning. The platform hosts a narrative-driven mission where learners command the S.S. ASTRA, navigating a series of immersive challenges that transform complex planetary data into interactive, hands-on discoveries. By integrating diverse gameplay mechanics, including puzzle-solving, resource management, and critical-thinking exercises, the intervention encourages students to actively explore the solar system rather than passively consume information. Each stage of the journey is meticulously structured to build academic confidence, requiring learners to unlock vital scientific facts to progress through the cosmos. The experience concludes with a comprehensive knowledge-based challenge, ensuring that all educational objectives are met through a compelling and rewarding final trial.";

const RESEARCH_MEMBERS = [
  "Mary Roxanne Abalo",
  "Shem Roah Serafin",
  "Althea Joy I. Silabay",
  "Shaira Suico",
  "Christyl Pines Temperatura",
  "Val Angelo Tingcang",
];

const DEVELOPERS = [
  "Roginand Villegas",
  "Ralph Adriane Dilao",
  "John Carl Atillo",
];

// Pixel art icon components

const PixelInfoIcon: React.FC = () => {
  const grid = [
    "..WBW..",
    "..WBW..",
    ".......",
    ".WWBW..",
    "..WBW..",
    "..WBW..",
    ".WWBWW.",
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
                backgroundColor:
                  cell === "W"
                    ? "#c8d8ff"
                    : cell === "B"
                      ? "#ffffff"
                      : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const PixelSpeakerOnIcon: React.FC = () => {
  const grid = [
    "...LG....",
    "..LGG.W..",
    "LLGGG..W.",
    "LGGGG.W.W",
    "LLGGG..W.",
    "..LGG.W..",
    "...LG....",
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
                backgroundColor:
                  cell === "G"
                    ? "#4ade80"
                    : cell === "L"
                      ? "#86efac"
                      : cell === "W"
                        ? "#22c55e"
                        : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const PixelSpeakerMutedIcon: React.FC = () => {
  const grid = [
    "...LR....",
    "..LRR.X.X",
    "LLRRR..X.",
    "LRRRR.X..",
    "LLRRR..X.",
    "..LRR.X.X",
    "...LR....",
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
                backgroundColor:
                  cell === "R"
                    ? "#f87171"
                    : cell === "L"
                      ? "#fca5a5"
                      : cell === "X"
                        ? "#ef4444"
                        : "transparent",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  isMuted: isMutedProp = false,
  onToggleMute,
}) => {
  const [isMutedLocal, setIsMutedLocal] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isMuted = onToggleMute ? isMutedProp : isMutedLocal;

  useEffect(() => {
    if (!isInfoOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsInfoOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isInfoOpen]);

  const handleHudClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();

    if (action === "TOGGLE_AUDIO") {
      if (onToggleMute) {
        onToggleMute();
      } else {
        setIsMutedLocal(!isMutedLocal);
      }
      return;
    }

    if (action === "OPEN_INFO") {
      setIsInfoOpen(true);
    }
  };

  return (
    <div
      onClick={() => {
        if (!isInfoOpen) {
          onPlay();
        }
      }}
      className="relative flex h-screen w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#050505] select-none"
    >
      <style>{`
                @keyframes logo-breathe {
                    0%, 100% {
                        transform: scale(1);
                        filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.4));
                    }
                    50% {
                        transform: scale(1.08);
                        filter: drop-shadow(0 0 20px rgba(99, 102, 241, 0.7));
                    }
                }
                .animate-logo-breathe {
                    animation: logo-breathe 3s ease-in-out infinite;
                }
                @keyframes modal-flicker-in {
                    from {
                        opacity: 0;
                        transform: translateY(16px) scale(0.96);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-modal-flicker-in {
                    animation: modal-flicker-in 0.24s steps(6) forwards;
                }
                .pixel-text-tall {
                    transform: scaleY(1.09);
                    transform-origin: top center;
                }
            `}</style>

      <div className="pointer-events-none absolute inset-0">
        <PixelStarfield
          starCount={200}
          pixelScale={3}
          speed={1}
          opacity={1}
          direction={225}
        />
      </div>

      <div className="z-10 flex flex-col items-center">
        <div className="flex items-center justify-center px-4">
          <img
            src={spaceOdysseyLogo}
            alt="Planetaria"
            className="animate-logo-breathe -mt-16 h-auto w-80 max-w-[80vw] gap-10 md:w-120"
            style={{
              imageRendering: "pixelated",
            }}
            draggable={false}
          />
        </div>

        <div className="flex flex-col items-center gap-2 px-4">
          <p className="animate-pulse text-center font-['Press_Start_2P'] text-xs tracking-widest text-yellow-400 sm:text-sm">
            CLICK ANYWHERE TO START
          </p>
        </div>
      </div>

      <div className="absolute right-4 bottom-4 z-20 flex gap-2 sm:right-8 sm:bottom-8 sm:gap-4">
        <div
          onClick={(e) => handleHudClick(e, "OPEN_INFO")}
          className="flex h-12 w-12 items-center justify-center border-2 border-blue-400 bg-blue-950 transition-colors duration-100 hover:border-white hover:bg-blue-900 active:bg-blue-800 sm:h-14 sm:w-14 md:h-16 md:w-16"
          title="Game Information"
          style={{ imageRendering: "pixelated" }}
        >
          <PixelInfoIcon />
        </div>

        <div
          onClick={(e) => handleHudClick(e, "TOGGLE_AUDIO")}
          className={`flex h-12 w-12 items-center justify-center border-2 transition-colors duration-100 sm:h-14 sm:w-14 md:h-16 md:w-16 ${
            isMuted
              ? "border-red-400 bg-red-950 hover:bg-red-900 active:bg-red-800"
              : "border-green-400 bg-green-950 hover:bg-green-900 active:bg-green-800"
          }`}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          style={{ imageRendering: "pixelated" }}
        >
          {isMuted ? <PixelSpeakerMutedIcon /> : <PixelSpeakerOnIcon />}
        </div>
      </div>

      {isInfoOpen && (
        <div
          onClick={() => setIsInfoOpen(false)}
          className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 px-3 py-4 sm:px-6 sm:py-8"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="animate-modal-flicker-in flex max-h-[88vh] w-full max-w-[720px] flex-col overflow-hidden border-4 border-[#89d7ff] bg-[#091321] shadow-[0_0_0_4px_#1e3d63,0_0_0_8px_#020617]"
            style={{ imageRendering: "pixelated" }}
          >
            <div className="flex items-start justify-between gap-3 border-b-4 border-[#27476c] bg-[#0f233a] px-4 py-3 sm:px-5">
              <div className="min-w-0">
                <p className="pixel-text-tall font-['Press_Start_2P'] text-[8px] leading-[1.9] tracking-[0.24em] text-cyan-200 sm:text-[10px]">
                  SPACE ODYSSEY
                </p>
                <h2 className="pixel-text-tall mt-2 font-['Press_Start_2P'] text-[11px] leading-[1.9] text-yellow-300 sm:text-[14px]">
                  ABOUT THE MISSION
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsInfoOpen(false)}
                className="shrink-0 border-2 border-red-300 bg-[#4b1823] px-3 py-2 font-['Press_Start_2P'] text-[9px] leading-none text-red-100 transition-colors duration-100 hover:bg-[#672433]"
              >
                CLOSE
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4 sm:px-5 sm:py-5">
              <section className="border-2 border-[#27476c] bg-[#0d1a2d] p-3 sm:p-4">
                <h3 className="pixel-text-tall font-['Press_Start_2P'] text-[10px] leading-[1.9] text-cyan-200 sm:text-[11px]">
                  About Space Odyssey
                </h3>
                <p className="pixel-text-tall mt-4 mb-8 font-['Press_Start_2P'] text-[9px] leading-[2.15] text-slate-100 sm:text-[10px]">
                  {INFO_DESCRIPTION}
                </p>
              </section>

              <section className="mt-4 border-2 border-[#62511b] bg-[#18130a] p-3 sm:p-4">
                <h3 className="pixel-text-tall font-['Press_Start_2P'] text-[10px] leading-[1.9] text-yellow-300 sm:text-[11px]">
                  Research and Development Team
                </h3>

                <div className="pixel-text-tall mt-4 space-y-3 font-['Press_Start_2P'] text-[9px] leading-[2.05] text-slate-100 sm:text-[10px]">
                  <p>
                    <span className="text-cyan-200">Lead Researcher:</span>{" "}
                    Justin Marc F. Sanchez
                  </p>
                  <p>
                    <span className="text-cyan-200">Assistant Leader:</span>{" "}
                    Elizabeth Nicole C. Villarta
                  </p>
                </div>

                <div className="mt-5">
                  <h4 className="pixel-text-tall font-['Press_Start_2P'] text-[9px] leading-[1.85] text-orange-200 sm:text-[10px]">
                    Research Members
                  </h4>
                  <ul className="pixel-text-tall mt-3 space-y-2 font-['Press_Start_2P'] text-[9px] leading-[2] text-slate-100 sm:text-[10px]">
                    {RESEARCH_MEMBERS.map((member) => (
                      <li key={member}>- {member}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-5">
                  <h4 className="pixel-text-tall font-['Press_Start_2P'] text-[9px] leading-[1.85] text-orange-200 sm:text-[10px]">
                    Developed By
                  </h4>
                  <ul className="pixel-text-tall mt-3 space-y-2 font-['Press_Start_2P'] text-[9px] leading-[2] text-slate-100 sm:text-[10px]">
                    {DEVELOPERS.map((developer) => (
                      <li key={developer}>- {developer}</li>
                    ))}
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-4">
        <p className="font-['Press_Start_2P'] text-[12px] text-gray-700">
          BUILD v0.1.0
        </p>
      </div>
    </div>
  );
};

export default MainMenu;
