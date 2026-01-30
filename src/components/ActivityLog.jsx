import { useRef, useEffect } from 'react';

const ActivityLog = ({ externalLogs = [] }) => {
    const scrollRef = useRef(null);

    const initialLogs = [
        { timestamp: '14:02', message: '- Payload successfully dropped.', type: 'info' },
        { timestamp: '14:02', message: '- Human detected at X: 15.432, Y: 7.899, distance 6.3 m.', type: 'alert' },
        { timestamp: '14:02', message: '- Clear drop target zone confirmed.', type: 'success' },
        { timestamp: '14:01', message: '- Drone hovering at target location.', type: 'info' },
    ];

    const allLogs = [...initialLogs, ...externalLogs];

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [allLogs.length]);

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header - Fixed Height h-10 */}
            <div className="bg-[#f8fafc] text-slate-800 border-b border-slate-200 flex items-center px-3 h-10 shrink-0">
                <svg className="w-4 h-4 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" /></svg>
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Activity Logs</span>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 p-3 bg-[#f1f5f9] overflow-y-auto font-mono text-xs leading-relaxed text-slate-600"
            >
                {allLogs.map((log, index) => (
                    <div key={index} className="mb-1.5 flex gap-2">
                        <span className="font-bold text-slate-400 shrink-0">{log.timestamp}</span>
                        <span className={log.type === 'alert' ? 'text-slate-800 font-bold' : ''}>
                            {log.message}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ActivityLog;
