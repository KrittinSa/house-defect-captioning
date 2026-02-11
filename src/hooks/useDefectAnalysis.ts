import { useState } from 'react';
import { useStore } from '../lib/store';
import { captioningService } from '../services/captioningService';
import { defectMapper } from '../lib/mappers/defectMapper';

export function useDefectAnalysis() {
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { addAnalysis, updateAnalysis, stats, analyses } = useStore();

    const analyzeImage = async (files: File[]) => {
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
            const { data, error } = await captioningService.analyzeImage(entry.file);

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
    };

    return {
        analyzeImage,
        isAnalyzing,
        stats,
        analyses,
    };
}
