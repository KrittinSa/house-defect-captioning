import type { InferenceResponseDB } from '../types/defect';
import { CONFIG } from '../config';
import { apiFetch } from './apiFetch';

// 1. Define the Interface
export interface ICaptioningProvider {
    analyzeImage(imageFile: File, projectId?: number): Promise<{ data: InferenceResponseDB | null; error: string | null }>;
}

// 2. Implement Mock Provider (Current Logic)
class MockProvider implements ICaptioningProvider {
    private mockDelay = 1500;
    private mockResponses: InferenceResponseDB[] = [
        { label: 'wall_crack', confidence: 0.95 },
        { label: 'leaking_pipe', confidence: 0.88 },
        { label: 'peeling_paint', confidence: 0.76 },
        { label: 'broken_tile', confidence: 0.92 },
        { label: 'mold_growth', confidence: 0.85 },
    ];

    // @ts-ignore
    async analyzeImage(imageFile: File, _projectId?: number): Promise<{ data: InferenceResponseDB | null; error: string | null }> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (!imageFile) {
                    resolve({ data: null, error: 'No image provided' });
                } else {
                    const randomResponse = this.mockResponses[Math.floor(Math.random() * this.mockResponses.length)];
                    resolve({ data: randomResponse, error: null });
                }
            }, this.mockDelay);
        });
    }
}

// 3. Implement Local API Provider (Python Backend)
class LocalApiProvider implements ICaptioningProvider {
    async analyzeImage(imageFile: File, projectId?: number): Promise<{ data: InferenceResponseDB | null; error: string | null }> {
        try {
            const formData = new FormData();
            formData.append('file', imageFile);
            if (projectId) {
                formData.append('project_id', projectId.toString());
            }

            const response = await apiFetch(`${CONFIG.apiUrl}/predict`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || errorData.error || `API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return { data, error: null };
        } catch (err) {
            console.error('LocalApiProvider Error:', err);
            return { data: null, error: err instanceof Error ? err.message : 'Unknown error' };
        }
    }
}

// 4. Export the Factory/Service
const providers: Record<string, ICaptioningProvider> = {
    'mock': new MockProvider(),
    'local-api': new LocalApiProvider(),
};

export const captioningService = {
    analyzeImage: async (imageFile: File, projectId?: number) => {
        const provider = providers[CONFIG.inferenceProvider] || providers['mock'];
        return provider.analyzeImage(imageFile, projectId);
    }
};
