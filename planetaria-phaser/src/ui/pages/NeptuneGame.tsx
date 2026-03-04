import React, { useEffect, useMemo, useState } from "react";
import PixelButton from "../components/PixelButton";
import { playCelebrationSfx, playWrongSfx } from "../../audio/Sfx";

interface NeptuneFeature {
  id: string;
  label: string;
  description: string;
  icon: string;
}

interface QuizQuestion {
  id: string;
  prompt: string;
  correctId: string;
  options: QuizOption[];
}

interface QuizOption {
  id: string;
  label: string;
}

interface NeptuneGameProps {
  onComplete: () => void;
  onBack: () => void;
}

const ASSETS = {
  spaceBg: "/assets/outerspace.png",
  neptune: "/assets/neptune.png",
};

const NEPTUNE_SPRITE_FRAME_COUNT = 5;
const NEPTUNE_SPRITE_FPS = 5;

const FEATURES: NeptuneFeature[] = [
  {
    id: "farthest",
    label: "Farthest Planet",
    description:
      "Neptune is the farthest planet from the Sun at about 4.5 billion km away. Sunlight takes over 4 hours to reach it.",
    icon: "",
  },
  {
    id: "ice-giant",
    label: "Ice Giant",
    description:
      "Neptune is an ice giant with water, ammonia, and methane-rich layers around a small rocky core.",
    icon: "",
  },
  {
    id: "deep-blue",
    label: "Deep Blue Color",
    description:
      "Methane in Neptune's atmosphere absorbs red light and reflects blue wavelengths, giving Neptune its vivid blue color.",
    icon: "",
  },
  {
    id: "strongest-winds",
    label: "Strongest Winds",
    description:
      "Neptune has the strongest winds in the solar system, with speeds up to 2,100 km/h.",
    icon: "",
  },
  {
    id: "cold-dark",
    label: "Very Cold and Dark",
    description:
      "Neptune's cloud tops are around −214 °C, and it gets only a tiny fraction of the sunlight Earth receives.",
    icon: "",
  },
  {
    id: "large-storms",
    label: "Large Storms",
    description:
      "Neptune hosts giant storm systems, including dark spots that can grow to Earth-size and then disappear over time.",
    icon: "",
  },
  {
    id: "long-orbit",
    label: "165 Earth-Year Revolution",
    description:
      "Neptune takes about 165 Earth years to complete one orbit around the Sun.",
    icon: "",
  },
];

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    prompt:
      "Which statement correctly describes Neptune’s position in the solar system?",
    correctId: "farthest",
    options: [
      { id: "q1-a", label: "A. It is the closest planet to the Sun" },
      {
        id: "farthest",
        label: "B. It is the farthest planet from the Sun",
      },
      { id: "q1-c", label: "C. It is located in the asteroid belt" },
    ],
  },
  {
    id: "q2",
    prompt: "Neptune belongs to which planetary classification?",
    correctId: "ice-giant",
    options: [
      { id: "q2-a", label: "A. Rocky planet" },
      { id: "q2-b", label: "B. Gas giant" },
      { id: "ice-giant", label: "C. Ice giant" },
    ],
  },
  {
    id: "q3",
    prompt: "Which feature best describes Neptune’s appearance?",
    correctId: "deep-blue",
    options: [
      { id: "q3-a", label: "A. Bright red surface" },
      { id: "deep-blue", label: "B. Deep blue color" },
      { id: "q3-c", label: "C. Golden-yellow atmosphere" },
    ],
  },
  {
    id: "q4",
    prompt: "Neptune is known for having the _____ in the solar system.",
    correctId: "strongest-winds",
    options: [
      { id: "strongest-winds", label: "A. Strongest winds" },
      { id: "q4-b", label: "B. Thickest rings" },
      { id: "q4-c", label: "C. Hottest surface" },
    ],
  },
  {
    id: "q5",
    prompt: "Because Neptune is so far from the Sun, it is:",
    correctId: "cold-dark",
    options: [
      { id: "q5-a", label: "A. Extremely hot and bright" },
      { id: "cold-dark", label: "B. Very cold and dark" },
      { id: "q5-c", label: "C. Covered in lava flows" },
    ],
  },
  {
    id: "q6",
    prompt: "What major weather feature is Neptune famous for?",
    correctId: "large-storms",
    options: [
      { id: "q6-a", label: "A. Massive sandstorms" },
      { id: "large-storms", label: "B. Large storms" },
      { id: "q6-c", label: "C. Frequent meteor showers" },
    ],
  },
  {
    id: "q7",
    prompt:
      "How long does Neptune take to complete one full orbit around the Sun?",
    correctId: "long-orbit",
    options: [
      { id: "q7-a", label: "A. 1 Earth year" },
      { id: "q7-b", label: "B. 84 Earth years" },
      { id: "long-orbit", label: "C. 165 Earth years" },
    ],
  },
];

