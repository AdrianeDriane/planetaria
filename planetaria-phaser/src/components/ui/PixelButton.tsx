interface PixelButtonProps {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
}

const PixelButton: React.FC<PixelButtonProps> = ({
    label,
    onClick,
    variant = "primary",
}) => {
    const isPrimary = variant === "primary";

    return (
        <button
            onClick={onClick}
            className={`
        font-['Press_Start_2P'] text-[10px] px-8 py-4
        tracking-wider uppercase cursor-pointer select-none
        border-4 transition-all duration-75
        active:translate-y-0.5
        ${
            isPrimary
                ? `bg-indigo-700 text-white
               border-t-indigo-400 border-l-indigo-400
               border-b-indigo-900 border-r-indigo-900
               hover:bg-indigo-600
               active:border-t-indigo-900 active:border-l-indigo-900
               active:border-b-indigo-400 active:border-r-indigo-400
               active:bg-indigo-800`
                : `bg-gray-700 text-gray-200
               border-t-gray-500 border-l-gray-500
               border-b-gray-900 border-r-gray-900
               hover:bg-gray-600
               active:border-t-gray-900 active:border-l-gray-900
               active:border-b-gray-500 active:border-r-gray-500
               active:bg-gray-800`
        }
      `}
        >
            {label}
        </button>
    );
};

export default PixelButton;
