import React, { useState, useEffect, useCallback, useRef } from "react";
import "./EarthCongratulationCinematic.css";

interface EarthCongratulationCinematicProps {
  onComplete: () => void;
}

const DIALOGUE_BEATS = [
  {
    text: "The shadow has lifted. Can you hear it, Captain?",
    delay: 3000,
  },
  {
    text: "The silence of the Void is gone. Earth is breathing again.",
    delay: 3500,
    majestic: true,
  },
  {
    text: "Every life, every ocean, every forest... they owe their future to you.",
    delay: 4000,
  },
  {
    text: "But the journey isn't over. Mars is calling. The Red Planet is next.",
    delay: 3500,
    warpReady: true,
  },
];

export const EarthCongratulationCinematic: React.FC<EarthCongratulationCinematicProps> = ({
  onComplete,
}) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isMajestic, setIsMajestic] = useState(false);
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
    }, 40);
  }, []);

  useEffect(() => {
    if (currentBeatIndex < DIALOGUE_BEATS.length) {
      const beat = DIALOGUE_BEATS[currentBeatIndex];
      typeText(beat.text);

      if (beat.majestic) setIsMajestic(true);

      const timer = setTimeout(
        () => {
          if (currentBeatIndex === DIALOGUE_BEATS.length - 1) {
            setShowButton(true);
          } else {
            setCurrentBeatIndex(currentBeatIndex + 1);
          }
        },
        beat.delay + beat.text.length * 40
      );

      return () => {
        clearTimeout(timer);
        if (typingTimerRef.current) clearInterval(typingTimerRef.current);
      };
    }
  }, [currentBeatIndex, typeText]);

  const handleWarp = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onComplete();
    }, 2000);
  };

  return (
    <div className={`congrat-container ${isFinishing ? "warp-flash" : ""}`}>
      {/* Cinematic Letterboxing */}
      <div className="cinematic-letterbox top" />
      <div className="cinematic-letterbox bottom" />

      {/* Background & Atmosphere */}
      <div className="congrat-bg" />
      <div className="majestic-flare" />
      <div className="star-particles" />

      {/* Main Visuals */}
      <div className="congrat-visual-stage">
        <div className={`earth-hero-container ${isMajestic ? "majestic-zoom" : ""}`}>
          <img
            src="assets/ui/earth.png"
            alt="Earth Restored"
            className="earth-hero-sprite"
          />
          <div className="earth-glow-aura" />
        </div>

        <div className={`congrat-ship-container ${isFinishing ? "ship-blast-off" : ""}`}>
          <img
            src="assets/ui/riding_ss_astra.png"
            alt="S.S. Astra"
            className="congrat-ship-sprite"
          />
          <div className="engine-glow" />
        </div>
      </div>

      {/* Hero Text Overlay */}
      <div className="hero-title-area">
          <h1 className="hero-main-title">EARTH RESTORED</h1>
          <p className="hero-sub-title">CORE STATUS: OPTIMAL // LIFE SIGNATURES: RECOVERED</p>
      </div>

      {/* Dialogue Area */}
      <div className="congrat-dialogue-area">
        <div className="congrat-dialogue-box">
          <div className="congrat-dialogue-speaker">ASTRA_AI // MISSION_SUCCESS_LOG</div>
          <div className="congrat-dialogue-text">
            {displayText}
            <span className={`cursor ${isTyping ? "typing" : ""}`}>_</span>
          </div>
        </div>
        
        {showButton && (
            <button className="warp-button" onClick={handleWarp}>
                <span className="warp-button-text">INITIATE WARP TO MARS</span>
                <div className="warp-button-glimmer" />
            </button>
        )}
      </div>

      {/* Navigation Hint */}
      <div className="sector-status">
          <div className="status-line">[ SECTOR: SOL_03 ]</div>
          <div className="status-line">[ STATUS: SECURE ]</div>
          <div className="status-line">[ NEXT_TARGET: MARS ]</div>
      </div>
    </div>
  );
};
