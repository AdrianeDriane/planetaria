import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PixelButton from "../components/PixelButton";

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
        icon: "🌌",
    },
    {
        id: "ice-giant",
        label: "Ice Giant",
        description:
            "Neptune is an ice giant with water, ammonia, and methane-rich layers around a small rocky core.",
        icon: "🧊",
    },
    {
        id: "deep-blue",
        label: "Deep Blue Color",
        description:
            "Methane in Neptune's atmosphere absorbs red light and reflects blue wavelengths, giving Neptune its vivid blue color.",
        icon: "🔵",
    },
    {
        id: "strongest-winds",
        label: "Strongest Winds",
        description:
            "Neptune has the strongest winds in the solar system, with speeds up to 2,100 km/h.",
        icon: "🌬️",
    },
    {
        id: "cold-dark",
        label: "Very Cold and Dark",
        description:
            "Neptune's cloud tops are around −214 °C, and it gets only a tiny fraction of the sunlight Earth receives.",
        icon: "🥶",
    },
    {
        id: "large-storms",
        label: "Large Storms",
        description:
            "Neptune hosts giant storm systems, including dark spots that can grow to Earth-size and then disappear over time.",
        icon: "🌀",
    },
    {
        id: "long-orbit",
        label: "165 Earth-Year Revolution",
        description:
            "Neptune takes about 165 Earth years to complete one orbit around the Sun.",
        icon: "⏳",
    },
];

const QUESTIONS: QuizQuestion[] = [
    {
        id: "q1",
        prompt: "Which statement correctly describes Neptune’s position in the solar system?",
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
        prompt: "How long does Neptune take to complete one full orbit around the Sun?",
        correctId: "long-orbit",
        options: [
            { id: "q7-a", label: "A. 1 Earth year" },
            { id: "q7-b", label: "B. 84 Earth years" },
            { id: "long-orbit", label: "C. 165 Earth years" },
        ],
    },
];

