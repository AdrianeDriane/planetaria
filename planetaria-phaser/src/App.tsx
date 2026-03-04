import { useState, useEffect, useCallback } from "react";
import MainMenu from "./ui/pages/MainMenu";
import LevelSelection from "./ui/pages/LevelSelection";
import PhaserGame from "./ui/pages/PhaserGame";
import { MarsRedPuzzle } from "./ui/components/MarsRedPuzzle";
import VenusGame from "./ui/pages/VenusGame";
import UranusGame from "./ui/pages/UranusGame";
import NeptuneGame from "./ui/pages/NeptuneGame";
import JupiterGame from "./ui/pages/JupiterGame";
import EarthGame from "./ui/pages/EarthGame";
import SaturnGame from "./ui/pages/SaturnGame";
import { EarthIntroCinematic } from "./ui/components/EarthIntroCinematic";
import { MarsIntroCinematic } from "./ui/components/MarsIntroCinematic";
import { EarthCongratulationCinematic } from "./ui/components/EarthCongratulationCinematic";
import { PlanetIntroCinematic } from "./ui/components/PlanetIntroCinematic";
import { EventBus } from "./game/EventBus";
import {
  setPlanetAudio,
  initDynamicAudio,
  toggleMute,
  isMuted as getIsMuted,
  setMuted,
  transitionTo,
  playStinger,
  setSituationIntensity,
  AudioSituation
} from "./audio/BgMusic";
import { playCelebrationSfx, playCelebrationStinger, playClickSfx } from "./audio/Sfx";

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
  const [showSaturnGame, setShowSaturnGame] = useState(false);
  const [showEarthCinematic, setShowEarthCinematic] = useState(false);
  const [showMarsCinematic, setShowMarsCinematic] = useState(false);
  const [showEarthCongratulation, setShowEarthCongratulation] = useState(false);
  const [showPlanetCinematic, setShowPlanetCinematic] = useState(false);
  const [currentPlanet, setCurrentPlanet] = useState<string>("");
  const [audioMuted, setAudioMuted] = useState(getIsMuted());
  const [showSoundGate, setShowSoundGate] = useState(true);

  const setPlanet = (planet: string) => {
    setCurrentPlanet(planet);
    setPlanetAudio(planet);
  };

  const triggerPlanetCelebration = useCallback(() => {
    transitionTo("victory");
    playCelebrationSfx();
    playCelebrationStinger(currentPlanet);
  }, [currentPlanet]);

  // Global click/tap SFX
  useEffect(() => {
    const handlePointerDown = () => playClickSfx();
    document.addEventListener("pointerdown", handlePointerDown, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);

  // Start background music immediately on mount
  useEffect(() => {
    initDynamicAudio();
  }, []);

  const handleEnableSound = () => {
    setMuted(false);
    setAudioMuted(false);
    setShowSoundGate(false);
    setPlanetAudio("menu");
  };

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
    const enterSaturn = () => setShowSaturnGame(true);
    const leaveSaturn = () => setShowSaturnGame(false);
    const startEarthCinematic = () => setShowEarthCinematic(true);
    const startMarsCinematic = () => setShowMarsCinematic(true);
    const startEarthCongratulation = () => {
      setShowEarthGame(false);
      setShowEarthCongratulation(true);
    };
    const startPlanetCinematic = (planet: string) => {
      setPlanet(planet);
      setShowPlanetCinematic(true);
    };
    const handleMercuryCompleteEvent = () => {
      triggerPlanetCelebration();
      unlockLevel(2); 
      setPlanet("venus");
      setShowPlanetCinematic(true);
    };
    const handleVenusCompleteEvent = () => {
      triggerPlanetCelebration();
      unlockLevel(3);
      setPlanet("earth");
      setShowEarthCinematic(true);
    };

    const handleBossDefeated = () => {
      playCelebrationSfx();
      transitionTo("victory");
    };
    const handleBossReturnToMenu = () => {
      setAppState("levels");
    };

    const handleOutroComplete = () => {
      setAppState("levels");
    };

    // Custom Event Listeners for Dynamic Audio
    const handleAudioTransition = (e: any) => {
      if (e.detail && e.detail.situation) {
        transitionTo(e.detail.situation as AudioSituation, !!e.detail.immediate);
      }
    };
    const handleStingerTrigger = (e: any) => {
      if (e.detail && e.detail.situation) {
        playStinger(e.detail.situation);
      }
    };
    const handleAudioIntensity = (e: any) => {
        if (e.detail && e.detail.situation) {
          setSituationIntensity(e.detail.situation as AudioSituation, e.detail.intensity);
        }
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
    EventBus.on("enter-saturn-game", enterSaturn);
    EventBus.on("leave-saturn-game", leaveSaturn);
    EventBus.on("start-earth-cinematic", startEarthCinematic);
    EventBus.on("start-mars-cinematic", startMarsCinematic);
    EventBus.on("start-earth-congratulation", startEarthCongratulation);
    EventBus.on("start-planet-cinematic", startPlanetCinematic);
    EventBus.on("mercury-complete", handleMercuryCompleteEvent);
    EventBus.on("venus-complete", handleVenusCompleteEvent);
    EventBus.on("boss-defeated", handleBossDefeated);
    EventBus.on("boss-return-to-menu", handleBossReturnToMenu);
    EventBus.on("outro-complete", handleOutroComplete);

    window.addEventListener("audio-transition", handleAudioTransition);
    window.addEventListener("audio-stinger", handleStingerTrigger);
    window.addEventListener("audio-intensity", handleAudioIntensity);

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
      EventBus.off("enter-saturn-game", enterSaturn);
      EventBus.off("leave-saturn-game", leaveSaturn);
      EventBus.off("start-earth-cinematic", startEarthCinematic);
      EventBus.off("start-mars-cinematic", startMarsCinematic);
      EventBus.off("start-earth-congratulation", startEarthCongratulation);
      EventBus.off("start-planet-cinematic", startPlanetCinematic);
      EventBus.off("mercury-complete", handleMercuryCompleteEvent);
      EventBus.off("venus-complete", handleVenusCompleteEvent);
      EventBus.off("boss-defeated", handleBossDefeated);
      EventBus.off("boss-return-to-menu", handleBossReturnToMenu);
      EventBus.off("outro-complete", handleOutroComplete);

      window.removeEventListener("audio-transition", handleAudioTransition);
      window.removeEventListener("audio-stinger", handleStingerTrigger);
      window.removeEventListener("audio-intensity", handleAudioIntensity);
    };
  }, [currentPlanet, triggerPlanetCelebration]);

  const unlockLevel = (levelId: number) => {
    try {
      const STORAGE_KEY = "planetaria_progress";
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

    setShowVenusGame(false);
    setShowEarthGame(false);
    setShowMarsPuzzle(false);
    setShowUranusGame(false);
    setShowNeptuneGame(false);
    setShowJupiterGame(false);
    setShowSaturnGame(false);
    setShowEarthCinematic(false);
    setShowMarsCinematic(false);
    setShowEarthCongratulation(false);
    setShowPlanetCinematic(false);

    if (levelId === 1) {
      setPlanet("mercury");
      setShowPlanetCinematic(true);
    } else if (levelId === 2) {
      setPlanet("venus");
      setShowPlanetCinematic(true);
    } else if (levelId === 3) {
      setPlanet("earth");
      setShowEarthCinematic(true);
    } else if (levelId === 4) {
      setPlanet("mars");
      setShowMarsCinematic(true);
    } else if (levelId === 5) {
      setPlanet("jupiter");
      setShowPlanetCinematic(true);
    } else if (levelId === 6) {
      setPlanet("saturn");
      setShowPlanetCinematic(true);
    } else if (levelId === 7) {
      setPlanet("uranus");
      setShowPlanetCinematic(true);
    } else if (levelId === 8) {
      setPlanet("neptune");
      setShowPlanetCinematic(true);
    } else if (levelId === 9) {
      setPlanet("boss");
      setShowPlanetCinematic(true);
    }
  };

  const handleVenusComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(3);
    EventBus.emit("venus-core-reactivated");
    setTimeout(() => {
      setShowVenusGame(false);
      setPlanet("earth");
      setShowEarthCinematic(true);
    }, 2000);
  };

  const handleEarthCinematicComplete = () => {
    setShowEarthCinematic(false);
    setShowEarthGame(true);
  };

  const handleEarthComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(4);
    setTimeout(() => {
      setShowEarthGame(false);
      setShowEarthCongratulation(true);
    }, 2000);
  };

  const handleEarthCongratulationComplete = () => {
    setShowEarthCongratulation(false);
    setPlanet("mars");
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
      setShowJupiterGame(true);
    } else if (currentPlanet === "saturn") {
      setShowSaturnGame(true);
    } else if (currentPlanet === "uranus") {
      setShowUranusGame(true);
    } else if (currentPlanet === "neptune") {
      setShowNeptuneGame(true);
    } else if (currentPlanet === "boss") {
      EventBus.emit("change-phaser-scene", "FinalBossScene");
    }
  };

  const handleMarsPuzzleComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(5);
    EventBus.emit("mars-core-reactivated");
    setTimeout(() => {
      setShowMarsPuzzle(false);
      setPlanet("jupiter");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleJupiterComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(6);
    EventBus.emit("jupiter-core-reactivated");
    setTimeout(() => {
      setShowJupiterGame(false);
      setPlanet("saturn");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleSaturnComplete = useCallback(() => {
    triggerPlanetCelebration();
    unlockLevel(7);
    EventBus.emit("saturn-core-reactivated");
    setTimeout(() => {
      setShowSaturnGame(false);
      setPlanet("uranus");
      setShowPlanetCinematic(true);
    }, 2000);
  }, [triggerPlanetCelebration]);

  const handleUranusComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(8);
    setTimeout(() => {
      setShowUranusGame(false);
      setPlanet("neptune");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const handleNeptuneComplete = () => {
    triggerPlanetCelebration();
    unlockLevel(9);
    setTimeout(() => {
      setShowNeptuneGame(false);
      setPlanet("boss");
      setShowPlanetCinematic(true);
    }, 2000);
  };

  const isReactOverlayActive =
    showVenusGame ||
    showMarsPuzzle ||
    showUranusGame ||
    showNeptuneGame ||
    showJupiterGame ||
    showSaturnGame ||
    showEarthCinematic ||
    showEarthGame ||
    showMarsCinematic ||
    showEarthCongratulation ||
    showPlanetCinematic;

  return (
    <div className="relative h-dvh w-screen overflow-hidden bg-gray-950">
      {showSoundGate && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 rounded-lg border border-white/20 bg-white/5 px-6 py-5 text-center shadow-lg">
            <p className="font-['Press_Start_2P'] text-xs text-white tracking-wide">
              ENABLE SOUND?
            </p>
            <button
              onClick={handleEnableSound}
              className="rounded-md border border-green-400 bg-green-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 active:translate-y-px"
            >
              Enable
            </button>
          </div>
        </div>
      )}
      {appState === "menu" && (
        <MainMenu
          onPlay={() => {
            setAppState("levels");
          }}
          isMuted={audioMuted}
          onToggleMute={() => {
            const nowMuted = toggleMute();
            setAudioMuted(nowMuted);
          }}
        />
      )}
      {appState === "levels" && (
        <LevelSelection
          onLevelSelect={handleLevelSelect}
          onBack={() => setAppState("menu")}
        />
      )}
      {appState === "playing" && (
        <>
          <div className={isReactOverlayActive ? "hidden" : "contents"}>
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
                const STORAGE_KEY = "planetaria_progress";
                const stored = localStorage.getItem(STORAGE_KEY);
                const progress = stored ? JSON.parse(stored) : {};
                return !!progress[4];
              })()}
            />
          )}
          {showMarsCinematic && (
            <MarsIntroCinematic
              onComplete={handleMarsCinematicComplete}
              canSkip={(() => {
                const STORAGE_KEY = "planetaria_progress";
                const stored = localStorage.getItem(STORAGE_KEY);
                const progress = stored ? JSON.parse(stored) : {};
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
          {showSaturnGame && (
            <SaturnGame
              onComplete={handleSaturnComplete}
              onBack={() => setShowSaturnGame(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default App;
