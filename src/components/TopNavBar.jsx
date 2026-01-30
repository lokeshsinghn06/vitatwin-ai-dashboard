import { useState } from 'react';
import { missionOptions } from '../data/mockData';

const DroneIcon = () => (
    <svg className="w-8 h-8 text-blue-400" viewBox="0 0 40 30" fill="currentColor">
        <path d="M20 15 L6 6 M20 15 L34 6 M20 15 L6 24 M20 15 L34 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="20" cy="15" r="4" className="fill-white" />
    </svg>
);

const TopNavBar = ({ activeNav, onNavChange }) => {
    const [selectedMission, setSelectedMission] = useState('VITATWIN-01');

    return (
        <nav className="h-16 flex items-center justify-between px-6 flex-shrink-0 bg-slate-800 text-white shadow-md z-50">

            {/* Left Section - Logo */}
            <div className="flex items-center gap-3">
                <DroneIcon />
                <h1 className="text-xl font-bold tracking-tight">
                    Drone Mission Control Dashboard
                </h1>
            </div>

            {/* Right Section - Navigation & Mission */}
            <div className="flex items-center gap-8 text-sm">

                {/* Navigation Tabs */}
                <div className="flex items-center gap-6">
                    {['Home', 'Data', 'Settings'].map((item) => (
                        <button
                            key={item}
                            onClick={() => onNavChange(item)}
                            className={`
                                font-medium transition-colors hover:text-blue-300
                                ${activeNav === item ? 'text-blue-400 border-b-2 border-blue-400 pb-0.5' : 'text-slate-300'}
                            `}
                        >
                            {item}
                        </button>
                    ))}
                </div>

                {/* Divider */}
                <div className="h-6 w-px bg-slate-600"></div>

                {/* Mission Selector */}
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">Mission:</span>
                    <select
                        value={selectedMission}
                        onChange={(e) => setSelectedMission(e.target.value)}
                        className="bg-transparent border-none text-white font-semibold focus:ring-0 cursor-pointer hover:text-blue-300"
                    >
                        {missionOptions.map((mission) => (
                            <option key={mission} value={mission} className="bg-slate-800 text-white">
                                {mission}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </nav>
    );
};

export default TopNavBar;
