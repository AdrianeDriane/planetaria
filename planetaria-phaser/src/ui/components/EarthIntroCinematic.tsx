import React, { useState, useEffect, useCallback, useRef } from "react";
import "./EarthIntroCinematic.css";

interface EarthIntroCinematicProps {
  onComplete: () => void;
  canSkip?: boolean;
}

const DIALOGUE_BEATS = [
  {
    text: "Captain! We have reached Earth. This is our beautiful home!",
    delay: 2500,
  },
  {
    text: "Oh no! The purple shadow is blocking the sun. Everything is getting dark and quiet.",
    delay: 3000,
  },
  {
    text: "We have to act fast! The plants, animals, and people need our help.",
    delay: 3000,
    approach: true,
  },
  {
    text: "Let's find the things that make Earth special, like our blue water and fresh air.",
    delay: 3500,
  },
  {
    text: "Starting the scan now! Let's save our planet together!",
    delay: 3000,
    signal: true,
  },
];

export const EarthIntroCinematic: React.FC<EarthIntroCinematicProps> = ({
  onComplete,
  canSkip = false,
}) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSignal, setShowSignal] = useState(false);
  const [isApproaching, setIsApproaching] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

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
    if (currentBeatIndex < DIALOGUE_BEATS.length) {
      const beat = DIALOGUE_BEATS[currentBeatIndex];
      typeText(beat.text);

      if (beat.signal) setShowSignal(true);
      if (beat.approach) setIsApproaching(true);

      const timer = setTimeout(
        () => {
          if (currentBeatIndex === DIALOGUE_BEATS.length - 1) {
            finishCinematic();
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
  }, [currentBeatIndex, typeText]);

  const finishCinematic = () => {
    setIsFinishing(true);
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleSkip = () => {
    if (canSkip) onComplete();
  };

  return (
    <div className={`cinematic-container ${isFinishing ? "finish-fade" : ""}`}>
      {/* Letterboxing */}
      <div className="cinematic-letterbox top" />
      <div className="cinematic-letterbox bottom" />

      {/* Background Starfield */}
      <div className="cinematic-bg" />
      <div className="anamorphic-flare" />

      {/* Chapter Titles */}
      <div className="chapter-title">
        <h1 className="cinematic-title-text">EARTH</h1>
        <p className="cinematic-subtitle-text">The Living Planet</p>
      </div>

      {/* Main Visuals */}
      <div className="visual-stage">
        <div className={`ship-container ${isApproaching ? "approaching" : ""}`}>
          <img
            src="assets/ui/riding_ss_astra.png"
            alt="S.S. Astra"
            className="ship-sprite"
          />
          {showSignal && (
            <div className="signal-container">
              <div className="signal-ring ring-1" />
              <div className="signal-ring ring-2" />
              <div className="signal-ring ring-3" />
            </div>
          )}
        </div>

        <div className="earth-container">
          <img
            src="assets/ui/earth_choked.png"
            alt="Corrupted Earth"
            className="earth-choked"
          />
        </div>
      </div>

      {/* Interface Elements */}
      <div className="hud-overlay">
        <div className="hud-scanner" />
        <div className="hud-data-left">
          <div className="hud-line">[ HOME_WORLD_SCAN ]</div>
          <div className="hud-line">
            [ SIGNAL_STATUS: {showSignal ? "ACTIVE" : "STANDBY"} ]
          </div>
        </div>
      </div>

      <div className="dialogue-area">
        <div className="dialogue-box">
          <div className="dialogue-speaker">ASTRA_AI // MISSION_LOG</div>
          <div className={`dialogue-text ${isTyping ? "is-typing" : ""}`}>
            {displayText}
          </div>
        </div>
        {canSkip && <div className="skip-hint">PRESS TO SKIP INTRO</div>}
      </div>

      {canSkip && (
        <button
          onClick={handleSkip}
          className="skip-hitbox"
          aria-label="Skip"
        />
      )}
    </div>
  );
};
