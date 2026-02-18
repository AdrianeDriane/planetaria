import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/scenes/GameScene";
<<<<<<< HEAD
import VenusScene from "../game/scenes/VenusScene";
=======
import EarthScene from "../game/scenes/EarthScene";
>>>>>>> 03854ab8d75f4784a4da234e679f8de95e59f16b
import { DISPLAY, PHYSICS } from "../game/config";
import PixelButton from "./ui/PixelButton";

interface PhaserGameProps {
<<<<<<< HEAD
    onNavigateToVenus: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onNavigateToVenus }) => {
=======
    initialScene?: "GameScene" | "EarthScene";
}

const PhaserGame: React.FC<PhaserGameProps> = ({
    initialScene = "GameScene",
}) => {
>>>>>>> 03854ab8d75f4784a4da234e679f8de95e59f16b
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
<<<<<<< HEAD
            scene: [GameScene, VenusScene],
=======
            scene: sceneConfig, // <--- Using our ordered array
>>>>>>> 03854ab8d75f4784a4da234e679f8de95e59f16b
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
        <div className="w-screen h-screen bg-gray-950 relative pointer-events-none">
            <div ref={containerRef} className="w-full h-full" />
            
            {/* Navigation Overlay */}
            <div className="absolute top-4 right-4 z-50 pointer-events-auto">
                <PixelButton 
                    label="Go to Venus" 
                    onClick={onNavigateToVenus}
                    variant="secondary"
                />
            </div>
        </div>
    );
};

export default PhaserGame;
