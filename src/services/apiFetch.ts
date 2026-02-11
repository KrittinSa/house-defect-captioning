/**
 * Wrapper around fetch() that adds the ngrok-skip-browser-warning header.
 * This prevents ngrok's free tier interstitial page from blocking API requests.
 */
export async function apiFetch(url: string, init?: RequestInit): Promise<Response> {
    const headers = new Headers(init?.headers);
    // Required to bypass ngrok's free-tier browser warning page
    headers.set('ngrok-skip-browser-warning', 'true');

    return fetch(url, {
        ...init,
        headers,
    });
}
