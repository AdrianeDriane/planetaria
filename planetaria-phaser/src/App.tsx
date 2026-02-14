import { useState } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";

type AppState = "menu" | "playing";

function App() {
    const [appState, setAppState] = useState<AppState>("menu");

    return (
        <div className="min-h-screen bg-gray-950">
            {appState === "menu" && (
                <MainMenu onPlay={() => setAppState("playing")} />
            )}
            {appState === "playing" && <PhaserGame />}
        </div>
    );
}

export default App;
