interface PixelButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
}

const PixelButton: React.FC<PixelButtonProps> = ({
  label,
  onClick,
  variant = "primary",
  disabled = false,
}) => {
  const isPrimary = variant === "primary";

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer border-4 px-6 py-3 sm:px-8 sm:py-4 font-['Press_Start_2P'] text-[9px] sm:text-[10px] tracking-wider uppercase transition-all duration-75 select-none active:translate-y-0.5 touch-manipulation ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : ''
      } ${
        isPrimary
          ? `border-t-indigo-400 border-r-indigo-900 border-b-indigo-900 border-l-indigo-400 bg-indigo-700 text-white hover:bg-indigo-600 active:border-t-indigo-900 active:border-r-indigo-400 active:border-b-indigo-400 active:border-l-indigo-900 active:bg-indigo-800`
          : `border-t-gray-500 border-r-gray-900 border-b-gray-900 border-l-gray-500 bg-gray-700 text-gray-200 hover:bg-gray-600 active:border-t-gray-900 active:border-r-gray-500 active:border-b-gray-500 active:border-l-gray-900 active:bg-gray-800`
      } `}
      style={{ minWidth: '120px', minHeight: '44px' }}
    >
      {label}
    </button>
  );
};

export default PixelButton;
