import React from "react";

interface DiscoveryBoxProps {
    feature: string | null;
    onClose: () => void;
}

const DISCOVERY_DATA: Record<
    string,
    { title: string; description: string; icon: string }
> = {
    liquid_water: {
        title: "Liquid Water",
        description:
            "Earth has liquid water on its surface; about 70% is covered in water.",
        icon: "💧",
    },
    living_things: {
        title: "Living Things",
        description:
            "It is the only planet known to support life; it has plants, animals, and humans.",
        icon: "🌿",
    },
    atmosphere: {
        title: "Air / Atmosphere",
        description:
            "It has an atmosphere that supports and protects life; burns most meteors before they reach the surface.",
        icon: "☁️",
    },
    sun_position: {
        title: "Earth's Position from the Sun",
        description: "It is the third planet from the Sun.",
        icon: "☀️",
    },
    moon: {
        title: "The Moon (Luna)",
        description: "1 moon; ancient name is Luna.",
        icon: "🌙",
    },
    movement: {
        title: "Earth's Movement",
        description: "Rotation: 23 hours, 56 minutes; Revolution: 365 ¼ days.",
        icon: "🔄",
    },
};

const DiscoveryBox: React.FC<DiscoveryBoxProps> = ({ feature, onClose }) => {
    if (!feature || !DISCOVERY_DATA[feature]) return null;

    const data = DISCOVERY_DATA[feature];

    return (
        <div className="fixed inset-0 flex items-end justify-center pb-20 pointer-events-none">
            <div className="pointer-events-auto relative">
                {/* Main Discovery Box */}
                <div className="w-96 font-mono">
                    {/* Outer cyan border */}
                    <div
                        className="bg-cyan-400 p-2 shadow-lg"
                        style={{
                            boxShadow:
                                "0 0 20px rgba(34, 211, 238, 0.5), 4px 4px 0px rgba(0,0,0,0.7)",
                        }}
                    >
                        {/* Inner dark background */}
                        <div className="bg-slate-900 p-4 border-2 border-slate-800">
                            {/* Header */}
                            <h3 className="text-cyan-400 font-bold text-sm mb-3 tracking-widest uppercase">
                                ★ DISCOVERY ★
                            </h3>

                            {/* Title */}
                            <h2 className="text-green-400 font-bold text-lg mb-3 tracking-wide">
                                {data.title}
                            </h2>

                            {/* Content Row */}
                            <div className="flex gap-4 items-start">
                                {/* Left Icon */}
                                <div className="flex-shrink-0">
                                    <div className="w-16 h-16 bg-blue-900 border-2 border-blue-500 flex items-center justify-center text-4xl">
                                        {data.icon}
                                    </div>
                                </div>

                                {/* Right Description */}
                                <div className="flex-1">
                                    <p className="text-white text-xs leading-relaxed">
                                        {data.description}
                                    </p>
                                </div>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="w-full mt-4 py-2 bg-cyan-500 border-2 border-cyan-300 text-slate-900 font-bold uppercase text-xs hover:bg-cyan-400 active:translate-y-0.5 transition-all"
                            >
                                Continue Scanning
                            </button>
                        </div>
                    </div>
                </div>

                {/* Pointing Hand Cursors */}
                <div className="absolute -bottom-12 left-4 text-4xl animate-bounce">
                    👆
                </div>
                <div
                    className="absolute -bottom-12 right-4 text-4xl animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                >
                    👆
                </div>
            </div>
        </div>
    );
};

export default DiscoveryBox;