const findNextQuestion = (
  activatedFeatures: Record<string, boolean>
): QuizQuestion | null => {
  return (
    QUESTIONS.find((question) => !activatedFeatures[question.correctId]) ?? null
  );
};

interface NeptuneDisplayProps {
  stabilityLevel: number;
  isCompleted: boolean;
  lightPulseKey: number;
}

const NeptuneDisplay: React.FC<NeptuneDisplayProps> = ({
  stabilityLevel,
  isCompleted,
  lightPulseKey,
}) => {
  const progress = Math.max(0, Math.min(stabilityLevel, 100));
  const radius = 148;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (progress / 100) * circumference;
  const stormOpacity = Math.max(0, 0.7 - (progress / 100) * 0.7);
  const brightness = 0.5 + (progress / 100) * 0.5;
  const [spriteFrame, setSpriteFrame] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setSpriteFrame(
        (previousFrame) => (previousFrame + 1) % NEPTUNE_SPRITE_FRAME_COUNT
      );
    }, 1000 / NEPTUNE_SPRITE_FPS);

    return () => window.clearInterval(intervalId);
  }, []);

  return (
    <div
      className="relative flex shrink-0 items-center justify-center"
      style={{ height: "clamp(120px, 28vh, 260px)" }}
    >
      <div
        className="absolute rounded-full"
        style={{
          width: "clamp(100px, 22vw, 200px)",
          height: "clamp(100px, 22vw, 200px)",
          boxShadow: isCompleted
            ? "0 0 80px rgba(96,165,250,0.9)"
            : `0 0 ${24 + progress * 0.35}px rgba(96,165,250,${
                0.2 + progress * 0.006
              })`,
          transition: "box-shadow 0.6s ease-out",
        }}
      />

      <div
        className={`relative ${!isCompleted ? "neptune-shake" : ""}`}
        style={{
          width: "clamp(100px, 22vw, 200px)",
          height: "clamp(100px, 22vw, 200px)",
        }}
      >
        <svg
          className="absolute -inset-1 h-[calc(100%+8px)] w-[calc(100%+8px)]"
          viewBox="0 0 320 320"
        >
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="rgba(30,41,59,0.7)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="160"
            cy="160"
            r={radius}
            stroke="url(#stabilityGradient)"
            strokeWidth="10"
            strokeLinecap="round"
            fill="none"
            transform="rotate(-90 160 160)"
            style={{
              strokeDashoffset: dashOffset,
              strokeDasharray: circumference,
              transition: "stroke-dashoffset 0.5s ease-out",
            }}
          />
          <defs>
            <linearGradient
              id="stabilityGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
        </svg>

        <div
          className="absolute inset-0 overflow-hidden rounded-full border border-blue-300/20"
          style={{
            filter: `brightness(${brightness}) saturate(1.2)`,
            transition: "filter 0.5s ease-out",
          }}
        >
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={ASSETS.neptune}
              alt="Neptune"
              className="absolute left-0 h-[500%] w-full"
              style={{
                top: `-${spriteFrame * 100}%`,
                imageRendering: "pixelated",
              }}
            />
          </div>

          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(2,6,23,0.65) 0 4px, rgba(30,64,175,0.35) 4px 8px), repeating-linear-gradient(90deg, rgba(2,6,23,0.4) 0 3px, rgba(15,23,42,0.15) 3px 6px)",
              backgroundSize: "12px 12px, 10px 10px",
              mixBlendMode: "multiply",
              imageRendering: "pixelated",
              opacity: stormOpacity,
              animation: "neptune-storm-drift 8s ease-in-out infinite",
              transition: "opacity 0.5s ease-out",
            }}
          />

          {lightPulseKey > 0 && (
            <div
              key={lightPulseKey}
              className="neptune-light-pulse pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(186,230,253,0) 15%, rgba(125,211,252,0.2) 48%, rgba(56,189,248,0.62) 100%)",
                mixBlendMode: "screen",
              }}
            />
          )}
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="rounded bg-slate-900/70 px-2 py-0.5 font-['Press_Start_2P'] text-[11px] text-blue-100 sm:text-[12px] md:text-[11px]">
            Stability {Math.round(progress)}%
          </span>
        </div>
      </div>

      <style>{`
                @keyframes neptune-shake {
                    0%, 100% { transform: translate(0, 0); }
                    20% { transform: translate(-2px, 1px); }
                    40% { transform: translate(2px, -1px); }
                    60% { transform: translate(-1px, 0); }
                    80% { transform: translate(1px, 0); }
                }
                .neptune-shake {
                    animation: neptune-shake 1.8s ease-in-out infinite;
                }
                @keyframes neptune-storm-drift {
                    0%, 100% { transform: rotate(0deg) scale(1); }
                    33% { transform: rotate(-7deg) scale(1.02); }
                    66% { transform: rotate(5deg) scale(1); }
                }
                @keyframes neptune-light-pulse {
                    0% { transform: scaleY(0); opacity: 0; transform-origin: bottom; }
                    50% { transform: scaleY(1); opacity: 0.95; transform-origin: bottom; }
                    100% { transform: scaleY(1); opacity: 0; transform-origin: bottom; }
                }
                .neptune-light-pulse {
                    animation: neptune-light-pulse 0.85s ease-out forwards;
                }
            `}</style>
    </div>
  );
};

