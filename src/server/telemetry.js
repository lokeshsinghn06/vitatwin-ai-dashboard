import dgram from "dgram";
import { WebSocketServer, WebSocket } from "ws";

const UDP_PORT = 14551;
const WS_PORT = 8081;

// ================================
// MOCK SIMULATION MODE
// Set to true to simulate drone flight without real telemetry
// ================================
const MOCK_MODE = !process.argv.includes('--real');

// Create UDP socket to receive MAVLink telemetry
const udp = dgram.createSocket("udp4");

// Create WebSocket server to stream to browser clients
const wss = new WebSocketServer({ port: WS_PORT });
const clients = new Set();

// Track connected clients
wss.on("connection", (ws) => {
    console.log("Browser client connected");
    clients.add(ws);
    ws.on("close", () => {
        console.log("Browser client disconnected");
        clients.delete(ws);
    });
});

// ArduPilot flight mode lookup (custom_mode values for Copter)
const FLIGHT_MODES = {
    0: "STABILIZE",
    1: "ACRO",
    2: "ALT_HOLD",
    3: "AUTO",
    4: "GUIDED",
    5: "LOITER",
    6: "RTL",
    7: "CIRCLE",
    9: "LAND",
    11: "DRIFT",
    13: "SPORT",
    14: "FLIP",
    15: "AUTOTUNE",
    16: "POSHOLD",
    17: "BRAKE",
    18: "THROW",
    19: "AVOID_ADSB",
    20: "GUIDED_NOGPS",
    21: "SMART_RTL",
    22: "FLOWHOLD",
    23: "FOLLOW",
    24: "ZIGZAG",
    25: "SYSTEMID",
    26: "AUTOROTATE",
    27: "AUTO_RTL",
};

// Broadcast data to all connected browser clients
function broadcast(data) {
    const json = JSON.stringify(data);
    clients.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(json);
        }
    });
}

