import { useRef, useEffect } from 'react';
import { useDroneTelemetry } from '../hooks/useDroneTelemetry';

const DronePositionMap = () => {
    const { droneState, waypoints, connectionStatus } = useDroneTelemetry();
    const mapRef = useRef(null);
    const googleMapRef = useRef(null);
    const droneMarkerRef = useRef(null);
    const flightPathRef = useRef(null);
    const trackRef = useRef([]);

    // Initialize Map
    useEffect(() => {
        if (!window.google || !mapRef.current) return;

        if (!googleMapRef.current) {
            // Initialize Google Map
            const map = new window.google.maps.Map(mapRef.current, {
                zoom: 18,
                center: { lat: droneState.lat, lng: droneState.lon },
                mapTypeId: 'hybrid',
                disableDefaultUI: true, // cleaner look for dashboard
                scaleControl: true
            });
            googleMapRef.current = map;

            // Drone Marker
            const marker = new window.google.maps.Marker({
                map,
                title: "Drone",
                icon: {
                    path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                    scale: 6,
                    rotation: 0,
                    strokeColor: "#4ade80", // Green matching theme
                    strokeWeight: 2,
                    fillColor: "#4ade80",
                    fillOpacity: 1,
                }
            });
            droneMarkerRef.current = marker;

            // Flight Path Polyline
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

        // Update Marker
        droneMarkerRef.current.setPosition(pos);

        // Update Heading Icon
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

        // Center Map (smoothly)
        googleMapRef.current.panTo(pos);

        // Update Track
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
                    strokeColor: "#3b82f6", // Blue
                    strokeWeight: 2,
                    fillColor: "#3b82f6",
                    fillOpacity: 0.8,
                }
            });
        });
    }, [waypoints]);

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header - Fixed Height h-10 */}
            <div className="bg-[#f8fafc] text-slate-800 border-b border-slate-200 flex items-center px-3 h-10 shrink-0">
                <svg className="w-4 h-4 text-slate-500 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                </svg>
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Drones Position Map</span>

                {/* Connection Status Indicator */}
                <div className="ml-auto flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${connectionStatus === 'CONNECTED' ? 'text-green-600' : 'text-red-500'}`}>
                        {connectionStatus === 'CONNECTED' ? 'LIVE' : 'OFFLINE'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 relative bg-slate-200 overflow-hidden group">

                {/* Google Map Container */}
                <div ref={mapRef} className="absolute inset-0 w-full h-full"></div>

                {/* Bottom Overlay Info - Dark Strip */}
                <div className="absolute bottom-2 left-2 right-auto bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded flex items-center gap-3 text-xs font-mono shadow-md border border-slate-700 min-w-[200px] z-10">
                    <div className="w-3 h-3 border border-green-500 flex items-center justify-center">
                        <div className="w-full h-px bg-green-500 rotate-45"></div>
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-slate-400 text-[10px]">COORDINATES</span>
                        <span>{droneState.lat.toFixed(4)}, {droneState.lon.toFixed(4)}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-600 mx-1"></div>
                    <div className="flex flex-col leading-none">
                        <span className="text-slate-400 text-[10px]">ALTITUDE</span>
                        <span className="text-green-400 font-bold">{droneState.alt.toFixed(1)} m</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DronePositionMap;
