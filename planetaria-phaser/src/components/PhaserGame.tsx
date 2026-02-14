import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/scenes/GameScene";
import EarthScene from "../game/scenes/EarthScene";
import { DISPLAY, PHYSICS } from "../game/config";

interface PhaserGameProps {
    initialScene?: "GameScene" | "EarthScene";
}

const PhaserGame: React.FC<PhaserGameProps> = ({
    initialScene = "GameScene",
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // 1. DYNAMIC SCENE ORDERING (The Fix)
        // Phaser auto-starts the first scene in the array.
        // We force the requested 'initialScene' to be index 0.
        const sceneConfig =
            initialScene === "EarthScene"
                ? [EarthScene, GameScene]
                : [GameScene, EarthScene];

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
            scene: sceneConfig, // <--- Using our ordered array
            input: { keyboard: true },
        };

        // 2. Create the game
        const game = new Phaser.Game(config);
        gameRef.current = game;

        // 3. Cleanup: Destroy the ENTIRE game instance when switching scenes
        // This guarantees the old scene is 100% gone.
        return () => {
            game.destroy(true);
            gameRef.current = null;
        };
    }, [initialScene]); // <--- Re-run this entire block when the prop changes

    return (
        <div className="w-screen h-screen bg-gray-950">
            <div ref={containerRef} className="w-full h-full" />
        </div>
    );
};

export default PhaserGame;
