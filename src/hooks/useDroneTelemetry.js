import { useState, useEffect, useRef } from 'react';

const TELEMETRY_WS = 'ws://localhost:8081';

export const useDroneTelemetry = () => {
    const [droneState, setDroneState] = useState({
        lat: 13.0827,
        lon: 80.2707,
        alt: 0,
        heading: 0,
        speed: 0,
        mode: '--',
        armed: false,
    });
    const [statusMessages, setStatusMessages] = useState([]);
    const [connectionStatus, setConnectionStatus] = useState('DISCONNECTED');
    const [waypoints, setWaypoints] = useState([]);

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
                            setDroneState(prev => ({ ...prev, ...data }));
                            break;
                        case 'heartbeat':
                            setDroneState(prev => ({ ...prev, mode: data.mode, armed: data.armed }));
                            break;
                        case 'waypoint':
                            setWaypoints(prev => {
                                // Avoid duplicates
                                if (prev.find(p => p.seq === data.seq)) return prev;
                                return [...prev, data];
                            });
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
        waypoints
    };
};
