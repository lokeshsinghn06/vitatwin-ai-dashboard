import { useRef, useEffect, useState } from 'react';
import { useDroneTelemetry } from '../hooks/useDroneTelemetry';

const RESOLUTION_OPTIONS = [
    { label: '4K', value: '3840:2160' },
    { label: '1080p', value: '1920:1080' },
    { label: '720p', value: '1280:720' },
    { label: '480p', value: '854:480' },
    { label: '360p', value: '640:360' },
];

const DronePositionMap = ({ onLog }) => {
    const { droneState, waypoints, connectionStatus } = useDroneTelemetry();
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const droneMarkerRef = useRef(null);
    const flightPathRef = useRef(null);
    const trackRef = useRef([]);

    const [mode, setMode] = useState('video'); // video, photo
    const [selectedResolution, setSelectedResolution] = useState('1280:720');
    const [iso, setIso] = useState(600);
    const [shutter, setShutter] = useState(180.0);
    const [lens, setLens] = useState(25);

    // Use real flight time from MAVLink
    const flightTime = droneState.flightTime || 0;

    const formatFlightTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const handleModeToggle = (newMode) => {
        setMode(newMode);
        if (onLog) {
            onLog(`- Camera mode: ${newMode.toUpperCase()}`, 'info');
        }
    };

    const handleResolutionChange = (resolution) => {
        setSelectedResolution(resolution);
        if (onLog) {
            onLog(`- Resolution changed to ${resolution}`, 'info');
        }
    };

    const handleIsoChange = (delta) => {
        setIso(prev => Math.max(100, Math.min(6400, prev + delta)));
    };

    const handleShutterChange = (delta) => {
        setShutter(prev => Math.max(1, Math.min(360, +(prev + delta).toFixed(1))));
    };

    // Initialize Map
    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        if (!googleMapRef.current) {
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 18,
                center: { lat: droneState.lat, lng: droneState.lon },
                mapTypeId: 'hybrid',
                disableDefaultUI: true,
                scaleControl: true,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#1a1a1a" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#1a1a1a" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                ]
            });
            googleMapRef.current = map;

            const marker = new window.google.maps.Marker({
                map,
                title: "Drone",
                icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    rotation: 0,
                    strokeColor: "#4ade80",
                    strokeWeight: 2,
                    fillColor: "#4ade80",
                    fillOpacity: 1,
                }
            });
            droneMarkerRef.current = marker;

            const polyline = new window.google.maps.Polyline({
                map,
                strokeColor: "#4ade80",
                strokeOpacity: 0.6,
                strokeWeight: 3,
            });
            flightPathRef.current = polyline;
        }
    }, []);

    // Update Drone Position
    useEffect(() => {
        if (!googleMapRef.current || !droneMarkerRef.current) return;

        const pos = { lat: droneState.lat, lng: droneState.lon };
        droneMarkerRef.current.setPosition(pos);

        if (window.google) {
            const symbol = {
                path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                scale: 6,
                rotation: droneState.heading,
                strokeColor: "#4ade80",
                strokeWeight: 2,
                fillColor: "#4ade80",
                fillOpacity: 1,
            };
            droneMarkerRef.current.setIcon(symbol);
        }

        googleMapRef.current.panTo(pos);

        trackRef.current.push(pos);
        if (flightPathRef.current) {
            flightPathRef.current.setPath(trackRef.current);
        }
    }, [droneState.lat, droneState.lon, droneState.heading]);

    // Draw Waypoints
    useEffect(() => {
        if (!googleMapRef.current || waypoints.length === 0) return;

        waypoints.forEach(wp => {
            new window.google.maps.Marker({
                map: googleMapRef.current,
                position: { lat: wp.lat, lng: wp.lon },
                label: {
                    text: `${wp.seq + 1}`,
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "10px"
                },
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 8,
                    strokeColor: "#3b82f6",
                    strokeWeight: 2,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.8,
                }
            });
        });
    }, [waypoints]);

    return (
        <div className="dashboard-card h-full flex flex-col overflow-hidden">
            {/* Top Bar with Video/Photo toggle */}
            <div className="h-12 bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center px-3 shrink-0">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleModeToggle('video')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${mode === 'video'
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-500 hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
                        </svg>
                        Video
                    </button>
                    <button
                        onClick={() => handleModeToggle('photo')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs transition ${mode === 'photo'
                            ? 'bg-cyan-600 text-white'
                            : 'text-gray-500 hover:text-white hover:bg-[#2a2a2a]'
                            }`}
                    >
                        <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="3.2" />
                            <path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" />
                        </svg>
                        Photo
                    </button>
                </div>

                {/* Frame indicators */}
                <div className="ml-auto flex items-center gap-3 text-gray-500 text-[10px]">
                    <span className="text-white bg-[#333] px-2 py-0.5 rounded">1</span>
                    <span className="flex gap-0.5">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-0.5 h-3 bg-gray-600"></div>
                        ))}
                    </span>
                    <span className="text-white bg-[#333] px-2 py-0.5 rounded">2</span>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex min-h-0">
                {/* Map Section */}
                <div className="w-2/5 relative bg-[#1a1a1a]">
                    <div ref={mapRef} className="absolute inset-0 w-full h-full"></div>

                    {/* Location Label */}
                    <div className="absolute bottom-2 left-2 bg-[#1a1a1a]/90 backdrop-blur px-2 py-1 rounded text-[10px] text-gray-400 z-10">
                        <span className="text-white font-medium">SOUTH BOSTON</span>
                        <div className="flex items-center gap-1 mt-0.5">
                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
                            </svg>
                            <span>{droneState.lat.toFixed(4)}, {droneState.lon.toFixed(4)}</span>
                        </div>
                    </div>
                </div>

                {/* Stats Section */}
                <div className="flex-1 p-3 flex flex-col justify-center">
                    <div className="grid grid-cols-3 gap-x-6 gap-y-3">
                        {/* Speed */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Speed</p>
                            <p className="text-white font-bold text-sm">{(droneState.speed * 3.6).toFixed(0)} km/h</p>
                        </div>
                        {/* Lens - Interactive */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Lens</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => setLens(prev => Math.max(10, prev - 5))} className="text-gray-500 hover:text-white text-xs">−</button>
                                <span className="text-white font-bold text-sm">{lens} mm</span>
                                <button onClick={() => setLens(prev => Math.min(200, prev + 5))} className="text-gray-500 hover:text-white text-xs">+</button>
                            </div>
                        </div>
                        {/* Frame Line */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Frame Line</p>
                            <p className="text-white font-bold text-sm">{selectedResolution.replace(':', 'x')}</p>
                        </div>

                        {/* Height */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Height</p>
                            <p className="text-white font-bold text-sm">{droneState.alt.toFixed(0)}m</p>
                        </div>
                        {/* ISO - Interactive */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">ISO</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleIsoChange(-100)} className="text-gray-500 hover:text-white text-xs">−</button>
                                <span className="text-white font-bold text-sm">{iso}</span>
                                <button onClick={() => handleIsoChange(100)} className="text-gray-500 hover:text-white text-xs">+</button>
                            </div>
                        </div>
                        {/* Resolution Selector */}
                        <div>
                            <select
                                value={selectedResolution}
                                onChange={(e) => handleResolutionChange(e.target.value)}
                                className="bg-transparent text-cyan-400 font-bold text-sm border-none outline-none cursor-pointer"
                            >
                                {RESOLUTION_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-[#1a1a1a]">
                                        {opt.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Flight Time */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Flight Time</p>
                            <p className="text-white font-bold text-sm">{formatFlightTime(flightTime)}</p>
                        </div>
                        {/* Shutter - Interactive */}
                        <div>
                            <p className="text-gray-500 text-[10px] uppercase">Shutter</p>
                            <div className="flex items-center gap-1">
                                <button onClick={() => handleShutterChange(-10)} className="text-gray-500 hover:text-white text-xs">−</button>
                                <span className="text-white font-bold text-sm">{shutter.toFixed(1)}</span>
                                <button onClick={() => handleShutterChange(10)} className="text-gray-500 hover:text-white text-xs">+</button>
                            </div>
                        </div>
                        {/* More resolutions */}
                        <div className="text-gray-500 text-xs flex flex-col gap-0.5">
                            {RESOLUTION_OPTIONS.slice(3).map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => handleResolutionChange(opt.value)}
                                    className={`text-left hover:text-white transition ${selectedResolution === opt.value ? 'text-cyan-400' : ''
                                        }`}
                                >
                                    {opt.value}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DronePositionMap;
