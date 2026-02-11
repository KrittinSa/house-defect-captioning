import type { DefectAnalysisUI, InferenceResponseDB, DefectRecordBackend } from '../../types/defect';
import { CONFIG } from '../../config';

const LABEL_MAP_EN: Record<string, string> = {
    'wall_crack': 'Wall Crack',
    'leaking_pipe': 'Leaking Pipe',
    'peeling_paint': 'Peeling Paint',
    'broken_tile': 'Broken Tile',
    'mold_growth': 'Mold/Moisture',
    'unknown': 'Unknown Defect',
};

export const defectMapper = {
    toUI: (dbResponse: InferenceResponseDB, id: string, imageUrl: string): DefectAnalysisUI => {
        // Use caption from model if available (Thai text), otherwise fallback to mapped label
        const displayLabel = dbResponse.caption || LABEL_MAP_EN[dbResponse.label] || dbResponse.label;

        return {
            id,
            imageUrl,
            labelThai: displayLabel,
            labelEn: displayLabel,
            confidence: dbResponse.confidence,
            room: 'General',
            timestamp: new Date(),
            status: 'done',
        };
    },

    fromBackend: (record: DefectRecordBackend): DefectAnalysisUI => {
        const displayLabel = record.caption || LABEL_MAP_EN[record.label] || record.label;
        // Construct URL: API is at localhost:8000, static mounted at /static
        // If image_path is partial "uploads/xyz.jpg", we need /static/uploads/xyz.jpg
        // Ensure CONFIG.apiUrl is base (e.g., http://localhost:8000)

        let imageUrl = record.image_path;
        if (record.image_path && !record.image_path.startsWith('http')) {
            imageUrl = `${CONFIG.apiUrl}/static/${record.image_path}`;
        }

        return {
            id: String(record.id),
            imageUrl: imageUrl,
            labelThai: displayLabel,
            labelEn: displayLabel,
            confidence: record.confidence,
            room: (record.room as any) || 'General',
            timestamp: new Date(record.timestamp),
            status: 'done',
            severity: record.severity,
        };
    }
};
