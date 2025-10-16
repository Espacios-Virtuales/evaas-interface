export function decodeJwtPayload<T = any>(token: string): T | null {
    try {
        const [, payload] = token.split('.');
        const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        return JSON.parse(decodeURIComponent(escape(json)));
    } catch { return null; }
}
export function getJwtExpiry(token: string): number | null {
    const p = decodeJwtPayload<any>(token);
    return p?.exp ?? null; // epoch seconds
}

