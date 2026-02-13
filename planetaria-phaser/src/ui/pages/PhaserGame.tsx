import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";
import { DISPLAY, PHYSICS } from "../../game/config";

const PhaserGame: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

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
      scene: [GameScene],
      input: { keyboard: true },
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
    <div className="h-screen w-screen bg-gray-950">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default PhaserGame;
