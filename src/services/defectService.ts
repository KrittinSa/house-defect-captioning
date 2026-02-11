import { CONFIG } from '../config';
import type { DefectRecordBackend } from '../types/defect';

export const defectService = {
    // Fetch all defects from the backend (optional filter by project)
    getAll: async (projectId?: number): Promise<DefectRecordBackend[]> => {
        try {
            const url = projectId
                ? `${CONFIG.apiUrl}/defects?project_id=${projectId}`
                : `${CONFIG.apiUrl}/defects`;

            const response = await fetch(url);
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

    // Update a defect's metadata
    update: async (id: number, updates: any): Promise<boolean> => {
        try {
            const response = await fetch(`${CONFIG.apiUrl}/defects/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updates),
            });
            return response.ok;
        } catch (error) {
            console.error('Error updating defect:', error);
            return false;
        }
    },

    // Generate PDF report from selected defect IDs
    generateReportFromIds: async (ids: string[]): Promise<boolean> => {
        try {
            // Filter out non-numeric IDs (e.g. temporary local IDs)
            const numericIds = ids.map(Number).filter(id => !isNaN(id));

            if (numericIds.length === 0) {
                console.warn('No valid numeric IDs to generate report for');
                return false;
            }

            const response = await fetch(`${CONFIG.apiUrl}/generate-report-db`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(numericIds),
            });

            if (!response.ok) throw new Error('Report generation failed');

            // Handle file download
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `DefectReport_${new Date().toISOString().slice(0, 10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            return true;
        } catch (error) {
            console.error('Error generating report:', error);
            return false;
        }
    },
};
