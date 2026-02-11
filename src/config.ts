export type InferenceProvider = 'mock' | 'local-api' | 'web-inference';

interface AppConfig {
    inferenceProvider: InferenceProvider;
    apiUrl: string;
}

export const CONFIG: AppConfig = {
    // Switch this to 'local-api' when your Python API is ready
    inferenceProvider: 'local-api',

    // Your local Python API URL (FastAPI default is 8000)
    // Use environment variable VITE_API_URL if available, otherwise fallback to localhost
    apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
};
