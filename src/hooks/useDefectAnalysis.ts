import { useState } from 'react';
import { useStore } from '../lib/store';
import { captioningService } from '../services/captioningService';
import { defectMapper } from '../lib/mappers/defectMapper';

export function useDefectAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { addAnalysis, updateAnalysis, stats, analyses, currentProjectId } = useStore();

    const analyzeImage = async (files: File[]) => {
        if (!currentProjectId) {
            console.error("No project selected");
            // Ideally show toast here
            return;
        }

        setIsAnalyzing(true);
        const timestamp = new Date();

        // 1. Prepare initial entries for immediate UI feedback
        const initialEntries = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            imageUrl: URL.createObjectURL(file)
        }));

        // 2. Add all to store as 'processing'
        initialEntries.forEach(entry => {
            addAnalysis({
                id: entry.id,
                imageUrl: entry.imageUrl,
                labelThai: 'Analyzing...', // Keeping the key, but value is English
                labelEn: 'Analyzing...',
                confidence: 0,
                room: 'General',
                timestamp: timestamp,
                status: 'processing',
            });
        });

        // 3. Process concurrently
        await Promise.all(initialEntries.map(async (entry) => {
            const { data, error } = await captioningService.analyzeImage(entry.file, currentProjectId);

            if (error || !data) {
                updateAnalysis(entry.id, {
                    status: 'error',
                    labelThai: 'Error occurred',
                    labelEn: 'Error occurred'
                });
            } else {
                const uiData = defectMapper.toUI(data, entry.id, entry.imageUrl);
                updateAnalysis(entry.id, { ...uiData, status: 'done' });
            }
        }));

        setIsAnalyzing(false);

        // Refresh the list to get real DB IDs
        if (currentProjectId) {
            const { useStore } = await import('../lib/store');
            // We need to access the store acton directly or import useStore to get state?
            // Actually useStore is imported at top level, but let's just use the returned actions
            const switchProject = useStore.getState().switchProject;
            await switchProject(currentProjectId);
        }
    };

    return {
        analyzeImage,
        isAnalyzing,
        stats,
        analyses,
    };
}
