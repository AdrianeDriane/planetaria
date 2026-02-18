import { useState } from "react";

import MainMenu from "./ui/pages/MainMenu";
import PhaserGame from "./ui/pages/PhaserGame";
import VenusGame from "./ui/pages/VenusGame";
import EarthGame from "./ui/pages/EarthGame";

type AppState = "menu" | "playing" | "venus" | "earth";

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
                <EarthGame onComplete={() => setAppState("menu")} onBack={() => setAppState("venus")} />
            )}
        </div>
    );
}

export default App;
