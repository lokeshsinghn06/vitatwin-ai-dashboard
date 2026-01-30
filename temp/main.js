/* global google */

// ============================================
// DRONE MONITORING WEB APP
// Real-time visualization of autonomous flight
// ============================================

let map, droneMarker, flightPath;
const track = [];
const waypointMarkers = [];

// Current drone state
const droneState = {
  lat: 0,
  lon: 0,
  alt: 0,
  heading: 0,
  speed: 0,
  mode: "--",
  armed: false,
};

// Initialize Google Map
function initMap() {
  // Default to San Francisco (will center on drone when data arrives)
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: 17,
    center: { lat: 13.0827, lng: 80.2707 },
    mapTypeId: "hybrid",
    disableDefaultUI: false,
    zoomControl: true,
    mapTypeControl: true,
    scaleControl: true,
  });

  // Drone marker with arrow icon
  droneMarker = new google.maps.Marker({
    map,
    title: "Drone",
    icon: {
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      rotation: 0,
      strokeColor: "#FF0000",
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.9,
    },
  });

  // Flight path polyline
  flightPath = new google.maps.Polyline({
    map,
    strokeColor: "#00FF00",
    strokeOpacity: 0.8,
    strokeWeight: 3,
  });

  console.log("Map initialized");
}

// Update drone position on map
function updateDronePosition(data) {
  const pos = { lat: data.lat, lng: data.lon };

  // Update marker position
  droneMarker.setPosition(pos);

  // Update marker rotation (heading)
  if (data.heading !== undefined) {
    droneMarker.setIcon({
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 6,
      rotation: data.heading,
      strokeColor: "#FF0000",
      strokeWeight: 2,
      fillColor: "#FF0000",
      fillOpacity: 0.9,
    });
  }

  // Center map on drone (smooth pan)
  map.panTo(pos);

  // Add to flight path
  track.push(pos);
  flightPath.setPath(track);

  // Update state
  droneState.lat = data.lat;
  droneState.lon = data.lon;
  droneState.alt = data.alt;
  droneState.heading = data.heading || 0;
  droneState.speed = data.speed || 0;

  // Update UI
  updateStatusPanel();
}

// Update heartbeat info (mode, armed status)
function updateHeartbeat(data) {
  droneState.mode = data.mode;
  droneState.armed = data.armed;
  updateStatusPanel();
}

// Add waypoint marker to map
function addWaypoint(data) {
  // Check if waypoint already exists
  const existing = waypointMarkers.find((w) => w.seq === data.seq);
  if (existing) return;

  const marker = new google.maps.Marker({
    map,
    position: { lat: data.lat, lng: data.lon },
    label: {
      text: `${data.seq + 1}`,
      color: "white",
      fontWeight: "bold",
    },
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 12,
      strokeColor: "#0066FF",
      strokeWeight: 2,
      fillColor: "#0066FF",
      fillOpacity: 0.8,
    },
    title: `Waypoint ${data.seq + 1} - Alt: ${data.alt}m`,
  });

  marker.seq = data.seq;
  waypointMarkers.push(marker);

  // If we have multiple waypoints, draw mission path
  if (waypointMarkers.length > 1) {
    drawMissionPath();
  }
}

// Draw lines connecting waypoints
let missionPath = null;
function drawMissionPath() {
  if (missionPath) missionPath.setMap(null);

  const sortedWaypoints = waypointMarkers
    .slice()
    .sort((a, b) => a.seq - b.seq)
    .map((m) => m.getPosition());

  missionPath = new google.maps.Polyline({
    map,
    path: sortedWaypoints,
    strokeColor: "#0066FF",
    strokeOpacity: 0.6,
    strokeWeight: 2,
    strokePattern: [10, 5], // Dashed line
  });
}

// Update status panel UI
function updateStatusPanel() {
  document.getElementById("mode").textContent = droneState.mode;
  document.getElementById("armed").textContent = droneState.armed
    ? "ARMED"
    : "DISARMED";
  document.getElementById("armed").className = droneState.armed
    ? "armed"
    : "disarmed";
  document.getElementById("altitude").textContent = `${droneState.alt.toFixed(1)} m`;
  document.getElementById("speed").textContent = `${droneState.speed.toFixed(1)} m/s`;
  document.getElementById("heading").textContent = `${droneState.heading.toFixed(0)}°`;
  document.getElementById("lat").textContent = droneState.lat.toFixed(6);
  document.getElementById("lon").textContent = droneState.lon.toFixed(6);
}

// Display status text message from drone
function showStatusMessage(data) {
  const statusLog = document.getElementById("status-log");
  const severityClass =
    data.severity <= 3 ? "error" : data.severity <= 5 ? "warning" : "info";

  const msg = document.createElement("div");
  msg.className = `status-msg ${severityClass}`;
  msg.textContent = data.text;

  statusLog.insertBefore(msg, statusLog.firstChild);

  // Keep only last 5 messages
  while (statusLog.children.length > 5) {
    statusLog.removeChild(statusLog.lastChild);
  }
}

// Clear flight path button
function clearFlightPath() {
  track.length = 0;
  flightPath.setPath([]);
}

// Connect to backend WebSocket
function connectWebSocket() {
  const ws = new WebSocket("ws://localhost:8081");

  ws.onopen = () => {
    console.log("Connected to telemetry server");
    document.getElementById("connection-status").textContent = "CONNECTED";
    document.getElementById("connection-status").className = "connected";
  };

  ws.onclose = () => {
    console.log("Disconnected from telemetry server");
    document.getElementById("connection-status").textContent = "DISCONNECTED";
    document.getElementById("connection-status").className = "disconnected";

    // Attempt reconnect after 3 seconds
    setTimeout(connectWebSocket, 3000);
  };

  ws.onerror = (err) => {
    console.error("WebSocket error:", err);
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case "position":
        updateDronePosition(data);
        break;
      case "heartbeat":
        updateHeartbeat(data);
        break;
      case "waypoint":
        addWaypoint(data);
        break;
      case "status_text":
        showStatusMessage(data);
        break;
    }
  };
}

// Initialize
window.onload = () => {
  initMap();
  connectWebSocket();

  // Clear path button
  document.getElementById("clear-path").addEventListener("click", clearFlightPath);
};
