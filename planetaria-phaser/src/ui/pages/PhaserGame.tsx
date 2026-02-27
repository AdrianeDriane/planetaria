import { useEffect, useRef } from "react";
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
import VenusScene from "../../game/scenes/VenusScene";
import VenusIntroScene from "../../game/scenes/venus/VenusIntroScene";
import JupiterIntroScene from "../../game/scenes/JupiterIntroScene";
import SaturnIntroScene from "../../game/scenes/SaturnIntroScene";
import UranusIntroScene from "../../game/scenes/uranus/UranusIntroScene";
import NeptuneIntroScene from "../../game/scenes/neptune/NeptuneIntroScene";
import { EventBus } from "../../game/EventBus";

interface PhaserGameProps {
  initialLevelId?: number;
  onNavigateToVenus?: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({
  initialLevelId = 1,
  onNavigateToVenus,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Mapping level ID to starting scene key
  const getStartingScene = (id: number): string => {
    switch (id) {
      case 1:
        return "IntroScene";
      case 2:
        return "VenusIntroScene";
      case 3:
        return "EarthIntroScene";
      case 4:
        return "MarsIntroScene";
      case 5:
        return "JupiterIntroScene";
      case 6:
        return "SaturnIntroScene";
      case 7:
        return "UranusIntroScene";
      case 8:
        return "NeptuneIntroScene";
      default:
        return "IntroScene";
    }
  };

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    // Define all available scenes
    const allScenes = [
      IntroScene,
      GameScene,
      VenusScene,
      VenusIntroScene,
      EarthIntroScene,
      EarthScene,
      EarthCongratulationScene,
      MarsIntroScene,
      MarsScene,
      JupiterIntroScene,
      SaturnIntroScene,
      UranusIntroScene,
      NeptuneIntroScene,
    ];

    // Phaser starts the FIRST scene in the array.
    // We reorder to put the requested scene at index 0.
    const startSceneKey = getStartingScene(initialLevelId);

    // Create a mapping of keys to constructors
    const sceneMap: Record<string, any> = {
      IntroScene: IntroScene,
      GameScene: GameScene,
      VenusScene: VenusScene,
      VenusIntroScene: VenusIntroScene,
      EarthIntroScene: EarthIntroScene,
      EarthScene: EarthScene,
      EarthCongratulationScene: EarthCongratulationScene,
      MarsIntroScene: MarsIntroScene,
      MarsScene: MarsScene,
      JupiterIntroScene: JupiterIntroScene,
      SaturnIntroScene: SaturnIntroScene,
      UranusIntroScene: UranusIntroScene,
      NeptuneIntroScene: NeptuneIntroScene,
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
