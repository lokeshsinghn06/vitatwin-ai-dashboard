import { useState } from 'react';

const ManualControls = ({ onLog }) => {
    const [awbEnabled, setAwbEnabled] = useState(true);
    const [dispEnabled, setDispEnabled] = useState(false);
    const [activeDirection, setActiveDirection] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);

    const handleDirectionPress = (direction) => {
        setActiveDirection(direction);
        if (onLog) {
            onLog(`- D-Pad: ${direction.toUpperCase()} pressed`, 'info');
        }
    };

    const handleDirectionRelease = () => {
        setActiveDirection(null);
    };

    const handleAWBToggle = () => {
        setAwbEnabled(!awbEnabled);
        if (onLog) {
            onLog(`- AWB ${!awbEnabled ? 'enabled' : 'disabled'}`, 'info');
        }
    };

    const handleDISPToggle = () => {
        setDispEnabled(!dispEnabled);
        if (onLog) {
            onLog(`- Display overlay ${!dispEnabled ? 'enabled' : 'disabled'}`, 'info');
        }
    };

    const handleMenuToggle = () => {
        setMenuOpen(!menuOpen);
    };

    const DirectionButton = ({ direction, position, icon }) => (
        <button
            onMouseDown={() => handleDirectionPress(direction)}
            onMouseUp={handleDirectionRelease}
            onMouseLeave={handleDirectionRelease}
            onTouchStart={() => handleDirectionPress(direction)}
            onTouchEnd={handleDirectionRelease}
            className={`absolute ${position} w-8 h-8 flex items-center justify-center transition-all ${activeDirection === direction
                    ? 'text-cyan-400 scale-110'
                    : 'text-gray-400 hover:text-white'
                }`}
        >
            {icon}
        </button>
    );

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Top Bar with AWB/DISP buttons */}
            <div className="h-12 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center justify-center gap-3 px-4 shrink-0">
                <button
                    onClick={handleAWBToggle}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition ${awbEnabled
                            ? 'bg-cyan-600 text-white'
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333] hover:text-white'
                        }`}
                >
                    AWB
                </button>
                <button
                    onClick={handleDISPToggle}
                    className={`px-4 py-1.5 rounded text-xs font-medium transition ${dispEnabled
                            ? 'bg-cyan-600 text-white'
                            : 'bg-[#2a2a2a] text-gray-400 hover:bg-[#333] hover:text-white'
                        }`}
                >
                    DISP
                </button>
            </div>

            {/* D-Pad Control Area */}
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="relative">
                    {/* Outer Ring */}
                    <div className={`w-40 h-40 rounded-full border-2 flex items-center justify-center relative transition ${activeDirection ? 'border-cyan-500 bg-[#252525]' : 'border-[#333] bg-[#252525]'
                        }`}>

                        {/* Up Arrow */}
                        <DirectionButton
                            direction="up"
                            position="top-2 left-1/2 -translate-x-1/2"
                            icon={
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14l5-5 5 5z" />
                                </svg>
                            }
                        />

                        {/* Down Arrow */}
                        <DirectionButton
                            direction="down"
                            position="bottom-2 left-1/2 -translate-x-1/2"
                            icon={
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 10l5 5 5-5z" />
                                </svg>
                            }
                        />

                        {/* Left Arrow */}
                        <DirectionButton
                            direction="left"
                            position="left-2 top-1/2 -translate-y-1/2"
                            icon={
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M14 7l-5 5 5 5z" />
                                </svg>
                            }
                        />

                        {/* Right Arrow */}
                        <DirectionButton
                            direction="right"
                            position="right-2 top-1/2 -translate-y-1/2"
                            icon={
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M10 7l5 5-5 5z" />
                                </svg>
                            }
                        />

                        {/* Inner Menu Button */}
                        <button
                            onClick={handleMenuToggle}
                            className={`w-20 h-20 rounded-full border flex flex-col items-center justify-center transition ${menuOpen
                                    ? 'bg-[#333] border-cyan-500'
                                    : 'bg-[#1e1e1e] border-[#333] hover:border-[#444]'
                                }`}
                        >
                            <span className="text-gray-500 text-[9px] uppercase">Disp/menu</span>
                            <div className="mt-2 text-gray-400 text-xs">
                                <svg className={`w-3 h-3 transition-transform ${menuOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M7 14l5-5 5 5z" />
                                </svg>
                            </div>
                        </button>
                    </div>

                    {/* Active Direction Indicator */}
                    {activeDirection && (
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-cyan-400 text-xs font-bold uppercase">
                            {activeDirection}
                        </div>
                    )}

                    {/* Mode label */}
                    {!activeDirection && (
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2">
                            <span className="text-gray-500 text-[10px] uppercase tracking-wider">mode</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManualControls;
