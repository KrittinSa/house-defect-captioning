import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { DefectAnalysisUI, ProjectStats, Project } from '../types/defect';
import { defectService } from '../services/defectService';
import { projectService } from '../services/projectService';
import { defectMapper } from './mappers/defectMapper';

export type AppView = 'home' | 'history' | 'report';

interface AppState {
    analyses: DefectAnalysisUI[];
    stats: ProjectStats;
    currentAnalysisId: string | null;
    currentView: AppView;
    projects: Project[];
    currentProjectId: number | null;

    addAnalysis: (analysis: DefectAnalysisUI) => void;
    updateAnalysis: (id: string, updates: Partial<DefectAnalysisUI>) => void;
    deleteAnalysis: (id: string) => void;
    setCurrentAnalysisId: (id: string | null) => void;
    setView: (view: AppView) => void;

    // Project Actions
    initialize: () => Promise<void>;
    fetchProjects: () => Promise<void>;
    addProject: (name: string, address?: string) => Promise<void>;
    switchProject: (projectId: number) => Promise<void>;
    deleteProject: (projectId: number) => Promise<void>;
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
        (set, get) => ({
            analyses: [],
            stats: initialStats,
            currentAnalysisId: null,
            currentView: 'home',
            projects: [],
            currentProjectId: null,

            addAnalysis: (analysis: DefectAnalysisUI) => set((state: AppState) => {
                const newAnalyses = [analysis, ...state.analyses];
                return { analyses: newAnalyses, stats: calculateStats(newAnalyses) };
            }),

            updateAnalysis: (id: string, updates: Partial<DefectAnalysisUI>) => set((state: AppState) => {
                // Map UI updates to Backend fields
                const backendUpdates: any = {};
                if (updates.labelThai !== undefined) backendUpdates.caption = updates.labelThai;
                if (updates.room !== undefined) backendUpdates.room = updates.room;
                if (updates.severity !== undefined) backendUpdates.severity = updates.severity;

                if (Object.keys(backendUpdates).length > 0) {
                    defectService.update(Number(id), backendUpdates).catch(err => console.error(err));
                }

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
                await get().fetchProjects();
                const state = get();

                if (state.projects.length === 0) {
                    // Auto-create default project only if DB is completely empty
                    await get().addProject('Default Project', 'Main Site');
                } else {
                    // Check if saved projectId still exists in DB
                    const savedExists = state.currentProjectId
                        && state.projects.some(p => p.id === state.currentProjectId);
                    const targetId = savedExists
                        ? state.currentProjectId!
                        : state.projects[0].id;
                    await get().switchProject(targetId);
                }
            },

            fetchProjects: async () => {
                const projects = await projectService.getAll();
                set({ projects });
            },

            addProject: async (name: string, address?: string) => {
                const newProject = await projectService.create(name, address);
                if (newProject) {
                    set((state) => ({ projects: [...state.projects, newProject] }));
                    await get().switchProject(newProject.id); // Auto-switch to new project
                }
            },

            switchProject: async (projectId: number) => {
                set({ currentProjectId: projectId, analyses: [] }); // Clear current view
                const records = await defectService.getAll(projectId);
                const analyses = records.map(defectMapper.fromBackend);
                set({ analyses, stats: calculateStats(analyses) });
            },

            deleteProject: async (projectId: number) => {
                const success = await projectService.delete(projectId);
                if (success) {
                    set((state) => ({
                        projects: state.projects.filter(p => p.id !== projectId)
                    }));
                    const state = get();
                    // If we deleted the current project, switch to another one
                    if (state.currentProjectId === projectId) {
                        const nextProject = state.projects[0];
                        if (nextProject) {
                            await get().switchProject(nextProject.id);
                        } else {
                            set({ currentProjectId: null, analyses: [], stats: initialStats });
                        }
                    }
                }
            }
        }),
        {
            name: 'house-defect-storage-v2',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                analyses: state.analyses,
                stats: state.stats,
                currentProjectId: state.currentProjectId
                // Don't persist projects list, fetch fresh on init
            }),
        }
    )
);
