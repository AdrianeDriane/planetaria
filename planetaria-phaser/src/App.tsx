import { useState } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";

type AppState = "menu" | "level-select" | "playing";

function App() {
  const [appState, setAppState] = useState<AppState>("menu");
  const [selectedLevel, setSelectedLevel] = useState<number>(1);

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevel(levelId);
    setAppState("playing");
  };

  return (
    <div className="min-h-screen bg-gray-950">
      {appState === "menu" && (
        <MainMenu onPlay={() => setAppState("level-select")} />
      )}
      {appState === "level-select" && (
        <LevelSelection
          onLevelSelect={handleLevelSelect}
          onBack={() => setAppState("menu")}
        />
      )}
      {appState === "playing" && <PhaserGame />}
    </div>
  );
}

export default App;
