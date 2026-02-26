'use client';

/**
 * getRoleFromSession — reads xentro_session from localStorage
 * and returns the account_type. Returns null if no valid session.
 */
export function getRoleFromSession(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        const raw = localStorage.getItem('xentro_session');
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session?.token || !session?.expiresAt || session.expiresAt < Date.now()) return null;
        return session.user?.role || session.user?.account_type || session.user?.accountType || null;
    } catch {
        return null;
    }
}

/**
 * getSessionToken — gets the token from xentro_session or falls back to role-specific tokens.
 */
export function getSessionToken(expectedRole?: string): string | null {
    if (typeof window === 'undefined') return null;

    // Try unified session first
    try {
        const raw = localStorage.getItem('xentro_session');
        if (raw) {
            const session = JSON.parse(raw);
            if (session?.token && session?.expiresAt > Date.now()) {
                return session.token;
            }
        }
    } catch { /* ignore */ }

    // Fallback to role-specific tokens
    const tokenMap: Record<string, string> = {
        mentor: 'mentor_token',
        startup: 'founder_token',
        founder: 'founder_token',
        institution: 'institution_token',
        investor: 'investor_token',
    };

    if (expectedRole && tokenMap[expectedRole]) {
        return localStorage.getItem(tokenMap[expectedRole]);
    }

    return null;
}
