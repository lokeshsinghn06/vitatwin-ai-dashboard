const AIDetectionStatus = () => {
    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header - Fixed Height h-12 */}
            <div className="bg-white text-slate-800 border-b border-slate-200 flex items-center px-4 h-12 shrink-0">
                <svg className="w-5 h-5 text-slate-500 mr-2.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span className="font-bold text-sm tracking-wide text-slate-700 uppercase">AI Detection Status</span>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 flex flex-col justify-center gap-6 bg-white">

                {/* Status Row 1 */}
                <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 border border-green-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-slate-900 font-bold text-lg">Human Detected:</span>
                            <span className="text-green-600 font-bold text-lg">YES</span>
                        </div>
                        <div className="space-y-1">
                            <div className="text-sm text-slate-500 font-medium flex justify-between">
                                <span>Confidence:</span>
                                <span className="text-slate-800">92%</span>
                            </div>
                            <div className="text-sm text-slate-500 font-medium flex justify-between">
                                <span>Distance:</span>
                                <span className="text-slate-800">6.3 meters</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Row 2 */}
                <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 border border-green-200">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <span className="text-green-700 font-bold text-base">Clear Drop Target Zone</span>
                </div>
            </div>
        </div>
    );
};

export default AIDetectionStatus;
