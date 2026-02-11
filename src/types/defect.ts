export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface InferenceResponseDB {
    label: string;
    confidence: number;
    caption?: string;
    bbox?: number[];
}

export type RoomType = 'General' | 'Bedroom 1' | 'Bedroom 2' | 'Bathroom' | 'Kitchen' | 'Living Room' | 'Exterior';

export interface DefectAnalysisUI {
    id: string;
    imageUrl: string;
    labelThai: string;
    labelEn: string;
    confidence: number;
    room: RoomType;
    timestamp: Date;
    status: 'processing' | 'done' | 'error';
    severity?: string;
}

export interface ProjectStats {
    totalDefects: number;
    processedCount: number;
    roomDistribution: Record<string, number>;
}

export interface DefectRecordBackend {
    id: number;
    filename: string;
    caption: string;
    label: string;
    confidence: number;
    timestamp: string; // ISO string from backend
    image_path: string;
    room?: string;
    severity?: string;
    project_id?: number;
}

export interface Project {
    id: number;
    name: string;
    address?: string;
    created_at: string;
}
