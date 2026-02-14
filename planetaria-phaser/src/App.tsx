import { useState } from "react";
import MainMenu from "./components/MainMenu";
import PhaserGame from "./components/PhaserGame";
import VenusGame from "./components/VenusGame";

type AppState = "menu" | "playing" | "venus";

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
                <VenusGame onComplete={() => setAppState("menu")} onBack={() => setAppState("menu")} />
            )}
        </div>
    );
}

export default App;
