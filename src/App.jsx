import TopNavBar from './components/TopNavBar';
import LiveCameraView from './components/LiveCameraView';
import AIDetectionStatus from './components/AIDetectionStatus';
import DroneData from './components/DroneData';
import DronePositionMap from './components/DronePositionMap';
import ManualControls from './components/ManualControls';
import ActivityLog from './components/ActivityLog';
import DataView from './components/DataView';
import SettingsView from './components/SettingsView';
import { useState, useCallback } from 'react';

function App() {
    const [currentView, setCurrentView] = useState('Home'); // Home, Data, Settings
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
        <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#e2e8f0] text-slate-800 font-sans">

            {/* Top Navigation Bar */}
            <TopNavBar activeNav={currentView} onNavChange={setCurrentView} />

            {/* Main Content Area */}
            <div className="flex-1 p-4 overflow-hidden relative z-10 flex flex-col min-h-0">

                {/* DASHBOARD VIEW */}
                {currentView === 'Home' && (
                    <div className="flex-1 flex flex-col gap-4 animate-fade-in min-h-0">
                        {/* Top Section - 60% height */}
                        <div className="flex gap-4 h-[60%] min-h-0">
                            {/* LEFT: Live Camera View */}
                            <div className="w-[67%] h-full">
                                <LiveCameraView onLog={handleLog} />
                            </div>

                            {/* RIGHT: Status Panels */}
                            <div className="w-[33%] h-full flex flex-col gap-4">
                                <div className="h-[45%] min-h-0">
                                    <AIDetectionStatus />
                                </div>
                                <div className="h-[55%] min-h-0">
                                    <DroneData />
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section - 40% height */}
                        <div className="flex gap-4 h-[40%] min-h-0">
                            <div className="w-[35%] h-full">
                                <DronePositionMap />
                            </div>
                            <div className="w-[30%] h-full">
                                <ManualControls />
                            </div>
                            <div className="w-[35%] h-full">
                                <ActivityLog externalLogs={activityLogs} />
                            </div>
                        </div>
                    </div>
                )}

                {/* DATA VIEW */}
                {currentView === 'Data' && (
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