// ================================
// MOCK SIMULATION
// Simulates a drone flying a mission around Chennai
// ================================
if (MOCK_MODE) {
    console.log("\n🚁 MOCK SIMULATION MODE ENABLED\n");

    // Mission waypoints around Chennai Marina Beach
    const waypoints = [
        { lat: 13.0500, lng: 80.2824, alt: 50 },  // Marina Beach
        { lat: 13.0550, lng: 80.2850, alt: 60 },  // North along beach
        { lat: 13.0600, lng: 80.2800, alt: 70 },  // Turn inland
        { lat: 13.0580, lng: 80.2750, alt: 65 },  // West
        { lat: 13.0520, lng: 80.2780, alt: 55 },  // South
        { lat: 13.0500, lng: 80.2824, alt: 50 },  // Return to start
    ];

    let currentWaypointIndex = 0;
    let currentLat = waypoints[0].lat;
    let currentLng = waypoints[0].lng;
    let currentAlt = 0;
    let heading = 0;
    let missionPhase = "TAKEOFF"; // TAKEOFF, AUTO, RTL, LAND
    let armed = false;

    // Send waypoints to browser on first client connection
    wss.on("connection", () => {
        setTimeout(() => {
            waypoints.forEach((wp, i) => {
                broadcast({
                    type: "waypoint",
                    seq: i,
                    lat: wp.lat,
                    lon: wp.lng,
                    alt: wp.alt,
                    command: 16, // NAV_WAYPOINT
                });
            });
            broadcast({ type: "mission_count", count: waypoints.length });
        }, 500);
    });

    // Calculate bearing between two points
    function calculateBearing(lat1, lng1, lat2, lng2) {
        const dLng = (lng2 - lng1) * Math.PI / 180;
        const y = Math.sin(dLng) * Math.cos(lat2 * Math.PI / 180);
        const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) * Math.cos(dLng);
        let bearing = Math.atan2(y, x) * 180 / Math.PI;
        return (bearing + 360) % 360;
    }

    // Simulate flight - runs every 500ms
    setInterval(() => {
        const targetWp = waypoints[currentWaypointIndex];

        // Calculate distance to target
        const dLat = targetWp.lat - currentLat;
        const dLng = targetWp.lng - currentLng;
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);

        // State machine for flight phases
        switch (missionPhase) {
            case "TAKEOFF":
                if (!armed) {
                    armed = true;
                    broadcast({ type: "status_text", severity: 6, text: "Arming motors" });
                }
                currentAlt += 2;
                if (currentAlt >= 50) {
                    missionPhase = "AUTO";
                    broadcast({ type: "status_text", severity: 6, text: "Reached altitude, starting mission" });
                }
                break;

            case "AUTO":
                // Move towards waypoint
                if (distance > 0.0001) {
                    const speed = 0.0002; // ~20m per update
                    currentLat += (dLat / distance) * speed;
                    currentLng += (dLng / distance) * speed;
                    heading = calculateBearing(currentLat, currentLng, targetWp.lat, targetWp.lng);

                    // Adjust altitude towards target
                    const altDiff = targetWp.alt - currentAlt;
                    currentAlt += altDiff * 0.1;
                } else {
                    // Reached waypoint
                    broadcast({ type: "status_text", severity: 6, text: `Reached WP ${currentWaypointIndex + 1}` });
                    currentWaypointIndex++;

                    if (currentWaypointIndex >= waypoints.length) {
                        missionPhase = "RTL";
                        currentWaypointIndex = 0;
                        broadcast({ type: "status_text", severity: 6, text: "Mission complete, RTL" });
                    }
                }
                break;

            case "RTL":
                // Return to home
                const home = waypoints[0];
                const dLatHome = home.lat - currentLat;
                const dLngHome = home.lng - currentLng;
                const distHome = Math.sqrt(dLatHome * dLatHome + dLngHome * dLngHome);

                if (distHome > 0.0001) {
                    const speed = 0.0003;
                    currentLat += (dLatHome / distHome) * speed;
                    currentLng += (dLngHome / distHome) * speed;
                    heading = calculateBearing(currentLat, currentLng, home.lat, home.lng);
                } else {
                    missionPhase = "LAND";
                    broadcast({ type: "status_text", severity: 6, text: "Landing" });
                }
                break;

            case "LAND":
                currentAlt -= 3;
                if (currentAlt <= 0) {
                    currentAlt = 0;
                    armed = false;
                    broadcast({ type: "status_text", severity: 6, text: "Landed, disarmed" });

                    // Reset for next mission after 5 seconds
                    setTimeout(() => {
                        missionPhase = "TAKEOFF";
                        currentWaypointIndex = 0;
                        currentLat = waypoints[0].lat;
                        currentLng = waypoints[0].lng;
                        broadcast({ type: "status_text", severity: 6, text: "Starting new mission..." });
                    }, 5000);
                }
                break;
        }

        // Broadcast position
        broadcast({
            type: "position",
            lat: currentLat,
            lon: currentLng,
            alt: currentAlt,
            relativeAlt: currentAlt,
            heading: heading,
            speed: missionPhase === "AUTO" || missionPhase === "RTL" ? 8.5 : 0,
        });

        // Broadcast heartbeat
        const modeMap = { TAKEOFF: 3, AUTO: 3, RTL: 6, LAND: 9 };
        broadcast({
            type: "heartbeat",
            mode: missionPhase === "TAKEOFF" ? "AUTO" : missionPhase,
            armed: armed,
            systemStatus: 4,
        });

    }, 500);

} else {
    // ================================
    // REAL MODE - Parse MAVLink from UDP
    // ================================

    // Parse MAVLink messages from UDP packets
    udp.on("message", (msg) => {
        const msgId = msg[5];

        // GLOBAL_POSITION_INT (ID: 33) - Live GPS position
        if (msgId === 33) {
            const lat = msg.readInt32LE(10) / 1e7;
            const lon = msg.readInt32LE(14) / 1e7;
            const alt = msg.readInt32LE(18) / 1000;
            const relativeAlt = msg.readInt32LE(22) / 1000;
            const vx = msg.readInt16LE(26) / 100;
            const vy = msg.readInt16LE(28) / 100;
            const hdg = msg.readUInt16LE(32) / 100;

            broadcast({
                type: "position",
                lat,
                lon,
                alt,
                relativeAlt,
                heading: hdg,
                speed: Math.sqrt(vx * vx + vy * vy),
            });
        }

        // HEARTBEAT (ID: 0)
        else if (msgId === 0) {
            const customMode = msg.readUInt32LE(6);
            const baseMode = msg[12];
            const armed = (baseMode & 0x80) !== 0;
            const modeName = FLIGHT_MODES[customMode] || `MODE_${customMode}`;

            broadcast({
                type: "heartbeat",
                mode: modeName,
                armed,
                systemStatus: msg[13],
            });
        }

        // MISSION_ITEM_INT (ID: 73)
        else if (msgId === 73) {
            const seq = msg.readUInt16LE(34);
            const lat = msg.readInt32LE(10) / 1e7;
            const lon = msg.readInt32LE(14) / 1e7;
            const alt = msg.readFloatLE(18);

            broadcast({
                type: "waypoint",
                seq,
                lat,
                lon,
                alt,
                command: msg.readUInt16LE(37),
            });
        }

        // MISSION_COUNT (ID: 44)
        else if (msgId === 44) {
            broadcast({
                type: "mission_count",
                count: msg.readUInt16LE(6),
            });
        }

        // STATUSTEXT (ID: 253)
        else if (msgId === 253) {
            const text = msg.slice(7, 57).toString("utf8").replace(/\0/g, "").trim();
            if (text) {
                broadcast({
                    type: "status_text",
                    severity: msg[6],
                    text,
                });
            }
        }
    });

    // Bind UDP socket
    udp.bind(UDP_PORT, () => {
        console.log(`
╔════════════════════════════════════════════════════════════╗
║         DRONE TELEMETRY BRIDGE SERVER                      ║
╠════════════════════════════════════════════════════════════╣
║  MAVLink UDP listening on port: ${UDP_PORT}                     ║
║  WebSocket server on: ws://localhost:${WS_PORT}                 ║
╠════════════════════════════════════════════════════════════╣
║  Configure Mission Planner to forward telemetry to:        ║
║  UDP: 127.0.0.1:${UDP_PORT}                                     ║
╚════════════════════════════════════════════════════════════╝
    `);
    });

    udp.on("error", (err) => {
        console.error("UDP Error:", err);
    });
}

console.log(`
╔════════════════════════════════════════════════════════════╗
║  WebSocket server on: ws://localhost:${WS_PORT}                 ║
║  Mode: ${MOCK_MODE ? "🚁 MOCK SIMULATION" : "📡 REAL TELEMETRY"}                            ║
╚════════════════════════════════════════════════════════════╝
`);
