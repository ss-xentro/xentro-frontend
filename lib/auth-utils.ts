'use client';

/* ═══════════════════════════════════════════════════════════
 * auth-utils.ts  –  Cookie-based session management
 *
 * Cookie layout:
 *   xentro_auth   – non-HttpOnly, JSON, holds user metadata
 *                    (role, name, email, avatar, id, contexts)
 *                    Readable by client JS and proxy.ts
 *   xentro_token  – HttpOnly, set/cleared via /api/auth/session
 *                    Holds JWT. Client JS can NOT read it.
 *   xentro_role_<role> – non-HttpOnly, holds role-specific token
 *                    For backward compat with role-specific APIs.
 * ═══════════════════════════════════════════════════════════ */

const AUTH_COOKIE = 'xentro_auth';
const FIVE_DAYS_SECONDS = 5 * 24 * 60 * 60;

/** Legacy localStorage keys to clean up during migration */
const LEGACY_LS_KEYS = [
    'xentro_session', 'founder_token', 'mentor_token',
    'investor_token', 'institution_token', 'startup_id',
    'xentro_user', 'xentro_join_state_v2',
];

/* ─── Low-level cookie helpers ─── */

function setCookie(name: string, value: string, maxAge = FIVE_DAYS_SECONDS) {
    if (typeof document === 'undefined') return;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    return match ? decodeURIComponent(match[1]) : null;
}

function deleteCookie(name: string) {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

/* ─── Session user shape stored in xentro_auth ─── */

export interface SessionUser {
    id?: string;
    email?: string;
    name?: string;
    avatar?: string;
    role: string;
    contexts: string[];
}

/**
 * Normalise any API user object into a clean SessionUser.
 * Handles Django-style fields (account_type, full_name) and frontend fields (role, name).
 */
export function normalizeUser(raw: Record<string, unknown>): SessionUser {
    const role = (raw.role || raw.account_type || raw.accountType || '') as string;
    const name = (raw.name || raw.full_name || raw.fullName ||
        [raw.first_name, raw.last_name].filter(Boolean).join(' ') || '') as string;
    const contexts = (raw.unlockedContexts ?? raw.unlocked_contexts ?? []) as string[];

    return {
        id: (raw.id ?? raw.pk ?? '') as string,
        email: (raw.email ?? '') as string,
        name,
        avatar: (raw.avatar ?? raw.profile_picture ?? raw.profilePicture ?? '') as string,
        role,
        contexts,
    };
}

/* ─── Auth cookie (non-HttpOnly user metadata) ─── */

/**
 * syncAuthCookie — stores user metadata in a regular cookie for
 * both client-side reads and server-side proxy auth checks.
 */
export function syncAuthCookie(user: Record<string, unknown>) {
    const normalized = normalizeUser(user);
    setCookie(AUTH_COOKIE, JSON.stringify(normalized));
}

/**
 * getAuthCookie — reads the user metadata cookie. Returns null if absent.
 */
export function getAuthCookie(): SessionUser | null {
    try {
        const raw = getCookie(AUTH_COOKIE);
        if (!raw) return null;
        return JSON.parse(raw) as SessionUser;
    } catch {
        return null;
    }
}

/**
 * clearAuthCookie — removes the auth cookie (called on logout).
 */
export function clearAuthCookie() {
    deleteCookie(AUTH_COOKIE);
}

/* ─── HttpOnly token cookie (via /api/auth/session) ─── */

/**
 * setTokenCookie — POSTs the JWT to the server-side API route which
 * sets it as an HttpOnly cookie. Returns true on success.
 */
export async function setTokenCookie(token: string): Promise<boolean> {
    try {
        const res = await fetch('/api/auth/session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token }),
        });
        return res.ok;
    } catch {
        return false;
    }
}

/**
 * clearTokenCookie — DELETEs the HttpOnly token cookie.
 */
export async function clearTokenCookie(): Promise<void> {
    try {
        await fetch('/api/auth/session', { method: 'DELETE' });
    } catch { /* best effort */ }
}

/* ─── Role-specific token cookies ─── */

