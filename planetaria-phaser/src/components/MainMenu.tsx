import PixelButton from "./ui/PixelButton";

interface MainMenuProps {
    onPlay: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onPlay }) => {
    return (
        <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-950">
            <div
                className="
          bg-gray-900 p-12
          flex flex-col items-center gap-10
          border-4
          border-red-100
        "
            >
                {/* Title */}
                <div className="flex flex-col items-center gap-3">
                    <h1 className="font-['Press_Start_2P'] border-red-500 text-2xl text-indigo-400 tracking-widest">
                        PLANETARIA
                    </h1>
                    <p className="font-['Press_Start_2P'] text-[8px] text-gray-500 tracking-wide">
                        A PIXEL SPACE ADVENTURE
                    </p>
                </div>

                {/* Separator */}
                <div
                    className="
            w-48 h-1 border-2
            border-t-gray-800 border-l-gray-800
            border-b-gray-600 border-r-gray-600
          "
                />

                {/* Buttons */}
                <div className="flex flex-col gap-4">
                    <PixelButton label="Start Game" onClick={onPlay} />
                    <PixelButton
                        label="Settings"
                        onClick={() => console.log("Settings — TODO")}
                        variant="secondary"
                    />
                    <PixelButton
                        label="Credits"
                        onClick={() => console.log("Credits — TODO")}
                        variant="secondary"
                    />
                </div>

                {/* Version */}
                <p className="font-['Press_Start_2P'] text-[6px] text-gray-600">
                    v0.1.0
                </p>
            </div>
        </div>
    );
};

export default MainMenu;
