import { useDroneTelemetry } from '../hooks/useDroneTelemetry';
import { useState } from 'react';

const DroneData = ({ onLog }) => {
    const { droneState, connectionStatus } = useDroneTelemetry();
    const [focusMode, setFocusMode] = useState('auto');
    const [isCapturing, setIsCapturing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [zoomLevel, setZoomLevel] = useState(8.3);

    // Use real battery from MAVLink
    const battery = droneState.batteryRemaining || 0;
    const voltage = droneState.batteryVoltage || 0;
    const satellites = droneState.gpsSatellites || 0;
    const throttle = droneState.throttle || 0;

    const handleFocusToggle = () => {
        const newMode = focusMode === 'auto' ? 'manual' : 'auto';
        setFocusMode(newMode);
        if (onLog) onLog(`- Focus mode: ${newMode.toUpperCase()}`, 'info');
    };

    const handleCapture = () => {
        setIsCapturing(true);
        if (onLog) onLog('- Photo captured', 'success');
        setTimeout(() => setIsCapturing(false), 500);
    };

    const handleSettingsToggle = () => setShowSettings(!showSettings);
    const handleFavoriteToggle = () => {
        setIsFavorite(!isFavorite);
        if (onLog) onLog(`- ${!isFavorite ? 'Added to' : 'Removed from'} favorites`, 'info');
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(20, +(prev + 0.5).toFixed(1)));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(1, +(prev - 0.5).toFixed(1)));

    const getBatteryColor = () => {
        if (battery < 20) return 'text-red-400';
        if (battery < 50) return 'text-yellow-400';
        return 'text-green-400';
    };

    const getGpsColor = () => {
        if (satellites >= 10) return 'text-green-400';
        if (satellites >= 6) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header with Drone Model */}
            <div className="p-4 border-b border-[#2a2a2a]">
                <div className="flex items-start justify-between">
                    <div>
                        <h2 className="text-white font-bold text-lg">VITATWIN</h2>
                    </div>
                    <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${connectionStatus === 'CONNECTED' ? 'bg-green-500/20 text-green-400' :
                            connectionStatus === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                                'bg-yellow-500/20 text-yellow-400'
                        }`}>
                        {connectionStatus}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="flex-1 p-4 flex flex-col gap-3 overflow-y-auto">
                {/* Battery Status - Real MAVLink Data */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs">Battery</p>
                        <p className="text-gray-500 text-[10px]">{voltage.toFixed(1)}V</p>
                    </div>
                    <div className={`font-bold text-lg ${getBatteryColor()}`}>
                        {Math.round(battery)}%
                    </div>
                </div>

                {/* GPS Satellites - Real MAVLink Data */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-gray-400 text-xs">GPS Satellites</p>
                        <p className="text-gray-500 text-[10px]">HDOP: {droneState.gpsHdop?.toFixed(1) || '--'}</p>
                    </div>
                    <div className={`font-bold text-lg ${getGpsColor()}`}>
                        {satellites} SAT
                    </div>
                </div>

                {/* Altitude */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Altitude</p>
                    <div className="text-white font-bold text-lg">{droneState.alt.toFixed(0)} M</div>
                </div>

                {/* Throttle - Real MAVLink Data */}
                <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-xs">Throttle</p>
                    <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                            <div
                                className="h-full bg-cyan-500 transition-all"
                                style={{ width: `${throttle}%` }}
                            ></div>
                        </div>
                        <span className="text-white font-bold text-sm">{throttle}%</span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-[#2a2a2a] my-1"></div>

                {/* Zoom Control Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleFocusToggle}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition ${focusMode === 'auto'
                                    ? 'bg-cyan-600 text-white'
                                    : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'
                                }`}
                            title={`Focus: ${focusMode.toUpperCase()}`}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                        <div className="flex items-center gap-1">
                            <button onClick={handleZoomOut} className="text-gray-400 hover:text-white text-lg px-1">−</button>
                            <button onClick={handleZoomIn} className="text-gray-400 hover:text-white text-lg px-1">+</button>
                        </div>
                    </div>
                    <div className="text-white font-bold text-lg">{zoomLevel.toFixed(1)}</div>
                </div>

                {/* Quick Action Buttons Row */}
                <div className="flex items-center justify-around mt-2">
                    <button
                        onClick={handleFocusToggle}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${focusMode === 'manual'
                                ? 'bg-cyan-600 text-white'
                                : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'
                            }`}
                        title="Focus Mode"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <path d="M9 9h6v6H9z" />
                        </svg>
                    </button>

                    <button
                        onClick={handleCapture}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isCapturing
                                ? 'bg-white text-black scale-90'
                                : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'
                            }`}
                        title="Capture Photo"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                    </button>

                    <button
                        onClick={handleSettingsToggle}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${showSettings
                                ? 'bg-[#333] text-white'
                                : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'
                            }`}
                        title="Settings"
                    >
                        <svg className={`w-5 h-5 transition-transform ${showSettings ? 'rotate-90' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="3" />
                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                        </svg>
                    </button>

                    <button
                        onClick={handleFavoriteToggle}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition ${isFavorite
                                ? 'bg-yellow-500 text-black'
                                : 'bg-[#2a2a2a] text-gray-400 hover:text-white hover:bg-[#333]'
                            }`}
                        title="Favorite"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </button>
                </div>

                {/* Telemetry Stats at bottom */}
                <div className="mt-auto pt-3 border-t border-[#2a2a2a] grid grid-cols-4 gap-2">
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">Speed</p>
                        <p className="text-white font-bold text-sm">{droneState.speed.toFixed(1)} m/s</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">Heading</p>
                        <p className="text-white font-bold text-sm">{Math.round(droneState.heading)}°</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">Mode</p>
                        <p className={`font-bold text-xs ${droneState.armed ? 'text-red-400' : 'text-green-400'}`}>
                            {droneState.mode}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-[10px] uppercase">Armed</p>
                        <p className={`font-bold text-xs ${droneState.armed ? 'text-red-400' : 'text-green-400'}`}>
                            {droneState.armed ? 'YES' : 'NO'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DroneData;
