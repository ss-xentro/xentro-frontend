'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import {
    clearAllRoleTokens, syncAuthCookie, clearAuthCookie, getAuthCookie,
    setTokenCookie, clearTokenCookie, normalizeUser, cleanupLegacyStorage,
} from '@/lib/auth-utils';

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    setSession: (user: User, token: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate session from cookie (with legacy localStorage migration)
    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                // Migrate any leftover localStorage data to cookies first
                cleanupLegacyStorage();

                const session = getAuthCookie();
                if (session && session.role) {
                    // Hydrate immediately from cookie (email excluded for PII safety)
                    const hydratedUser: User = {
                        id: session.id || '',
                        email: '',
                        name: session.name || '',
                        avatar: session.avatar || '',
                        role: session.role as User['role'],
                        unlockedContexts: session.contexts,
                    };
                    setUser(hydratedUser);
                    setToken(null);

                    // M1: Fetch full user data (including email) from the server.
                    // Skip if we recently fetched (within 60s) to avoid redundant
                    // calls on soft navigations.
                    const AUTH_ME_CACHE_KEY = 'xentro_auth_me_ts';
                    const lastFetch = Number(sessionStorage.getItem(AUTH_ME_CACHE_KEY) || 0);
                    const stale = Date.now() - lastFetch > 60_000;

                    if (stale) {
                        try {
                            const res = await fetch('/api/auth/me/');
                            if (res.ok) {
                                const data = await res.json();
                                if (!cancelled && data.user) {
                                    const full = normalizeUser(data.user);
                                    setUser({
                                        id: full.id || hydratedUser.id,
                                        email: full.email || '',
                                        name: full.name || hydratedUser.name,
                                        avatar: full.avatar || hydratedUser.avatar,
                                        role: (full.role || hydratedUser.role) as User['role'],
                                        unlockedContexts: full.contexts?.length ? full.contexts : hydratedUser.unlockedContexts,
                                    });
                                    sessionStorage.setItem(AUTH_ME_CACHE_KEY, String(Date.now()));
                                }
                            }
                        } catch { /* Non-critical — UI works without email */ }
                    }
                }
            } catch {
                clearAuthCookie();
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setIsLoading(false);
                return { success: false, error: data.message || 'Invalid email. Please try again.' };
            }

            const normalized = normalizeUser(data.user);
            const loggedInUser: User = {
                id: normalized.id || '',
                email: normalized.email || '',
                name: normalized.name || '',
                avatar: normalized.avatar || '',
                role: (normalized.role || 'admin') as User['role'],
                unlockedContexts: normalized.contexts,
            };
            const jwt: string = data.token;

            setUser(loggedInUser);
            setToken(jwt);

            // Store token in HttpOnly cookie
            await setTokenCookie(jwt);
            // Store user metadata in readable cookie
            syncAuthCookie(data.user);
            // Clean up any old localStorage data
            clearAllRoleTokens();

            setIsLoading(false);
            return { success: true };
        } catch (err) {
            setIsLoading(false);
            return { success: false, error: 'Something went wrong. Please check your connection and try again.' };
        }
    }, []);

    const setSession = useCallback(async (newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        // Store user metadata cookie
        const existing = getAuthCookie();
        syncAuthCookie({
            ...(existing ?? {}),
            ...(newUser as unknown as Record<string, unknown>),
        });
        // Store token in HttpOnly cookie
        await setTokenCookie(newToken);
    }, []);

    const logout = useCallback(async () => {
        setUser(null);
        setToken(null);
        clearAuthCookie();
        clearAllRoleTokens();
        await clearTokenCookie();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated: !!user,
                isLoading,
                login,
                setSession,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
