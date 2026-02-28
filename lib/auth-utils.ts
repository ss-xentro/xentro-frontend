'use client';

/** All role-specific localStorage keys used by the app */
const ROLE_TOKEN_KEYS = ['founder_token', 'mentor_token', 'investor_token', 'institution_token'];
const EXTRA_SESSION_KEYS = ['startup_id', 'startup-onboarding-storage'];

/**
 * clearAllRoleTokens — removes every role-specific token and session artifact
 * from localStorage. Call this on login (before setting the new token) and on logout.
 */
export function clearAllRoleTokens() {
    if (typeof window === 'undefined') return;
    [...ROLE_TOKEN_KEYS, ...EXTRA_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
}

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
 * getUnlockedContexts — reads the user's unlocked_contexts from xentro_session.
 * Returns an array of context strings the user has access to.
 */
export function getUnlockedContexts(): string[] {
    if (typeof window === 'undefined') return [];

    try {
        const raw = localStorage.getItem('xentro_session');
        if (!raw) return [];
        const session = JSON.parse(raw);
        if (!session?.token || !session?.expiresAt || session.expiresAt < Date.now()) return [];
        return session.user?.unlockedContexts || session.user?.unlocked_contexts || ['explorer'];
    } catch {
        return [];
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

    // No expectedRole — check all role tokens as last resort
    if (!expectedRole) {
        for (const key of Object.values(tokenMap)) {
            const t = localStorage.getItem(key);
            if (t) return t;
        }
    }

    return null;
}
