import dgram from "dgram";
import { WebSocketServer, WebSocket } from "ws";

const UDP_PORT = 14551;
const WS_PORT = 8081;

// ================================
// MOCK SIMULATION MODE
// Set to false to wait for real MAVLink data from Mission Planner
// ================================
const MOCK_MODE = false; // Disabled - waiting for real data

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

// GPS Fix Type lookup
const GPS_FIX_TYPES = {
    0: "NO_GPS",
    1: "NO_FIX",
    2: "2D_FIX",
    3: "3D_FIX",
    4: "DGPS",
    5: "RTK_FLOAT",
    6: "RTK_FIXED",
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
    let flightStartTime = null;

    // Battery simulation
    let batteryPercent = 100;
    let batteryVoltage = 16.8; // 4S LiPo fully charged

    // Attitude simulation
    let roll = 0;
    let pitch = 0;
    let yaw = 0;

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

        // Drain battery slowly
        if (armed && batteryPercent > 5) {
            batteryPercent -= 0.02;
            batteryVoltage = 14.0 + (batteryPercent / 100) * 2.8; // 14.0V empty to 16.8V full
        }

        // Simulate attitude changes during flight
        if (missionPhase === "AUTO" || missionPhase === "RTL") {
            roll = Math.sin(Date.now() / 1000) * 5; // Slight roll oscillation
            pitch = -3 + Math.random() * 2; // Slight forward pitch
            yaw = heading;
        } else {
            roll = 0;
            pitch = 0;
        }

        // State machine for flight phases
        switch (missionPhase) {
            case "TAKEOFF":
                if (!armed) {
                    armed = true;
                    flightStartTime = Date.now();
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
                        batteryPercent = 100;
                        batteryVoltage = 16.8;
                        broadcast({ type: "status_text", severity: 6, text: "Starting new mission..." });
                    }, 5000);
                }
                break;
        }

        // Calculate flight time
        const flightTime = flightStartTime ? Math.floor((Date.now() - flightStartTime) / 1000) : 0;

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
        broadcast({
            type: "heartbeat",
            mode: missionPhase === "TAKEOFF" ? "AUTO" : missionPhase,
            armed: armed,
            systemStatus: 4,
        });

        // Broadcast battery status (SYS_STATUS equivalent)
        broadcast({
            type: "battery",
            voltage: batteryVoltage,
            current: armed ? 15.5 : 0, // 15.5A when flying
            remaining: Math.round(batteryPercent),
        });

        // Broadcast GPS status
        broadcast({
            type: "gps",
            fixType: 3, // 3D Fix
            satellites: 14,
            hdop: 0.8,
        });

        // Broadcast attitude
        broadcast({
            type: "attitude",
            roll: roll,
            pitch: pitch,
            yaw: yaw,
        });

        // Broadcast VFR HUD data
        broadcast({
            type: "vfr_hud",
            airspeed: missionPhase === "AUTO" || missionPhase === "RTL" ? 8.5 : 0,
            groundspeed: missionPhase === "AUTO" || missionPhase === "RTL" ? 8.5 : 0,
            throttle: armed ? 55 : 0,
            climbRate: missionPhase === "TAKEOFF" ? 2.0 : missionPhase === "LAND" ? -3.0 : 0,
        });

        // Broadcast flight time
        broadcast({
            type: "flight_time",
            seconds: flightTime,
        });

        // Broadcast current waypoint
        broadcast({
            type: "mission_current",
            seq: currentWaypointIndex,
        });

    }, 500);

} else {
    // ================================
    // REAL MODE - Parse MAVLink from UDP
    // ================================

    // Parse MAVLink messages from UDP packets
    udp.on("message", (msg) => {
        const msgId = msg[5];

        // HEARTBEAT (ID: 0)
        if (msgId === 0) {
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

        // SYS_STATUS (ID: 1) - Battery info
        else if (msgId === 1) {
            const voltage = msg.readUInt16LE(14) / 1000; // mV to V
            const current = msg.readInt16LE(16) / 100;   // cA to A
            const remaining = msg[30];                    // Battery remaining %

            broadcast({
                type: "battery",
                voltage,
                current,
                remaining,
            });
        }

        // GPS_RAW_INT (ID: 24) - GPS status
        else if (msgId === 24) {
            const fixType = msg[28];
            const satellites = msg[29];
            const hdop = msg.readUInt16LE(22) / 100;

            broadcast({
                type: "gps",
                fixType,
                fixTypeName: GPS_FIX_TYPES[fixType] || "UNKNOWN",
                satellites,
                hdop,
            });
        }

        // ATTITUDE (ID: 30) - Roll/Pitch/Yaw
        else if (msgId === 30) {
            const roll = msg.readFloatLE(6) * (180 / Math.PI);   // rad to deg
            const pitch = msg.readFloatLE(10) * (180 / Math.PI);
            const yaw = msg.readFloatLE(14) * (180 / Math.PI);

            broadcast({
                type: "attitude",
                roll,
                pitch,
                yaw,
            });
        }

        // GLOBAL_POSITION_INT (ID: 33) - Live GPS position
        else if (msgId === 33) {
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

        // MISSION_COUNT (ID: 44)
        else if (msgId === 44) {
            broadcast({
                type: "mission_count",
                count: msg.readUInt16LE(6),
            });
        }

        // MISSION_CURRENT (ID: 42)
        else if (msgId === 42) {
            broadcast({
                type: "mission_current",
                seq: msg.readUInt16LE(6),
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

        // VFR_HUD (ID: 74) - Speed, throttle, climb
        else if (msgId === 74) {
            const airspeed = msg.readFloatLE(6);
            const groundspeed = msg.readFloatLE(10);
            const heading = msg.readInt16LE(18);
            const throttle = msg.readUInt16LE(20);
            const alt = msg.readFloatLE(14);
            const climbRate = msg.readFloatLE(22);

            broadcast({
                type: "vfr_hud",
                airspeed,
                groundspeed,
                heading,
                throttle,
                alt,
                climbRate,
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
