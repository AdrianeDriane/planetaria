import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";
import { DISPLAY, PHYSICS } from "../../game/config";
import IntroScene from "../../game/scenes/IntroScene";
import PixelButton from "../components/PixelButton";
import VirtualControls from "../components/VirtualControls";

interface PhaserGameProps {
  onNavigateToVenus?: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onNavigateToVenus }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Simulate keyboard events for mobile controls
  const simulateKey = (keyCode: number, isDown: boolean) => {
    if (!gameRef.current) return;
    
    const event = new KeyboardEvent(isDown ? 'keydown' : 'keyup', {
      keyCode,
      which: keyCode,
      bubbles: true,
    });
    
    window.dispatchEvent(event);
  };

  const handleLeftDown = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.A, true);
  const handleLeftUp = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.A, false);
  const handleRightDown = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.D, true);
  const handleRightUp = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.D, false);
  const handleJumpDown = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.W, true);
  const handleJumpUp = () => simulateKey(Phaser.Input.Keyboard.KeyCodes.W, false);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: DISPLAY.WIDTH,
      height: DISPLAY.HEIGHT,
      backgroundColor: DISPLAY.BG_COLOR,
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { x: 0, y: PHYSICS.GRAVITY },
          debug: PHYSICS.DEBUG,
        },
      },
      scene: [IntroScene, GameScene],
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
      
      {/* Virtual Controls for Mobile */}
      <VirtualControls
        onLeftDown={handleLeftDown}
        onLeftUp={handleLeftUp}
        onRightDown={handleRightDown}
        onRightUp={handleRightUp}
        onJumpDown={handleJumpDown}
        onJumpUp={handleJumpUp}
      />
      
      {/* Navigation button overlay */}
      {onNavigateToVenus && (
        <div className="absolute top-4 right-4 sm:top-6 sm:right-6 pointer-events-auto z-50">
          <PixelButton 
            label="Go to Venus" 
            onClick={onNavigateToVenus}
            variant="primary"
          />
        </div>
      )}
    </div>
  );
};

export default PhaserGame;
