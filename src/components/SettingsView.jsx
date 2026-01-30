import { useState } from 'react';

const Toggle = ({ label, desc, checked, onChange, icon }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 flex items-center justify-center text-cyan-400 group-hover:text-cyan-300 group-hover:scale-110 transition-all">
                {icon}
            </div>
            <div>
                <h3 className="text-white font-medium">{label}</h3>
                <p className="text-gray-400 text-xs">{desc}</p>
            </div>
        </div>

        <button
            onClick={() => onChange(!checked)}
            className={`relative w-12 h-6 rounded-full transition-all duration-300 ${checked ? 'bg-cyan-500' : 'bg-gray-700'}`}
        >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-lg transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);

const SettingsView = ({ onResetLogs }) => {
    const [settings, setSettings] = useState({
        notifications: true,
        sound: true,
        autoRecord: false,
        darkMode: true,
        units: 'metric',
        streamQuality: 'high'
    });

    const updateSetting = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="h-full w-full flex gap-6 p-2 animate-fade-in">
            {/* Sidebar Navigation */}
            <div className="w-64 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-4 shadow-xl flex flex-col gap-2">
                <h2 className="text-xl font-bold text-white px-4 py-4 mb-2">Settings</h2>
                {['General', 'Notifications', 'Display', 'System'].map((item, i) => (
                    <button
                        key={item}
                        className={`text-left px-4 py-3 rounded-xl text-sm font-medium transition-all
              ${i === 0 ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}
            `}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-xl overflow-y-auto">

                <div className="max-w-3xl space-y-8">
                    {/* Section: Mission Control */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-cyan-500 rounded-full"></span>
                            Mission Control
                        </h3>
                        <div className="space-y-3">
                            <Toggle
                                label="Audible Alerts"
                                desc="Play sound on detection events"
                                checked={settings.sound}
                                onChange={(v) => updateSetting('sound', v)}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                                }
                            />
                            <Toggle
                                label="Auto-Record Incidents"
                                desc="Automatically record video when a detection alert is triggered"
                                checked={settings.autoRecord}
                                onChange={(v) => updateSetting('autoRecord', v)}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                }
                            />
                        </div>
                    </div>

                    {/* Section: Display */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
                            Display & Units
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => updateSetting('units', 'metric')}
                                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${settings.units === 'metric' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="font-bold">Metric (m/km)</div>
                                <div className="text-xs opacity-70">Standard international units</div>
                            </button>

                            <button
                                onClick={() => updateSetting('units', 'imperial')}
                                className={`p-4 rounded-xl border flex flex-col gap-2 transition-all ${settings.units === 'imperial' ? 'bg-cyan-500/10 border-cyan-500 text-white' : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'}`}
                            >
                                <div className="font-bold">Imperial (ft/mi)</div>
                                <div className="text-xs opacity-70">US standard units</div>
                            </button>
                        </div>
                    </div>

                    {/* Section: Maintenance */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="w-1 h-6 bg-red-500 rounded-full"></span>
                            Danger Zone
                        </h3>
                        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-6 flex items-center justify-between">
                            <div>
                                <h4 className="text-red-400 font-bold">Clear All System Logs</h4>
                                <p className="text-red-400/60 text-sm">This action cannot be undone.</p>
                            </div>
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to delete all logs?')) onResetLogs();
                                }}
                                className="bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-lg font-bold border border-red-500/30 transition-colors"
                            >
                                Clear Data
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SettingsView;
