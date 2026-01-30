// Mock data for the drone mission control dashboard

export const mockDetectionData = {
    humanDetected: true,
    confidence: 92,
    distance: 6.3,
    status: 'Clear Drop Target Zone',
    boundingBoxes: [
        { x: 120, y: 80, width: 140, height: 280, label: 'person', confidence: 92 }
    ]
};

export const mockDroneData = {
    batteryLevel: 79,
    payloadStatus: 'Loaded',
    payloadWeight: 4.8,
    commLink: 'Active',
    commType: 'LoRa',
    heading: 134,
    position: {
        x: 28.6139,
        y: 77.2090,
        altitude: 45.2
    },
    fps: 30,
    latency: 0.042,
    signalStrength: 87,
    gpsStatus: 'Fixed',
    connectivity: 'Connected'
};

export const mockActivityLog = [
    { timestamp: '11:08:15', message: 'System initialized', type: 'info' },
    { timestamp: '11:08:18', message: 'Drone connected via LoRa', type: 'info' },
    { timestamp: '11:08:22', message: 'GPS lock acquired', type: 'success' },
    { timestamp: '11:08:25', message: 'Payload verified: 4.8 kg', type: 'info' },
    { timestamp: '11:08:30', message: 'Mission VITATWIN-01 loaded', type: 'info' },
    { timestamp: '11:08:45', message: 'Takeoff initiated', type: 'warning' },
    { timestamp: '11:08:52', message: 'Altitude: 45m reached', type: 'info' },
    { timestamp: '11:09:10', message: 'Human detected at (28.6139, 77.2090)', type: 'success' },
    { timestamp: '11:09:12', message: 'Confidence: 92%', type: 'success' },
    { timestamp: '11:09:15', message: 'Target zone confirmed', type: 'success' },
    { timestamp: '11:09:18', message: 'Drone hovering - awaiting drop command', type: 'warning' },
];

export const missionOptions = [
    'VITATWIN-01',
    'RESCUE-ALPHA',
    'SUPPLY-DROP-03',
    'RECON-DELTA',
];
