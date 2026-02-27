import { useState, useCallback, useEffect, useRef, type CSSProperties } from "react";

// ─── Types & Data ────────────────────────────────────────────────────────────
interface PuzzlePiece {
  id: number;
  row: number;
  col: number;
  label: string;
  trivia: string;
}

const COLS = 4;
const ROWS = 2;
const FONT = `"Press Start 2P", monospace`;
const GOLD = "#ffc040";
const GOLD_DIM = "rgba(255, 192, 64, 0.4)";

const PUZZLE_PIECES: PuzzlePiece[] = [
  { id: 0, row: 0, col: 0, label: "SIZE", trivia: "Jupiter is the largest gaseous planet in the solar system — over 1,300 Earths could fit inside it." },
  { id: 1, row: 0, col: 1, label: "GRAVITY", trivia: "Jupiter has a strong gravitational pull — about 2.4 times Earth's surface gravity." },
  { id: 2, row: 0, col: 2, label: "ATMOSPHERE", trivia: "Jupiter's atmosphere is composed of hydrogen, helium, methane, ammonia, and water vapor." },
  { id: 3, row: 0, col: 3, label: "RINGS", trivia: "Jupiter has a faint ring system, first discovered by the Voyager 1 spacecraft in 1979." },
  { id: 4, row: 1, col: 0, label: "STORM", trivia: "The Great Red Spot is a massive storm on Jupiter that has been raging for over 300 years." },
  { id: 5, row: 1, col: 1, label: "MOONS", trivia: "Jupiter has at least 63 known moons, including the four large Galilean moons: Io, Europa, Ganymede, and Callisto." },
  { id: 6, row: 1, col: 2, label: "ROTATION", trivia: "Jupiter rotates faster than any other planet — one full spin takes only 9 hours and 56 minutes." },
  { id: 7, row: 1, col: 3, label: "ORBIT", trivia: "Jupiter takes about 12 Earth years to complete one revolution around the Sun." },
];