const findNextQuestion = (
    activatedFeatures: Record<string, boolean>,
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
                (previousFrame) =>
                    (previousFrame + 1) % NEPTUNE_SPRITE_FRAME_COUNT,
            );
        }, 1000 / NEPTUNE_SPRITE_FPS);

        return () => window.clearInterval(intervalId);
    }, []);

    return (
        <div className="relative flex items-center justify-center shrink-0" style={{ height: "clamp(120px, 28vh, 260px)" }}>
            <motion.div
                className="absolute rounded-full"
                animate={{
                    boxShadow: isCompleted
                        ? "0 0 80px rgba(96,165,250,0.9)"
                        : `0 0 ${24 + progress * 0.35}px rgba(96,165,250,${0.2 +
                              progress * 0.006})`,
                }}
                transition={{ duration: 0.6 }}
                style={{
                    width: "clamp(100px, 22vw, 200px)",
                    height: "clamp(100px, 22vw, 200px)",
                }}
            />

            <motion.div
                className="relative" style={{ width: "clamp(100px, 22vw, 200px)", height: "clamp(100px, 22vw, 200px)" }}
                animate={
                    isCompleted
                        ? { x: 0, y: 0 }
                        : {
                              x: [0, -2, 2, -1, 1, 0],
                              y: [0, 1, -1, 0],
                          }
                }
                transition={{
                    duration: 1.8,
                    repeat: isCompleted ? 0 : Infinity,
                    ease: "easeInOut",
                }}
            >
                <svg
                    className="absolute -inset-1 w-[calc(100%+8px)] h-[calc(100%+8px)]"
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
                    <motion.circle
                        cx="160"
                        cy="160"
                        r={radius}
                        stroke="url(#stabilityGradient)"
                        strokeWidth="10"
                        strokeLinecap="round"
                        fill="none"
                        transform="rotate(-90 160 160)"
                        animate={{ strokeDashoffset: dashOffset }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        strokeDasharray={circumference}
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

                <motion.div
                    className="absolute inset-0 rounded-full overflow-hidden border border-blue-300/20"
                    animate={{ filter: `brightness(${brightness}) saturate(1.2)` }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={ASSETS.neptune}
                            alt="Neptune"
                            className="absolute left-0 w-full h-[500%]"
                            style={{
                                top: `-${spriteFrame * 100}%`,
                                imageRendering: "pixelated",
                            }}
                        />
                    </div>

                    <motion.div
                        className="absolute inset-0"
                        style={{
                            backgroundImage:
                                "repeating-linear-gradient(0deg, rgba(2,6,23,0.65) 0 4px, rgba(30,64,175,0.35) 4px 8px), repeating-linear-gradient(90deg, rgba(2,6,23,0.4) 0 3px, rgba(15,23,42,0.15) 3px 6px)",
                            backgroundSize: "12px 12px, 10px 10px",
                            mixBlendMode: "multiply",
                            imageRendering: "pixelated",
                        }}
                        animate={{
                            opacity: stormOpacity,
                            rotate: [0, -7, 5, 0],
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            opacity: { duration: 0.5 },
                            rotate: {
                                duration: 8,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                            scale: {
                                duration: 3,
                                repeat: Infinity,
                                ease: "easeInOut",
                            },
                        }}
                    />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={lightPulseKey}
                            className="absolute inset-0 pointer-events-none"
                            style={{
                                background:
                                    "linear-gradient(180deg, rgba(186,230,253,0) 15%, rgba(125,211,252,0.2) 48%, rgba(56,189,248,0.62) 100%)",
                                mixBlendMode: "screen",
                            }}
                            initial={{ scaleY: 0, opacity: 0, transformOrigin: "bottom" }}
                            animate={{ scaleY: [0, 1, 1], opacity: [0, 0.95, 0] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.85, ease: "easeOut" }}
                        />
                    </AnimatePresence>
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] text-blue-100 bg-slate-900/70 px-2 py-0.5 rounded">
                        Stability {Math.round(progress)}%
                    </span>
                </div>
            </motion.div>
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
        <motion.button
            onClick={onSelect}
            disabled={disabled}
            whileHover={disabled ? undefined : { scale: 1.02 }}
            whileTap={disabled ? undefined : { scale: 0.98 }}
            animate={
                isWrong
                    ? {
                          x: [0, -8, 8, -6, 6, -2, 2, 0],
                          backgroundColor: [
                              "rgba(30,41,59,0.95)",
                              "rgba(127,29,29,0.95)",
                              "rgba(30,41,59,0.95)",
                          ],
                      }
                    : { x: 0, backgroundColor: "rgba(30,41,59,0.95)" }
            }
            transition={{ duration: 0.45, ease: "easeInOut" }}
            className={`font-['Press_Start_2P'] text-[6px] sm:text-[7px] md:text-[8px] px-2 py-1.5 sm:px-2 sm:py-2 rounded-md border-2 transition-colors ${
                disabled
                    ? "border-slate-700 text-slate-500 cursor-not-allowed"
                    : "border-blue-500 text-blue-100 hover:border-cyan-400"
            }`}
        >
            {icon ? `${icon} ` : ""}
            {label}
        </motion.button>
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
        <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-2 md:pb-4 mt-10 sm:mt-8 md:mt-10"
        >
            <div className="bg-slate-950/90 border border-blue-500/60 rounded-lg p-2 sm:p-3 md:p-4">
                <p className="font-['Press_Start_2P'] text-[7px] sm:text-[8px] md:text-[9px] text-blue-100 leading-relaxed mb-2 sm:mb-3 text-center">
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
        </motion.div>
    );
};

interface InfoCardProps {
    feature: NeptuneFeature | null;
    onClose: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ feature, onClose }) => {
    return (
        <AnimatePresence>
            {feature && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <button
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    <motion.div
                        className="relative w-full max-w-md bg-slate-950 border border-cyan-400/70 rounded-xl overflow-hidden"
                        initial={{ opacity: 0, y: 44, scale: 0.92 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 28, scale: 0.94 }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                    >
                        <div className="px-4 py-3 border-b border-cyan-500/40 bg-cyan-900/20">
                            <p className="font-['Press_Start_2P'] text-[10px] md:text-xs text-cyan-300">
                                {feature.icon} Feature Activated
                            </p>
                        </div>

                        <div className="px-4 py-4 space-y-3">
                            <h3 className="font-['Press_Start_2P'] text-[10px] md:text-xs text-blue-100">
                                {feature.label}
                            </h3>
                            <p className="font-['Press_Start_2P'] text-[9px] md:text-[10px] text-slate-300 leading-relaxed">
                                {feature.description}
                            </p>
                        </div>

                        <div className="px-4 py-3 border-t border-cyan-500/30 flex justify-end">
                            <button
                                onClick={onClose}
                                className="font-['Press_Start_2P'] text-[10px] md:text-xs px-3 py-2 rounded-md border border-cyan-400 text-cyan-200 hover:bg-cyan-900/20"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

const NeptuneMission: React.FC<NeptuneGameProps> = ({ onComplete, onBack }) => {
    const featuresById = useMemo(
        () =>
            FEATURES.reduce<Record<string, NeptuneFeature>>((acc, feature) => {
                acc[feature.id] = feature;
                return acc;
            }, {}),
        [],
    );

    const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(
        QUESTIONS[0],
    );
    const [activatedFeatures, setActivatedFeatures] = useState<
        Record<string, boolean>
    >(() =>
        FEATURES.reduce<Record<string, boolean>>((acc, feature) => {
            acc[feature.id] = false;
            return acc;
        }, {}),
    );
    const [stabilityLevel, setStabilityLevel] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [showInfoCard, setShowInfoCard] = useState<NeptuneFeature | null>(null);
    const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);
    const [lightPulseKey, setLightPulseKey] = useState(0);

    const handleAnswer = (featureId: string) => {
        if (!currentQuestion || isCompleted || showInfoCard) {
            return;
        }

        if (activatedFeatures[featureId]) {
            return;
        }

        if (featureId !== currentQuestion.correctId) {
            setWrongOptionId(featureId);
            window.setTimeout(() => setWrongOptionId(null), 460);
            return;
        }

        const updated = { ...activatedFeatures, [featureId]: true };
        const activatedCount = FEATURES.filter((feature) => updated[feature.id]).length;
        const nextStability = (activatedCount / FEATURES.length) * 100;
        const allActivated = activatedCount === FEATURES.length;

        setActivatedFeatures(updated);
        setCurrentQuestion(findNextQuestion(updated));
        setStabilityLevel(nextStability);
        setLightPulseKey((prevKey) => prevKey + 1);
        setShowInfoCard(featuresById[featureId]);
        if (allActivated) {
            setIsCompleted(true);
        }
    };

    return (
        <div className="w-screen h-dvh relative overflow-hidden flex flex-col">
            <img
                src={ASSETS.spaceBg}
                alt="Pixel space background"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ imageRendering: "pixelated" }}
            />
            <div className="absolute inset-0 bg-slate-950/65" />

            <header className="relative z-10 px-3 pt-2 sm:pt-3 md:pt-4 mt-5 flex items-center">
                <div className="absolute left-3">
                    <PixelButton label="Back" onClick={onBack} variant="secondary" />
                </div>
                <h1 className="font-['Press_Start_2P'] text-[8px] sm:text-[9px] md:text-[10px] text-cyan-200 w-full text-center">
                    Neptune: Stabilize the Storm
                </h1>
            </header>

            <main className="relative z-10 flex-1 flex flex-col justify-center items-center gap-0 min-h-0">
                <NeptuneDisplay
                    stabilityLevel={stabilityLevel}
                    isCompleted={isCompleted}
                    lightPulseKey={lightPulseKey}
                />

                <AnimatePresence mode="wait">
                    {currentQuestion && !showInfoCard && !isCompleted && (
                        <QuestionPanel
                            question={currentQuestion}
                            featuresById={featuresById}
                            activatedFeatures={activatedFeatures}
                            wrongOptionId={wrongOptionId}
                            onAnswer={handleAnswer}
                        />
                    )}
                </AnimatePresence>
            </main>

            <AnimatePresence>
                {isCompleted && (
                    <motion.div
                        className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="w-full max-w-xl rounded-xl border border-blue-400/70 bg-slate-950/95 p-6"
                            initial={{ opacity: 0, y: 36, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.4 }}
                        >
                            <p className="font-['Press_Start_2P'] text-[10px] md:text-xs text-cyan-300 text-center leading-relaxed">
                                Planet Stabilized! You have identified the conditions that make Neptune cold, windy, and distant.
                            </p>

                            <div className="mt-5 flex justify-center">
                                <PixelButton
                                    label="Proceed to Void Boundary"
                                    onClick={onComplete}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <InfoCard
                feature={showInfoCard}
                onClose={() => setShowInfoCard(null)}
            />


        </div>
    );
};

export default NeptuneMission;