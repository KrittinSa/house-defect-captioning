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
}
