import React, { useState } from "react";
import PixelStarfield from "../components/PixelStarfield";
import planetariaLogo from "/assets/ui/planetaria_logo.png";

interface MainMenuProps {
  onPlay: () => void;
}

// ─── Pixel Art Icon Components ───
// These render crisp pixel-art icons using small div grids

const PixelInfoIcon: React.FC = () => {
  // 7x7 pixel grid for a retro "i" info symbol
  // . = transparent, W = white, B = bright blue accent
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
  // 9x7 pixel grid: speaker cone + sound waves
  // G = green body, L = light green highlight, W = wave (green)
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
  // 9x7 pixel grid: speaker cone + X for muted
  // R = red body, L = light red, X = red X mark
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

const MainMenu: React.FC<MainMenuProps> = ({ onPlay }) => {
  const [isMuted, setIsMuted] = useState(false);

  const handleHudClick = (e: React.MouseEvent, action: string) => {
    e.stopPropagation();
    console.log(`HUD Action: ${action}`);
    if (action === "TOGGLE_AUDIO") setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={onPlay}
      className="relative flex h-screen w-full cursor-pointer flex-col items-center justify-center overflow-hidden bg-[#050505] select-none"
    >
      {/* Keyframe animation for the pulsing logo */}
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
            `}</style>

      {/* BACKGROUND LAYER: Pixel Starfield */}
      <div className="pointer-events-none absolute inset-0">
        <PixelStarfield
          starCount={200}
          pixelScale={3}
          speed={1}
          opacity={1}
          direction={225}
        />
      </div>

      {/* CENTRAL CONTENT */}
      <div className="z-10 flex flex-col items-center">
        {/* PLANETARIA LOGO */}
        <div className="flex items-center justify-center">
          <img
            src={planetariaLogo}
            alt="Planetaria"
            className="animate-logo-breathe -mt-16 h-auto w-125 max-w-[80vw] gap-10"
            style={{
              imageRendering: "pixelated",
            }}
            draggable={false}
          />
        </div>

        {/* START PROMPT */}
        <div className="flex flex-col items-center gap-2">
          <p className="animate-pulse font-['Press_Start_2P'] text-sm tracking-widest text-yellow-400">
            CLICK ANYWHERE TO START
          </p>
        </div>
      </div>

      {/* HUD CONTAINER - Bottom Right */}
      <div className="absolute right-8 bottom-8 z-20 flex gap-4">
        {/* INFO BUTTON — Pixel Art */}
        <div
          onClick={(e) => handleHudClick(e, "OPEN_INFO")}
          className="flex h-12 w-12 items-center justify-center border-2 border-blue-400 bg-blue-950 transition-colors duration-100 hover:border-white hover:bg-blue-900"
          title="Game Instructions"
          style={{ imageRendering: "pixelated" }}
        >
          <PixelInfoIcon />
        </div>

        {/* AUDIO TOGGLE — Pixel Art Speaker */}
        <div
          onClick={(e) => handleHudClick(e, "TOGGLE_AUDIO")}
          className={`flex h-12 w-12 items-center justify-center border-2 transition-colors duration-100 ${
            isMuted
              ? "border-red-400 bg-red-950 hover:bg-red-900"
              : "border-green-400 bg-green-950 hover:bg-green-900"
          }`}
          title={isMuted ? "Unmute Audio" : "Mute Audio"}
          style={{ imageRendering: "pixelated" }}
        >
          {isMuted ? <PixelSpeakerMutedIcon /> : <PixelSpeakerOnIcon />}
        </div>
      </div>

      {/* VERSION TAG - Bottom Left */}
      <div className="absolute bottom-4 left-4">
        <p className="font-['Press_Start_2P'] text-[8px] text-gray-700">
          BUILD v0.1.0
        </p>
      </div>
    </div>
  );
};

export default MainMenu;
