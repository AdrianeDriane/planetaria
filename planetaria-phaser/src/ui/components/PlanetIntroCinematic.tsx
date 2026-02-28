import React, { useState, useEffect, useCallback, useRef } from "react";
import "./PlanetIntroCinematic.css";

interface PlanetIntroCinematicProps {
  planet: string; // 'venus' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'
  onComplete: () => void;
}

interface PlanetData {
  title: string;
  subtitle: string;
  beats: { text: string; delay: number; action?: string }[];
  accentColor: string;
  asset: string;
  hudInfo: string[];
  twistClass: string;
}

const PLANET_CONFIGS: Record<string, PlanetData> = {
  mercury: {
    title: "MERCURY",
    subtitle: "The Barren Crash Site",
    accentColor: "#a5a5a5",
    asset: "assets/ui/mercury.png",
    twistClass: "crash-impact",
    hudInfo: ["SHIELDS: 0%", "HULL: CRITICAL", "STATUS: CRASHED"],
    beats: [
      {
        text: "Log: Emergency! A shockwave from the Void has struck the Astra!",
        delay: 3000,
        action: "ship-shake",
      },
      {
        text: "We're losing control... pulling into Mercury's gravity well!",
        delay: 3500,
        action: "ship-tilt",
      },
      {
        text: "Brace for impact! The journey begins with a hard landing.",
        delay: 3000,
        action: "impact-flash",
      },
    ],
  },
  venus: {
    title: "VENUS",
    subtitle: "The Acid Haze",
    accentColor: "#ffcc33",
    asset: "assets/ui/venus.png",
    twistClass: "acid-haze",
    hudInfo: ["TEMP: 462┬░C", "ATMOS: SULFURIC ACID", "PRESSURE: EXTREME"],
    beats: [
      {
        text: "Entering Venus orbit. The heat is already testing our shields.",
        delay: 3000,
      },
      {
        text: "The acid clouds are so thick... we can't see the surface.",
        delay: 3500,
        action: "cloud-surge",
      },
      {
        text: "Deploying the telescope. We must peer through the haze.",
        delay: 3000,
      },
    ],
  },
  jupiter: {
    title: "JUPITER",
    subtitle: "The Giant's Secret",
    accentColor: "#ffaa88",
    asset: "assets/ui/jupiter.png",
    twistClass: "gravity-pull",
    hudInfo: ["MASS: 318 EARTHS", "GRAVITY: 2.4x", "STORM_STATUS: ACTIVE"],
    beats: [
      {
        text: "Approaching the Gas Giant. Feel that gravitational pull!",
        delay: 3000,
        action: "ship-tilt",
      },
      {
        text: "The Great Red Spot is right below us. It's a storm larger than Earth.",
        delay: 4000,
      },
      {
        text: "The core is buried deep. We must scan the swirling clouds.",
        delay: 3000,
      },
    ],
  },
  saturn: {
    title: "SATURN",
    subtitle: "The Ringless Wonder",
    accentColor: "#ead6b0",
    asset: "assets/ui/saturn.png",
    twistClass: "dust-drift",
    hudInfo: ["RINGS: MISSING", "MOONS: 82", "DENSITY: < WATER"],
    beats: [
      { text: "Saturn... but something is terribly wrong.", delay: 3000 },
      {
        text: "The Void Devourer has stripped the rings! Only dust and ice remain.",
        delay: 4000,
        action: "ring-fragment-float",
      },
      {
        text: "We must collect the fragments and restore the planet's glory.",
        delay: 3500,
      },
    ],
  },
  uranus: {
    title: "URANUS",
    subtitle: "The Sideways Planet",
    accentColor: "#aaffff",
    asset: "assets/ui/uranus.png",
    twistClass: "frozen-tilt",
    hudInfo: ["TILT: 98┬░", "TEMP: -224┬░C", "TYPE: ICE GIANT"],
    beats: [
      {
        text: "Arriving at the Sideways Planet. It's freezing out here.",
        delay: 3000,
        action: "hud-freeze",
      },
      {
        text: "Uranus has been knocked further off its tilt. It's wildly unstable.",
        delay: 4000,
      },
      {
        text: "Stabilize the rotation. We need to find the hidden features.",
        delay: 3500,
      },
    ],
  },
  neptune: {
    title: "NEPTUNE",
    subtitle: "Stabilize the Storm",
    accentColor: "#3366ff",
    asset: "assets/ui/neptune.png",
    twistClass: "wind-shear",
    hudInfo: ["WINDS: 2100 KM/H", "DISTANCE: 4.5B KM", "COLOR: METHANE BLUE"],
    beats: [
      {
        text: "The final frontier. Neptune is being torn apart by storms.",
        delay: 3000,
        action: "ship-shake",
      },
      {
        text: "The winds here are the fastest in the solar system.",
        delay: 3500,
      },
      {
        text: "Use the control panel to stabilize the atmosphere. Now!",
        delay: 3000,
      },
    ],
  },
  boss: {
    title: "THE VOID DEVOURER",
    subtitle: "Final Stand at the Edge of the Solar System",
    accentColor: "#ef4444",
    asset: "assets/ui/kirby.png", // placeholder — boss has no planet image
    twistClass: "gravity-pull",
    hudInfo: ["THREAT: MAXIMUM", "CORES: 8/8 ACTIVE", "STATUS: CONVERGENCE"],
    beats: [
      {
        text: "All eight Planetary Cores are online. Their energy is converging...",
        delay: 3500,
        action: "ship-shake",
      },
      {
        text: "Wait — a massive dark signature is emerging at the edge of the Solar System!",
        delay: 4000,
        action: "impact-flash",
      },
      {
        text: "The Void Devourer has manifested. This is our final stand. Everything we've learned... it all comes down to this.",
        delay: 4500,
        action: "ship-tilt",
      },
    ],
  },
};

