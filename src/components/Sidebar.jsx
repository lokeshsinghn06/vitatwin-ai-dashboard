const Sidebar = ({ activeNav, onNavChange }) => {
    const navItems = [
        { id: 'Home', icon: 'home', label: 'Dashboard' },
        { id: 'Video', icon: 'video', label: 'Video' },
        { id: 'Settings', icon: 'settings', label: 'Settings' },
    ];

    const icons = {
        home: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
        ),
        video: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
        ),
        settings: (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
        ),
    };

    return (
        <div className="w-16 bg-[#0d0d0d] border-r border-[#1a1a1a] flex flex-col items-center py-6 shrink-0">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                    D
                </div>
            </div>

            {/* Navigation Icons */}
            <div className="flex flex-col gap-4 flex-1">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavChange(item.id)}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${
                            activeNav === item.id
                                ? 'bg-[#1e1e1e] text-white'
                                : 'text-[#666] hover:text-white hover:bg-[#1e1e1e]/50'
                        }`}
                        title={item.label}
                    >
                        {icons[item.icon]}
                    </button>
                ))}
            </div>

            {/* User Avatar at bottom */}
            <div className="mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-medium cursor-pointer hover:ring-2 hover:ring-white/20 transition-all">
                    U
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