const ROLE_COOKIE_MAP: Record<string, string> = {
    mentor: 'xentro_role_mentor',
    startup: 'xentro_role_founder',
    founder: 'xentro_role_founder',
    institution: 'xentro_role_institution',
    investor: 'xentro_role_investor',
    admin: 'xentro_role_admin',
};

/**
 * setRoleToken — stores a role-specific token in a cookie.
 */
export function setRoleToken(role: string, token: string) {
    const cookieName = ROLE_COOKIE_MAP[role] || `xentro_role_${role}`;
    setCookie(cookieName, token);
}

/**
 * getRoleToken — reads a role-specific token from cookie.
 */
export function getRoleToken(role: string): string | null {
    const cookieName = ROLE_COOKIE_MAP[role] || `xentro_role_${role}`;
    return getCookie(cookieName);
}

/* ─── Convenience readers (backward-compatible API) ─── */

/**
 * getRoleFromSession — reads role from the auth cookie.
 */
export function getRoleFromSession(): string | null {
    const session = getAuthCookie();
    if (session?.role) return session.role;

    // Legacy fallback: try localStorage
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('xentro_session') : null;
        if (!raw) return null;
        const data = JSON.parse(raw);
        return data?.user?.role || data?.user?.account_type || null;
    } catch {
        return null;
    }
}

/**
 * getUnlockedContexts — reads contexts from the auth cookie.
 */
export function getUnlockedContexts(): string[] {
    const session = getAuthCookie();
    if (session?.contexts?.length) return session.contexts;

    // Legacy fallback
    try {
        const raw = typeof window !== 'undefined' ? localStorage.getItem('xentro_session') : null;
        if (!raw) return [];
        const data = JSON.parse(raw);
        return data?.user?.unlockedContexts || data?.user?.unlocked_contexts || ['explorer'];
    } catch {
        return [];
    }
}

/**
 * getSessionToken — reads the unified token from cookie, or falls back to role tokens.
 */
export function getSessionToken(expectedRole?: string): string | null {
    // Try role-specific cookie tokens
    if (expectedRole) {
        const t = getRoleToken(expectedRole);
        if (t) return t;
    }

    // Try all role cookies as last resort
    if (!expectedRole) {
        for (const cookieName of Object.values(ROLE_COOKIE_MAP)) {
            const t = getCookie(cookieName);
            if (t) return t;
        }
    }

    // Legacy localStorage fallback (will be removed after migration)
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem('xentro_session');
        if (raw) {
            const data = JSON.parse(raw);
            if (data?.token && data?.expiresAt > Date.now()) return data.token;
        }
    } catch { /* ignore */ }

    return null;
}

/* ─── Cleanup ─── */

/**
 * clearAllRoleTokens — removes all role cookies and legacy localStorage keys.
 */
export function clearAllRoleTokens() {
    // Clear role cookies
    for (const cookieName of Object.values(ROLE_COOKIE_MAP)) {
        deleteCookie(cookieName);
    }
    // Clear context-switching cookies
    deleteCookie('xentro_context_token');
    deleteCookie('xentro_current_context');
    deleteCookie('xentro_context_entity_id');

    // Clean up legacy localStorage (migration)
    if (typeof window !== 'undefined') {
        LEGACY_LS_KEYS.forEach((key) => {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
        });
    }
}

/**
 * cleanupLegacyStorage — call once on app boot to migrate any
 * remaining localStorage data to cookies, then remove it.
 */
export function cleanupLegacyStorage() {
    if (typeof window === 'undefined') return;
    try {
        const raw = localStorage.getItem('xentro_session');
        if (raw) {
            const data = JSON.parse(raw);
            if (data?.user && data?.expiresAt > Date.now()) {
                // Migrate to cookie if cookie is empty
                if (!getAuthCookie()) {
                    syncAuthCookie(data.user);
                }
            }
            // Remove after migration
            localStorage.removeItem('xentro_session');
        }
        // Clean up other legacy keys
        LEGACY_LS_KEYS.forEach((key) => {
            try { localStorage.removeItem(key); } catch { /* ignore */ }
        });
    } catch { /* ignore */ }
}
