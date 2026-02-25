import { useState } from "react";

import MainMenu from "./ui/pages/MainMenu";
import PhaserGame from "./ui/pages/PhaserGame";
import VenusGame from "./ui/pages/VenusGame";
import EarthGame from "./ui/pages/EarthGame";
import UranusGame from "./ui/pages/UranusGame";
import NeptuneGame from "./ui/pages/NeptuneGame";

type AppState = "menu" | "playing" | "venus" | "earth" | "uranus" | "neptune"

function App() {
    const [appState, setAppState] = useState<AppState>("menu");

    return (
        <div className="min-h-screen bg-gray-950">
            {appState === "menu" && (
                <MainMenu onPlay={() => setAppState("playing")} />
            )}
            {appState === "playing" && (
                <PhaserGame onNavigateToVenus={() => setAppState("venus")} />
            )}
            {appState === "venus" && (
                <VenusGame onComplete={() => setAppState("earth")} onBack={() => setAppState("playing")} />
            )}
            {appState === "earth" && (
                <EarthGame onComplete={() => setAppState("uranus")} onBack={() => setAppState("venus")} />
            )}
            {appState === "uranus" && (
                <UranusGame onComplete={() => setAppState("neptune")} onBack={() => setAppState("earth")} />
            )}
            {appState === "neptune" && (
                <NeptuneGame onComplete={() => setAppState("menu")} onBack={() => setAppState("uranus")} />
            )}
        </div>
    );
}

export default App;
