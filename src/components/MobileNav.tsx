import React from 'react';
import { useStore } from '../lib/store';
import type { AppView } from '../lib/store';
import { List, Activity, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

export const MobileNav: React.FC = () => {
    const currentView = useStore((state) => state.currentView);
    const setView = useStore((state) => state.setView);

    const navItems = [
        { view: 'home' as AppView, icon: CheckCircle, label: 'Scan' },
        { view: 'history' as AppView, icon: List, label: 'History' },
        { view: 'report' as AppView, icon: Activity, label: 'Report' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-100 px-6 py-4 pb-8 sm:pb-4 flex justify-around items-center shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.05)]">
            {navItems.map((item) => (
                <button
                    key={item.view}
                    onClick={() => setView(item.view)}
                    className={clsx(
                        "flex flex-col items-center gap-1 transition-colors duration-300",
                        currentView === item.view ? "text-crimson" : "text-slate-400 hover:text-slate-600"
                    )}
                >
                    <item.icon size={22} className={clsx(currentView === item.view && "animate-bounce")} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
                </button>
            ))}
        </nav>
    );
};
