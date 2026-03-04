import React, { useState, useEffect, useCallback, useRef } from "react";
import "./MarsIntroCinematic.css";

interface MarsIntroCinematicProps {
  onComplete: () => void;
  canSkip?: boolean;
}

const DIALOGUE_BEATS = [
  {
    text: "Approaching the Red Planet... Mars. Wait, look at the sensor readings!",
    delay: 2500,
  },
  {
    text: "The Void Devourer's energy is everywhere. It's tearing the planet's data apart!",
    delay: 3000,
    glitch: true,
  },
  {
    text: "The Planetary Core has been SHATTERED. We must find the pieces in the desert.",
    delay: 3000,
    shatter: true,
  },
  {
    text: "System Alert: Communications scrambled. Words are failing us!",
    delay: 3500,
    scramble: true,
  },
  {
    text: "We have to unscramble the data and rebuild the core before it's too late!",
    delay: 3000,
    approach: true,
  },
];

export const MarsIntroCinematic: React.FC<MarsIntroCinematicProps> = ({
  onComplete,
  canSkip = false,
}) => {
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isShattering, setIsShattering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
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

      // Drive a cinematic, reactive Mars score arc by narrative beat.
      if (currentBeatIndex === 0) {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "tension" },
          })
        );
      }
      if (beat.glitch) {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "tension" },
          })
        );
        window.dispatchEvent(
          new CustomEvent("audio-intensity", {
            detail: { situation: "tension", intensity: 0.62 },
          })
        );
      }
      if (beat.shatter) {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "climax", immediate: true },
          })
        );
        window.dispatchEvent(
          new CustomEvent("audio-intensity", {
            detail: { situation: "climax", intensity: 0.9 },
          })
        );
      }
      if (beat.scramble) {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "tension" },
          })
        );
        window.dispatchEvent(
          new CustomEvent("audio-intensity", {
            detail: { situation: "tension", intensity: 0.66 },
          })
        );
      }
      if (beat.approach) {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "tension" },
          })
        );
        window.dispatchEvent(
          new CustomEvent("audio-intensity", {
            detail: { situation: "tension", intensity: 0.7 },
          })
        );
      }

      if (beat.glitch) setIsGlitching(true);
      if (beat.shatter) setIsShattering(true);
      if (beat.scramble) setIsScrambling(true);
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
    window.dispatchEvent(
      new CustomEvent("audio-transition", {
        detail: { situation: "tension" },
      })
    );
    setTimeout(() => {
      onComplete();
    }, 1500);
  };

  const handleSkip = () => {
    if (canSkip) onComplete();
  };

  return (
    <div className={`mars-cinematic-container ${isFinishing ? "finish-fade" : ""} ${isGlitching ? "glitch-active" : ""}`}>
      {/* Letterboxing */}
      <div className="cinematic-letterbox top" />
      <div className="cinematic-letterbox bottom" />

      {/* Background Starfield & Nebula */}
      <div className="mars-cinematic-bg" />
      <div className="red-anamorphic-flare" />

      {/* Chapter Titles */}
      <div className="mars-chapter-title">
        <h1 className="mars-cinematic-title-text">MARS</h1>
        <p className="mars-cinematic-subtitle-text">The Red Puzzle</p>
      </div>

      {/* Main Visuals */}
      <div className="mars-visual-stage">
        <div className={`mars-ship-container ${isApproaching ? "mars-approaching" : ""}`}>
          <img
            src="assets/ui/riding_ss_astra.png"
            alt="S.S. Astra"
            className="mars-ship-sprite"
          />
        </div>

        <div className="mars-planet-container">
          <img
            src="assets/ui/mars.png"
            alt="Mars"
            className={`mars-sprite ${isGlitching ? "mars-glitch" : ""}`}
          />
          {isShattering && (
            <div className="core-shards-container">
              <img src="assets/mars/mars_tore_pieces.png" alt="Shattered Core" className="core-shards" />
            </div>
          )}
        </div>
      </div>

      {/* Interface Elements */}
      <div className="mars-hud-overlay">
        <div className="mars-hud-scanner" />
        <div className="mars-hud-data-left">
          <div className="mars-hud-line">[ MARS_SECTOR_ENTRY ]</div>
          <div className="mars-hud-line">
            [ CORE_STATUS: {isShattering ? "FRACTURED" : "STABLE"} ]
          </div>
          <div className="mars-hud-line">
            [ DATA_INTEGRITY: {isScrambling ? "SCRAMBLED" : "100%"} ]
          </div>
        </div>
      </div>

      <div className="mars-dialogue-area">
        <div className="mars-dialogue-box">
          <div className="mars-dialogue-speaker">ASTRA_AI // MARS_ORBIT_LOG</div>
          <div className={`mars-dialogue-text ${isTyping ? "is-typing" : ""} ${isScrambling ? "scrambled-font" : ""}`}>
            {displayText}
          </div>
        </div>
        {canSkip && <div className="mars-skip-hint">PRESS TO SKIP INTRO</div>}
      </div>

      {canSkip && (
        <button
          onClick={handleSkip}
          className="mars-skip-hitbox"
          aria-label="Skip"
        />
      )}
    </div>
  );
};
