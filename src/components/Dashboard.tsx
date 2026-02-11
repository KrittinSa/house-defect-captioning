import React from 'react';
import { useStore } from '../lib/store';
import { ShieldAlert } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { ReportView } from './views/ReportView';
import { MobileNav } from './MobileNav';
import { DefectDetailModal } from './DefectDetailModal';
import { Toaster } from 'sonner';

export const Dashboard: React.FC = () => {
    console.log('Dashboard: Rendering...');
    const currentView = useStore((state) => state.currentView);
    const setView = useStore((state) => state.setView);
    const initialize = useStore((state) => state.initialize);

    React.useEffect(() => {
        initialize();
    }, [initialize]);

    console.log('Dashboard: Current View:', currentView);

    const renderView = () => {
        // Simple fade-in animation key
        const fadeClass = "animate-in fade-in duration-500 slide-in-from-bottom-2";

        switch (currentView) {
            case 'home':
                return <div key="home" className={fadeClass}><HomeView /></div>;
            case 'history':
                return <div key="history" className={fadeClass}><HistoryView /></div>;
            case 'report':
                return <div key="report" className={fadeClass}><ReportView /></div>;
            default:
                return <div key="home" className={fadeClass}><HomeView /></div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32 sm:pb-8">
            {/* Defect Detail Modal (Global) */}
            <DefectDetailModal />
            <Toaster position="top-center" richColors />

            {/* Header */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-crimson rounded-lg flex items-center justify-center shadow-glow">
                            <ShieldAlert className="text-white" size={18} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">House Defect <span className="text-crimson">AI</span></h1>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden sm:flex items-center gap-6">
                        <button
                            onClick={() => setView('home')}
                            className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Scan
                        </button>
                        <button
                            onClick={() => setView('history')}
                            className={`text-sm font-medium transition-colors ${currentView === 'history' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            History
                        </button>
                        <button
                            onClick={() => setView('report')}
                            className={`text-sm font-medium transition-colors ${currentView === 'report' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                            Report
                        </button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        AI Model Active
                    </span>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 overflow-hidden">
                        {/* Placeholder Avatar */}
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 transition-opacity duration-300 ease-in-out">
                {renderView()}
            </main>

            {/* Mobile PWA Nav */}
            <div className="sm:hidden">
                <MobileNav />
            </div>

            {/* Desktop Nav Hint (Optional, since this is mobile-first MVP) */}
            <div className="hidden sm:flex fixed bottom-8 right-8 z-40 bg-white rounded-full shadow-premium px-6 py-3 items-center gap-4 border border-slate-100">
                <p className="text-sm text-slate-500">Desktop Mode: Use Upload Zone</p>
            </div>
        </div>
    );
};