interface FeatureButtonProps {
  label: string;
  icon?: string;
  onSelect: () => void;
  disabled?: boolean;
  isWrong?: boolean;
}

const FeatureButton: React.FC<FeatureButtonProps> = ({
  label,
  icon,
  onSelect,
  disabled,
  isWrong,
}) => {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`rounded-md border-2 px-2 py-1.5 font-['Press_Start_2P'] text-[12px] transition-all sm:px-2 sm:py-2 sm:text-[11px] md:text-[12px] ${
        disabled
          ? "cursor-not-allowed border-slate-700 text-slate-500"
          : "border-blue-500 text-blue-100 hover:scale-[1.02] hover:border-cyan-400 active:scale-[0.98]"
      } ${isWrong ? "neptune-wrong-answer" : ""}`}
      style={{ backgroundColor: "rgba(30,41,59,0.95)" }}
    >
      {icon ? `${icon} ` : ""}
      {label}
    </button>
  );
};

interface QuestionPanelProps {
  question: QuizQuestion;
  featuresById: Record<string, NeptuneFeature>;
  activatedFeatures: Record<string, boolean>;
  wrongOptionId: string | null;
  onAnswer: (featureId: string) => void;
}

const QuestionPanel: React.FC<QuestionPanelProps> = ({
  question,
  featuresById,
  activatedFeatures,
  wrongOptionId,
  onAnswer,
}) => {
  return (
    <div className="fade-in-up mx-auto mt-10 w-full max-w-3xl px-3 pb-2 sm:mt-8 sm:px-4 md:mt-10 md:pb-4">
      <div className="rounded-lg border border-blue-500/60 bg-slate-950/90 p-2 sm:p-3 md:p-4">
        <p className="mb-2 text-center font-['Press_Start_2P'] text-[11px] leading-relaxed text-blue-100 sm:mb-3 sm:text-[12px] md:text-[11px]">
          {question.prompt}
        </p>

        <div className="grid grid-cols-3 gap-2">
          {question.options.map((option) => {
            const feature = featuresById[option.id];
            return (
              <FeatureButton
                key={option.id}
                label={option.label}
                icon={feature?.icon}
                onSelect={() => onAnswer(option.id)}
                disabled={Boolean(activatedFeatures[option.id])}
                isWrong={wrongOptionId === option.id}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  feature: NeptuneFeature | null;
  onClose: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ feature, onClose }) => {
  if (!feature) return null;

  return (
    <div className="fade-in fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="info-card-enter relative w-full max-w-md overflow-hidden rounded-xl border border-cyan-400/70 bg-slate-950">
        <div className="border-b border-cyan-500/40 bg-cyan-900/20 px-4 py-3">
          <p className="font-['Press_Start_2P'] text-[12px] text-cyan-300 md:text-xs">
            Feature Activated
          </p>
        </div>

        <div className="space-y-3 px-4 py-4">
          <h3 className="font-['Press_Start_2P'] text-[12px] text-blue-100 md:text-xs">
            {feature.label}
          </h3>
          <p className="font-['Press_Start_2P'] text-[11px] leading-relaxed text-slate-300 md:text-[12px]">
            {feature.description}
          </p>
        </div>

        <div className="flex justify-end border-t border-cyan-500/30 px-4 py-3">
          <button
            onClick={onClose}
            className="rounded-md border border-cyan-400 px-3 py-2 font-['Press_Start_2P'] text-[12px] text-cyan-200 hover:bg-cyan-900/20 md:text-xs"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

const NeptuneMission: React.FC<NeptuneGameProps> = ({ onComplete, onBack }) => {
  const featuresById = useMemo(
    () =>
      FEATURES.reduce<Record<string, NeptuneFeature>>((acc, feature) => {
        acc[feature.id] = feature;
        return acc;
      }, {}),
    []
  );

  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
    QUESTIONS[0]
  );
  const [activatedFeatures, setActivatedFeatures] = useState<
    Record<string, boolean>
  >(() =>
    FEATURES.reduce<Record<string, boolean>>((acc, feature) => {
      acc[feature.id] = false;
      return acc;
    }, {})
  );
  const [stabilityLevel, setStabilityLevel] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showInfoCard, setShowInfoCard] = useState<NeptuneFeature | null>(null);
  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
  const [lightPulseKey, setLightPulseKey] = useState(0);

  useEffect(() => {
    if (isCompleted) return;

    let situation: "critical" | "hazard" | "action" | "climax" = "critical";
    let immediate = true;

    if (stabilityLevel >= 85) {
      situation = "climax";
      immediate = false;
    } else if (stabilityLevel >= 50) {
      situation = "action";
      immediate = false;
    } else if (stabilityLevel >= 20) {
      situation = "hazard";
      immediate = true;
    }

    window.dispatchEvent(
      new CustomEvent("audio-transition", {
        detail: {
          situation,
          immediate,
        },
      })
    );
  }, [stabilityLevel, isCompleted]);

  const handleAnswer = (featureId: string) => {
    if (!currentQuestion || isCompleted || showInfoCard) {
      return;
    }

    if (activatedFeatures[featureId]) {
      return;
    }

    if (featureId !== currentQuestion.correctId) {
      playWrongSfx();
      setWrongOptionId(featureId);
      window.setTimeout(() => setWrongOptionId(null), 460);
      return;
    }

    const updated = { ...activatedFeatures, [featureId]: true };
    const activatedCount = FEATURES.filter(
      (feature) => updated[feature.id]
    ).length;
    const nextStability = (activatedCount / FEATURES.length) * 100;
    const allActivated = activatedCount === FEATURES.length;

    setActivatedFeatures(updated);
    setCurrentQuestion(findNextQuestion(updated));
    setStabilityLevel(nextStability);
    setLightPulseKey((prevKey) => prevKey + 1);
    setShowInfoCard(featuresById[featureId]);

    if (allActivated) {
      playCelebrationSfx();
      setIsCompleted(true);
      window.setTimeout(() => {
        window.dispatchEvent(
          new CustomEvent("audio-transition", {
            detail: { situation: "victory" },
          })
        );
      }, 420);
    } else {
      // Audio trigger for standard discovery progress
      window.dispatchEvent(
        new CustomEvent("audio-stinger", { detail: { situation: "neptune" } })
      );
    }
  };

  return (
    <div className="relative z-50 flex h-dvh w-screen flex-col overflow-hidden">
      <img
        src={ASSETS.spaceBg}
        alt="Pixel space background"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="absolute inset-0 bg-slate-950/65" />

      <header className="relative z-10 mt-5 flex items-center px-3 pt-2 sm:pt-3 md:pt-4">
        <h1 className="w-full text-center font-['Press_Start_2P'] text-[12px] text-cyan-200 sm:text-[11px] md:text-[12px]">
          Neptune: Stabilize the Storm
        </h1>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center gap-0">
        <NeptuneDisplay
          stabilityLevel={stabilityLevel}
          isCompleted={isCompleted}
          lightPulseKey={lightPulseKey}
        />

        {currentQuestion && !showInfoCard && !isCompleted && (
          <QuestionPanel
            key={currentQuestion.id}
            question={currentQuestion}
            featuresById={featuresById}
            activatedFeatures={activatedFeatures}
            wrongOptionId={wrongOptionId}
            onAnswer={handleAnswer}
          />
        )}
      </main>

      {isCompleted && (
        <div className="fade-in fixed inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="summary-card-enter max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-xl border border-blue-400/70 bg-slate-950/95 p-5">
            {/* Header */}
            <div className="mb-4 text-center">
              <p
                className="font-['Press_Start_2P'] text-[12px] tracking-widest text-cyan-300 uppercase md:text-xs"
                style={{ animation: "pulse-scale 2s infinite" }}
              >
                ★ Planet Stabilized ★
              </p>
              <p className="mt-2 font-['Press_Start_2P'] text-[9px] leading-relaxed text-cyan-200/80 md:text-[10px]">
                You have identified the conditions that make Neptune cold,
                windy, and distant.
              </p>
            </div>

            {/* Summary of learnings */}
            <div className="mb-4 space-y-2">
              {FEATURES.map((f) => (
                <div
                  key={f.id}
                  className="flex items-start gap-2 rounded border border-blue-800/50 bg-slate-900 px-3 py-2"
                >
                  <div>
                    <p className="font-['Press_Start_2P'] text-[10px] text-blue-300 md:text-[11px]">
                      {f.label}
                    </p>
                    <p className="mt-1 font-['Press_Start_2P'] text-[7px] leading-relaxed text-blue-200/70 md:text-[9px]">
                      {f.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center">
              <PixelButton
                label="Proceed to Void Boundary"
                onClick={onComplete}
              />
            </div>
          </div>
        </div>
      )}

      <InfoCard feature={showInfoCard} onClose={() => setShowInfoCard(null)} />

      <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
                @keyframes info-card-enter {
                    from { opacity: 0; transform: translateY(44px) scale(0.92); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .info-card-enter {
                    animation: info-card-enter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
                @keyframes summary-card-enter {
                    from { opacity: 0; transform: translateY(36px) scale(0.95); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
                .summary-card-enter {
                    animation: summary-card-enter 0.4s ease-out forwards;
                }
                @keyframes pulse-scale {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                @keyframes neptune-wrong-answer {
                    0%, 100% { transform: translateX(0); background-color: rgba(30,41,59,0.95); }
                    12.5%, 37.5%, 62.5%, 87.5% { transform: translateX(-8px); }
                    25%, 50%, 75% { transform: translateX(8px); }
                    0%, 50%, 100% { background-color: rgba(30,41,59,0.95); }
                    25%, 75% { background-color: rgba(127,29,29,0.95); }
                }
                .neptune-wrong-answer {
                    animation: neptune-wrong-answer 0.45s ease-in-out forwards;
                }
            `}</style>
    </div>
  );
};

export default NeptuneMission;
