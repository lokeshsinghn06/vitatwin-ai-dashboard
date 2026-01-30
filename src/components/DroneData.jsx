import { useDroneTelemetry } from '../hooks/useDroneTelemetry';

const DroneData = () => {
    const { droneState } = useDroneTelemetry();

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header - Fixed Height h-12 */}
            <div className="bg-white text-slate-800 border-b border-slate-200 flex items-center px-4 h-12 shrink-0">
                <svg className="w-5 h-5 text-slate-500 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                    <path d="M7 12h2v5H7zm4-3h2v8h-2zm4-3h2v11h-2z" />
                </svg>
                <span className="font-bold text-sm tracking-wide text-slate-700 uppercase">Drone Data</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 bg-white flex flex-col justify-center gap-5">

                {/* Battery (Mocked for now as not in simple telemetry, or could be status text?) */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z" /></svg>
                        <span className="text-slate-700 font-bold text-base">Battery Level</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex gap-0.5">
                            <div className="w-1.5 h-3.5 bg-green-500"></div>
                            <div className="w-1.5 h-3.5 bg-green-500"></div>
                            <div className="w-1.5 h-3.5 bg-green-500"></div>
                            <div className="w-1.5 h-3.5 bg-green-500"></div>
                            <div className="w-1.5 h-3.5 bg-slate-200"></div>
                        </div>
                        <span className="bg-slate-800 text-white px-2 py-0.5 rounded text-sm font-bold">79%</span>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Payload - Updated with real Mode info */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-2.05.54-2.65 1.39C11.96 2.55 11.23 2 10.4 2 8.92 2 7.7 3.09 7.42 4.5 7.28 4.5 7.15 4.5 7 4.5c-2.76 0-5 2.24-5 5s2.24 5 5 5c.15 0 .28 0 .42-.01C7.7 15.91 8.92 17 10.4 17c.83 0 1.56-.55 1.95-1.39.6.85 1.6 1.39 2.65 1.39 1.66 0 3-1.34 3-3 0-.35-.07-.69-.18-1H20c1.1 0 2-.9 2-2v-3c0-1.1-.9-2-2-2z" /></svg>
                        <div>
                            <div className="text-slate-700 font-bold text-base">Flight Mode</div>
                            <div className="text-slate-500 text-xs mt-0.5 font-mono">{droneState.mode}</div>
                        </div>
                    </div>
                    <div>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${droneState.armed ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                            {droneState.armed ? 'ARMED' : 'DISARMED'}
                        </span>
                    </div>
                </div>

                <div className="h-px bg-slate-100 w-full"></div>

                {/* Comm Link & Heading */}
                <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                            <span className="text-slate-700 font-bold text-sm">Speed</span>
                        </div>
                        <span className="text-slate-500 text-xs ml-5 font-mono">{droneState.speed.toFixed(1)} m/s</span>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-2 mb-1">
                            <svg className="w-4 h-4 text-slate-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" /></svg>
                            <span className="text-slate-700 font-bold text-sm">Heading</span>
                        </div>
                        <span className="text-slate-900 font-bold text-xl leading-none">{Math.round(droneState.heading)}°</span>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DroneData;
