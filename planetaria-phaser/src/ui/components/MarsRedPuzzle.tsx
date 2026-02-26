import { useState, useCallback, useEffect, useRef } from "react";
import "./MarsRedPuzzle.css";

// ─── Data ────────────────────────────────────────────────────────────────────
interface Level {
  scramble: string;
  answer: string;
  trivia: string;
  pieceKey: "tl" | "tr" | "bl" | "br";
  targetPos: { x: number; y: number };
}

const LEVELS: Level[] = [
  {
    scramble: "E D R",
    answer: "RED",
    trivia:
      "Mars is called the Red Planet because its surface appears red-yellow due to iron oxide in the soil and dust that covers most of the planet.",
    pieceKey: "tl",
    targetPos: { x: 0, y: 0 },
  },
  {
    scramble: "O W T",
    answer: "TWO",
    trivia: "Mars has two moons.",
    pieceKey: "tr",
    targetPos: { x: 50, y: 0 },
  },
  {
    scramble: "R U O F T H",
    answer: "FOURTH",
    trivia: "Mars is the fourth planet from the Sun.",
    pieceKey: "bl",
    targetPos: { x: 0, y: 50 },
  },
  {
    scramble: "L O V A C N O",
    answer: "VOLCANO",
    trivia:
      "Mars has the largest volcano in the solar system, called Olympus Mons.",
    pieceKey: "br",
    targetPos: { x: 50, y: 50 },
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
interface MarsRedPuzzleProps {
  onComplete?: () => void;
}

type GamePhase =
  | "intro"
  | "init"
  | "scramble"
  | "trivia"
  | "assembly"
  | "restored";

export const MarsRedPuzzle: React.FC<MarsRedPuzzleProps> = ({ onComplete }) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
  const [builtWord, setBuiltWord] = useState("");
  const [solvedPieces, setSolvedPieces] = useState<string[]>([]);

  // UI States
  const [isWrong, setIsWrong] = useState(false);
  const [isBoardShaking, setIsBoardShaking] = useState(false);
  const [assemblyError, setAssemblyError] = useState<string | null>(null);
  const [scrambleText, setScrambleText] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Drag State
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [piecePos, setPiecePos] = useState({ x: 0, y: 0 });

  const boardRef = useRef<HTMLDivElement>(null);
  const pieceRef = useRef<HTMLDivElement>(null);

  const level = LEVELS[currentLevel];
  const letters = level.scramble.split(" ");

  const showFeedback = useCallback(() => {
    const messages = [
      "GREAT JOB!",
      "GOOD JOB!",
      "AWESOME!",
      "NICE!",
      "FANTASTIC!",
    ];
    const msg = messages[Math.floor(Math.random() * messages.length)];
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 1500);
  }, []);

  // ─── Intro Logic ────────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "intro") {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*";
      let iterations = 0;
      const interval = setInterval(() => {
        let text = "";
        for (let i = 0; i < 20; i++) {
          text += chars[Math.floor(Math.random() * chars.length)];
        }
        setScrambleText(text);
        iterations++;
        if (iterations > 30) {
          clearInterval(interval);
          setPhase("init");
        }
      }, 50);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // ─── Scramble Logic ──────────────────────────────────────────────────────
  const handleLetterClick = useCallback(
    (index: number) => {
      if (selectedLetters.includes(index) || phase !== "scramble") return;

      const newSelected = [...selectedLetters, index];
      const newWord = builtWord + letters[index];

      setSelectedLetters(newSelected);
      setBuiltWord(newWord);

      if (newWord.length === level.answer.length) {
        if (newWord === level.answer) {
          showFeedback();
          setPhase("trivia");
        } else {
          setIsWrong(true);
          setTimeout(() => {
            setIsWrong(false);
            setSelectedLetters([]);
            setBuiltWord("");
          }, 600);
        }
      }
    },
    [selectedLetters, builtWord, letters, level, phase, showFeedback]
  );

  const handleUndo = useCallback(() => {
    if (selectedLetters.length === 0) return;
    setSelectedLetters((prev) => prev.slice(0, -1));
    setBuiltWord((prev) => prev.slice(0, -1));
  }, [selectedLetters]);

  // ─── Drag & Drop Assembly Logic ──────────────────────────────────────────
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "assembly" || !pieceRef.current) return;
    const target = pieceRef.current;
    const rect = target.getBoundingClientRect();

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setPiecePos({
      x: rect.left,
      y: rect.top,
    });
    target.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPiecePos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const onPointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (boardRef.current && pieceRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const pieceRect = pieceRef.current.getBoundingClientRect();

      const relativeX = pieceRect.left - boardRect.left;
      const relativeY = pieceRect.top - boardRect.top;

      const percentX = (relativeX / boardRect.width) * 100;
      const percentY = (relativeY / boardRect.height) * 100;

      const target = level.targetPos;
      const tolerance = 15;

      if (
        Math.abs(percentX - target.x) < tolerance &&
        Math.abs(percentY - target.y) < tolerance
      ) {
        // Success
        showFeedback();
        setSolvedPieces((prev) => [...prev, level.pieceKey]);
        setAssemblyError(null);

        if (currentLevel < LEVELS.length - 1) {
          setCurrentLevel((prev) => prev + 1);
          setSelectedLetters([]);
          setBuiltWord("");
          setPhase("scramble");
        } else {
          setShowCelebration(true); // Trigger celebration before final screen
          setTimeout(() => {
            setPhase("restored");
          }, 3000); // 3s of celebration
        }
      } else {
        triggerShake();
      }
    }
    setPiecePos({ x: 0, y: 0 });
  };

  const triggerShake = () => {
    setIsBoardShaking(true);
    setAssemblyError("ALIGNMENT FAILED: COORDINATES MISMATCH");
    setTimeout(() => {
      setIsBoardShaking(false);
      setAssemblyError(null);
    }, 800);
  };

  // ─── Board Rendering Helper ──────────────────────────────────────────────
  const renderBoardContent = () => {
    const count = solvedPieces.length;

    return (
      <div className="mars-board-grid">
        {/* Quadrant Layers: Only show if NOT covered by a composite */}
        <div className="board-quadrant tl">
          {solvedPieces.includes("tl") && count < 2 && (
            <img src="assets/mars/mars_ptl.png" className="quadrant-img" />
          )}
        </div>
        <div className="board-quadrant tr">
          {solvedPieces.includes("tr") && count < 2 && (
            <img src="assets/mars/mars_ptr.png" className="quadrant-img" />
          )}
        </div>
        <div className="board-quadrant bl">
          {solvedPieces.includes("bl") && count < 3 && (
            <img src="assets/mars/mars_pbl.png" className="quadrant-img" />
          )}
        </div>
        <div className="board-quadrant br">
          {solvedPieces.includes("br") && count < 3 && (
            <img src="assets/mars/mars_pbr.png" className="quadrant-img" />
          )}
        </div>

        {/* Composite Layers: Seamlessly combine pieces */}
        {count === 2 && (
          <img src="assets/mars/mars_tltr.png" className="composite-half" />
        )}
        {count === 3 && (
          <img
            src="assets/mars/mars_tltrbr.png"
            className="composite-full-three-quarters"
          />
        )}
        {count >= 4 && (
          <img src="assets/ui/mars.png" className="composite-full" />
        )}

        <div className="board-grid-lines" />
      </div>
    );
  };

  // ─── Render: Win State ──────────────────────────────────────────────────
  if (phase === "restored") {
    return (
      <div className="mars-puzzle-root">
        <div className="mars-bg" />
        <div className="mars-win-container">
          <div className="mars-planet-assembled mars-fade-in">
            <img
              src="assets/ui/mars.png"
              alt="Mars Restored"
              className="mars-full-fit"
            />
          </div>
          <div className="mars-terminal-content win-content">
            <h2 className="celebration-title">PLANETARY CORE REACTIVATED</h2>
            <div
              className="mars-summary-list"
              style={{
                fontSize: "10px",
                textAlign: "left",
                lineHeight: "1.6",
                marginTop: "10px",
              }}
            >
              <div>
                • Thin atmosphere: mostly carbon dioxide, small amounts of
                oxygen and nitrogen.
              </div>
              <div>• Two irregularly shaped moons: Phobos and Deimos.</div>
              <div>• Rotation: 24 hours and 37 minutes.</div>
              <div>• Revolution: 687 days.</div>
              <div>• Once believed to have water.</div>
              <div>• Gravity: about 2/5 of Earth's.</div>
            </div>
            <button className="mars-next-btn warp-btn" onClick={onComplete}>
              PROCEED TO JUPITER
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Intro ──────────────────────────────────────────────────────
  if (phase === "intro") {
    return (
      <div className="mars-puzzle-root">
        <div className="mars-bg" />
        <div className="mars-intro-overlay">
          <div className="scramble-container">
            <h2 className="scramble-title">ESTABLISHING LINK</h2>
            <div className="scramble-text">{scrambleText}</div>
            <div className="scramble-bar">
              <div className="scramble-progress" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Render: Main Game ──────────────────────────────────────────────────
  return (
    <div className="mars-puzzle-root">
      <div className={`mars-bg ${isBoardShaking ? "bg-shake" : ""}`} />

      {successMessage && (
        <div className="success-toast-overlay">
          <div className="success-toast-text">{successMessage}</div>
        </div>
      )}

      {showCelebration && (
        <div className="celebration-overlay">
          <div className="confetti-container">
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} className="confetti" />
            ))}
          </div>
          <h1 className="celebration-text">GREAT JOB!</h1>
        </div>
      )}

      <div className="mars-centered-layout">
        <div className="mars-left-column">
          <div className="mars-status-header">
            <div className="mars-terminal-header">
              <span className="mars-blink">&gt;</span>
              {phase === "init"
                ? "SYSTEM STATUS"
                : phase === "assembly"
                  ? "INITIATE FUSION"
                  : "DATA DECRYPTION"}
            </div>
          </div>

          {/* ─── ASSEMBLY BOARD ─── */}
          <div
            ref={boardRef}
            className={`mars-assembly-board ${isBoardShaking ? "shake-hard" : ""}`}
          >
            {renderBoardContent()}

            {phase === "assembly" && (
              <div
                className="ghost-target-indicator"
                style={{
                  left: `${level.targetPos.x}%`,
                  top: `${level.targetPos.y}%`,
                }}
              />
            )}
          </div>

          {assemblyError && (
            <div className="mars-error-toast">{assemblyError}</div>
          )}
        </div>

        {/* ─── Interaction Panel (Right Column) ─── */}
        <div className="mars-right-column">
          <div className="mars-interaction-panel">
            {phase === "init" && (
              <div className="mars-terminal-init">
                <p className="mars-terminal-alert">
                  SYSTEM CRITICAL:
                  <br />
                  MARS CORE FRAGMENTED.
                </p>
                <button
                  className="mars-next-btn"
                  onClick={() => setPhase("scramble")}
                >
                  START DECRYPTION
                </button>
              </div>
            )}

            {phase === "scramble" && (
              <div className="mars-scramble-controls">
                <div className="mars-terminal-sub">
                  DECRYPT FRAGMENT {currentLevel + 1}
                </div>
                <div className="mars-word-display">
                  <div className={`mars-word-slots ${isWrong ? "shake" : ""}`}>
                    {Array.from({ length: level.answer.length }).map((_, i) => (
                      <div key={i} className="mars-word-slot">
                        {builtWord[i] || "_"}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mars-letter-grid">
                  {letters.map((letter, i) => {
                    const isUsed = selectedLetters.includes(i);
                    return (
                      <button
                        key={i}
                        className={`mars-letter-tile ${isUsed ? "used" : ""}`}
                        disabled={isUsed}
                        onClick={() => handleLetterClick(i)}
                      >
                        <img
                          src="assets/mars/letter_tile.png"
                          alt=""
                          className="mars-tile-bg"
                        />
                        <span className="mars-tile-letter">{letter}</span>
                      </button>
                    );
                  })}
                </div>
                <button className="mars-undo-btn" onClick={handleUndo}>
                  &#x2190; UNDO
                </button>
              </div>
            )}

            {phase === "trivia" && (
              <div className="mars-trivia-reveal">
                <div className="mars-trivia-word">&#x2713; {level.answer}</div>
                <p className="mars-trivia-text">{level.trivia}</p>
                <button
                  className="mars-next-btn"
                  onClick={() => setPhase("assembly")}
                >
                  RETRIEVE DATA
                </button>
              </div>
            )}

            {phase === "assembly" && (
              <div className="mars-assembly-panel">
                <p className="mars-assembly-instr">
                  DRAG FRAGMENT TO COMBINE WITH MAIN SEQUENCE
                </p>
                <div className="held-piece-area">
                  <div
                    ref={pieceRef}
                    className={`draggable-piece ${isDragging ? "dragging" : ""}`}
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    style={{
                      position: isDragging ? "fixed" : "relative",
                      left: isDragging ? piecePos.x : 0,
                      top: isDragging ? piecePos.y : 0,
                      zIndex: 1000,
                      touchAction: "none",
                      width: "var(--mars-piece-size)",
                      height: "var(--mars-piece-size)",
                    }}
                  >
                    <img
                      src={`assets/mars/mars_p${level.pieceKey}.png`}
                      alt="Fragment"
                      className="mars-piece-img"
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                      }}
                    />
                    <div className="drag-handle" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarsRedPuzzle;
