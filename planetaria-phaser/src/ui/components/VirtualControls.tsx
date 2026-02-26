import { useEffect, useState } from "react";

interface VirtualControlsProps {
  onLeftDown: () => void;
  onLeftUp: () => void;
  onRightDown: () => void;
  onRightUp: () => void;
  onJumpDown: () => void;
  onJumpUp: () => void;
}

const VirtualControls: React.FC<VirtualControlsProps> = ({
  onLeftDown,
  onLeftUp,
  onRightDown,
  onRightUp,
  onJumpDown,
  onJumpUp,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check if device supports touch
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

  if (!isTouchDevice) {
    return null; // Don't show controls on desktop
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Left/Right D-Pad */}
      <div className="absolute bottom-6 left-6 flex gap-2 pointer-events-auto">
        {/* Left Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onLeftDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onLeftUp();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800/70 border-4 border-gray-600 flex items-center justify-center active:bg-gray-700 active:border-gray-500 transition-colors"
          style={{ touchAction: 'none' }}
        >
          <span className="text-white text-2xl font-bold">◄</span>
        </button>

        {/* Right Button */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onRightDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onRightUp();
          }}
          className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-800/70 border-4 border-gray-600 flex items-center justify-center active:bg-gray-700 active:border-gray-500 transition-colors"
          style={{ touchAction: 'none' }}
        >
          <span className="text-white text-2xl font-bold">►</span>
        </button>
      </div>

      {/* Jump Button */}
      <div className="absolute bottom-6 right-6 pointer-events-auto">
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            onJumpDown();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            onJumpUp();
          }}
          className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-700/70 border-4 border-indigo-500 rounded-full flex items-center justify-center active:bg-indigo-600 active:border-indigo-400 transition-colors font-['Press_Start_2P'] text-white text-xs"
          style={{ touchAction: 'none' }}
        >
          JUMP
        </button>
      </div>
    </div>
  );
};

export default VirtualControls;
