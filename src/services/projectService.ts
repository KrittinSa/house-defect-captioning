
import { CONFIG } from '../config';
import type { Project } from '../types/defect';

export const projectService = {
    getAll: async (): Promise<Project[]> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/projects`);
            if (!response.ok) throw new Error('Failed to fetch projects');
            return await response.json();
        } catch (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
    },

    create: async (name: string, address?: string): Promise<Project | null> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/projects`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, address }),
            });
            if (!response.ok) throw new Error('Failed to create project');
            return await response.json();
        } catch (error) {
            console.error('Error creating project:', error);
            return null;
        }
    },

    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/projects/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting project:', error);
            return false;
        }
    }
};
