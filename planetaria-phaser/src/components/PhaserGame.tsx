import { useEffect, useRef } from "react";
import Phaser from "phaser";
import GameScene from "../game/scenes/GameScene";
import VenusScene from "../game/scenes/VenusScene";
import { DISPLAY, PHYSICS } from "../game/config";
import PixelButton from "./ui/PixelButton";

interface PhaserGameProps {
    onNavigateToVenus: () => void;
}

const PhaserGame: React.FC<PhaserGameProps> = ({ onNavigateToVenus }) => {
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
            scene: [GameScene, VenusScene],
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
