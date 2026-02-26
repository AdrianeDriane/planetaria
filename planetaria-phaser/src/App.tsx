import { useState, useEffect } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";
import { MarsRedPuzzle } from "./ui/components/MarsRedPuzzle";
import { EventBus } from "./game/EventBus";

type AppState = "menu" | "playing";

function App() {
  const [appState, setAppState] = useState<AppState>("menu");
  const [showMarsPuzzle, setShowMarsPuzzle] = useState(false);

  useEffect(() => {
    const showMars = () => setShowMarsPuzzle(true);
    const hideMars = () => setShowMarsPuzzle(false);

    EventBus.on("enter-mars-scene", showMars);
    EventBus.on("leave-mars-scene", hideMars);

    return () => {
      EventBus.off("enter-mars-scene", showMars);
      EventBus.off("leave-mars-scene", hideMars);
    };
  }, []);

  const handleMarsPuzzleComplete = () => {
    EventBus.emit("mars-core-reactivated");
    setTimeout(() => setShowMarsPuzzle(false), 2000);
  };

  return (
    <div className="relative min-h-screen bg-gray-950">
      {appState === "menu" && (
        <MainMenu onPlay={() => setAppState("playing")} />
      )}
      {appState === "playing" && (
        <>
          <PhaserGame />
          {showMarsPuzzle && (
            <MarsRedPuzzle onComplete={handleMarsPuzzleComplete} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
