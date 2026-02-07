import { useState } from "react";
import MainMenu from "./components/MainMenu";
import PhaserGame from "./components/PhaserGame";

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
