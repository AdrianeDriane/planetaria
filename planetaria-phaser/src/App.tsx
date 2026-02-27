import { useState, useEffect } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";
import { MarsRedPuzzle } from "./ui/components/MarsRedPuzzle";
import VenusGame from "./ui/pages/VenusGame";
import UranusGame from "./ui/pages/UranusGame";
import NeptuneGame from "./ui/pages/NeptuneGame";
import JupiterGame from "./ui/pages/JupiterGame";
import EarthGame from "./ui/pages/EarthGame";
import { EarthIntroCinematic } from "./ui/components/EarthIntroCinematic";
import { MarsIntroCinematic } from "./ui/components/MarsIntroCinematic";
import { EarthCongratulationCinematic } from "./ui/components/EarthCongratulationCinematic";
import { PlanetIntroCinematic } from "./ui/components/PlanetIntroCinematic";
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
  const [showJupiterGame, setShowJupiterGame] = useState(false);
  const [showEarthGame, setShowEarthGame] = useState(false);
  const [showEarthCinematic, setShowEarthCinematic] = useState(false);
  const [showMarsCinematic, setShowMarsCinematic] = useState(false);
  const [showEarthCongratulation, setShowEarthCongratulation] = useState(false);
  const [showPlanetCinematic, setShowPlanetCinematic] = useState(false);
  const [currentPlanet, setCurrentPlanet] = useState<string>("");

  useEffect(() => {
    const enterMars = () => setShowMarsPuzzle(true);
    const leaveMars = () => setShowMarsPuzzle(false);
    const enterVenus = () => setShowVenusGame(true);
    const leaveVenus = () => setShowVenusGame(false);
    const enterUranus = () => setShowUranusGame(true);
    const leaveUranus = () => setShowUranusGame(false);
    const enterNeptune = () => setShowNeptuneGame(true);
    const leaveNeptune = () => setShowNeptuneGame(false);
    const enterJupiter = () => setShowJupiterGame(true);
    const leaveJupiter = () => setShowJupiterGame(false);
    const enterEarth = () => setShowEarthGame(true);
    const leaveEarth = () => setShowEarthGame(false);
    const startEarthCinematic = () => setShowEarthCinematic(true);
    const startMarsCinematic = () => setShowMarsCinematic(true);
    const startEarthCongratulation = () => setShowEarthCongratulation(true);
    const startPlanetCinematic = (planet: string) => {
      setCurrentPlanet(planet);
      setShowPlanetCinematic(true);
    };
    const handleMercuryCompleteEvent = () => {
      unlockLevel(2); // Unlock Venus
      setCurrentPlanet("venus");
      setShowPlanetCinematic(true);
    };
    const handleVenusCompleteEvent = () => {
      unlockLevel(3); // Unlock Earth
      setShowEarthCinematic(true);
    };

    EventBus.on("enter-mars-scene", enterMars);
    EventBus.on("leave-mars-scene", leaveMars);
    EventBus.on("enter-venus-game", enterVenus);
    EventBus.on("leave-venus-game", leaveVenus);
    EventBus.on("enter-uranus-game", enterUranus);
    EventBus.on("leave-uranus-game", leaveUranus);
    EventBus.on("enter-neptune-game", enterNeptune);
    EventBus.on("leave-neptune-game", leaveNeptune);
    EventBus.on("enter-jupiter-game", enterJupiter);
    EventBus.on("leave-jupiter-game", leaveJupiter);
    EventBus.on("enter-earth-game", enterEarth);
    EventBus.on("leave-earth-game", leaveEarth);
    EventBus.on("start-earth-cinematic", startEarthCinematic);
    EventBus.on("start-mars-cinematic", startMarsCinematic);
    EventBus.on("start-earth-congratulation", startEarthCongratulation);
    EventBus.on("start-planet-cinematic", startPlanetCinematic);
    EventBus.on("mercury-complete", handleMercuryCompleteEvent);
    EventBus.on("venus-complete", handleVenusCompleteEvent);

    return () => {
      EventBus.off("enter-mars-scene", enterMars);
      EventBus.off("leave-mars-scene", leaveMars);
      EventBus.off("enter-venus-game", enterVenus);
      EventBus.off("leave-venus-game", leaveVenus);
      EventBus.off("enter-uranus-game", enterUranus);
      EventBus.off("leave-uranus-game", leaveUranus);
      EventBus.off("enter-neptune-game", enterNeptune);
      EventBus.off("leave-neptune-game", leaveNeptune);
      EventBus.off("enter-jupiter-game", enterJupiter);
      EventBus.off("leave-jupiter-game", leaveJupiter);
      EventBus.off("enter-earth-game", enterEarth);
      EventBus.off("leave-earth-game", leaveEarth);
      EventBus.off("start-earth-cinematic", startEarthCinematic);
      EventBus.off("start-mars-cinematic", startMarsCinematic);
      EventBus.off("start-earth-congratulation", startEarthCongratulation);
      EventBus.off("start-planet-cinematic", startPlanetCinematic);
      EventBus.off("mercury-complete", handleMercuryCompleteEvent);
      EventBus.off("venus-complete", handleVenusCompleteEvent);
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
    
    // Reset all game/cinematic states
    setShowVenusGame(false);
    setShowEarthGame(false);
    setShowMarsPuzzle(false);
    setShowUranusGame(false);
    setShowNeptuneGame(false);
    setShowEarthCinematic(false);
    setShowMarsCinematic(false);
    setShowEarthCongratulation(false);
    setShowPlanetCinematic(false);

    // Trigger Intros Directly
    if (levelId === 1) {
      setCurrentPlanet("mercury");
      setShowPlanetCinematic(true);
    } else if (levelId === 2) {
      setCurrentPlanet("venus");
      setShowPlanetCinematic(true);
    } else if (levelId === 3) {
      setShowEarthCinematic(true);
    } else if (levelId === 4) {
      setShowMarsCinematic(true);
    } else if (levelId === 5) {
      setCurrentPlanet("jupiter");
      setShowPlanetCinematic(true);
    } else if (levelId === 6) {
      setCurrentPlanet("saturn");
      setShowPlanetCinematic(true);
    } else if (levelId === 7) {
      setCurrentPlanet("uranus");
      setShowPlanetCinematic(true);
    } else if (levelId === 8) {
      setCurrentPlanet("neptune");
      setShowPlanetCinematic(true);
    }
  };

  const handleVenusComplete = () => {
    unlockLevel(3); // Unlock Earth
    EventBus.emit("venus-core-reactivated");
    setTimeout(() => {
      setShowVenusGame(false);
      setShowEarthCinematic(true);
    }, 2000);
  };

  const handleEarthCinematicComplete = () => {
    setShowEarthCinematic(false);
    setShowEarthGame(true);
  };

  const handleEarthComplete = () => {
    unlockLevel(4); // Unlock Mars
    setTimeout(() => {
      setShowEarthGame(false);
      setShowEarthCongratulation(true);
    }, 2000);
  };

  const handleEarthCongratulationComplete = () => {
    setShowEarthCongratulation(false);
    setShowMarsCinematic(true);
  };

  const handleMarsCinematicComplete = () => {
    setShowMarsCinematic(false);
    EventBus.emit("change-phaser-scene", "MarsScene");
  };

  const handlePlanetCinematicComplete = () => {
    setShowPlanetCinematic(false);
    if (currentPlanet === "mercury") {
      EventBus.emit("change-phaser-scene", "GameScene");
    } else if (currentPlanet === "venus") {
      setShowVenusGame(true);
    } else if (currentPlanet === "jupiter") {
      // Since Jupiter game is not implemented, go to Saturn
      setShowJupiterGame(true);
    } else if (currentPlanet === "saturn") {
      // Since Saturn game is not implemented, go to Uranus
      handleSaturnComplete();
    } else if (currentPlanet === "uranus") {
      setShowUranusGame(true);
    } else if (currentPlanet === "neptune") {
      setShowNeptuneGame(true);
    }
  };

  const handleMarsPuzzleComplete = () => {
    unlockLevel(5); // Unlock Jupiter
    EventBus.emit("mars-core-reactivated");
    setTimeout(() => {
      setShowMarsPuzzle(false);
      setCurrentPlanet("jupiter");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleJupiterComplete = () => {
    unlockLevel(6); // Unlock Saturn
    EventBus.emit("jupiter-core-reactivated");
    setTimeout(() => {
        setShowJupiterGame(false);
        EventBus.emit("change-phaser-scene", "SaturnIntroScene");
      setCurrentPlanet("saturn");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleSaturnComplete = () => {
    unlockLevel(7); // Unlock Uranus
    setTimeout(() => {
      setCurrentPlanet("uranus");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleUranusComplete = () => {
    unlockLevel(8); // Unlock Neptune
    setTimeout(() => {
      setShowUranusGame(false);
      setCurrentPlanet("neptune");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleNeptuneComplete = () => {
    unlockLevel(9); // Unlock Boss
    setTimeout(() => {
      setShowNeptuneGame(false);
      setAppState("menu"); // Return to menu for now
    }, 2000);
  };

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-gray-950">
      {appState === "menu" && <MainMenu onPlay={() => setAppState("levels")} />}
      {appState === "levels" && (
        <LevelSelection
          onLevelSelect={handleLevelSelect}
          onBack={() => setAppState("menu")}
        />
      )}
      {appState === "playing" && (
        <>
          <div
            className={
              showVenusGame ||
              showMarsPuzzle ||
              showUranusGame ||
              showNeptuneGame ||
              showJupiterGame ||
              showEarthCinematic ||
              showEarthGame ||
              showMarsCinematic ||
              showEarthCongratulation ||
              showPlanetCinematic
                ? "hidden"
                : "contents"
            }
          >
            <PhaserGame initialLevelId={selectedLevelId} />
          </div>
          {showPlanetCinematic && (
            <PlanetIntroCinematic
              planet={currentPlanet}
              onComplete={handlePlanetCinematicComplete}
            />
          )}
          {showEarthCongratulation && (
            <EarthCongratulationCinematic
              onComplete={handleEarthCongratulationComplete}
            />
          )}
          {showEarthCinematic && (
            <EarthIntroCinematic
              onComplete={handleEarthCinematicComplete}
              canSkip={(() => {
                const stored = localStorage.getItem(STORAGE_KEY);
                const progress = stored ? JSON.parse(stored) : {};
                // If Mars (Level 4) is unlocked, it means Earth (Level 3) was already completed.
                return !!progress[4];
              })()}
            />
          )}
          {showMarsCinematic && (
            <MarsIntroCinematic
              onComplete={handleMarsCinematicComplete}
              canSkip={(() => {
                const stored = localStorage.getItem(STORAGE_KEY);
                const progress = stored ? JSON.parse(stored) : {};
                // If Jupiter (Level 5) is unlocked, it means Mars (Level 4) was already completed.
                return !!progress[5];
              })()}
            />
          )}
          {showEarthGame && (
            <EarthGame
              onComplete={handleEarthComplete}
              onBack={() => setShowEarthGame(false)}
            />
          )}
          {showVenusGame && (
            <VenusGame
              onComplete={handleVenusComplete}
              onBack={() => setShowVenusGame(false)}
            />
          )}
          {showMarsPuzzle && (
            <MarsRedPuzzle onComplete={handleMarsPuzzleComplete} />
          )}
          {showUranusGame && (
            <UranusGame
              onComplete={handleUranusComplete}
              onBack={() => setShowUranusGame(false)}
            />
          )}
          {showNeptuneGame && (
            <NeptuneGame
              onComplete={handleNeptuneComplete}
              onBack={() => setShowNeptuneGame(false)}
            />
          )}
          {showJupiterGame && (
            <JupiterGame onComplete={handleJupiterComplete} />
          )}
        </>
      )}
    </div>
  );
}

export default App;
