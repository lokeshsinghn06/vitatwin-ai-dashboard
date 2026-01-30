import { useState, useEffect, useRef } from 'react';

const TELEMETRY_WS = 'ws://localhost:8081';

export const useDroneTelemetry = () => {
    const [droneState, setDroneState] = useState({
        // Position data
        lat: 13.0827,
        lon: 80.2707,
        alt: 0,
        relativeAlt: 0,
        heading: 0,
        speed: 0,

        // Flight status
        mode: '--',
        armed: false,
        systemStatus: 0,

        // Battery (from SYS_STATUS)
        batteryVoltage: 0,
        batteryCurrent: 0,
        batteryRemaining: 0,

        // GPS (from GPS_RAW_INT)
        gpsFixType: 0,
        gpsSatellites: 0,
        gpsHdop: 0,

        // Attitude (from ATTITUDE)
        roll: 0,
        pitch: 0,
        yaw: 0,

        // VFR HUD data
        airspeed: 0,
        groundspeed: 0,
        throttle: 0,
        climbRate: 0,

        // Mission
        currentWaypoint: 0,
        flightTime: 0,
    });

    const [statusMessages, setStatusMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [waypoints, setWaypoints] = useState([]);
    const [missionCount, setMissionCount] = useState(0);

    const wsRef = useRef(null);

    useEffect(() => {
        const connect = () => {
            console.log("Connecting to telemetry...");
            const ws = new WebSocket(TELEMETRY_WS);
            wsRef.current = ws;

            ws.onopen = () => {
                setConnectionStatus('CONNECTED');
                console.log('Connected to drone telemetry');
            };

            ws.onclose = () => {
                setConnectionStatus('DISCONNECTED');
                console.log('Disconnected from drone telemetry');
                // Reconnect after 3s
                setTimeout(connect, 3000);
            };

            ws.onerror = (err) => {
                console.error('Telemetry WebSocket Error:', err);
                setConnectionStatus('ERROR');
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    switch (data.type) {
                        case 'position':
                            setDroneState(prev => ({
                                ...prev,
                                lat: data.lat,
                                lon: data.lon,
                                alt: data.alt,
                                relativeAlt: data.relativeAlt,
                                heading: data.heading,
                                speed: data.speed,
                            }));
                            break;

                        case 'heartbeat':
                            setDroneState(prev => ({
                                ...prev,
                                mode: data.mode,
                                armed: data.armed,
                                systemStatus: data.systemStatus,
                            }));
                            break;

                        case 'battery':
                            setDroneState(prev => ({
                                ...prev,
                                batteryVoltage: data.voltage,
                                batteryCurrent: data.current,
                                batteryRemaining: data.remaining,
                            }));
                            break;

                        case 'gps':
                            setDroneState(prev => ({
                                ...prev,
                                gpsFixType: data.fixType,
                                gpsSatellites: data.satellites,
                                gpsHdop: data.hdop,
                            }));
                            break;

                        case 'attitude':
                            setDroneState(prev => ({
                                ...prev,
                                roll: data.roll,
                                pitch: data.pitch,
                                yaw: data.yaw,
                            }));
                            break;

                        case 'vfr_hud':
                            setDroneState(prev => ({
                                ...prev,
                                airspeed: data.airspeed,
                                groundspeed: data.groundspeed,
                                throttle: data.throttle,
                                climbRate: data.climbRate,
                            }));
                            break;

                        case 'mission_current':
                            setDroneState(prev => ({
                                ...prev,
                                currentWaypoint: data.seq,
                            }));
                            break;

                        case 'flight_time':
                            setDroneState(prev => ({
                                ...prev,
                                flightTime: data.seconds,
                            }));
                            break;

                        case 'waypoint':
                            setWaypoints(prev => {
                                // Avoid duplicates
                                if (prev.find(p => p.seq === data.seq)) return prev;
                                return [...prev, data].sort((a, b) => a.seq - b.seq);
                            });
                            break;

                        case 'mission_count':
                            setMissionCount(data.count);
                            break;

                        case 'status_text':
                            setStatusMessages(prev => [data, ...prev].slice(0, 50));
                            break;

                        default:
                            break;
                    }
                } catch (e) {
                    console.error('Failed to parse telemetry message:', e);
                }
            };
        };

        connect();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    return {
        droneState,
        statusMessages,
        connectionStatus,
        waypoints,
        missionCount,
    };
};
