import React from 'react';
import { useStore } from '../lib/store';
import { ShieldAlert } from 'lucide-react';
import { HomeView } from './views/HomeView';
import { HistoryView } from './views/HistoryView';
import { ReportView } from './views/ReportView';
import { MobileNav } from './MobileNav';
import { DefectDetailModal } from './DefectDetailModal';
import { ProjectManager } from './ProjectManager';
import { Toaster } from 'sonner';

export const Dashboard: React.FC = () => {
    const currentView = useStore((state) => state.currentView);
    const setView = useStore((state) => state.setView);
    const initialize = useStore((state) => state.initialize);
    const currentProjectId = useStore((state) => state.currentProjectId);
    const projects = useStore((state) => state.projects);
    const [isProjectManagerOpen, setIsProjectManagerOpen] = React.useState(false);

    const currentProjectName = React.useMemo(() => {
        return projects.find(p => p.id === currentProjectId)?.name || 'Select Project';
    }, [projects, currentProjectId]);

    React.useEffect(() => {
        initialize();
    }, [initialize]);

    const renderView = () => {
        const fadeClass = "animate-in fade-in duration-500 slide-in-from-bottom-2";
        switch (currentView) {
            case 'home': return <div key="home" className={fadeClass}><HomeView /></div>;
            case 'history': return <div key="history" className={fadeClass}><HistoryView /></div>;
            case 'report': return <div key="report" className={fadeClass}><ReportView /></div>;
            default: return <div key="home" className={fadeClass}><HomeView /></div>;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFDFD] pb-32 sm:pb-8">
            <DefectDetailModal />
            {isProjectManagerOpen && <ProjectManager onClose={() => setIsProjectManagerOpen(false)} />}
            <Toaster position="top-center" richColors />

            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex justify-between items-center transition-all duration-300">
                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-crimson rounded-lg flex items-center justify-center shadow-glow">
                            <ShieldAlert className="text-white" size={18} />
                        </div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight hidden sm:block">House Defect <span className="text-crimson">AI</span></h1>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight sm:hidden">HDAI</h1>
                    </div>

                    <nav className="hidden sm:flex items-center gap-6">
                        <button onClick={() => setView('home')} className={`text-sm font-medium transition-colors ${currentView === 'home' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}>Scan</button>
                        <button onClick={() => setView('history')} className={`text-sm font-medium transition-colors ${currentView === 'history' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}>History</button>
                        <button onClick={() => setView('report')} className={`text-sm font-medium transition-colors ${currentView === 'report' ? 'text-crimson' : 'text-slate-500 hover:text-slate-900'}`}>Report</button>
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {/* Project Selector */}
                    <button
                        onClick={() => setIsProjectManagerOpen(true)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                        <span className="w-2 h-2 rounded-full bg-crimson" />
                        <span className="text-xs font-bold truncate max-w-[100px] sm:max-w-[150px]">{currentProjectName}</span>
                    </button>

                    <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-100 overflow-hidden">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto p-6 transition-opacity duration-300 ease-in-out">
                {renderView()}
            </main>

            <div className="sm:hidden">
                <MobileNav />
            </div>
        </div>
    );
};
