import Sidebar from './components/Sidebar';
import LiveCameraView from './components/LiveCameraView';
import DroneData from './components/DroneData';
import DronePositionMap from './components/DronePositionMap';
import ManualControls from './components/ManualControls';
import ActivityLog from './components/ActivityLog';
import DataView from './components/DataView';
import SettingsView from './components/SettingsView';
import { useState, useCallback } from 'react';

function App() {
    const [currentView, setCurrentView] = useState('Home'); // Home, Video, Settings
    const [activityLogs, setActivityLogs] = useState([
        { timestamp: '14:02', message: '- Payload successfully dropped.', type: 'info' },
        { timestamp: '14:02', message: '- Human detected at distance 6.3 m.', type: 'success' },
        { timestamp: '14:02', message: '- Clear drop target zone confirmed.', type: 'success' },
        { timestamp: '14:01', message: '- Drone hovering at target location.', type: 'info' },
    ]);

    const handleLog = useCallback((message, type = 'info') => {
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        setActivityLogs(prev => {
            const newLogs = [...prev, { timestamp, message, type }];
            if (newLogs.length > 500) return newLogs.slice(newLogs.length - 500);
            return newLogs;
        });
    }, []);

    const handleResetLogs = () => {
        setActivityLogs([]);
    };

    return (
        <div className="h-screen w-screen flex overflow-hidden bg-[#0d0d0d] text-white font-sans">

            {/* Left Sidebar */}
            <Sidebar activeNav={currentView} onNavChange={setCurrentView} />

            {/* Main Content Area */}
            <div className="flex-1 p-4 overflow-hidden relative flex flex-col min-h-0 gap-4">

                {/* DASHBOARD VIEW */}
                {currentView === 'Home' && (
                    <div className="flex-1 flex flex-col gap-4 animate-fade-in min-h-0">
                        {/* Top Section - 60% height */}
                        <div className="flex gap-4 h-[60%] min-h-0">
                            {/* LEFT: Live Camera View */}
                            <div className="flex-1 h-full">
                                <LiveCameraView onLog={handleLog} />
                            </div>

                            {/* RIGHT: Drone Info Panel */}
                            <div className="w-[280px] h-full shrink-0">
                                <DroneData onLog={handleLog} />
                            </div>
                        </div>

                        {/* Bottom Section - 40% height */}
                        <div className="flex gap-4 h-[40%] min-h-0">
                            {/* Map + Telemetry Stats */}
                            <div className="flex-1 h-full">
                                <DronePositionMap onLog={handleLog} />
                            </div>

                            {/* D-Pad Controls */}
                            <div className="w-[280px] h-full shrink-0">
                                <ManualControls onLog={handleLog} />
                            </div>

                            {/* Activity Logs */}
                            <div className="w-[320px] h-full shrink-0">
                                <ActivityLog externalLogs={activityLogs} />
                            </div>
                        </div>
                    </div>
                )}

                {/* VIDEO VIEW */}
                {currentView === 'Video' && (
                    <DataView logs={activityLogs} />
                )}

                {/* SETTINGS VIEW */}
                {currentView === 'Settings' && (
                    <SettingsView onResetLogs={handleResetLogs} />
                )}

            </div>
        </div>
    );
}

export default App;