export const PlanetIntroCinematic: React.FC<PlanetIntroCinematicProps> = ({
  planet,
  onComplete,
}) => {
  const config = PLANET_CONFIGS[planet] || PLANET_CONFIGS.venus;
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);
  const [showButton, setShowButton] = useState(false);

  const typingTimerRef = useRef<NodeJS.Timeout | null>(null);

  const typeText = useCallback((text: string) => {
    if (typingTimerRef.current) clearInterval(typingTimerRef.current);

    setIsTyping(true);
    setDisplayText("");
    let i = 0;

    typingTimerRef.current = setInterval(() => {
      setDisplayText(text.substring(0, i + 1));
      i++;
      if (i >= text.length) {
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
        setIsTyping(false);
      }
    }, 30);
  }, []);

  useEffect(() => {
    if (currentBeatIndex < config.beats.length) {
      const beat = config.beats[currentBeatIndex];
      typeText(beat.text);
      if (beat.action) setCurrentAction(beat.action);

      const timer = setTimeout(
        () => {
          if (currentBeatIndex === config.beats.length - 1) {
            setShowButton(true);
          } else {
            setCurrentBeatIndex(currentBeatIndex + 1);
          }
        },
        beat.delay + beat.text.length * 30
      );

      return () => {
        clearTimeout(timer);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      };
    }
  }, [currentBeatIndex, config.beats, typeText]);

  const handleStart = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  return (
    <div
      className={`planet-cinematic-container ${planet}-theme ${isFinishing ? "fade-out" : ""}`}
    >
      {/* Letterboxing */}
      <div className="cinematic-letterbox top" />
      <div className="cinematic-letterbox bottom" />

      {/* Dynamic Background */}
      <div className={`planet-cinematic-bg ${config.twistClass}`} />
      <div
        className="planet-flare"
        style={{ backgroundColor: config.accentColor }}
      />

      {/* Chapter Titles */}
      <div className="planet-chapter-title">
        <h1
          className="planet-title-text"
          style={{ textShadow: `0 0 20px ${config.accentColor}` }}
        >
          {config.title}
        </h1>
        <p
          className="planet-subtitle-text"
          style={{ color: config.accentColor }}
        >
          {config.subtitle}
        </p>
      </div>

      {/* Visual Stage */}
      <div
        className={`planet-visual-stage ${currentAction === "impact-flash" ? "impact-flash" : ""}`}
      >
        <div
          className={`planet-ship-container ${currentAction === "ship-tilt" ? "tilted" : ""} ${currentAction === "ship-shake" ? "shaking" : ""}`}
        >
          <img
            src="assets/ui/riding_ss_astra.png"
            alt="S.S. Astra"
            className="planet-ship-sprite"
          />
        </div>

        <div className="planet-hero-container">
          <img
            src={config.asset}
            alt={config.title}
            className={`planet-hero-sprite ${currentAction === "cloud-surge" ? "surging" : ""}`}
          />
          {currentAction === "ring-fragment-float" && (
            <div className="dust-particles" />
          )}
          {currentAction === "hud-freeze" && <div className="frost-overlay" />}
        </div>
      </div>

      {/* HUD Overlay */}
      <div className="planet-hud-overlay">
        <div className="planet-hud-data-left">
          {config.hudInfo.map((info, idx) => (
            <div
              key={idx}
              className="hud-info-line"
              style={{ color: config.accentColor }}
            >
              {`[ ${info} ]`}
            </div>
          ))}
        </div>
        <div
          className="planet-hud-scanner"
          style={{ borderBottomColor: config.accentColor }}
        />
      </div>

      {/* Dialogue Area */}
      <div className="planet-dialogue-area">
        <div
          className="planet-dialogue-box"
          style={{ borderLeftColor: config.accentColor }}
        >
          <div
            className="planet-dialogue-speaker"
            style={{ color: config.accentColor }}
          >
            ASTRA_AI // {config.title}_LOG
          </div>
          <div
            className={`planet-dialogue-text ${isTyping ? "is-typing" : ""}`}
          >
            {displayText}
          </div>
        </div>

        {showButton && (
          <button
            className="planet-start-button"
            onClick={handleStart}
            style={{
              borderColor: config.accentColor,
              color: config.accentColor,
            }}
          >
            INITIATE MISSION
          </button>
        )}
      </div>
    </div>
  );
};
