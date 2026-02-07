import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/scenes/GameScene";
import { DISPLAY, PHYSICS } from "../game/config";

/**
 * PhaserGame.tsx
 *
 * React wrapper that manages the Phaser game lifecycle.
 * Now configured with downward gravity for platformer physics.
 */
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
                    // --- Gravity pulls everything down (platformer!) ---
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
        <div className="flex items-center justify-center w-full h-screen bg-gray-950">
            <div
                ref={containerRef}
                className="w-full max-w-4xl aspect-video border-2 border-gray-700 rounded-lg overflow-hidden shadow-lg shadow-black/50"
            />
        </div>
    );
};

export default PhaserGame;
