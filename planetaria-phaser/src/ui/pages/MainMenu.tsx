import React, { useState } from "react";
import PixelStarfield from "../components/PixelStarfield";
import planetariaLogo from "/assets/ui/planetaria_logo.png";

interface MainMenuProps {
  onPlay: () => void;
}

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
        <div
          onClick={(e) => handleHudClick(e, "OPEN_INFO")}
          className="flex h-12 w-12 items-center justify-center border-2 border-blue-400 bg-blue-900 transition-colors duration-100 hover:border-white hover:bg-blue-800"
          title="Game Instructions"
        >
          <span className="font-['Press_Start_2P'] text-xl text-white">i</span>
        </div>

        <div
          onClick={(e) => handleHudClick(e, "TOGGLE_AUDIO")}
          className={`flex h-12 w-12 items-center justify-center border-2 transition-colors duration-100 ${
            isMuted
              ? "border-red-400 bg-red-900 hover:bg-red-800"
              : "border-green-400 bg-green-900 hover:bg-green-800"
          } `}
          title="Toggle Audio"
        >
          <div
            className={`h-4 w-4 ${isMuted ? "bg-red-200" : "bg-green-200"}`}
          />
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
