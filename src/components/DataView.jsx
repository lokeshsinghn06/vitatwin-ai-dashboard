import { useState } from 'react';

const DataView = ({ logs }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('all');

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || log.type === filterType;
        return matchesSearch && matchesType;
    });

    return (
        <div className="h-full w-full flex flex-col gap-4 animate-fade-in p-2">
            {/* Header Section */}
            <div className="flex items-center justify-between p-6 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl">
                <div>
                    <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        Mission Data Logs
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">
                        Comprehensive history of all drone activities and detections
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Search logs..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black/40 text-white pl-10 pr-4 py-2 rounded-xl border border-white/10 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 outline-none w-64 transition-all group-hover:bg-black/50"
                        />
                        <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-black/40 text-white px-4 py-2 rounded-xl border border-white/10 outline-none focus:border-cyan-500/50 cursor-pointer hover:bg-black/50 transition-colors"
                    >
                        <option value="all">All Events</option>
                        <option value="alert">Alerts Only</option>
                        <option value="success">Success</option>
                        <option value="info">Info</option>
                    </select>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="flex-1 bg-gray-900/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-white/5 text-gray-400 text-sm font-medium uppercase tracking-wider">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-2">Type</div>
                    <div className="col-span-8">Message</div>
                </div>

                {/* Table Content */}
                <div className="flex-1 overflow-y-auto">
                    {filteredLogs.length > 0 ? (
                        filteredLogs.map((log, index) => (
                            <div
                                key={index}
                                className="grid grid-cols-12 gap-4 p-4 border-b border-white/5 hover:bg-white/[0.02] transition-colors items-center"
                            >
                                <div className="col-span-2 font-mono text-cyan-300/80">
                                    {log.timestamp}
                                </div>
                                <div className="col-span-2">
                                    <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border
                    ${log.type === 'alert' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            log.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                'bg-blue-500/10 text-blue-400 border-blue-500/20'}
                  `}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${log.type === 'alert' ? 'bg-red-400 animate-pulse' :
                                                log.type === 'success' ? 'bg-green-400' :
                                                    'bg-blue-400'
                                            }`}></span>
                                        {log.type.toUpperCase()}
                                    </span>
                                </div>
                                <div className="col-span-8 text-gray-300">
                                    {log.message}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2">
                            <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <span>No logs found matching your filters</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-white/10 bg-white/5 flex justify-between items-center text-xs text-gray-500">
                    <span>Showing {filteredLogs.length} entries</span>
                    <button className="text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1">
                        Export CSV
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DataView;
