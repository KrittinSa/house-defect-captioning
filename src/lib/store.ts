import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DefectAnalysisUI, ProjectStats } from '../types/defect';
import { defectService } from '../services/defectService';
import { defectMapper } from './mappers/defectMapper';

export type AppView = 'home' | 'history' | 'report';

interface AppState {
    analyses: DefectAnalysisUI[];
    stats: ProjectStats;
    currentAnalysisId: string | null;
    currentView: AppView;
    addAnalysis: (analysis: DefectAnalysisUI) => void;
    updateAnalysis: (id: string, updates: Partial<DefectAnalysisUI>) => void;
    deleteAnalysis: (id: string) => void;
    setCurrentAnalysisId: (id: string | null) => void;
    setView: (view: AppView) => void;
    initialize: () => Promise<void>;
}

const calculateStats = (analyses: DefectAnalysisUI[]): ProjectStats => {
    return {
        totalDefects: analyses.length,
        processedCount: analyses.filter((a) => a.status === 'done').length,
        roomDistribution: analyses.reduce((acc: Record<string, number>, a) => {
            if (a.status === 'done') {
                acc[a.room] = (acc[a.room] || 0) + 1;
            }
            return acc;
        }, {}),
    };
};

const initialStats: ProjectStats = {
    totalDefects: 0,
    processedCount: 0,
    roomDistribution: {},
};

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            analyses: [],
            stats: initialStats,
            currentAnalysisId: null,
            currentView: 'home',

            addAnalysis: (analysis: DefectAnalysisUI) => set((state: AppState) => {
                const newAnalyses = [analysis, ...state.analyses];
                return { analyses: newAnalyses, stats: calculateStats(newAnalyses) };
            }),

            updateAnalysis: (id: string, updates: Partial<DefectAnalysisUI>) => set((state: AppState) => {
                const newAnalyses = state.analyses.map((a: DefectAnalysisUI) => a.id === id ? { ...a, ...updates } : a);
                return { analyses: newAnalyses, stats: calculateStats(newAnalyses) };
            }),

            setCurrentAnalysisId: (id: string | null) => set({ currentAnalysisId: id }),
            setView: (view: AppView) => set({ currentView: view }),

            deleteAnalysis: (id: string) => set((state: AppState) => {
                // Optimistically update UI
                defectService.delete(Number(id)).catch(err => console.error(err));

                const newAnalyses = state.analyses.filter((a) => a.id !== id);
                return { analyses: newAnalyses, stats: calculateStats(newAnalyses), currentAnalysisId: null };
            }),

            initialize: async () => {
                const records = await defectService.getAll();
                const analyses = records.map(defectMapper.fromBackend);
                set({ analyses, stats: calculateStats(analyses) });
            },
        }),
        {
            name: 'house-defect-storage-v2',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ analyses: state.analyses, stats: state.stats }), // Only persist data, not view state if not needed (optional)
        }
    )
);
