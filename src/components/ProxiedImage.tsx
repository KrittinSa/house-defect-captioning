import { useState, useEffect } from 'react';
import { apiFetch } from '../services/apiFetch';

interface ProxiedImageProps {
    src: string;
    alt: string;
    className?: string;
}

/**
 * Image component that fetches images through apiFetch
 * (with ngrok-skip-browser-warning header) and displays them as blob URLs.
 * This is necessary because <img> tags can't send custom headers,
 * so ngrok's interstitial page blocks direct image loading.
 */
export function ProxiedImage({ src, alt, className }: ProxiedImageProps) {
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!src) return;

        // If it's already a blob/data URL or local file, use directly
        if (src.startsWith('blob:') || src.startsWith('data:')) {
            setBlobUrl(src);
            return;
        }

        let cancelled = false;
        apiFetch(src)
            .then(res => res.blob())
            .then(blob => {
                if (!cancelled) {
                    setBlobUrl(URL.createObjectURL(blob));
                }
            })
            .catch(() => {
                // Fallback to direct src if fetch fails
                if (!cancelled) setBlobUrl(src);
            });

        return () => {
            cancelled = true;
        };
    }, [src]);

    if (!blobUrl) {
        return <div className={className} style={{ background: '#e2e8f0' }} />;
    }

    return <img src={blobUrl} alt={alt} className={className} />;
}
