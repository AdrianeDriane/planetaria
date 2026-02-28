import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import GameScene from "../../game/scenes/GameScene";
import EarthScene from "../../game/scenes/EarthScene";
import MarsScene from "../../game/scenes/MarsScene";
import FinalBossScene from "../../game/scenes/FinalBossScene";
import { DISPLAY, PHYSICS } from "../../game/config";
import VirtualControls from "../components/VirtualControls";
import { EventBus } from "../../game/EventBus";
import FinalOutroScene from "../../game/scenes/FinalOutroScene";

interface PhaserGameProps {
  initialLevelId?: number;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ initialLevelId = 1 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const [isGameActive, setIsGameActive] = useState(false);

  // Mapping level ID to starting scene key
  const getStartingScene = (id: number): string => {
    switch (id) {
      case 1:
        return "GameScene";
      case 2:
        return "GameScene"; // Venus is React-only
      case 3:
        return "EarthScene";
      case 4:
        return "MarsScene";
      case 5:
        return "GameScene"; // Jupiter is React-only
      case 6:
        return "GameScene"; // Saturn is React-only
      case 7:
        return "GameScene"; // Uranus is React-only
      case 8:
        return "GameScene"; // Neptune is React-only
      case 9:
        return "FinalBossScene";
      default:
        return "GameScene";
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
      GameScene,
      EarthScene,
      MarsScene,
      FinalBossScene,
      FinalOutroScene,
    ];

    // Phaser starts the FIRST scene in the array.
    // We reorder to put the requested scene at index 0.
    const startSceneKey = getStartingScene(initialLevelId);

    // Create a mapping of keys to constructors
    const sceneMap: Record<string, any> = {
      GameScene: GameScene,
      EarthScene: EarthScene,
      MarsScene: MarsScene,
      FinalBossScene: FinalBossScene,
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
        gameRef.current.scene.scenes.forEach((s) => {
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
    <div className="relative z-50 h-dvh w-screen bg-gray-950">
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export default PhaserGame;