// ─── Keyframes (can't be inline) ─────────────────────────────────────────────
const KEYFRAMES = `
@import url("https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap");
@keyframes jup-bg-pan { from{background-position:0% 50%} to{background-position:100% 50%} }
@keyframes jup-shake { 10%,90%{transform:translate(-1px,0)} 20%,80%{transform:translate(2px,0)} 30%,50%,70%{transform:translate(-4px,0)} 40%,60%{transform:translate(4px,0)} }
@keyframes jup-blink { 50%{opacity:0} }
@keyframes jup-pulse { from{opacity:.6} to{opacity:1} }
@keyframes jup-progress { from{width:0} to{width:100%} }
@keyframes jup-pop { from{transform:scale(.5);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes jup-fade-in { from{opacity:0} to{opacity:1} }
@keyframes jup-modal-slide { from{transform:translateY(30px) scale(.95);opacity:0} to{transform:translateY(0) scale(1);opacity:1} }
@keyframes jup-cell-fill { from{transform:scale(.8);opacity:0} to{transform:scale(1);opacity:1} }
@keyframes jup-celeb-pulse { from{transform:scale(1)} to{transform:scale(1.1)} }
@keyframes jup-fade-scale { from{opacity:0;transform:scale(.8)} to{opacity:1;transform:scale(1)} }
@keyframes jup-flash-red { 0%,100%{opacity:1} 50%{opacity:.3} }
@keyframes jup-confetti-fall { to{top:110%;transform:rotate(720deg)} }
@keyframes jup-float { 0%,100%{transform:translate(-50%,-50%) translateY(0px) rotate(-1deg)} 50%{transform:translate(-50%,-50%) translateY(-8px) rotate(1deg)} }
@keyframes jup-ring-pulse { 0%{transform:scale(.2);opacity:.9} 100%{transform:scale(2.4);opacity:0} }
@keyframes jup-orb-in { from{opacity:0;transform:scale(.4)} to{opacity:1;transform:scale(1)} }
@keyframes jup-title-in { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
@keyframes jup-line-in { from{opacity:0;transform:translateX(-18px)} to{opacity:1;transform:translateX(0)} }
@keyframes jup-status-pulse { 0%,100%{opacity:1;color:#ffc040} 50%{opacity:.3;color:#ff8800} }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateScatterPositions(): Record<number, { x: number; y: number }> {
  const zones = [
    { xMin: 2, xMax: 87, yMin: 62, yMax: 88 },
    { xMin: 2, xMax: 14, yMin: 10, yMax: 60 },
    { xMin: 80, xMax: 87, yMin: 10, yMax: 60 },
  ];
  const positions: Record<number, { x: number; y: number }> = {};
  const placed: Array<{ x: number; y: number }> = [];
  for (let id = 0; id < PUZZLE_PIECES.length; id++) {
    let attempts = 0;
    let pos: { x: number; y: number };
    do {
      const zone = zones[Math.floor(Math.random() * zones.length)];
      pos = {
        x: Math.random() * (zone.xMax - zone.xMin) + zone.xMin,
        y: Math.random() * (zone.yMax - zone.yMin) + zone.yMin,
      };
      attempts++;
      const tooClose = placed.some(
        (p) => Math.abs(p.x - pos.x) < 9 && Math.abs(p.y - pos.y) < 9
      );
      if (!tooClose || attempts > 40) break;
    } while (true);
    placed.push(pos);
    positions[id] = pos;
  }
  return positions;
}

/**
 * Render a slice of the puzzle image for a given grid cell.
 * Uses background-image + position:absolute;inset:0 so it fills
 * any parent (grid cell OR fixed-position scattered piece) without
 * needing the parent to have an explicit height for % resolution.
 */
function PieceSlice({ row, col }: { row: number; col: number }) {
  const bgPosX = COLS > 1 ? (col / (COLS - 1)) * 100 : 0;
  const bgPosY = ROWS > 1 ? (row / (ROWS - 1)) * 100 : 0;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "url(/assets/jupiterpuzzle.png)",
        backgroundSize: `${COLS * 100}% ${ROWS * 100}%`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundRepeat: "no-repeat",
      }}
    />
  );
}

// ─── Shared Styles ───────────────────────────────────────────────────────────
const rootStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  height: "100dvh",
  zIndex: 100,
  fontFamily: FONT,
  color: GOLD,
  overflow: "hidden",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const bgBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  backgroundImage: "url(/assets/outerspace.png)",
  backgroundSize: "120%",
  backgroundPosition: "center",
  animation: "jup-bg-pan 30s ease-in-out infinite alternate",
  zIndex: 0,
};

const overlayAfter: CSSProperties = {
  content: '""',
  position: "absolute",
  inset: 0,
  background: "rgba(0,0,0,0.62)",
  zIndex: 1,
  pointerEvents: "none",
};

const btnStyle: CSSProperties = {
  fontFamily: FONT,
  fontSize: "clamp(8px, 1.2vw, 10px)",
  color: "#000",
  background: "linear-gradient(180deg, #ffc040, #e0a020)",
  border: "none",
  borderRadius: 4,
  padding: "10px 20px",
  cursor: "pointer",
  letterSpacing: 1,
};

// ─── Component ───────────────────────────────────────────────────────────────
type GamePhase = "intro" | "playing" | "trivia" | "celebration" | "restored";

interface JupiterGameProps {
  onComplete?: () => void;
}

const JupiterGame: React.FC<JupiterGameProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<GamePhase>("intro");
  const [placedPieces, setPlacedPieces] = useState<number[]>([]);
  const [shuffledPieces, setShuffledPieces] = useState<PuzzlePiece[]>([]);
  const [triviaToShow, setTriviaToShow] = useState<PuzzlePiece | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [summaryIndex, setSummaryIndex] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBoardShaking, setIsBoardShaking] = useState(false);

  const [activePieceId, setActivePieceId] = useState<number | null>(null);
  const [hoveredPieceId, setHoveredPieceId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const [dragPieceSize, setDragPieceSize] = useState({ w: 0, h: 0 });
  const [scatterPositions, setScatterPositions] = useState<Record<number, { x: number; y: number }>>({});

  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setShuffledPieces(shuffleArray(PUZZLE_PIECES));
    setScatterPositions(generateScatterPositions());
  }, []);

  // ─── Intro Animation ────────────────────────────────────────────────────
  useEffect(() => {
    if (phase === "intro") {
      const timer = setTimeout(() => setPhase("playing"), 3400);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // ─── Feedback ────────────────────────────────────────────────────────────
  const showFeedback = useCallback(() => {
    const msgs = ["FRAGMENT RESTORED!", "CORE ALIGNED!", "EXCELLENT!", "PERFECT FIT!", "GREAT JOB!"];
    setSuccessMessage(msgs[Math.floor(Math.random() * msgs.length)]);
    setTimeout(() => setSuccessMessage(null), 1500);
  }, []);

  const triggerError = useCallback(() => {
    setErrorMessage("ALIGNMENT FAILED — WRONG POSITION");
    setIsBoardShaking(true);
    setTimeout(() => { setErrorMessage(null); setIsBoardShaking(false); }, 800);
  }, []);

  // ─── Drag & Drop ────────────────────────────────────────────────────────
  const onPointerDown = useCallback(
    (e: React.PointerEvent, pieceId: number) => {
      if (phase !== "playing" || placedPieces.includes(pieceId)) return;
      const target = e.currentTarget as HTMLElement;
      const rect = target.getBoundingClientRect();
      setActivePieceId(pieceId);
      setIsDragging(true);
      setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setDragPos({ x: rect.left, y: rect.top });
      setDragPieceSize({ w: rect.width, h: rect.height });
      target.setPointerCapture(e.pointerId);
    },
    [phase, placedPieces]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      setDragPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    },
    [isDragging, dragOffset]
  );

  const onPointerUp = useCallback(() => {
    if (!isDragging || activePieceId === null) return;
    setIsDragging(false);
    const piece = PUZZLE_PIECES[activePieceId];
    if (boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const cellWidth = boardRect.width / COLS;
      const cellHeight = boardRect.height / ROWS;
      const centerX = dragPos.x + dragPieceSize.w / 2;
      const centerY = dragPos.y + dragPieceSize.h / 2;
      const relX = centerX - boardRect.left;
      const relY = centerY - boardRect.top;
      if (relX >= 0 && relX <= boardRect.width && relY >= 0 && relY <= boardRect.height) {
        const droppedCol = Math.min(Math.floor(relX / cellWidth), COLS - 1);
        const droppedRow = Math.min(Math.floor(relY / cellHeight), ROWS - 1);
        if (droppedCol === piece.col && droppedRow === piece.row) {
          showFeedback();
          setPlacedPieces((prev) => [...prev, piece.id]);
          setTriviaToShow(piece);
          setPhase("trivia");
        } else {
          triggerError();
        }
      }
    }
    setActivePieceId(null);
  }, [isDragging, activePieceId, dragPos, dragPieceSize, showFeedback, triggerError]);

  // ─── Dismiss Trivia ─────────────────────────────────────────────────────
  const dismissTrivia = useCallback(() => {
    setTriviaToShow(null);
    if (placedPieces.length >= PUZZLE_PIECES.length) {
      setShowCelebration(true);
      setTimeout(() => { setShowCelebration(false); setPhase("restored"); }, 3000);
    } else {
      setPhase("playing");
    }
  }, [placedPieces.length]);

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDERS
  // ═══════════════════════════════════════════════════════════════════════════

  const confettiColors = ["#ffc040", "#ff8800", "#44aaff"];
  const confettiLefts = [5,15,25,35,45,55,65,75,85,95,10,20,30,40,50,60,70,80,90,0];
  const confettiDelays = [0,.15,.3,.45,.1,.25,.4,.05,.2,.35,.5,.65,.8,.55,.7,.85,.1,.3,.6,.75];

  // ─── Intro ──────────────────────────────────────────────────────────────
  if (phase === "intro") {
    const dataLines = [
      "> POSITION ...... 5.2 AU FROM SOL",
      "> MASS .......... 1.898 × 10²⁷ KG",
      "> STORM ......... GREAT RED SPOT ACTIVE",
      "> FRAGMENTS ..... 8 DETECTED",
    ];
    return (
      <div style={rootStyle}>
        <style>{KEYFRAMES}</style>
        <div style={{ ...bgBase, filter: "brightness(0.5)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1, pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", gap: 0 }}>

          {/* Radar rings + orb */}
          <div style={{ position: "relative", width: 140, height: 140, marginBottom: 28 }}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={{
                position: "absolute", inset: 0, borderRadius: "50%",
                border: `1.5px solid rgba(255,192,64,${0.7 - i * 0.15})`,
                animation: `jup-ring-pulse 2.2s ease-out ${i * 0.55}s infinite`,
              }} />
            ))}
            {/* Jupiter orb */}
            <div style={{
              position: "absolute", inset: "25%", borderRadius: "50%",
              background: "radial-gradient(ellipse at 38% 35%, #f0c080 0%, #d07830 40%, #8a3010 100%)",
              boxShadow: "0 0 24px rgba(255,160,60,0.7), 0 0 48px rgba(255,120,20,0.3)",
              animation: "jup-orb-in 0.6s ease-out 0.2s both",
              overflow: "hidden",
            }}>
              {/* Storm bands */}
              {[28, 42, 58, 72].map((top, i) => (
                <div key={i} style={{ position: "absolute", left: 0, right: 0, top: `${top}%`, height: "6%", background: `rgba(${i % 2 === 0 ? "160,60,20" : "100,30,10"},0.5)`, borderRadius: 2 }} />
              ))}
            </div>
          </div>

          {/* Title */}
          <h1 style={{ fontFamily: FONT, fontSize: "clamp(20px, 4.5vw, 36px)", color: GOLD, margin: "0 0 20px 0", letterSpacing: 10, animation: "jup-title-in 0.7s ease-out 0.4s both", opacity: 0, textShadow: "0 0 24px rgba(255,192,64,0.7), 0 0 48px rgba(255,140,0,0.3)" }}>
            JUPITER
          </h1>

          {/* Data readout */}
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: "clamp(8px, 1.4vw, 11px)", color: "#7ab", display: "flex", flexDirection: "column", gap: 7, textAlign: "left" }}>
            {dataLines.map((line, i) => (
              <div key={i} style={{ animation: `jup-line-in 0.45s ease-out ${0.8 + i * 0.28}s both`, opacity: 0 }}>
                {line}
              </div>
            ))}
          </div>

          {/* Status */}
          <div style={{ marginTop: 28, fontFamily: FONT, fontSize: "clamp(7px, 1.3vw, 10px)", color: GOLD, letterSpacing: 4, animation: "jup-status-pulse 0.7s step-end 2.1s infinite" }}>
            SIGNAL LOCK IN PROGRESS
          </div>
        </div>
      </div>
    );
  }

  // ─── Win Screen ─────────────────────────────────────────────────────────
  if (phase === "restored") {
    const currentPiece = PUZZLE_PIECES[summaryIndex];
    const isLast = summaryIndex >= PUZZLE_PIECES.length - 1;
    return (
      <div style={rootStyle}>
        <style>{KEYFRAMES}</style>
        <div style={bgBase} />
        <div style={overlayAfter} />
        <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: "20px 16px", boxSizing: "border-box", gap: 20 }}>
          {/* Title */}
          <h2 style={{ fontFamily: FONT, fontSize: "clamp(10px, 2.5vw, 16px)", color: GOLD, letterSpacing: 2, margin: 0, textShadow: "0 0 10px rgba(255,192,64,0.5)", textAlign: "center", flexShrink: 0 }}>
            PLANETARY CORE REACTIVATED
          </h2>

          {/* Card row: back | card | next */}
          <div key={summaryIndex} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10, width: "min(96vw, 560px)", animation: "jup-modal-slide 0.35s ease-out" }}>
            {/* Back button */}
            <div style={{ flex: "0 0 auto", width: 44, display: "flex", justifyContent: "center" }}>
              {summaryIndex > 0 ? (
                <button style={{ fontFamily: FONT, fontSize: "clamp(14px, 3vw, 20px)", color: GOLD, background: "rgba(255,192,64,0.1)", border: `2px solid rgba(255,192,64,0.4)`, borderRadius: 6, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSummaryIndex((i) => i - 1)}>
                  ‹
                </button>
              ) : (
                <div style={{ width: 44 }} />
              )}
            </div>

            {/* Center: image + fact card + counter */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, minWidth: 0 }}>
              {/* Jupiter image */}
              <div style={{ width: "min(45vw, 180px)", flexShrink: 0 }}>
                <img src="/assets/jupiterpuzzle.png" alt="Jupiter" style={{ width: "100%", height: "auto", borderRadius: 8, boxShadow: "0 0 30px rgba(255,192,64,0.25)" }} />
              </div>
              {/* Fact card */}
              <div style={{ background: "linear-gradient(135deg, #0a0500, #1a0e00)", border: `2px solid ${GOLD}`, borderRadius: 8, padding: "18px 16px", width: "100%", boxSizing: "border-box", boxShadow: "0 0 24px rgba(255,192,64,0.12)" }}>
                <div style={{ fontFamily: FONT, fontSize: "clamp(9px, 2vw, 12px)", color: GOLD, letterSpacing: 2, marginBottom: 10, textAlign: "center" }}>
                  {currentPiece.label}
                </div>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: "clamp(10px, 1.8vw, 13px)", color: "#ccd6f6", lineHeight: 1.8, margin: 0, textAlign: "left" }}>
                  {currentPiece.trivia}
                </p>
              </div>
              {/* Counter */}
              <div style={{ fontFamily: FONT, fontSize: "clamp(7px, 1.5vw, 9px)", color: "rgba(255,192,64,0.5)", letterSpacing: 2 }}>
                {summaryIndex + 1} / {PUZZLE_PIECES.length}
              </div>
            </div>

            {/* Next / Proceed button */}
            <div style={{ flex: "0 0 auto", width: 44, display: "flex", justifyContent: "center" }}>
              {isLast ? (
                <button style={{ fontFamily: FONT, fontSize: "clamp(7px, 1.4vw, 9px)", color: "#000", background: "linear-gradient(180deg, #ffc040, #e0a020)", border: "none", borderRadius: 6, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", letterSpacing: 0, padding: "0 2px", textAlign: "center", lineHeight: 1.2 }} onClick={onComplete}>
                  GO ›
                </button>
              ) : (
                <button style={{ fontFamily: FONT, fontSize: "clamp(14px, 3vw, 20px)", color: "#000", background: "linear-gradient(180deg, #ffc040, #e0a020)", border: "none", borderRadius: 6, width: 44, height: 44, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setSummaryIndex((i) => i + 1)}>
                  ›
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Game ──────────────────────────────────────────────────────────
  const availablePieces = shuffledPieces.filter((p) => !placedPieces.includes(p.id));

  return (
    <div style={rootStyle}>
      <style>{KEYFRAMES}</style>
      <div style={{ ...bgBase, ...(isBoardShaking ? { animation: "jup-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" } : {}) }} />
      <div style={overlayAfter} />

      {/* Success Toast */}
      {successMessage && (
        <div style={{ position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, pointerEvents: "none" }}>
          <div style={{ fontSize: "clamp(16px, 4vw, 28px)", color: GOLD, textShadow: "0 0 20px rgba(255,192,64,0.8), 0 0 40px rgba(255,160,0,0.4)", animation: "jup-pop 0.4s ease-out", fontFamily: FONT }}>
            {successMessage}
          </div>
        </div>
      )}

      {/* Celebration Overlay */}
      {showCelebration && (
        <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <div key={i} style={{
                position: "absolute", width: 8, height: 8, top: -10,
                left: `${confettiLefts[i]}%`,
                background: confettiColors[i % 3],
                animation: `jup-confetti-fall 3s ease-in ${confettiDelays[i]}s forwards`,
              }} />
            ))}
          </div>
          <h1 style={{ fontSize: "clamp(24px, 6vw, 48px)", color: GOLD, textShadow: "0 0 30px rgba(255,192,64,0.8)", animation: "jup-celeb-pulse 0.5s ease infinite alternate", fontFamily: FONT, zIndex: 1 }}>
            GREAT JOB!
          </h1>
        </div>
      )}

      {/* Trivia Modal */}
      {phase === "trivia" && triviaToShow && (
        <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.75)", animation: "jup-fade-in 0.3s ease" }}>
          <div style={{
            background: "linear-gradient(135deg, #0a0500 0%, #1a0e00 100%)", border: `2px solid ${GOLD}`, borderRadius: 8,
            padding: "28px 24px", maxWidth: 380, width: "90%", textAlign: "center",
            boxShadow: "0 0 40px rgba(255,192,64,0.2), inset 0 0 30px rgba(255,192,64,0.05)",
            animation: "jup-modal-slide 0.4s ease-out",
          }}>
            <div style={{ fontSize: 28, color: GOLD, marginBottom: 12, textShadow: "0 0 15px rgba(255,192,64,0.6)" }}>✦</div>
            <h3 style={{ fontSize: "clamp(12px, 2vw, 16px)", color: GOLD, letterSpacing: 3, marginBottom: 14, fontFamily: FONT }}>{triviaToShow.label}</h3>
            <p style={{ fontSize: "clamp(9px, 1.3vw, 11px)", color: "#ccd6f6", lineHeight: 1.8, marginBottom: 20, fontFamily: '"Courier New", monospace' }}>{triviaToShow.trivia}</p>
            <button style={btnStyle} onClick={dismissTrivia}>
              {placedPieces.length >= PUZZLE_PIECES.length ? "VIEW RESULTS" : "CONTINUE"}
            </button>
          </div>
        </div>
      )}

      {/* Game Layout */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", padding: 12, gap: 12 }}>
        {/* Header */}
        <div style={{ fontSize: "clamp(7px, 2.2vw, 12px)", color: GOLD, letterSpacing: 1, textShadow: "0 0 8px rgba(255,192,64,0.5)", textAlign: "center", padding: "8px 0", flexShrink: 0, pointerEvents: "auto", fontFamily: FONT, maxWidth: "100%", wordBreak: "break-word" }}>
          <span style={{ animation: "jup-blink 1s step-end infinite" }}>&gt;</span> JUPITER CORE RESTORATION — {placedPieces.length}/{PUZZLE_PIECES.length} FRAGMENTS
        </div>

        {/* Puzzle Board — square to match the 500×500 image */}
        <div
          ref={boardRef}
          style={{
            position: "relative",
            width: "min(90vw, 55vh, 420px)",
            aspectRatio: "1 / 1",
            border: `2px solid ${GOLD_DIM}`,
            borderRadius: 6,
            background: "rgba(0,0,0,0.6)",
            boxShadow: "0 0 20px rgba(255,160,40,0.15), inset 0 0 30px rgba(0,0,0,0.5)",
            flexShrink: 0,
            pointerEvents: "auto",
            ...(isBoardShaking ? { animation: "jup-shake 0.5s cubic-bezier(0.36,0.07,0.19,0.97) both" } : {}),
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gridTemplateRows: "repeat(2, 1fr)", width: "100%", height: "100%", gap: 2, padding: 2 }}>
            {PUZZLE_PIECES.map((piece) => {
              const filled = placedPieces.includes(piece.id);
              return (
                <div
                  key={piece.id}
                  style={{
                    position: "relative",
                    border: filled ? `1px solid rgba(255,192,64,0.6)` : "1px dashed rgba(255,192,64,0.2)",
                    borderRadius: 3,
                    overflow: "hidden",
                    background: filled ? undefined : "rgba(255,192,64,0.03)",
                    ...(filled ? { animation: "jup-cell-fill 0.4s ease-out" } : {}),
                  }}
                >
                  {filled ? (
                    <PieceSlice row={piece.row} col={piece.col} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "clamp(14px, 3vw, 24px)", color: "rgba(255,192,64,0.15)" }}>?</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error */}
        {errorMessage && (
          <div style={{ fontSize: "clamp(8px, 1.2vw, 11px)", color: "#ff4444", textAlign: "center", padding: 6, animation: "jup-flash-red 0.4s ease", textShadow: "0 0 6px rgba(255,50,50,0.4)", flexShrink: 0, pointerEvents: "auto", fontFamily: FONT }}>
            {errorMessage}
          </div>
        )}

        {/* Scattered Pieces */}
        {availablePieces.map((piece, idx) => {
          const isActive = isDragging && activePieceId === piece.id;
          const scatter = scatterPositions[piece.id];
          if (!scatter) return null;
          const floatDuration = 2.4 + (idx % 4) * 0.4;
          const floatDelay = (idx * 0.35) % 2;
          return (
            <div
              key={piece.id}
              onPointerDown={(e) => onPointerDown(e, piece.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onMouseEnter={() => { if (!isActive) setHoveredPieceId(piece.id); }}
              onMouseLeave={() => setHoveredPieceId(null)}
              style={{
                position: "fixed",
                left: isActive ? dragPos.x : `${scatter.x}vw`,
                top: isActive ? dragPos.y : `${scatter.y}vh`,
                zIndex: isActive ? 1000 : hoveredPieceId === piece.id ? 60 : 50,
                width: isActive ? dragPieceSize.w : "clamp(26px, 6.5vw, 72px)",
                height: isActive ? dragPieceSize.h : undefined,
                aspectRatio: isActive ? undefined : "1 / 2",
                border: isActive
                  ? `2px solid ${GOLD}`
                  : hoveredPieceId === piece.id
                  ? `2px solid rgba(255,210,80,0.95)`
                  : `2px solid rgba(255,192,64,0.35)`,
                borderRadius: 4,
                cursor: isActive ? "grabbing" : "grab",
                overflow: "hidden",
                background: hoveredPieceId === piece.id && !isActive ? "rgba(255,192,64,0.06)" : "rgba(0,0,0,0.3)",
                userSelect: "none",
                WebkitUserSelect: "none",
                boxSizing: "border-box",
                touchAction: "none",
                pointerEvents: "auto",
                animation: isActive ? "none" : `jup-float ${floatDuration}s ease-in-out ${floatDelay}s infinite`,
                boxShadow: isActive
                  ? `0 0 22px rgba(255,192,64,0.7)`
                  : hoveredPieceId === piece.id
                  ? `0 0 18px rgba(255,192,64,0.75), 0 0 36px rgba(255,160,0,0.35), 0 4px 16px rgba(0,0,0,0.5)`
                  : `0 0 8px rgba(255,192,64,0.15), 0 4px 12px rgba(0,0,0,0.4)`,
                opacity: isActive ? 0.92 : 1,
                transition: "box-shadow 0.2s ease, border-color 0.2s ease, background 0.2s ease",
              }}
            >
              <PieceSlice row={piece.row} col={piece.col} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JupiterGame;
