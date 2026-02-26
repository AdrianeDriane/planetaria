import { useEffect, useRef } from "react";
import Phaser from "phaser";
import EarthScene from "../../game/scenes/EarthScene";
import PixelButton from "../components/PixelButton";

interface EarthGameProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const EarthGame: React.FC<EarthGameProps> = ({ onComplete, onBack }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 1376,
      height: 768,
      backgroundColor: "#000000",
      pixelArt: false,
      antialias: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [EarthScene],
      input: { 
        keyboard: true,
        touch: true,
        activePointers: 3,
      },
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-gray-950 relative">
      <div ref={containerRef} className="h-full w-full" />
      
      {/* Navigation buttons overlay */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex flex-col sm:flex-row gap-2 sm:gap-4">
        {onBack && (
          <PixelButton 
            label="Back to Venus" 
            onClick={onBack}
            variant="secondary"
          />
        )}
        {onComplete && (
          <PixelButton 
            label="Continue" 
            onClick={onComplete}
            variant="primary"
          />
        )}
      </div>
    </div>
  );
};

export default EarthGame;
