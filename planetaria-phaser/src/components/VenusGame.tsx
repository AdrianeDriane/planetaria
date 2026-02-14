import { useState, useRef, useEffect } from "react";
import PixelButton from "./ui/PixelButton";

interface DataPacket {
    id: string;
    x: number;
    y: number;
    image: string
    title: string;
    description: string;
    found: boolean;
}

interface VenusGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const VenusGame: React.FC<VenusGameProps> = ({ onComplete, onBack }) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);

    const [dataPackets, setDataPackets] = useState<DataPacket[]>([
        {
            id: "hot-potato",
            x: 300,
            y: 200,
            image: "/assets/venus_rock.png",
            title: "Hot Potato",
            description: "Venus is the hottest planet. It's like a giant pizza oven in space!",
            found: false,
        },
        {
            id: "acid-clouds",
            x: 600,
            y: 350,
            image: "/assets/venus_rock.png",
            title: "Acid Clouds",
            description: "It doesn't rain water; it rains acid that would sting your skin.",
            found: false,
        },
        {
            id: "slow-spinning",
            x: 450,
            y: 280,
            image: "/assets/venus_rock.png",
            title: "Slow Spinning Venus",
            description: "Venus spins so slowly that you could walk faster than the planet rotates!",
            found: false,
        },
        {
            id: "rocks",
            x: Math.random() * 800 + 200,
            y: 800,
            image: "/assets/venus_rock.png",
            title: "Rocks",
            description: "No moon, 116 days rotation, same gravity as the Earth.",
            found: false,
        },
    ]);

    const [telescopePos, setTelescopePos] = useState({ x: 200, y: 200 });
    const [selectedPacket, setSelectedPacket] = useState<DataPacket | null>(null);
    const [showTitle, setShowTitle] = useState(true);
    const telescopeRadius = 250;

    useEffect(() => {
        const timer = setTimeout(() => setShowTitle(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleSceneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sceneRef.current) return;
        const rect = sceneRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setTelescopePos({ x, y });
    };

    const handleSceneClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sceneRef.current) return;
        const rect = sceneRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Check if crosshair center (telescope center) is over any packet
        dataPackets.forEach((packet) => {
            // Calculate distance from telescope CENTER to packet center
            const distance = Math.sqrt(
                Math.pow(packet.x + 50 - telescopePos.x, 2) + 
                Math.pow(packet.y + 50 - telescopePos.y, 2)
            );
            
            // Only collect if crosshair is directly over the rock (within ~50px of rock center)
            if (distance < 50 && !packet.found) {
                setSelectedPacket(packet);
                setDataPackets((prev) =>
                    prev.map((p) =>
                        p.id === packet.id ? { ...p, found: true } : p
                    )
                );
            }
        });
    };

    const allFound = dataPackets.every((p) => p.found);

    return (
        <div
            className="w-screen h-screen relative overflow-hidden bg-black"
        >
            {/* Animated Venus Background Spritesheet - revealed by mask */}
            <div
                ref={backgroundRef}
                className="absolute inset-0 z-10"
                style={{
                    backgroundImage: "url(/assets/venus_background.png)",
                    backgroundSize: "100% 200%",
                    backgroundPosition: "0% 0%",
                    backgroundRepeat: "no-repeat",
                    animation: "venus-sprite 1s steps(1) infinite",
                    WebkitMaskImage: `radial-gradient(circle ${telescopeRadius}px at ${telescopePos.x}px ${telescopePos.y}px, black ${telescopeRadius}px, transparent ${telescopeRadius + 1}px)`,
                    maskImage: `radial-gradient(circle ${telescopeRadius}px at ${telescopePos.x}px ${telescopePos.y}px, black ${telescopeRadius}px, transparent ${telescopeRadius + 1}px)`,
                }}
            />

            {/* Animation keyframes */}
            <style>{`
                @keyframes venus-sprite {
                    0%   { background-position: 0% 0%; }
                    50%  { background-position: 0% 100%; }
                    100% { background-position: 0% 0%; }
                }
            `}</style>

            {/* Full-screen interactive telescope scene */}
            <div
                ref={sceneRef}
                className="absolute inset-0 cursor-crosshair z-20"
                onMouseMove={handleSceneMouseMove}
                onClick={handleSceneClick}
            >
                {/* Data Packet Indicators */}
                {dataPackets.map((packet) => {
                    const isWithinRadius =
                        Math.sqrt(
                            Math.pow(packet.x + 50 - telescopePos.x, 2) +
                                Math.pow(packet.y + 50 - telescopePos.y, 2)
                        ) < telescopeRadius;

                    const distanceFromCenter = Math.sqrt(
                        Math.pow(packet.x + 50 - telescopePos.x, 2) +
                            Math.pow(packet.y + 50 - telescopePos.y, 2)
                    );
                    
                    const isOnCrosshair = distanceFromCenter < 50;

                    return (
                        <img
                            key={packet.id}
                            src="/assets/venus_rock.png"
                            alt="Rock"
                            className={`absolute cursor-pointer transition-all ${
                                packet.found ? "opacity-0" : ""
                            } ${!isWithinRadius ? "opacity-0" : "opacity-100"}`}
                            style={{
                                left: `${packet.x}px`,
                                top: `${packet.y}px`,
                                width: "100px",
                                height: "100px",
                                filter: isOnCrosshair
                                    ? "drop-shadow(0 0 15px rgba(251, 191, 36, 0.8)) brightness(1.3)"
                                    : isWithinRadius 
                                    ? "brightness(1)"
                                    : "brightness(0.5)",
                                pointerEvents: isWithinRadius ? 'auto' : 'none',
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!packet.found && isOnCrosshair) {
                                    setSelectedPacket(packet);
                                    setDataPackets((prev) =>
                                        prev.map((p) =>
                                            p.id === packet.id ? { ...p, found: true } : p
                                        )
                                    );
                                }
                            }}
                        />
                    );
                })}

                {/* Telescope Viewport */}
                <div
                    className="absolute border-4 border-cyan-400 rounded-full pointer-events-none"
                    style={{
                        width: `${telescopeRadius * 2}px`,
                        height: `${telescopeRadius * 2}px`,
                        left: `${telescopePos.x - telescopeRadius}px`,
                        top: `${telescopePos.y - telescopeRadius}px`,
                        boxShadow:
                            "inset 0 0 20px rgba(34, 197, 234, 0.5), 0 0 30px rgba(34, 197, 234, 0.3)",
                    }}
                />

                {/* Center crosshair */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: "20px",
                        height: "20px",
                        left: `${telescopePos.x - 10}px`,
                        top: `${telescopePos.y - 10}px`,
                    }}
                >
                    <div className="absolute w-full h-0.5 top-1/2 left-0 bg-cyan-400" />
                    <div className="absolute h-full w-0.5 left-1/2 top-0 bg-cyan-400" />
                </div>
            </div>

            {/* UI Overlay - positioned absolutely */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4 pointer-events-none z-20">
                {/* Title - Top Center (auto-hides after 3s) */}
                {showTitle && (
                    <div className="text-center">
                        <h2 className="font-['Press_Start_2P'] text-yellow-500 text-2xl mb-2">
                            CHAPTER 2: VENUS
                        </h2>
                        <p className="font-['Press_Start_2P'] text-yellow-600 text-xs">
                            The Acid Haze
                        </p>
                        <p className="font-['Press_Start_2P'] text-gray-400 text-[10px] mt-2">
                            Move the telescope and click to find all Data Packets
                        </p>
                    </div>
                )}
                

                {/* Info Panel - Top Right */}
                <div className="absolute top-20 right-4 flex flex-col gap-4 w-72 pointer-events-auto">
                    <div className="bg-black border-4 border-yellow-700 p-4">
                        <p className="font-['Press_Start_2P'] text-yellow-400 text-xs mb-3">
                            Data Packets:
                        </p>
                        <div className="space-y-2">
                            {dataPackets.map((packet) => (
                                <div
                                    key={packet.id}
                                    className={`text-xs font-['Press_Start_2P'] p-2 border-2 cursor-pointer transition-all ${
                                        packet.found
                                            ? "border-green-500 bg-green-900 text-green-300"
                                            : "border-gray-600 bg-gray-800 text-gray-500"
                                    }`}
                                    onClick={() => setSelectedPacket(packet)}
                                >
                                    {packet.title}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Selected Packet Details */}
                    {selectedPacket && (
                        <div className="bg-black border-4 border-cyan-400 p-4">
                            <p className="font-['Press_Start_2P'] text-cyan-400 text-xs mb-2">
                                {selectedPacket.title}
                            </p>
                            <p className="text-xs text-gray-300 leading-relaxed">
                                {selectedPacket.description}
                            </p>
                        </div>
                    )}

                    {/* Completion Message */}
                    {allFound && (
                        <div className="bg-green-900 border-4 border-green-500 p-4 animate-pulse">
                            <p className="font-['Press_Start_2P'] text-green-300 text-xs text-center">
                                All Data Packets Found!
                            </p>
                            <p className="font-['Press_Start_2P'] text-green-200 text-[10px] text-center mt-2">
                                Venus's Planetary Core Reactivates
                            </p>
                        </div>
                    )}
                </div>

                {/* Controls - Bottom Center */}
                <div className="absolute bottom-4 flex gap-4 pointer-events-auto">
                    <PixelButton label="Back" onClick={onBack} variant="secondary" />
                    <PixelButton
                        label="Proceed to Earth"
                        onClick={onComplete}
                        disabled={!allFound}
                    />
                </div>
            </div>
        </div>
    );
};

export default VenusGame;
