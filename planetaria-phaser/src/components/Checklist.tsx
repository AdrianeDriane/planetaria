import { useEffect, useState } from "react";

const FEATURES = {
    liquid_water: "Liquid Water (Ocean)",
    living_things: "Living Things",
    atmosphere: "Air / Atmosphere",
    sun_position: "Position from Sun",
    moon: "The Moon (Luna)",
    movement: "Earth's Movement",
};

export default function Checklist() {
    const [discovered, setDiscovered] = useState<string[]>([]);
    const [showCompletion, setShowCompletion] = useState(false);

    useEffect(() => {
        const handleDiscovery = (e: any) => {
            const feature = e.detail.feature;
            if (!feature) return;

            setDiscovered((prev) => {
                if (prev.includes(feature)) return prev;
                const newSet = [...prev, feature];
                // Check for completion
                if (newSet.length === Object.keys(FEATURES).length) {
                    setTimeout(() => setShowCompletion(true), 500);
                }
                return newSet;
            });
        };

        window.addEventListener("earth-discovery", handleDiscovery);
        return () =>
            window.removeEventListener("earth-discovery", handleDiscovery);
    }, []);

    const isComplete = discovered.length === Object.keys(FEATURES).length;

    return (
        <div className="absolute top-4 right-4 w-80 font-mono select-none pointer-events-none">
            {/* Outer glow container */}
            <div
                className="bg-cyan-400 p-1 shadow-xl"
                style={{
                    boxShadow:
                        "0 0 30px rgba(34, 211, 238, 0.6), 4px 4px 0px rgba(0,0,0,0.7)",
                }}
            >
                {/* Dark theme inner container */}
                <div className="bg-slate-950 border-4 border-slate-800 p-4">
                    {/* Header */}
                    <div className="mb-4 pb-3 border-b-2 border-cyan-400">
                        <h2 className="text-cyan-400 font-bold tracking-widest text-sm uppercase">
                            EARTH: THE LIVING PLANET
                        </h2>
                        <div className="text-xs text-cyan-300 mt-1 tracking-wider">
                            DISCOVERIES: {discovered.length}/
                            {Object.keys(FEATURES).length}
                        </div>
                    </div>

                    {/* Scroll Indicator Up */}
                    <div className="text-center text-cyan-400 text-xs mb-2">
                        ▲ ▲ ▲
                    </div>

                    {/* List Container with border */}
                    <div className="border-2 border-cyan-400 bg-slate-900 p-3 mb-2 max-h-64 overflow-y-auto">
                        {/* List Items */}
                        <ul className="space-y-2">
                            {Object.entries(FEATURES).map(([key, label]) => {
                                const isFound = discovered.includes(key);
                                return (
                                    <li
                                        key={key}
                                        className={`flex items-center gap-3 text-xs uppercase tracking-wide transition-colors duration-200 ${
                                            isFound
                                                ? "text-green-400 font-bold"
                                                : "text-cyan-300"
                                        }`}
                                    >
                                        {/* Pixel checkbox */}
                                        <div
                                            className={`w-4 h-4 flex-shrink-0 border-2 flex items-center justify-center ${
                                                isFound
                                                    ? "border-green-400 bg-green-400/30"
                                                    : "border-cyan-400 bg-transparent"
                                            }`}
                                        >
                                            {isFound && (
                                                <span className="text-green-400 text-xs font-bold">
                                                    ✓
                                                </span>
                                            )}
                                        </div>
                                        <span>{label}</span>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {/* Scroll Indicator Down */}
                    <div className="text-center text-cyan-400 text-xs mb-3">
                        ▼ ▼ ▼
                    </div>

                    {/* Status bar */}
                    <div
                        className={`text-center text-xs font-bold p-2 border-2 ${
                            isComplete
                                ? "border-green-400 bg-green-400/10 text-green-400"
                                : "border-cyan-400 bg-cyan-400/10 text-cyan-300"
                        }`}
                    >
                        {isComplete ? "✦ SCAN COMPLETE ✦" : "SCANNING..."}
                    </div>
                </div>
            </div>

            {/* Completion Modal */}
            {showCompletion && (
                <div className="pointer-events-auto mt-6">
                    <div
                        className="bg-green-400 p-1 shadow-xl"
                        style={{
                            boxShadow: "0 0 20px rgba(74, 222, 128, 0.6)",
                        }}
                    >
                        <div className="bg-slate-900 border-3 border-green-400 p-3 text-center">
                            <p className="text-green-400 font-bold text-xs mb-2 tracking-widest uppercase">
                                ✦ ANALYSIS COMPLETE ✦
                            </p>
                            <p className="text-green-300 text-xs mb-3 leading-relaxed">
                                Earth's Core is reactivating. Ready for Mars
                                expedition.
                            </p>
                            <button
                                onClick={() => setShowCompletion(false)}
                                className="w-full py-2 px-3 bg-green-500 text-slate-900 font-bold border-2 border-green-300 uppercase text-xs hover:bg-green-400 active:translate-y-0.5 transition-all"
                            >
                                Proceed to Mars
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
