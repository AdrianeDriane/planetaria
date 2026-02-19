import { useState, useRef, useEffect } from "react";
import PixelButton from "../components/PixelButton";

interface DataPacket {
    id: string;
    x: number;
    y: number;
    image: string;
    type: 'data' | 'trap'; // New: packet can be data or trap
    contentType: 'hot-potato' | 'acid-clouds' | 'slow-spinning' | 'rocks' | 
                 'broken-lens' | 'acid-mist' | 'pressure-spike' | 'heat-blast' | 'volcanic-ash';
    title: string;
    description: string;
    found: boolean;
    opened: boolean; // New: track if packet has been opened
    temporary?: boolean;
}

interface AcidDrop {
    id: number;
    x: number;
    y: number;
    speed: number;
}

interface Particle {
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    color: string;
    size: number;
}

interface Lightning {
    id: number;
    x: number;
    opacity: number;
}

interface VenusGameProps {
    onComplete: () => void;
    onBack: () => void;
}

const VenusGame: React.FC<VenusGameProps> = ({ onComplete, onBack }) => {
    const sceneRef = useRef<HTMLDivElement>(null);
    const backgroundRef = useRef<HTMLDivElement>(null);
    const scanningIntervalRef = useRef<number | null>(null);
    const volcanicTimerRef = useRef<number | null>(null);
    const acidRainTimerRef = useRef<number | null>(null);

    // Helper function to generate non-overlapping positions
    const generateNonOverlappingPosition = (existingPositions: { x: number; y: number }[]) => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const MIN_DISTANCE = Math.min(vw, vh) * 0.15; // Scale min distance to viewport
        const MAX_ATTEMPTS = 50;
        const PADDING = 60; // Keep packets away from edges
        
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            const newPos = {
                x: Math.random() * (vw - PADDING * 2) + PADDING,
                y: Math.random() * (vh - PADDING * 2) + PADDING
            };
            
            // Check if this position is far enough from all existing positions
            const isFarEnough = existingPositions.every(pos => {
                const distance = Math.sqrt(
                    Math.pow(newPos.x - pos.x, 2) + Math.pow(newPos.y - pos.y, 2)
                );
                return distance >= MIN_DISTANCE;
            });
            
            if (isFarEnough) {
                return newPos;
            }
        }
        
        // Fallback: return a position even if overlap (shouldn't happen with MAX_ATTEMPTS=50)
        return {
            x: Math.random() * (vw - PADDING * 2) + PADDING,
            y: Math.random() * (vh - PADDING * 2) + PADDING
        };
    };

    // Generate positions for all packets
    const positions: { x: number; y: number }[] = [];
    
    // Viewport-relative positions for data packets (distributed across screen)
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    positions.push({ x: vw * 0.25, y: vh * 0.3 });   // top-left area
    positions.push({ x: vw * 0.7, y: vh * 0.6 });    // bottom-right area
    positions.push({ x: vw * 0.4, y: vh * 0.7 });    // bottom-center
    positions.push({ x: vw * 0.8, y: vh * 0.35 });   // top-right area
    
    // Generate non-overlapping positions for trap packets (7 total for variety)
    for (let i = 0; i < 7; i++) {
        positions.push(generateNonOverlappingPosition(positions));
    }

    const [dataPackets, setDataPackets] = useState<DataPacket[]>([
        // DATA PACKETS (need to collect all 4)
        {
            id: "packet-1",
            x: positions[0].x,
            y: positions[0].y,
            image: "/assets/hot_potato_venus.png",
            type: 'data',
            contentType: 'hot-potato',
            title: "Hot Potato",
            description: "Venus is the hottest planet - over 900°F! It's like a giant pizza oven in space!",
            found: false,
            opened: false,
        },
        {
            id: "packet-2",
            x: positions[1].x,
            y: positions[1].y,
            image: "/assets/acid_cloud_venus.png",
            type: 'data',
            contentType: 'acid-clouds',
            title: "Acid Clouds",
            description: "It doesn't rain water on Venus; it rains sulfuric acid that would melt your skin!",
            found: false,
            opened: false,
        },
        {
            id: "packet-3",
            x: positions[2].x,
            y: positions[2].y,
            image: "/assets/slow_spinning_venus.png",
            type: 'data',
            contentType: 'slow-spinning',
            title: "Slow Spinning Venus",
            description: "Venus spins so slowly, one day lasts 243 Earth days - longer than its year!",
            found: false,
            opened: false,
        },
        {
            id: "packet-4",
            x: positions[3].x,
            y: positions[3].y,
            image: "/assets/venus_rock.png",
            type: 'data',
            contentType: 'rocks',
            title: "Rocky Surface",
            description: "Venus has a rocky surface with 1,600+ volcanoes and the same gravity as Earth!",
            found: false,
            opened: false,
        },
        // TRAP PACKETS (use pre-generated non-overlapping positions)
        {
            id: "trap-1",
            x: positions[4].x,
            y: positions[4].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'broken-lens',
            title: "⚠ Lens Fracture Trap",
            description: "A micrometeorite struck your telescope lens! Scanning is disabled until you repair it.",
            found: false,
            opened: false,
        },
        {
            id: "trap-2",
            x: positions[5].x,
            y: positions[5].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'acid-mist',
            title: "⚠ Acid Vapor Trap",
            description: "Concentrated sulfuric acid vapor engulfs your telescope! Visibility severely reduced.",
            found: false,
            opened: false,
        },
        {
            id: "trap-3",
            x: positions[6].x,
            y: positions[6].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'pressure-spike',
            title: "⚠ Pressure Anomaly",
            description: "Atmospheric pressure fluctuations go haywire! Safe zone becomes unpredictable.",
            found: false,
            opened: false,
        },
        {
            id: "trap-4",
            x: positions[7].x,
            y: positions[7].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'heat-blast',
            title: "⚠ Thermal Shockwave",
            description: "A wave of extreme heat distorts your instruments and shakes your equipment!",
            found: false,
            opened: false,
        },
        {
            id: "trap-5",
            x: positions[8].x,
            y: positions[8].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'volcanic-ash',
            title: "⚠ Volcanic Ash Cloud",
            description: "A volcanic eruption blankets your view in ash particles!",
            found: false,
            opened: false,
        },
        {
            id: "trap-6",
            x: positions[9].x,
            y: positions[9].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'broken-lens',
            title: "⚠ Lens Crack Trap",
            description: "Another lens fracture! Equipment needs immediate repair.",
            found: false,
            opened: false,
        },
        {
            id: "trap-7",
            x: positions[10].x,
            y: positions[10].y,
            image: "/assets/data_packet_venus.png",
            type: 'trap',
            contentType: 'acid-mist',
            title: "⚠ Acid Fog Trap",
            description: "Dense sulfuric fog rolls in, severely limiting visibility!",
            found: false,
            opened: false,
        },
    ]);

    const [telescopePos, setTelescopePos] = useState({ x: 200, y: 200 });
    const [showTitle, setShowTitle] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
    const [isChecklistOpen, setIsChecklistOpen] = useState(false);
    const telescopeRadius = isMobile ? 120 : 250; // Smaller on mobile

    // NEW GAME MECHANICS STATE
    const [pressure, setPressure] = useState(50); // 0-100 scale
    const [dayNightPhase, setDayNightPhase] = useState(0); // 0-100 (0=day, 100=night)
    const [acidDrops, setAcidDrops] = useState<AcidDrop[]>([]);
    const [scanningPacket, setScanningPacket] = useState<DataPacket | null>(null);
    const [scanProgress, setScanProgress] = useState(0); // 0-100
    const [cloudLayer1Offset, setCloudLayer1Offset] = useState(0);
    const [cloudLayer2Offset, setCloudLayer2Offset] = useState(0);
    const [cloudLayer3Offset, setCloudLayer3Offset] = useState(0);
    const [particles, setParticles] = useState<Particle[]>([]);
    const [lightning, setLightning] = useState<Lightning[]>([]);
    const [screenShake, setScreenShake] = useState({ x: 0, y: 0 });
    const [flashIntensity, setFlashIntensity] = useState(0);
    const [heatWaveIntensity, setHeatWaveIntensity] = useState(0);

    // TRAP EFFECTS STATE
    const [lensIsBroken, setLensIsBroken] = useState(false);
    const [acidMistLevel, setAcidMistLevel] = useState(0); // 0-100
    const [pressureIsWild, setPressureIsWild] = useState(false);
    const [heatBlastActive, setHeatBlastActive] = useState(false);
    const [recentlyOpenedPacket, setRecentlyOpenedPacket] = useState<DataPacket | null>(null);
    
    // Modal for data packet trivia
    const [showTriviaModal, setShowTriviaModal] = useState(false);
    const [triviaContent, setTriviaContent] = useState<{ title: string; description: string; image: string; contentType: string } | null>(null);
    
    // Venus sprite animation state
    const [venusFrame, setVenusFrame] = useState(0);
    
    // Instructions modal (shows at start)
    const [showInstructions, setShowInstructions] = useState(true);
    const [instructionStep, setInstructionStep] = useState(0);
    
    // Detect mobile screen size changes
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    
    // Flying button for trap clearing
    const [activeTrap, setActiveTrap] = useState<string | null>(null);
    const [flyingButtonPos, setFlyingButtonPos] = useState({ x: 400, y: 300 });
    const [trapClicks, setTrapClicks] = useState(0);
    
    // Safe zone indicator (shows where to go when pressure is red)
    // Randomize position on each game start to keep it unpredictable
    const [safeZonePos, setSafeZonePos] = useState(() => ({ 
        x: Math.floor(Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2), 
        y: Math.floor(Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.25) 
    }));

    // Title auto-hide
    useEffect(() => {
        const timer = setTimeout(() => setShowTitle(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    // MECHANIC 1: Atmospheric pressure fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setPressure(prev => {
                const isInSafeZone = pressure >= 40 && pressure <= 70;
                
                // Check if telescope is near the safe zone indicator
                const distanceToSafeZone = Math.sqrt(
                    Math.pow(telescopePos.x - safeZonePos.x, 2) +
                    Math.pow(telescopePos.y - safeZonePos.y, 2)
                );
                const isAtSafeZoneLocation = distanceToSafeZone < 150; // Within safe zone radius
                
                // If pressure is bad AND telescope is at safe zone location, stabilize it
                if (!isInSafeZone && isAtSafeZoneLocation) {
                    // Move pressure toward 55 (middle of safe zone)
                    const targetPressure = 55;
                    const correction = (targetPressure - prev) * 0.5; // Fast stabilization (50% per second)
                    return Math.max(0, Math.min(100, prev + correction));
                }
                
                // Otherwise, normal fluctuation
                const changeAmount = pressureIsWild ? 20 : 10;
                const change = (Math.random() - 0.5) * changeAmount;
                const newPressure = prev + change;
                return Math.max(0, Math.min(100, newPressure));
            });
        }, pressureIsWild ? 500 : 1000); // Faster changes when wild
        return () => clearInterval(interval);
    }, [pressureIsWild, telescopePos, safeZonePos, pressure]);

    // Update safe zone position when pressure enters red zone
    useEffect(() => {
        const inSafeZone = pressure >= 40 && pressure <= 70;
        if (!inSafeZone) {
            // Randomize safe zone location when pressure is red
            const interval = setInterval(() => {
                // Check if telescope is currently at safe zone - don't move it if they're there!
                const distanceToSafeZone = Math.sqrt(
                    Math.pow(telescopePos.x - safeZonePos.x, 2) +
                    Math.pow(telescopePos.y - safeZonePos.y, 2)
                );
                const isAtSafeZone = distanceToSafeZone < 150;
                
                if (!isAtSafeZone) {
                    setSafeZonePos({
                        x: Math.floor(Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2),
                        y: Math.floor(Math.random() * (window.innerHeight * 0.5) + window.innerHeight * 0.25)
                    });
                }
            }, 8000); // Move safe zone every 8 seconds (if player not there)
            return () => clearInterval(interval);
        }
    }, [pressure, telescopePos, safeZonePos]);
    
    // Animate Venus sprite (6 frames) when trivia modal is showing slow-spinning content
    useEffect(() => {
        if (showTriviaModal && triviaContent && triviaContent.contentType === 'slow-spinning') {
            const interval = setInterval(() => {
                setVenusFrame(prev => (prev + 1) % 6); // Cycle through 6 frames
            }, 200); // Change frame every 200ms for smooth rotation
            return () => clearInterval(interval);
        } else {
            setVenusFrame(0); // Reset to first frame when modal closes
        }
    }, [showTriviaModal, triviaContent]);

    // MECHANIC 2: Day/Night cycle (Venus has 116 Earth-day rotation)
    useEffect(() => {
        const interval = setInterval(() => {
            setDayNightPhase(prev => (prev + 0.5) % 200); // Full cycle every 400 ticks
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // MECHANIC 3: Atmospheric cloud layers scrolling
    useEffect(() => {
        const interval = setInterval(() => {
            setCloudLayer1Offset(prev => (prev + 0.5) % 100);
            setCloudLayer2Offset(prev => (prev + 0.3) % 100);
            setCloudLayer3Offset(prev => (prev + 0.7) % 100);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // MECHANIC 4: Acid rain generation
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.3) { // 30% chance each interval
                const newDrop: AcidDrop = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * window.innerWidth,
                    y: -20,
                    speed: 2 + Math.random() * 3,
                };
                setAcidDrops(prev => [...prev, newDrop]);
            }
        }, 500);
        return () => clearInterval(interval);
    }, []);

    // MECHANIC 5: Acid rain animation (visual only, no collision)
    useEffect(() => {
        const interval = setInterval(() => {
            setAcidDrops(prev => {
                const updated = prev.map(drop => ({
                    ...drop,
                    y: drop.y + drop.speed,
                })).filter(drop => drop.y < window.innerHeight);

                return updated;
            });
        }, 50);
        return () => clearInterval(interval);
    }, [telescopePos, telescopeRadius]);

    // TRAP EFFECT: Heat blast continuous shake (visual only, no auto-clear)
    useEffect(() => {
        if (!heatBlastActive) return;
        
        const interval = setInterval(() => {
            setScreenShake({
                x: (Math.random() - 0.5) * 15,
                y: (Math.random() - 0.5) * 15,
            });
        }, 50);

        return () => {
            clearInterval(interval);
            setScreenShake({ x: 0, y: 0 });
        };
    }, [heatBlastActive]);

    // VISUAL FX: Heat wave screen distortion
    useEffect(() => {
        const interval = setInterval(() => {
            setHeatWaveIntensity(Math.sin(Date.now() / 500) * 3 + 5);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // VISUAL FX: Lightning strikes
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.15) { // 15% chance
                const newLightning: Lightning = {
                    id: Date.now(),
                    x: Math.random() * window.innerWidth,
                    opacity: 1,
                };
                setLightning(prev => [...prev, newLightning]);
                setFlashIntensity(0.4);
                
                // Fade lightning
                setTimeout(() => {
                    setLightning(prev => prev.filter(l => l.id !== newLightning.id));
                }, 200);
                
                // Fade screen flash
                setTimeout(() => setFlashIntensity(0), 150);
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // VISUAL FX: Atmospheric particles
    useEffect(() => {
        const interval = setInterval(() => {
            // Spawn ash/dust particles
            if (Math.random() < 0.5) {
                const newParticle: Particle = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 100,
                    color: Math.random() > 0.5 ? '#ff6b35' : '#ffa737',
                    size: Math.random() * 4 + 2,
                };
                setParticles(prev => [...prev, newParticle]);
            }
        }, 100);
        return () => clearInterval(interval);
    }, []);

    // VISUAL FX: Particle animation
    useEffect(() => {
        const interval = setInterval(() => {
            setParticles(prev => 
                prev
                    .map(p => ({
                        ...p,
                        x: p.x + p.vx,
                        y: p.y + p.vy,
                        life: p.life - 1,
                    }))
                    .filter(p => p.life > 0 && p.x > 0 && p.x < window.innerWidth && p.y > 0 && p.y < window.innerHeight)
            );
        }, 50);
        return () => clearInterval(interval);
    }, []);

    // MECHANIC 7: Volcanic eruptions spawning temporary packets
    // DISABLED for mystery packet system - we have a fixed set of 8 packets
    /*
    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.random() < 0.2) { // 20% chance
                const eruption = {
                    x: Math.random() * (window.innerWidth - 200) + 100,
                    y: Math.random() * (window.innerHeight - 200) + 100,
                };
                setVolcanicEruption(eruption);

                // Screen shake effect
                const shakeInterval = setInterval(() => {
                    setScreenShake({
                        x: (Math.random() - 0.5) * 10,
                        y: (Math.random() - 0.5) * 10,
                    });
                }, 50);

                // Spawn explosion particles
                for (let i = 0; i < 20; i++) {
                    setTimeout(() => {
                        const angle = (Math.PI * 2 * i) / 20;
                        const speed = 3 + Math.random() * 4;
                        const particle: Particle = {
                            id: Date.now() + Math.random(),
                            x: eruption.x,
                            y: eruption.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 80,
                            color: Math.random() > 0.5 ? '#ff4500' : '#ff8c00',
                            size: 6 + Math.random() * 4,
                        };
                        setParticles(prev => [...prev, particle]);
                    }, i * 10);
                }

                // Stop shaking
                setTimeout(() => {
                    clearInterval(shakeInterval);
                    setScreenShake({ x: 0, y: 0 });
                }, 500);

                // Flash screen
                setFlashIntensity(0.3);
                setTimeout(() => setFlashIntensity(0), 200);

                // Spawn temporary packet
                const tempPacket: DataPacket = {
                    id: `volcanic-${Date.now()}`,
                    x: eruption.x,
                    y: eruption.y,
                    image: "/assets/data_packet_venus.png",
                    title: "Volcanic Data",
                    description: "Venus has more volcanoes than any other planet! Over 1,600 major volcanoes cover the surface.",
                    found: false,
                    temporary: true,
                };
                setDataPackets(prev => [...prev, tempPacket]);

                // Remove eruption effect after animation
                setTimeout(() => setVolcanicEruption(null), 1000);

                // Remove temp packet after 5 seconds if not collected
                setTimeout(() => {
                    setDataPackets(prev => prev.filter(p => p.id !== tempPacket.id));
                }, 5000);
            }
        }, 8000); // Every 8 seconds
        return () => clearInterval(interval);
    }, []);
    */

    // Cleanup intervals on unmount
    useEffect(() => {
        return () => {
            if (scanningIntervalRef.current) {
                clearInterval(scanningIntervalRef.current);
            }
            if (volcanicTimerRef.current) {
                clearTimeout(volcanicTimerRef.current);
            }
            if (acidRainTimerRef.current) {
                clearTimeout(acidRainTimerRef.current);
            }
        };
    }, []);

    const handleSceneMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!sceneRef.current) return;
        const rect = sceneRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setTelescopePos({ x, y });
    };

    // MECHANIC 8: Multi-step scanning - hold to scan packets
    const handleSceneMouseDown = () => {
        if (!sceneRef.current) return;

        // TRAP CHECK: Broken lens prevents scanning
        if (lensIsBroken) {
            return; // Can't scan with broken lens!
        }

        // Check if we're hovering over a packet
        const targetPacket = dataPackets.find(packet => {
            const distance = Math.sqrt(
                Math.pow(packet.x + 50 - telescopePos.x, 2) + 
                Math.pow(packet.y + 50 - telescopePos.y, 2)
            );
            return distance < 50 && !packet.found;
        });

        if (targetPacket) {
            // Check if pressure is in safe zone (40-70)
            const inSafeZone = pressure >= 40 && pressure <= 70;
            if (!inSafeZone) {
                return; // Can't scan outside safe pressure zone
            }

            setScanningPacket(targetPacket);
            setScanProgress(0);

            // Start scanning progress
            if (scanningIntervalRef.current) {
                clearInterval(scanningIntervalRef.current);
            }

            scanningIntervalRef.current = window.setInterval(() => {
                setScanProgress(prev => {
                    const newProgress = prev + 2; // 2% per tick = 50 ticks = ~2.5 seconds
                    if (newProgress >= 100) {
                        // SCAN COMPLETE - OPEN THE PACKET!
                        setDataPackets(prevPackets =>
                            prevPackets.map(p =>
                                (p.contentType === targetPacket.contentType && p.x === targetPacket.x && p.y === targetPacket.y) 
                                    ? { ...p, opened: true } 
                                    : p
                            )
                        );
                        
                        setRecentlyOpenedPacket(targetPacket);
                        setTimeout(() => setRecentlyOpenedPacket(null), 3000);

                        // Handle packet contents
                        if (targetPacket.type === 'data') {
                            // DATA PACKET - Success!
                            
                            // Show trivia modal with custom content
                            const triviaData = {
                                'hot-potato': {
                                    title: "🔥 Hot Potato",
                                    description: "Venus is the hottest planet. It's like a giant pizza oven in space!",
                                    image: "/assets/hot_potato_venus.png",
                                    contentType: targetPacket.contentType
                                },
                                'acid-clouds': {
                                    title: "☁️ Acid Clouds",
                                    description: "It doesn't rain water; it rains acid that would sting your skin.",
                                    image: "/assets/acid_cloud_venus.png",
                                    contentType: targetPacket.contentType
                                },
                                'slow-spinning': {
                                    title: "🌀 Slow Spinning Venus",
                                    description: "Venus spins so slowly that you could walk faster than the planet rotates!",
                                    image: "/assets/slow_spinning_venus.png",
                                    contentType: targetPacket.contentType
                                },
                                'rocks': {
                                    title: "🪨 Rocky Planet",
                                    description: "No moon, 116 days rotation, same gravity as the Earth.",
                                    image: "/assets/venus_rock.png",
                                    contentType: targetPacket.contentType
                                }
                            };
                            
                            setTriviaContent(triviaData[targetPacket.contentType as 'hot-potato' | 'acid-clouds' | 'slow-spinning' | 'rocks']);
                            setShowTriviaModal(true);
                            
                            // SUCCESS VISUAL FEEDBACK
                            setFlashIntensity(0.5);
                            setTimeout(() => setFlashIntensity(0), 300);
                            
                            // Success particles (cyan)
                            for (let i = 0; i < 15; i++) {
                                setTimeout(() => {
                                    const angle = (Math.PI * 2 * i) / 15;
                                    const speed = 2 + Math.random() * 2;
                                    const particle: Particle = {
                                        id: Date.now() + Math.random(),
                                        x: targetPacket.x + 50,
                                        y: targetPacket.y + 50,
                                        vx: Math.cos(angle) * speed,
                                        vy: Math.sin(angle) * speed,
                                        life: 60,
                                        color: '#22c5ea',
                                        size: 4,
                                    };
                                    setParticles(prev => [...prev, particle]);
                                }, i * 20);
                            }
                        } else {
                            // TRAP PACKET - Trigger trap effect!
                            handleTrapEffect(targetPacket.contentType);
                            
                            // TRAP VISUAL FEEDBACK (red)
                            setFlashIntensity(0.7);
                            setTimeout(() => setFlashIntensity(0), 400);
                            
                            // Explosion particles (red/orange)
                            for (let i = 0; i < 25; i++) {
                                setTimeout(() => {
                                    const angle = (Math.PI * 2 * i) / 25;
                                    const speed = 3 + Math.random() * 3;
                                    const particle: Particle = {
                                        id: Date.now() + Math.random(),
                                        x: targetPacket.x + 50,
                                        y: targetPacket.y + 50,
                                        vx: Math.cos(angle) * speed,
                                        vy: Math.sin(angle) * speed,
                                        life: 80,
                                        color: Math.random() > 0.5 ? '#ef4444' : '#f97316',
                                        size: 6,
                                    };
                                    setParticles(prev => [...prev, particle]);
                                }, i * 15);
                            }
                        }
                        
                        setScanningPacket(null);
                        setScanProgress(0);
                        
                        if (scanningIntervalRef.current) {
                            clearInterval(scanningIntervalRef.current);
                        }
                        return 0;
                    }
                    return newProgress;
                });
            }, 50);
        }
    };

    // Handle trap effects - now activates flying button mechanic
    const handleTrapEffect = (trapType: string) => {
        setActiveTrap(trapType);
        setTrapClicks(0);
        // Randomize button position
        setFlyingButtonPos({
            x: Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2,
            y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
        });
        
        switch (trapType) {
            case 'broken-lens':
                setLensIsBroken(true);
                break;
            case 'acid-mist':
                setAcidMistLevel(100);
                break;
            case 'pressure-spike':
                setPressureIsWild(true);
                break;
            case 'heat-blast':
                setHeatBlastActive(true);
                setFlashIntensity(0.8);
                setTimeout(() => setFlashIntensity(0), 200);
                break;
            case 'volcanic-ash':
                // Spawn lots of particles
                for (let i = 0; i < 50; i++) {
                    setTimeout(() => {
                        const particle: Particle = {
                            id: Date.now() + Math.random(),
                            x: Math.random() * window.innerWidth,
                            y: Math.random() * window.innerHeight,
                            vx: (Math.random() - 0.5) * 3,
                            vy: (Math.random() - 0.5) * 3,
                            life: 150,
                            color: Math.random() > 0.5 ? '#78350f' : '#92400e',
                            size: 4 + Math.random() * 6,
                        };
                        setParticles(prev => [...prev, particle]);
                    }, i * 50);
                }
                break;
        }
    };

    // Click flying button to clear trap
    const handleFlyingButtonClick = () => {
        setTrapClicks(prev => prev + 1);
        
        // Different traps need different click counts
        const clicksNeeded = activeTrap === 'acid-mist' ? 10 : 
                           activeTrap === 'broken-lens' ? 8 :
                           activeTrap === 'pressure-spike' ? 6 :
                           activeTrap === 'heat-blast' ? 8 : 5;
        
        // Gradually reduce trap effect with each click
        switch (activeTrap) {
            case 'acid-mist':
                setAcidMistLevel(prev => Math.max(0, prev - 10));
                break;
            case 'broken-lens':
                if (trapClicks >= clicksNeeded - 1) {
                    setLensIsBroken(false);
                }
                break;
            case 'pressure-spike':
                if (trapClicks >= clicksNeeded - 1) {
                    setPressureIsWild(false);
                }
                break;
            case 'heat-blast':
                if (trapClicks >= clicksNeeded - 1) {
                    setHeatBlastActive(false);
                }
                break;
        }
        
        // Check if trap is cleared
        if (trapClicks >= clicksNeeded - 1) {
            setActiveTrap(null);
            setTrapClicks(0);
        } else {
            // Move button to random position
            setFlyingButtonPos({
                x: Math.random() * (window.innerWidth * 0.6) + window.innerWidth * 0.2,
                y: Math.random() * (window.innerHeight * 0.6) + window.innerHeight * 0.2
            });
        }
    };

    const handleSceneMouseUp = () => {
        // Cancel scanning if mouse released
        if (scanningIntervalRef.current) {
            clearInterval(scanningIntervalRef.current);
        }
        setScanningPacket(null);
        setScanProgress(0);
    };

    // Only count DATA packets for completion (4 required, traps don't count)
    const allFound = dataPackets.filter(p => p.type === 'data' && p.opened).length === 4;
    const inSafeZone = pressure >= 40 && pressure <= 70;
    const isDaytime = dayNightPhase < 100;

    return (
        <div
            className="w-screen h-screen relative overflow-hidden bg-black"
            style={{
                transform: `translate(${screenShake.x}px, ${screenShake.y}px)`,
                transition: 'transform 0.05s',
            }}
        >
            {/* SCREEN FLASH OVERLAY */}
            {flashIntensity > 0 && (
                <div
                    className="absolute inset-0 z-50 pointer-events-none transition-opacity duration-200"
                    style={{
                        backgroundColor: `rgba(255, 200, 100, ${flashIntensity})`,
                    }}
                />
            )}

            {/* LIGHTNING STRIKES */}
            {lightning.map(bolt => (
                <div
                    key={bolt.id}
                    className="absolute top-0 bottom-0 z-25 pointer-events-none"
                    style={{
                        left: `${bolt.x}px`,
                        width: '4px',
                        background: 'linear-gradient(to bottom, rgba(255,255,200,0.9) 0%, rgba(255,255,150,0.6) 50%, transparent 100%)',
                        boxShadow: '0 0 20px rgba(255,255,200,0.8), 0 0 40px rgba(255,200,100,0.5)',
                        opacity: bolt.opacity,
                        filter: 'blur(1px)',
                    }}
                />
            ))}

            {/* ATMOSPHERIC PARTICLES (ash, dust) */}
            {particles.map(particle => (
                <div
                    key={particle.id}
                    className="absolute z-14 pointer-events-none rounded-full"
                    style={{
                        left: `${particle.x}px`,
                        top: `${particle.y}px`,
                        width: `${particle.size}px`,
                        height: `${particle.size}px`,
                        backgroundColor: particle.color,
                        opacity: particle.life / 100,
                        boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
                    }}
                />
            ))}

            {/* ATMOSPHERIC CLOUD LAYERS (3 layers scrolling at different speeds) */}
            <div className="absolute inset-0 z-5 pointer-events-none">
                {/* Layer 1 - Slow */}
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: `radial-gradient(ellipse at ${cloudLayer1Offset}% 50%, rgba(255,200,100,0.4) 0%, transparent 50%)`,
                        filter: 'blur(2px)',
                    }}
                />
                {/* Layer 2 - Medium */}
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        background: `radial-gradient(ellipse at ${cloudLayer2Offset}% 30%, rgba(255,180,80,0.5) 0%, transparent 50%)`,
                        filter: 'blur(3px)',
                    }}
                />
                {/* Layer 3 - Fast */}
                <div
                    className="absolute inset-0 opacity-35"
                    style={{
                        background: `radial-gradient(ellipse at ${cloudLayer3Offset}% 70%, rgba(200,150,70,0.4) 0%, transparent 50%)`,
                        filter: 'blur(1px)',
                    }}
                />
            </div>

            {/* DAY/NIGHT CYCLE OVERLAY */}
            <div
                className="absolute inset-0 z-6 pointer-events-none transition-opacity duration-1000"
                style={{
                    backgroundColor: isDaytime ? 'rgba(255, 200, 100, 0.15)' : 'rgba(20, 10, 40, 0.7)',
                    opacity: Math.abs(dayNightPhase - 100) / 100,
                }}
            />

            {/* HEAT WAVE DISTORTION OVERLAY */}
            <div
                className="absolute inset-0 z-7 pointer-events-none"
                style={{
                    background: `repeating-linear-gradient(
                        ${heatWaveIntensity}deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 100, 0, 0.03) 10px,
                        rgba(255, 100, 0, 0.03) 20px
                    )`,
                    animation: 'heatWave 3s ease-in-out infinite',
                }}
            />

            {/* ACID RAIN PARTICLES */}
            {acidDrops.map(drop => (
                <div
                    key={drop.id}
                    className="absolute z-15 pointer-events-none"
                    style={{
                        left: `${drop.x}px`,
                        top: `${drop.y}px`,
                    }}
                >
                    <div 
                        className="w-1 h-8 bg-linear-to-b from-green-400 to-transparent opacity-60"
                        style={{
                            transform: 'rotate(15deg)',
                            boxShadow: '0 0 4px rgba(74, 222, 128, 0.6)',
                        }}
                    />
                </div>
            ))}

            {/* SAFE ZONE RADAR - Shows where to move when pressure is red */}
            {(pressure < 40 || pressure > 70) && (() => {
                // Check if telescope is at safe zone
                const distanceToSafeZone = Math.sqrt(
                    Math.pow(telescopePos.x - safeZonePos.x, 2) +
                    Math.pow(telescopePos.y - safeZonePos.y, 2)
                );
                const isAtSafeZone = distanceToSafeZone < 150;
                
                return (
                    <div
                        className="absolute z-16 pointer-events-none"
                        style={{
                            left: `${safeZonePos.x}px`,
                            top: `${safeZonePos.y}px`,
                            transform: 'translate(-50%, -50%)',
                        }}
                    >
                        {/* Outer pulsing ring */}
                        <div 
                            className={isAtSafeZone ? "absolute rounded-full" : "absolute animate-ping rounded-full"}
                            style={{
                                width: '300px',
                                height: '300px',
                                left: '-150px',
                                top: '-150px',
                                background: isAtSafeZone 
                                    ? 'radial-gradient(circle, rgba(34, 197, 128, 0.2) 0%, transparent 70%)' 
                                    : 'radial-gradient(circle, rgba(34, 197, 128, 0.4) 0%, transparent 70%)',
                                border: isAtSafeZone ? '4px solid rgba(34, 197, 128, 1)' : '3px solid rgba(34, 197, 128, 0.6)',
                                boxShadow: isAtSafeZone 
                                    ? '0 0 50px rgba(34, 197, 128, 1), inset 0 0 40px rgba(34, 197, 128, 0.5)' 
                                    : '0 0 30px rgba(34, 197, 128, 0.8), inset 0 0 20px rgba(34, 197, 128, 0.3)',
                            }}
                        />
                        {/* Middle ring */}
                        <div 
                            className="absolute animate-pulse rounded-full"
                            style={{
                                width: '100px',
                                height: '100px',
                                left: '-50px',
                                top: '-50px',
                                background: 'radial-gradient(circle, rgba(34, 197, 128, 0.3) 0%, transparent 70%)',
                                border: '2px solid rgba(34, 197, 128, 0.8)',
                                boxShadow: '0 0 20px rgba(34, 197, 128, 1)',
                                animationDelay: '0.2s',
                            }}
                        />
                        {/* Center glow */}
                        <div 
                            className="absolute rounded-full"
                            style={{
                                width: '40px',
                                height: '40px',
                                left: '-20px',
                                top: '-20px',
                                background: 'radial-gradient(circle, rgba(34, 197, 128, 0.9) 0%, rgba(34, 197, 128, 0.4) 100%)',
                                boxShadow: '0 0 25px rgba(34, 197, 128, 1), inset 0 0 15px rgba(255, 255, 255, 0.6)',
                            }}
                        />
                        {/* Label */}
                        <div 
                            className="absolute font-['Press_Start_2P'] text-green-400 text-[10px] whitespace-nowrap animate-pulse"
                            style={{
                                top: '60px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                textShadow: '0 0 10px rgba(34, 197, 128, 1), 0 0 20px rgba(34, 197, 128, 0.8)',
                            }}
                        >
                            {isAtSafeZone ? '✓ IN SAFE ZONE!' : 'SAFE ZONE'}
                        </div>
                    </div>
                );
            })()}

            {/* Animated Venus Background Spritesheet - revealed by mask */}
            <div
                ref={backgroundRef}
                className="absolute inset-0 z-10"
                style={{
                    backgroundImage: "url(/assets/venus_background.png)",
                    backgroundSize: "100% 200%",
                    backgroundPosition: "0% 0%",
                    backgroundRepeat: "no-repeat",
                    animation: "venus-sprite 1s steps(1) infinite",
                    WebkitMaskImage: `radial-gradient(circle ${telescopeRadius}px at ${telescopePos.x}px ${telescopePos.y}px, black ${telescopeRadius}px, transparent ${telescopeRadius + 1}px)`,
                    maskImage: `radial-gradient(circle ${telescopeRadius}px at ${telescopePos.x}px ${telescopePos.y}px, black ${telescopeRadius}px, transparent ${telescopeRadius + 1}px)`,
                }}
            />

            {/* ACID MIST OVERLAY (from trap) - Very heavy fog */}
            {acidMistLevel > 0 && (
                <div
                    className="absolute inset-0 z-19 pointer-events-none"
                    style={{
                        background: `radial-gradient(circle at ${telescopePos.x}px ${telescopePos.y}px, 
                            rgba(180,255,180,${acidMistLevel / 100}) 0%, 
                            rgba(100,220,100,${acidMistLevel / 80}) ${telescopeRadius * 0.8}px,
                            transparent ${telescopeRadius}px)`,
                        backdropFilter: `blur(${acidMistLevel / 5}px)`,
                        mixBlendMode: 'overlay',
                    }}
                >
                    {/* Dense fog clouds */}
                    {[...Array(Math.floor(acidMistLevel / 20))].map((_, i) => (
                        <div
                            key={i}
                            className="absolute rounded-full bg-green-300 opacity-30"
                            style={{
                                left: `${telescopePos.x + (Math.cos(i * 1.3) * telescopeRadius * 0.6)}px`,
                                top: `${telescopePos.y + (Math.sin(i * 1.3) * telescopeRadius * 0.6)}px`,
                                width: `${40 + i * 10}px`,
                                height: `${40 + i * 10}px`,
                                filter: 'blur(20px)',
                            }}
                        />
                    ))}
                </div>
            )}

            {/* BROKEN LENS OVERLAY (cracks across screen) */}
            {lensIsBroken && (
                <div className="absolute inset-0 z-21 pointer-events-none">
                    {/* Crack lines */}
                    <svg className="w-full h-full" style={{filter: 'drop-shadow(0 0 3px rgba(255,255,255,0.5))'}}>
                        <line x1={telescopePos.x} y1={telescopePos.y} x2={telescopePos.x + 200} y2={telescopePos.y - 100} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                        <line x1={telescopePos.x} y1={telescopePos.y} x2={telescopePos.x - 150} y2={telescopePos.y + 120} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                        <line x1={telescopePos.x} y1={telescopePos.y} x2={telescopePos.x + 100} y2={telescopePos.y + 180} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                        <line x1={telescopePos.x} y1={telescopePos.y} x2={telescopePos.x - 180} y2={telescopePos.y - 80} stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
                        <line x1={telescopePos.x + 100} y1={telescopePos.y - 50} x2={telescopePos.x + 150} y2={telescopePos.y - 120} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                        <line x1={telescopePos.x - 80} y1={telescopePos.y + 60} x2={telescopePos.x - 120} y2={telescopePos.y + 140} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                    </svg>
                </div>
            )}

            {/* VIGNETTE EFFECT */}
            <div 
                className="absolute inset-0 z-8 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.4) 100%)',
                }}
            />

            {/* Animation keyframes */}
            <style>{`
                @keyframes venus-sprite {
                    0%   { background-position: 0% 0%; }
                    50%  { background-position: 0% 100%; }
                    100% { background-position: 0% 0%; }
                }
                @keyframes shimmer {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(2px, -2px); }
                    50% { transform: translate(-2px, 2px); }
                    75% { transform: translate(2px, 2px); }
                }
                @keyframes heatWave {
                    0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
                    50% { transform: translateY(-10px) rotate(2deg); opacity: 0.8; }
                }
                @keyframes pulse-glow {
                    0%, 100% { box-shadow: inset 0 0 20px rgba(34, 197, 234, 0.5), 0 0 30px rgba(34, 197, 234, 0.3); }
                    50% { box-shadow: inset 0 0 30px rgba(34, 197, 234, 0.8), 0 0 50px rgba(34, 197, 234, 0.6); }
                }
                @keyframes scanline {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(100%); }
                }
            `}</style>

            {/* Full-screen interactive telescope scene */}
            <div
                ref={sceneRef}
                className="absolute inset-0 cursor-crosshair z-20"
                onMouseMove={handleSceneMouseMove}
                onMouseDown={handleSceneMouseDown}
                onMouseUp={handleSceneMouseUp}
                onMouseLeave={handleSceneMouseUp}
            >
                {/* Mystery Packet Indicators (unknown until opened) */}
                {dataPackets.map((packet) => {
                    const packetSize = isMobile ? 60 : 100;
                    const packetCenter = packetSize / 2;
                    
                    const isWithinRadius =
                        Math.sqrt(
                            Math.pow(packet.x + packetCenter - telescopePos.x, 2) +
                                Math.pow(packet.y + packetCenter - telescopePos.y, 2)
                        ) < telescopeRadius;

                    const distanceFromCenter = Math.sqrt(
                        Math.pow(packet.x + packetCenter - telescopePos.x, 2) +
                            Math.pow(packet.y + packetCenter - telescopePos.y, 2)
                    );
                    
                    const isOnCrosshair = distanceFromCenter < 50;
                    const isScanning = 
                        scanningPacket?.contentType === packet.contentType &&
                        Math.abs(scanningPacket.x - packet.x) < 5 &&
                        Math.abs(scanningPacket.y - packet.y) < 5;

                    // Visibility based on day/night cycle
                    const visibilityMultiplier = isDaytime ? 1 : 0.5;

                    // Hide packets when a trap is active (must clear trap first)
                    if (activeTrap) return null;
                    
                    // Hide packets that have been opened (both data and trap packets vanish)
                    if (packet.opened) return null;
                    
                    // Only render packets that are within telescope radius
                    if (!isWithinRadius) return null;

                    // All visible packets are unopened (opened ones are filtered out above)
                    const glowColor = 'rgba(200, 200, 200, 0.4)'; // Unopened = gray
                    const packetLabel = '?';

                    return (
                        <div
                            key={`${packet.contentType}-${packet.x}`}
                            className="absolute transition-all opacity-100"
                            style={{
                                left: `${packet.x}px`,
                                top: `${packet.y}px`,
                                animation: 'shimmer 0.8s ease-in-out infinite',
                            }}
                        >
                            {/* Glow ring when targeted */}
                            {isOnCrosshair && (
                                <div 
                                    className="absolute -inset-4 rounded-full animate-pulse"
                                    style={{
                                        background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                                        filter: 'blur(8px)',
                                    }}
                                />
                            )}
                            
                            {/* Mystery Box (unopened) or Revealed Packet (opened) */}
                            <div
                                className="relative flex items-center justify-center"
                                style={{
                                    width: isMobile ? "60px" : "100px",
                                    height: isMobile ? "60px" : "100px",
                                }}
                            >
                                {/* Background rock image */}
                                <img
                                    src="/assets/data_packet_venus.png"
                                    alt="Packet"
                                    className="absolute inset-0 cursor-pointer"
                                    style={{
                                        width: isMobile ? "60px" : "100px",
                                        height: isMobile ? "60px" : "100px",
                                        filter: `
                                            ${isOnCrosshair ? "drop-shadow(0 0 20px rgba(251, 191, 36, 1)) brightness(1.5)" : `brightness(1) drop-shadow(0 0 8px ${glowColor})`}
                                            brightness(${visibilityMultiplier})
                                        `,
                                        pointerEvents: 'auto',
                                    }}
                                />
                                
                                {/* Packet label overlay */}
                                <div 
                                    className="absolute z-10 font-['Press_Start_2P'] pointer-events-none"
                                    style={{
                                        fontSize: isMobile ? '16px' : '24px',
                                        color: '#d1d5db',
                                        textShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor}`,
                                    }}
                                >
                                    {packetLabel}
                                </div>
                            </div>
                            
                            {/* Scanning progress circle */}
                            {isScanning && (
                                <div
                                    className="absolute top-0 left-0 w-full h-full flex items-center justify-center pointer-events-none"
                                >
                                    <svg className={isMobile ? "w-20 h-20" : "w-32 h-32"} style={{transform: 'rotate(-90deg)'}}>
                                        <circle
                                            cx={isMobile ? "40" : "64"}
                                            cy={isMobile ? "40" : "64"}
                                            r={isMobile ? "36" : "60"}
                                            stroke="rgba(34, 197, 234, 0.3)"
                                            strokeWidth="4"
                                            fill="none"
                                        />
                                        <circle
                                            cx={isMobile ? "40" : "64"}
                                            cy={isMobile ? "40" : "64"}
                                            r={isMobile ? "36" : "60"}
                                            stroke="rgba(34, 197, 234, 1)"
                                            strokeWidth="4"
                                            fill="none"
                                            strokeDasharray={`${2 * Math.PI * (isMobile ? 36 : 60)}`}
                                            strokeDashoffset={`${2 * Math.PI * (isMobile ? 36 : 60) * (1 - scanProgress / 100)}`}
                                            className="transition-all duration-100"
                                            style={{
                                                filter: 'drop-shadow(0 0 6px rgba(34, 197, 234, 0.8))',
                                            }}
                                        />
                                    </svg>
                                    <span className={`absolute text-cyan-400 font-['Press_Start_2P'] ${isMobile ? 'text-[8px]' : 'text-xs'}`}
                                          style={{
                                              textShadow: '0 0 8px rgba(34, 197, 234, 1)',
                                          }}>
                                        {Math.floor(scanProgress)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Telescope Viewport */}
                <div
                    className="absolute border-4 border-cyan-400 rounded-full pointer-events-none"
                    style={{
                        width: `${telescopeRadius * 2}px`,
                        height: `${telescopeRadius * 2}px`,
                        left: `${telescopePos.x - telescopeRadius}px`,
                        top: `${telescopePos.y - telescopeRadius}px`,
                        animation: 'pulse-glow 2s ease-in-out infinite',
                    }}
                >
                    {/* Scanning scanline effect */}
                    {scanningPacket && (
                        <div 
                            className="absolute inset-0 overflow-hidden rounded-full"
                        >
                            <div 
                                className="absolute w-full h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-50"
                                style={{
                                    animation: 'scanline 2s linear infinite',
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Center crosshair - Enhanced */}
                <div
                    className="absolute pointer-events-none"
                    style={{
                        width: "40px",
                        height: "40px",
                        left: `${telescopePos.x - 20}px`,
                        top: `${telescopePos.y - 20}px`,
                    }}
                >
                    {/* Main crosshair */}
                    <div className="absolute w-full h-0.5 top-1/2 left-0 bg-cyan-400" style={{boxShadow: '0 0 4px rgba(34, 197, 234, 0.8)'}} />
                    <div className="absolute h-full w-0.5 left-1/2 top-0 bg-cyan-400" style={{boxShadow: '0 0 4px rgba(34, 197, 234, 0.8)'}} />
                    
                    {/* Corner brackets */}
                    <div className="absolute w-2 h-2 border-l-2 border-t-2 border-cyan-400 top-0 left-0" />
                    <div className="absolute w-2 h-2 border-r-2 border-t-2 border-cyan-400 top-0 right-0" />
                    <div className="absolute w-2 h-2 border-l-2 border-b-2 border-cyan-400 bottom-0 left-0" />
                    <div className="absolute w-2 h-2 border-r-2 border-b-2 border-cyan-400 bottom-0 right-0" />
                    
                    {/* Center dot */}
                    <div className="absolute w-1 h-1 bg-red-500 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                         style={{boxShadow: '0 0 6px rgba(239, 68, 68, 1)'}} />
                </div>
            </div>

            {/* UI Overlay - positioned absolutely */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-4 pointer-events-none z-30">
                {/* Instructions Modal */}
                {showInstructions && (
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 pointer-events-auto"
                    >
                        <div 
                            className="bg-linear-to-b from-orange-900 to-yellow-900 border-2 sm:border-4 border-yellow-400 p-4 sm:p-8 max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
                            style={{
                                boxShadow: '0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4)',
                            }}
                        >
                            {/* Title */}
                            <div className="text-center mb-4 sm:mb-6">
                                <p className="font-['Press_Start_2P'] text-yellow-300 text-base sm:text-2xl mb-2"
                                   style={{
                                       textShadow: '0 0 15px rgba(251, 191, 36, 1)',
                                   }}>
                                    VENUS MISSION
                                </p>
                                <p className="font-['Press_Start_2P'] text-orange-300 text-xs sm:text-sm"
                                   style={{
                                       textShadow: '0 0 10px rgba(251, 146, 60, 1)',
                                   }}>
                                    The Acid Haze
                                </p>
                            </div>
                            
                            {/* Step Content */}
                            <div className="min-h-40 sm:min-h-75">
                                {instructionStep === 0 && (
                                    <div className="bg-black bg-opacity-50 border border-blue-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-blue-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(96, 165, 250, 1)',
                                           }}>
                                            🎯 OBJECTIVE:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            Find all 4 DATA PACKETS to reactivate Venus's planetary core!
                                        </p>
                                    </div>
                                )}
                                
                                {instructionStep === 1 && (
                                    <div className="bg-black bg-opacity-50 border border-cyan-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-cyan-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(34, 211, 238, 1)',
                                           }}>
                                            🔍 SCANNING:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4">
                                            Move telescope with your mouse.
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            HOLD CLICK on mystery packets to scan them.
                                        </p>
                                    </div>
                                )}
                                
                                {instructionStep === 2 && (
                                    <div className="bg-black bg-opacity-50 border border-green-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-green-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(34, 197, 94, 1)',
                                           }}>
                                            🟢 ATMOSPHERIC PRESSURE:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4">
                                            You can ONLY SCAN when pressure is in the SAFE ZONE (40-70).
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            If pressure goes red, move to the GREEN BEACON to stabilize it!
                                        </p>
                                    </div>
                                )}
                                
                                {instructionStep === 3 && (
                                    <div className="bg-black bg-opacity-50 border border-purple-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-purple-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(168, 85, 247, 1)',
                                           }}>
                                            ❓ MYSTERY PACKETS:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4">
                                            Each packet is a MYSTERY!
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            Some contain DATA (good!), others are TRAPS (bad!).
                                        </p>
                                    </div>
                                )}
                                
                                {instructionStep === 4 && (
                                    <div className="bg-black bg-opacity-50 border border-red-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-red-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(239, 68, 68, 1)',
                                           }}>
                                            ⚠️ TRAPS:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4">
                                            If you open a trap, a FLYING BUTTON appears.
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            Click it multiple times to clear the trap!
                                        </p>
                                    </div>
                                )}
                                
                                {instructionStep === 5 && (
                                    <div className="bg-black bg-opacity-50 border border-yellow-400 p-3 sm:p-6">
                                        <p className="font-['Press_Start_2P'] text-yellow-300 text-[8px] sm:text-xs mb-2 sm:mb-4"
                                           style={{
                                               textShadow: '0 0 8px rgba(251, 191, 36, 1)',
                                           }}>
                                            🌞 DAY/NIGHT CYCLE:
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed mb-2 sm:mb-4">
                                            Night reduces visibility.
                                        </p>
                                        <p className="font-['Press_Start_2P'] text-white text-xs sm:text-sm leading-relaxed">
                                            Day gives you clear view.
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            {/* Progress indicator */}
                            <div className="flex justify-center gap-1 sm:gap-2 my-3 sm:my-6">
                                {[0, 1, 2, 3, 4, 5].map((step) => (
                                    <div
                                        key={step}
                                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                                            step === instructionStep ? 'bg-yellow-400' : 'bg-gray-600'
                                        }`}
                                    />
                                ))}
                            </div>
                            
                            {/* Navigation buttons */}
                            <div className="flex justify-between items-center gap-2">
                                <div>
                                    {instructionStep > 0 && (
                                        <PixelButton 
                                            label="Back" 
                                            onClick={() => setInstructionStep(prev => prev - 1)} 
                                            variant="secondary"
                                        />
                                    )}
                                </div>
                                <div>
                                    {instructionStep < 5 ? (
                                        <PixelButton 
                                            label="Next" 
                                            onClick={() => setInstructionStep(prev => prev + 1)} 
                                            variant="primary"
                                        />
                                    ) : (
                                        <PixelButton 
                                            label="Start" 
                                            onClick={() => setShowInstructions(false)} 
                                            variant="primary"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Title - Top Center (auto-hides after 3s) */}
                {showTitle && !showInstructions && (
                    <div className="text-center px-4">
                        <h2 className="font-['Press_Start_2P'] text-yellow-500 text-base sm:text-2xl mb-1 sm:mb-2">
                            CHAPTER 2: VENUS
                        </h2>
                        <p className="font-['Press_Start_2P'] text-yellow-600 text-[8px] sm:text-xs">
                            The Acid Haze
                        </p>
                        <p className="font-['Press_Start_2P'] text-gray-400 text-[7px] sm:text-[10px] mt-1 sm:mt-2">
                            Hold click on packets to scan (only in safe pressure zone!)
                        </p>
                    </div>
                )}

                {/* FLYING BUTTON FOR TRAP CLEARING */}
                {activeTrap && (
                    <div
                        className="absolute z-50 pointer-events-auto animate-pulse"
                        style={{
                            left: `${flyingButtonPos.x}px`,
                            top: `${flyingButtonPos.y}px`,
                            transform: 'translate(-50%, -50%)',
                            transition: 'all 0.3s ease-out',
                        }}
                    >
                        {/* Glow effect */}
                        <div 
                            className="absolute inset-0 rounded-lg animate-ping"
                            style={{
                                width: '200px',
                                height: '80px',
                                left: '-50px',
                                top: '-20px',
                                background: activeTrap === 'acid-mist' ? 'rgba(34, 197, 128, 0.3)' :
                                           activeTrap === 'broken-lens' ? 'rgba(239, 68, 68, 0.3)' :
                                           activeTrap === 'pressure-spike' ? 'rgba(251, 146, 60, 0.3)' :
                                           activeTrap === 'heat-blast' ? 'rgba(239, 68, 68, 0.3)' :
                                           'rgba(120, 53, 15, 0.3)',
                                boxShadow: '0 0 40px rgba(255, 255, 255, 0.5)',
                            }}
                        />
                        {/* Button */}
                        <button
                            onClick={handleFlyingButtonClick}
                            className="relative px-4 py-2 sm:px-6 sm:py-3 font-['Press_Start_2P'] text-[8px] sm:text-xs border-2 sm:border-4 transition-all transform hover:scale-110 active:scale-95"
                            style={{
                                backgroundColor: activeTrap === 'acid-mist' ? '#10b981' :
                                               activeTrap === 'broken-lens' ? '#ef4444' :
                                               activeTrap === 'pressure-spike' ? '#f97316' :
                                               activeTrap === 'heat-blast' ? '#dc2626' :
                                               '#92400e',
                                borderColor: activeTrap === 'acid-mist' ? '#22c55e' :
                                           activeTrap === 'broken-lens' ? '#ef4444' :
                                           activeTrap === 'pressure-spike' ? '#fb923c' :
                                           activeTrap === 'heat-blast' ? '#ef4444' :
                                           '#78350f',
                                color: 'white',
                                boxShadow: activeTrap === 'acid-mist' ? '0 0 20px rgba(34, 197, 128, 1)' :
                                           activeTrap === 'broken-lens' ? '0 0 20px rgba(239, 68, 68, 1)' :
                                           activeTrap === 'pressure-spike' ? '0 0 20px rgba(251, 146, 60, 1)' :
                                           activeTrap === 'heat-blast' ? '0 0 20px rgba(239, 68, 68, 1)' :
                                           '0 0 20px rgba(120, 53, 15, 1)',
                                textShadow: '0 0 10px rgba(0, 0, 0, 0.8)',
                            }}
                        >
                            {activeTrap === 'acid-mist' && `🧹 WIPE! (${trapClicks}/10)`}
                            {activeTrap === 'broken-lens' && `🔧 REPAIR! (${trapClicks}/8)`}
                            {activeTrap === 'pressure-spike' && `⚡ STABILIZE! (${trapClicks}/6)`}
                            {activeTrap === 'heat-blast' && `❄️ COOL! (${trapClicks}/8)`}
                            {activeTrap === 'volcanic-ash' && `💨 CLEAR! (${trapClicks}/5)`}
                        </button>
                        {/* Instruction text */}
                        <div 
                            className="absolute top-12 sm:top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap font-['Press_Start_2P'] text-yellow-300 text-[7px] sm:text-[10px] animate-bounce"
                            style={{
                                textShadow: '0 0 10px rgba(0, 0, 0, 1), 0 0 20px rgba(251, 191, 36, 0.8)',
                            }}
                        >
                            CLICK TO CLEAR TRAP!
                        </div>
                    </div>
                )}

                {/* PRESSURE GAUGE - Top Left */}
                <div className="absolute top-1 left-1 sm:top-4 sm:left-4 pointer-events-auto">
                    <div className={`bg-black border border-purple-600 ${isMobile ? 'p-1 w-28' : 'border-4 p-4 w-64'}`}
                         style={{
                             boxShadow: inSafeZone 
                                 ? '0 0 10px rgba(168, 85, 247, 0.3)' 
                                 : '0 0 10px rgba(239, 68, 68, 0.3)',
                         }}>
                        <p className={`font-['Press_Start_2P'] text-purple-400 ${isMobile ? 'text-[5px] mb-1' : 'text-xs mb-3'}`}
                           style={{textShadow: '0 0 8px rgba(168, 85, 247, 0.8)'}}>
                            {isMobile ? 'Pressure' : 'Atmospheric Pressure'}
                        </p>
                        <div className={`relative ${isMobile ? 'h-4' : 'h-8'} bg-gray-800 border border-gray-600 overflow-hidden`}>
                            {/* Safe zone indicator */}
                            <div
                                className="absolute h-full bg-green-900 opacity-30"
                                style={{
                                    left: '40%',
                                    width: '30%',
                                }}
                            />
                            {/* Current pressure */}
                            <div
                                className={`absolute h-full transition-all duration-300 ${
                                    inSafeZone ? 'bg-green-500' : 'bg-red-500'
                                }`}
                                style={{
                                    width: `${pressure}%`,
                                    boxShadow: inSafeZone 
                                        ? '0 0 15px rgba(34, 197, 128, 0.8)' 
                                        : '0 0 15px rgba(239, 68, 68, 0.8)',
                                }}
                            />
                            {/* Animated scan line */}
                            <div 
                                className="absolute h-full w-0.5 bg-white opacity-50"
                                style={{
                                    left: `${pressure}%`,
                                    boxShadow: '0 0 6px rgba(255, 255, 255, 0.8)',
                                }}
                            />
                            {/* Safe zone markers */}
                            <div className="absolute left-[40%] top-0 h-full w-0.5 bg-white" />
                            <div className="absolute left-[70%] top-0 h-full w-0.5 bg-white" />
                        </div>
                        <p className={`font-['Press_Start_2P'] ${isMobile ? 'text-[5px] mt-0.5' : 'text-[10px] mt-2'} ${
                            inSafeZone ? 'text-green-400' : 'text-red-400 animate-pulse'
                        }`}
                           style={{
                               textShadow: inSafeZone 
                                   ? '0 0 6px rgba(34, 197, 128, 1)' 
                                   : '0 0 8px rgba(239, 68, 68, 1)',
                           }}>
                            {inSafeZone ? '✓ SAFE TO SCAN' : (() => {
                                const distanceToSafeZone = Math.sqrt(
                                    Math.pow(telescopePos.x - safeZonePos.x, 2) +
                                    Math.pow(telescopePos.y - safeZonePos.y, 2)
                                );
                                const isAtSafeZone = distanceToSafeZone < 150;
                                return isAtSafeZone ? '⏳ STABILIZING...' : '⚠ MOVE TO SAFE ZONE';
                            })()}
                        </p>
                    </div>
                </div>

                {/* DAY/NIGHT INDICATOR - Below pressure on mobile, beside on desktop */}
                <div className={`absolute pointer-events-auto ${isMobile ? 'top-1 left-[130px]' : 'top-4 left-80'}`}>
                    <div className={`bg-black border border-yellow-600 ${isMobile ? 'p-1 w-20' : 'border-4 p-3 w-48'}`}
                         style={{
                             boxShadow: isDaytime 
                                 ? '0 0 10px rgba(251, 191, 36, 0.3)' 
                                 : '0 0 10px rgba(59, 130, 246, 0.3)',
                         }}>
                        <div className="flex items-center gap-1">
                            <span className={isMobile ? 'text-sm' : 'text-2xl'} style={{
                                filter: isDaytime 
                                    ? 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.8))' 
                                    : 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))',
                            }}>
                                {isDaytime ? '☀️' : '🌙'}
                            </span>
                            <span className={`font-['Press_Start_2P'] text-white ${isMobile ? 'text-[5px]' : 'text-xs'}`}
                                  style={{textShadow: '0 0 4px rgba(255, 255, 255, 0.5)'}}>
                                {isDaytime ? 'DAY' : 'NIGHT'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ACTIVE TRAP WARNINGS */}
                {(pressureIsWild || heatBlastActive) && (
                    <div className={`absolute ${isMobile ? 'bottom-14 left-1' : 'top-96 left-4'} pointer-events-auto`}>
                        <div className={`bg-black border border-orange-600 ${isMobile ? 'p-1 w-28' : 'border-4 p-3 w-64'}`}
                             style={{
                                 boxShadow: '0 0 10px rgba(251, 146, 60, 0.4)',
                             }}>
                            <p className={`font-['Press_Start_2P'] text-orange-400 ${isMobile ? 'text-[5px] mb-0.5' : 'text-[10px] mb-2'}`}
                               style={{textShadow: '0 0 8px rgba(251, 146, 60, 1)'}}>
                                ⚡ TRAPS
                            </p>
                            {pressureIsWild && (
                                <p className={`text-yellow-300 ${isMobile ? 'text-[4px]' : 'text-[8px]'} mb-1`}>
                                    • Pressure!
                                </p>
                            )}
                            {heatBlastActive && (
                                <p className={`text-red-300 ${isMobile ? 'text-[4px]' : 'text-[8px]'} mb-1`}>
                                    • Heat blast!
                                </p>
                            )}
                            <p className={`text-gray-400 ${isMobile ? 'text-[4px] mt-0.5' : 'text-[8px] mt-2'}`}>
                                Wait for effects...
                            </p>
                        </div>
                    </div>
                )}

                {/* Hamburger Menu Button (Mobile Only) */}
                {isMobile && (
                    <button
                        onClick={() => setIsChecklistOpen(!isChecklistOpen)}
                        className="absolute top-1 right-1 z-50 pointer-events-auto bg-yellow-800 border border-yellow-600 p-1.5 rounded"
                        style={{
                            boxShadow: '0 0 6px rgba(161, 98, 7, 0.5)',
                        }}
                    >
                        <div className="flex flex-col gap-0.5 w-4">
                            <div className="h-0.5 bg-yellow-400" />
                            <div className="h-0.5 bg-yellow-400" />
                            <div className="h-0.5 bg-yellow-400" />
                        </div>
                        <span className="font-['Press_Start_2P'] text-yellow-400 text-[4px] mt-0.5 block">
                            {dataPackets.filter(p => p.opened && p.type === 'data').length}/4
                        </span>
                    </button>
                )}

                {/* Info Panel - Top Right (Desktop always visible, Mobile shows when hamburger clicked) */}
                {(!isMobile || isChecklistOpen) && (
                    <div className={`absolute ${isMobile ? 'top-8 right-1' : 'top-4 right-4'} flex flex-col gap-1 pointer-events-auto z-40 ${isMobile ? 'w-36 max-h-[70vh] overflow-y-auto' : 'w-72 gap-4'}`}
                         style={isMobile ? {
                             backgroundColor: 'rgba(0, 0, 0, 0.95)',
                             border: '1px solid rgba(161, 98, 7, 0.8)',
                             boxShadow: '0 0 10px rgba(0, 0, 0, 0.9)',
                             padding: '4px',
                         } : {}}>
                        <div className={`bg-black border border-yellow-700 ${isMobile ? 'p-1' : 'border-4 p-4'}`}
                             style={{
                                 boxShadow: '0 0 8px rgba(161, 98, 7, 0.3)',
                             }}>
                            <p className={`font-['Press_Start_2P'] text-yellow-400 ${isMobile ? 'text-[5px] mb-1' : 'text-xs mb-3'}`}
                               style={{textShadow: '0 0 6px rgba(251, 191, 36, 0.8)'}}>
                                Mystery Packets:
                            </p>
                        <div className="space-y-2">
                            {dataPackets.filter(p => p.type === 'data').map((packet) => {
                                let statusText = '❓ UNKNOWN';
                                let statusColor = 'text-gray-400';
                                let borderColor = 'border-gray-600';
                                let bgColor = 'bg-gray-800';
                                
                                if (packet.opened) {
                                    statusText = packet.contentType === 'hot-potato' ? '🔥 HOT POTATO' :
                                                packet.contentType === 'acid-clouds' ? '☁️ ACID CLOUDS' :
                                                packet.contentType === 'slow-spinning' ? '🌀 SLOW SPIN' : '🪨 ROCKS';
                                    statusColor = 'text-blue-300';
                                    borderColor = 'border-blue-500';
                                    bgColor = 'bg-blue-900';
                                }
                                
                                const handlePacketClick = () => {
                                    if (packet.opened) {
                                        // Reopen the trivia modal for this data packet
                                        const triviaData = {
                                            'hot-potato': {
                                                title: "🔥 Hot Potato",
                                                description: "Venus is the hottest planet. It's like a giant pizza oven in space!",
                                                image: "/assets/hot_potato_venus.png",
                                                contentType: 'hot-potato'
                                            },
                                            'acid-clouds': {
                                                title: "☁️ Acid Clouds",
                                                description: "It doesn't rain water; it rains acid that would sting your skin.",
                                                image: "/assets/acid_cloud_venus.png",
                                                contentType: 'acid-clouds'
                                            },
                                            'slow-spinning': {
                                                title: "🌀 Slow Spinning Venus",
                                                description: "Venus spins so slowly that you could walk faster than the planet rotates!",
                                                image: "/assets/slow_spinning_venus.png",
                                                contentType: 'slow-spinning'
                                            },
                                            'rocks': {
                                                title: "🪨 Rocky Planet",
                                                description: "No moon, 116 days rotation, same gravity as the Earth.",
                                                image: "/assets/venus_rock.png",
                                                contentType: 'rocks'
                                            }
                                        };
                                        
                                        setTriviaContent(triviaData[packet.contentType as 'hot-potato' | 'acid-clouds' | 'slow-spinning' | 'rocks']);
                                        setShowTriviaModal(true);
                                    }
                                };
                                
                                return (
                                    <div
                                        key={`${packet.contentType}-${packet.x}`}
                                        className={`${isMobile ? 'text-[4px] p-0.5' : 'text-[10px] p-2'} font-['Press_Start_2P'] border transition-all ${borderColor} ${bgColor} ${statusColor} ${packet.opened ? 'cursor-pointer hover:brightness-125' : ''}`}
                                        onClick={handlePacketClick}
                                    >
                                        {statusText}
                                    </div>
                                );
                            })}
                        </div>
                        <div className={`${isMobile ? 'mt-1 pt-1' : 'mt-3 pt-3'} border-t border-yellow-700`}>
                            <p className={`text-blue-300 ${isMobile ? 'text-[4px]' : 'text-[10px]'} font-['Press_Start_2P']`}>
                                Data Found: {dataPackets.filter(p => p.opened && p.type === 'data').length}/4
                            </p>
                        </div>
                    </div>

                    {/* Recently Opened Packet */}
                    {recentlyOpenedPacket && (
                        <div className={`bg-black border animate-pulse ${isMobile ? 'p-1' : 'border-4 p-4'} ${recentlyOpenedPacket.type === 'data' ? 'border-blue-500' : 'border-red-500'}`}
                             style={{
                                 boxShadow: recentlyOpenedPacket.type === 'data' 
                                    ? '0 0 10px rgba(96, 165, 250, 0.4)' 
                                    : '0 0 10px rgba(239, 68, 68, 0.4)',
                             }}>
                            <p className={`font-['Press_Start_2P'] ${isMobile ? 'text-[4px] mb-0.5' : 'text-xs mb-2'} ${recentlyOpenedPacket.type === 'data' ? 'text-blue-400' : 'text-red-400'}`}
                               style={{textShadow: recentlyOpenedPacket.type === 'data' 
                                   ? '0 0 8px rgba(96, 165, 250, 1)' 
                                   : '0 0 8px rgba(239, 68, 68, 1)'}}>
                                {recentlyOpenedPacket.type === 'data' ? '✓ DATA FOUND!' : '⚠ TRAP!'}
                            </p>
                            <p className={`${isMobile ? 'text-[4px]' : 'text-xs'} text-gray-300 leading-relaxed`}>
                                {recentlyOpenedPacket.contentType === 'hot-potato' ? 'Hot potato data packet - handles with extreme heat!' :
                                 recentlyOpenedPacket.contentType === 'acid-clouds' ? 'Acid cloud composition analysis retrieved!' :
                                 recentlyOpenedPacket.contentType === 'slow-spinning' ? 'Venus rotation speed data collected!' :
                                 recentlyOpenedPacket.contentType === 'rocks' ? 'Volcanic rock samples catalogued!' :
                                 recentlyOpenedPacket.contentType === 'broken-lens' ? 'Lens shattered! Scanning disabled!' :
                                 recentlyOpenedPacket.contentType === 'acid-mist' ? 'Acid mist released! Vision obscured!' :
                                 recentlyOpenedPacket.contentType === 'pressure-spike' ? 'Pressure going wild for 15 seconds!' :
                                 recentlyOpenedPacket.contentType === 'heat-blast' ? 'Heat blast causing intense shaking!' :
                                 'Volcanic ash erupted everywhere!'}
                            </p>
                        </div>
                    )}

                    {/* Completion Message */}
                    {allFound && (
                        <div className={`bg-green-900 border border-green-500 animate-pulse ${isMobile ? 'p-1' : 'border-4 p-4'}`}
                             style={{
                                 boxShadow: '0 0 15px rgba(34, 197, 128, 0.5)',
                             }}>
                            <p className={`font-['Press_Start_2P'] text-green-300 text-center ${isMobile ? 'text-[4px]' : 'text-xs'}`}
                               style={{textShadow: '0 0 10px rgba(34, 197, 128, 1)'}}>
                                ⭐ All Found! ⭐
                            </p>
                            <div className={`text-center ${isMobile ? 'text-sm' : 'mt-2 text-2xl'}`}>
                                🌋✨🌋
                            </div>
                        </div>
                    )}
                    </div>
                )}

                {/* Trivia Modal */}
                {showTriviaModal && triviaContent && (
                    <div 
                        className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 pointer-events-auto p-1 sm:p-4"
                        onClick={() => setShowTriviaModal(false)}
                    >
                        <div 
                            className={`bg-linear-to-b from-purple-900 to-blue-900 border border-yellow-400 relative max-h-[90vh] overflow-y-auto ${isMobile ? 'p-2 mx-1 max-w-sm' : 'border-4 p-8 max-w-3xl mx-4'}`}
                            style={{
                                boxShadow: '0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4)',
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Close button */}
                            <button
                                onClick={() => setShowTriviaModal(false)}
                                className="absolute top-1 right-1 sm:top-2 sm:right-2 text-yellow-400 hover:text-yellow-200 font-['Press_Start_2P'] text-sm sm:text-xl px-2"
                                style={{
                                    textShadow: '0 0 8px rgba(251, 191, 36, 1)',
                                }}
                            >
                                ✕
                            </button>
                            
                            {/* Header */}
                            <div className={`text-center ${isMobile ? 'mb-2' : 'mb-6'}`}>
                                <p className={`font-['Press_Start_2P'] text-yellow-300 ${isMobile ? 'text-[5px] mb-0.5' : 'text-sm mb-2'}`}
                                   style={{
                                       textShadow: '0 0 10px rgba(251, 191, 36, 1)',
                                   }}>
                                    DATA PACKET DISCOVERED!
                                </p>
                                <p className={`font-['Press_Start_2P'] text-white ${isMobile ? 'text-[8px]' : 'text-2xl'}`}
                                   style={{
                                       textShadow: '0 0 15px rgba(255, 255, 255, 0.8)',
                                   }}>
                                    {triviaContent.title}
                                </p>
                            </div>
                            
                            {/* Content with Image and Description */}
                            <div className={`flex ${isMobile ? 'flex-row gap-2 mb-2' : 'flex-col sm:flex-row gap-6 mb-6'}`}>
                                {/* Data Packet Image */}
                                <div className="shrink-0 mx-auto sm:mx-0">
                                    {triviaContent.contentType === 'slow-spinning' ? (
                                        <div
                                            className={`relative overflow-hidden ${isMobile ? 'w-20 h-20' : 'w-48 h-48'}`}
                                            style={{
                                                filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.8))',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '100%',
                                                    height: '600%', // 6 frames
                                                    backgroundImage: 'url(/assets/slow_spinning_venus.png)',
                                                    backgroundSize: '100% 600%',
                                                    backgroundPosition: `0 ${venusFrame * 100}%`,
                                                    backgroundRepeat: 'no-repeat',
                                                }}
                                                className="w-full h-full"
                                            />
                                        </div>
                                    ) : (
                                        <img 
                                            src={triviaContent.image} 
                                            alt="Data Packet"
                                            className={`object-contain ${isMobile ? 'w-20 h-20' : 'w-48 h-48'}`}
                                            style={{
                                                filter: 'drop-shadow(0 0 20px rgba(96, 165, 250, 0.8))',
                                            }}
                                        />
                                    )}
                                </div>
                                
                                {/* Description */}
                                <div className={`flex-1 bg-black bg-opacity-50 border border-blue-400 flex items-center ${isMobile ? 'p-1.5' : 'border-2 p-6'}`}>
                                    <p className={`font-['Press_Start_2P'] text-blue-200 leading-relaxed ${isMobile ? 'text-[5px]' : 'text-base'}`}
                                       style={{
                                           textShadow: '0 0 8px rgba(147, 197, 253, 0.6)',
                                       }}>
                                        {triviaContent.description}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Continue button */}
                            <div className="text-center">
                                <PixelButton 
                                    label="Continue Exploring" 
                                    onClick={() => setShowTriviaModal(false)} 
                                    variant="primary"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Controls - Bottom Center */}
                <div className={`absolute ${isMobile ? 'bottom-1' : 'bottom-4'} flex flex-row gap-2 pointer-events-auto`}>
                    <PixelButton label="Back" onClick={onBack} variant="secondary" />
                    <PixelButton
                        label={isMobile ? "Next" : "Proceed to Earth"}
                        onClick={onComplete}
                        disabled={!allFound}
                    />
                </div>
            </div>
        </div>
    );
};

export default VenusGame;
