import { CONFIG } from '../config';
import type { DefectRecordBackend } from '../types/defect';

export const defectService = {
    // Fetch all defects from the backend
    getAll: async (): Promise<DefectRecordBackend[]> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/defects`);
            if (!response.ok) {
                throw new Error('Failed to fetch defects');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching defects:', error);
            return [];
        }
    },

    // Delete a defect by ID
    delete: async (id: number): Promise<boolean> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/defects/${id}`, {
                method: 'DELETE',
            });
            return response.ok;
        } catch (error) {
            console.error('Error deleting defect:', error);
            return false;
        }
    },
};
