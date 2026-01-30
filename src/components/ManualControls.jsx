const ManualControls = () => {
    return (
        <div className="dashboard-card h-full flex flex-col">
            {/* Header - Fixed Height h-10 */}
            <div className="bg-[#f8fafc] text-slate-800 border-b border-slate-200 flex items-center px-3 h-10 shrink-0">
                <svg className="w-4 h-4 text-slate-500 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M10.18 9" /></svg>
                <svg className="w-4 h-4 text-slate-500 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.96l-.36-2.54a.484.484 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.26-1.13.59-1.62.96l-2.39-.96c-.21-.08-.47-.05-.59.22L2.74 8.87c-.09.17-.05.38.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.96l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.26 1.13-.59 1.62-.96l2.39.96c.21.08.47.05.59-.22l1.92-3.32c.09-.17.05-.38-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" /></svg>
                <span className="font-bold text-xs text-slate-700 uppercase tracking-wide">Manual Controls</span>
            </div>

            <div className="flex-1 p-3 bg-[#f1f5f9] flex flex-col justify-between">

                <div className="flex gap-4 items-start justify-center pt-1">

                    {/* Left Column: Altitude Control */}
                    <div className="flex flex-col gap-2 w-[80px]">
                        {/* Up Arrow */}
                        <button className="bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-700 h-10 rounded-md shadow-[0_2px_0_0_rgb(203,213,225),0_3px_5px_rgba(0,0,0,0.1)] border border-slate-300 active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                        </button>

                        {/* Down Arrow */}
                        <button className="bg-gradient-to-b from-slate-100 to-slate-200 hover:from-white hover:to-slate-100 text-slate-700 h-10 rounded-md shadow-[0_2px_0_0_rgb(203,213,225),0_3px_5px_rgba(0,0,0,0.1)] border border-slate-300 active:shadow-none active:translate-y-0.5 transition-all flex items-center justify-center">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                        </button>

                        {/* LAND Button */}
                        <button className="mt-1 bg-gradient-to-b from-[#0ea5e9] to-[#0284c7] hover:from-[#38bdf8] hover:to-[#0ea5e9] text-white font-bold h-10 rounded-md shadow-[0_2px_0_0_rgb(3,105,161),0_3px_5px_rgba(0,0,0,0.2)] border-t border-sky-400 active:shadow-none active:translate-y-0.5 transition-all text-xs tracking-wider uppercase">
                            LAND
                        </button>
                    </div>

                    {/* Right Column: Directional Pad */}
                    <div className="flex flex-col gap-2 w-[140px]">
                        <div className="grid grid-cols-3 gap-1.5">
                            {/* Top Row */}
                            <div className="col-start-1">
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none transition-all">
                                    <svg className="w-5 h-5 rotate-[270deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                                </button>
                            </div>

                            <div className="col-start-2 -mt-1.5"> {/* Slight offset */}
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none ring-1 ring-slate-400/30 transition-all">
                                    <svg className="w-6 h-6 mb-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                                </button>
                            </div>

                            <div className="col-start-3">
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none transition-all">
                                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                                </button>
                            </div>

                            {/* Bottom Row */}
                            <div className="col-start-1 row-start-2">
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none transition-all">
                                    <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                                </button>
                            </div>
                            <div className="col-start-2 row-start-2">
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none transition-all">
                                    <svg className="w-6 h-6 mt-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M7 10l5 5 5-5z" /></svg>
                                </button>
                            </div>
                            <div className="col-start-3 row-start-2">
                                <button className="w-full h-10 rounded-md bg-gradient-to-b from-slate-700 to-slate-800 shadow-[0_2px_0_0_rgb(30,41,59)] flex items-center justify-center text-white active:translate-y-0.5 active:shadow-none transition-all">
                                    <svg className="w-5 h-5 rotate-[270deg]" fill="currentColor" viewBox="0 0 24 24"><path d="M7 14l5-5 5 5z" /></svg>
                                </button>
                            </div>
                        </div>

                        {/* DROP PAYLOAD */}
                        <button className="mt-1 w-full bg-gradient-to-b from-[#facc15] to-[#ca8a04] hover:from-[#fde047] hover:to-[#eab308] text-slate-900 font-bold h-10 rounded-md shadow-[0_2px_0_0_rgb(161,98,7),0_3px_5px_rgba(0,0,0,0.2)] border-t border-yellow-300 active:shadow-none active:translate-y-0.5 transition-all text-xs tracking-wide uppercase flex items-center justify-center">
                            DROP PAYLOAD
                        </button>
                    </div>

                </div>

                {/* Emergency Stop */}
                <div className="mt-2">
                    <button className="w-full bg-gradient-to-b from-[#dc2626] to-[#991b1b] hover:from-[#ef4444] hover:to-[#b91c1c] text-white font-bold py-2 rounded-md shadow-[0_2px_0_0_rgb(127,29,29),0_3px_5px_rgba(0,0,0,0.3)] border-t border-red-400 active:shadow-none active:translate-y-0.5 transition-all tracking-wider text-sm uppercase">
                        EMERGENCY STOP
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualControls;
