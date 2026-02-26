import { useState, useEffect } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";
import { MarsRedPuzzle } from "./ui/components/MarsRedPuzzle";
import VenusGame from "./ui/pages/VenusGame";
import UranusGame from "./ui/pages/UranusGame";
import NeptuneGame from "./ui/pages/NeptuneGame";
import { EventBus } from "./game/EventBus";

type AppState = "menu" | "levels" | "playing";

const STORAGE_KEY = "planetaria_progress";

function App() {
  const [appState, setAppState] = useState<AppState>("menu");
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const [showMarsPuzzle, setShowMarsPuzzle] = useState(false);
  const [showVenusGame, setShowVenusGame] = useState(false);
  const [showUranusGame, setShowUranusGame] = useState(false);
  const [showNeptuneGame, setShowNeptuneGame] = useState(false);

  useEffect(() => {
    const enterMars = () => setShowMarsPuzzle(true);
    const leaveMars = () => setShowMarsPuzzle(false);
    const enterVenus = () => setShowVenusGame(true);
    const leaveVenus = () => setShowVenusGame(false);
    const enterUranus = () => setShowUranusGame(true);
    const leaveUranus = () => setShowUranusGame(false);
    const enterNeptune = () => setShowNeptuneGame(true);
    const leaveNeptune = () => setShowNeptuneGame(false);

    EventBus.on("enter-mars-scene", enterMars);
    EventBus.on("leave-mars-scene", leaveMars);
    EventBus.on("enter-venus-game", enterVenus);
    EventBus.on("leave-venus-game", leaveVenus);
    EventBus.on("enter-uranus-game", enterUranus);
    EventBus.on("leave-uranus-game", leaveUranus);
    EventBus.on("enter-neptune-game", enterNeptune);
    EventBus.on("leave-neptune-game", leaveNeptune);

    return () => {
      EventBus.off("enter-mars-scene", enterMars);
      EventBus.off("leave-mars-scene", leaveMars);
      EventBus.off("enter-venus-game", enterVenus);
      EventBus.off("leave-venus-game", leaveVenus);
      EventBus.off("enter-uranus-game", enterUranus);
      EventBus.off("leave-uranus-game", leaveUranus);
      EventBus.off("enter-neptune-game", enterNeptune);
      EventBus.off("leave-neptune-game", leaveNeptune);
    };
  }, []);

  const unlockLevel = (levelId: number) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      let progress = stored ? JSON.parse(stored) : {};
      progress[levelId] = "unlocked";
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.warn("Failed to save progress:", e);
    }
  };

  const handleLevelSelect = (levelId: number) => {
    setSelectedLevelId(levelId);
    setAppState("playing");
  };

  const handleVenusComplete = () => {
    unlockLevel(3); // Unlock Earth
    EventBus.emit("venus-core-reactivated");
    setTimeout(() => {
        setShowVenusGame(false);
        EventBus.emit("change-phaser-scene", "EarthIntroScene");
    }, 2000);
  };

  const handleMarsPuzzleComplete = () => {
    unlockLevel(5); // Unlock Jupiter (progression placeholder)
    unlockLevel(7); // Unlock Uranus
    EventBus.emit("mars-core-reactivated");
    setTimeout(() => {
        setShowMarsPuzzle(false);
        EventBus.emit("change-phaser-scene", "UranusIntroScene");
    }, 2000);
  };

  const handleUranusComplete = () => {
    unlockLevel(8); // Unlock Neptune
    setTimeout(() => {
        setShowUranusGame(false);
        EventBus.emit("change-phaser-scene", "NeptuneIntroScene");
    }, 2000);
  };

  const handleNeptuneComplete = () => {
    unlockLevel(9); // Unlock Boss
    setTimeout(() => {
        setShowNeptuneGame(false);
        EventBus.emit("change-phaser-scene", "JupiterIntroScene"); // Or a victory scene
    }, 2000);
  };

  return (
    <div className="relative min-h-screen bg-gray-950">
      {appState === "menu" && (
        <MainMenu onPlay={() => setAppState("levels")} />
      )}
      {appState === "levels" && (
        <LevelSelection 
          onLevelSelect={handleLevelSelect} 
          onBack={() => setAppState("menu")} 
        />
      )}
      {appState === "playing" && (
        <>
          <PhaserGame initialLevelId={selectedLevelId} />
          {showVenusGame && (
            <VenusGame onComplete={handleVenusComplete} onBack={() => setShowVenusGame(false)} />
          )}
          {showMarsPuzzle && (
            <MarsRedPuzzle onComplete={handleMarsPuzzleComplete} />
          )}
          {showUranusGame && (
            <UranusGame onComplete={handleUranusComplete} onBack={() => setShowUranusGame(false)} />
          )}
          {showNeptuneGame && (
            <NeptuneGame onComplete={handleNeptuneComplete} onBack={() => setShowNeptuneGame(false)} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
