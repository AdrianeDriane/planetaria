import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";
import EarthScene from "../../game/scenes/EarthScene";
import EarthIntroScene from "../../game/scenes/earth/EarthIntroScene";
import EarthCongratulationScene from "../../game/scenes/earth/EarthCongratulationScene";
import MarsIntroScene from "../../game/scenes/mars/MarsIntroScene";
import MarsScene from "../../game/scenes/MarsScene";
import { DISPLAY, PHYSICS } from "../../game/config";
import IntroScene from "../../game/scenes/IntroScene";
import PixelButton from "../components/PixelButton";
import VirtualControls from "../components/VirtualControls";
import VenusIntroScene from "../../game/scenes/venus/VenusIntroScene";
import JupiterIntroScene from "../../game/scenes/JupiterIntroScene";
import UranusIntroScene from "../../game/scenes/uranus/UranusIntroScene";
import NeptuneIntroScene from "../../game/scenes/neptune/NeptuneIntroScene";
import { EventBus } from "../../game/EventBus";

interface PhaserGameProps {
  initialLevelId?: number;
  onNavigateToVenus?: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ 
  initialLevelId = 1,
  onNavigateToVenus 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Mapping level ID to starting scene key
  const getStartingScene = (id: number): string => {
    switch (id) {
      case 1: return "IntroScene";
      case 2: return "VenusIntroScene";
      case 3: return "EarthIntroScene";
      case 4: return "MarsIntroScene";
      case 7: return "UranusIntroScene";
      case 8: return "NeptuneIntroScene";
      default: return "EarthIntroScene";
    }
  };

  // Simulate keyboard events for mobile controls
  const simulateKey = (keyCode: number, isDown: boolean) => {
    if (!gameRef.current) return;

    const event = new KeyboardEvent(isDown ? "keydown" : "keyup", {
      keyCode,
      which: keyCode,
      bubbles: true,
    });

    window.dispatchEvent(event);
  };

  const handleLeftDown = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.A, true);
  const handleLeftUp = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.A, false);
  const handleRightDown = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.D, true);
  const handleRightUp = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.D, false);
  const handleJumpDown = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.W, true);
  const handleJumpUp = () =>
    simulateKey(Phaser.Input.Keyboard.KeyCodes.W, false);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Define all available scenes
    const allScenes = [
      VenusIntroScene,
      EarthIntroScene,
      EarthScene,
      EarthCongratulationScene,
      MarsIntroScene,
      MarsScene,
      GameScene,
      IntroScene,
      JupiterIntroScene,
      UranusIntroScene,
      NeptuneIntroScene,
    ];

    // Phaser starts the FIRST scene in the array. 
    // We reorder to put the requested scene at index 0.
    const startSceneKey = getStartingScene(initialLevelId);
    
    // Create a mapping of keys to constructors
    const sceneMap: Record<string, any> = {
        "VenusIntroScene": VenusIntroScene,
        "EarthIntroScene": EarthIntroScene,
        "EarthScene": EarthScene,
        "EarthCongratulationScene": EarthCongratulationScene,
        "MarsIntroScene": MarsIntroScene,
        "MarsScene": MarsScene,
        "GameScene": GameScene,
        "IntroScene": IntroScene,
        "JupiterIntroScene": JupiterIntroScene,
        "UranusIntroScene": UranusIntroScene,
        "NeptuneIntroScene": NeptuneIntroScene
    };

    const finalScenes = [...allScenes];
    const StartSceneClass = sceneMap[startSceneKey];
    
    if (StartSceneClass) {
        const index = finalScenes.indexOf(StartSceneClass);
        if (index !== -1) {
            finalScenes.splice(index, 1);
            finalScenes.unshift(StartSceneClass);
        }
    }

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
      scene: finalScenes,
      input: {
        keyboard: true,
        touch: true,
        activePointers: 3,
      },
    };

    gameRef.current = new Phaser.Game(config);

    const handleSceneChange = (sceneKey: string) => {
        if (gameRef.current) {
            gameRef.current.scene.scenes.forEach(s => {
                if (gameRef.current?.scene.isActive(s.scene.key)) {
                    gameRef.current?.scene.stop(s.scene.key);
                }
            });
            gameRef.current.scene.start(sceneKey);
        }
    };

    EventBus.on("change-phaser-scene", handleSceneChange);

    // Listen for GameScene to start, then show virtual controls
    gameRef.current.events.on("step", () => {
      if (gameRef.current?.scene.isActive("GameScene") && !isGameActive) {
        setIsGameActive(true);
      }
    });

    return () => {
      EventBus.off("change-phaser-scene", handleSceneChange);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative h-screen w-screen bg-gray-950">
      <div ref={containerRef} className="h-full w-full" />

      {/* Virtual Controls for Mobile - only shown after intro */}
      {isGameActive && (
        <VirtualControls
          onLeftDown={handleLeftDown}
          onLeftUp={handleLeftUp}
          onRightDown={handleRightDown}
          onRightUp={handleRightUp}
          onJumpDown={handleJumpDown}
          onJumpUp={handleJumpUp}
        />
      )}

      {/* Navigation button overlay */}
      {onNavigateToVenus && (
        <div className="pointer-events-auto absolute top-4 right-4 z-50 sm:top-6 sm:right-6">
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
