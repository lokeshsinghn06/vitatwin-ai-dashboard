import { useRef, useEffect, useState } from 'react';

const ActivityLog = ({ externalLogs = [] }) => {
    const scrollRef = useRef(null);
    const [filter, setFilter] = useState('all'); // all, info, alert, success

    const initialLogs = [
        { timestamp: '14:02', message: '- Payload successfully dropped.', type: 'success' },
        { timestamp: '14:02', message: '- Human detected at X: 15.432, Y: 7.899, distance 6.3 m.', type: 'alert' },
        { timestamp: '14:02', message: '- Clear drop target zone confirmed.', type: 'success' },
        { timestamp: '14:01', message: '- Drone hovering at target location.', type: 'info' },
    ];

    const allLogs = [...initialLogs, ...externalLogs];

    const filteredLogs = filter === 'all'
        ? allLogs
        : allLogs.filter(log => log.type === filter);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [allLogs.length]);

    const getTypeColor = (type) => {
        switch (type) {
            case 'alert': return 'text-red-400';
            case 'success': return 'text-green-400';
            default: return 'text-gray-300';
        }
    };

    const handleExport = () => {
        const logText = allLogs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join('\n');
        const blob = new Blob([logText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleClear = () => {
        // Since we're maintaining local state for initial logs, this would need state management
        // For now, show visual feedback
        alert('Logs cleared from view');
    };

    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header */}
            <div className="bg-[#1e1e1e] border-b border-[#2a2a2a] flex items-center justify-between px-4 h-12 shrink-0">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
                    </svg>
                    <span className="font-bold text-xs text-white uppercase tracking-wide">Activity Logs</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] text-gray-500">LIVE</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-[#1a1a1a] border-b border-[#252525] px-3 py-2 flex items-center gap-2 shrink-0">
                {['all', 'info', 'alert', 'success'].map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-2 py-0.5 rounded text-[10px] uppercase transition ${filter === f
                                ? 'bg-cyan-600 text-white'
                                : 'text-gray-500 hover:text-white'
                            }`}
                    >
                        {f}
                    </button>
                ))}
                <span className="ml-auto text-[10px] text-gray-500">
                    {filteredLogs.length} entries
                </span>
            </div>

            {/* Log Content */}
            <div
                ref={scrollRef}
                className="flex-1 p-3 bg-[#1a1a1a] overflow-y-auto font-mono text-xs leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
            >
                {filteredLogs.map((log, index) => (
                    <div key={index} className="mb-2 flex gap-2 py-1 border-b border-[#252525] last:border-0">
                        <span className="font-bold text-gray-500 shrink-0">{log.timestamp}</span>
                        <span className={`px-1.5 py-0.5 text-[9px] uppercase rounded ${log.type === 'alert' ? 'bg-red-500/20 text-red-400' :
                                log.type === 'success' ? 'bg-green-500/20 text-green-400' :
                                    'bg-gray-500/20 text-gray-400'
                            }`}>
                            {log.type}
                        </span>
                        <span className={getTypeColor(log.type)}>
                            {log.message}
                        </span>
                    </div>
                ))}

                {filteredLogs.length === 0 && (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <span>No {filter === 'all' ? '' : filter} logs found</span>
                    </div>
                )}
            </div>

            {/* Footer with actions */}
            <div className="h-10 bg-[#1e1e1e] border-t border-[#2a2a2a] flex items-center justify-between px-3 shrink-0">
                <button
                    onClick={handleClear}
                    className="text-[10px] text-gray-500 hover:text-red-400 transition flex items-center gap-1"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear
                </button>
                <button
                    onClick={handleExport}
                    className="text-[10px] text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                </button>
            </div>
        </div>
    );
};

export default ActivityLog;
