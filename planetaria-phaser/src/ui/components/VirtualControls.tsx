import React from 'react';

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
  return (
    <div className="virtual-controls-container">
      <div className="movement-controls">
        <button 
          className="control-btn left-btn"
          onMouseDown={onLeftDown}
          onMouseUp={onLeftUp}
          onMouseLeave={onLeftUp}
          onTouchStart={(e) => { e.preventDefault(); onLeftDown(); }}
          onTouchEnd={(e) => { e.preventDefault(); onLeftUp(); }}
        >
          &larr;
        </button>
        <button 
          className="control-btn right-btn"
          onMouseDown={onRightDown}
          onMouseUp={onRightUp}
          onMouseLeave={onRightUp}
          onTouchStart={(e) => { e.preventDefault(); onRightDown(); }}
          onTouchEnd={(e) => { e.preventDefault(); onRightUp(); }}
        >
          &rarr;
        </button>
      </div>
      <div className="action-controls">
        <button 
          className="control-btn jump-btn"
          onMouseDown={onJumpDown}
          onMouseUp={onJumpUp}
          onMouseLeave={onJumpUp}
          onTouchStart={(e) => { e.preventDefault(); onJumpDown(); }}
          onTouchEnd={(e) => { e.preventDefault(); onJumpUp(); }}
        >
          JUMP
        </button>
      </div>

      <style>{`
        .virtual-controls-container {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          display: flex;
          justify-content: space-between;
          padding: 0 30px;
          pointer-events: none;
          z-index: 100;
        }
        .movement-controls, .action-controls {
          display: flex;
          gap: 15px;
          pointer-events: auto;
        }
        .control-btn {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-radius: 10px;
          color: white;
          font-family: 'Courier New', Courier, monospace;
          font-weight: bold;
          font-size: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          user-select: none;
          backdrop-filter: blur(5px);
          transition: all 0.1s;
        }
        .control-btn:active {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(0.95);
        }
        .jump-btn {
          width: 80px;
          font-size: 14px;
        }
        @media (min-width: 1024px) {
          .virtual-controls-container {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default VirtualControls;
