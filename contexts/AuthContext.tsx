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
    setSession: (user: User, token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate session from cookie (with legacy localStorage migration)
    useEffect(() => {
        try {
            // Migrate any leftover localStorage data to cookies first
            cleanupLegacyStorage();

            const session = getAuthCookie();
            if (session && session.role) {
                const hydratedUser: User = {
                    id: session.id || '',
                    email: session.email || '',
                    name: session.name || '',
                    avatar: session.avatar || '',
                    role: session.role as User['role'],
                    unlockedContexts: session.contexts,
                };
                setUser(hydratedUser);
                // Token is in HttpOnly cookie — we don't have access client-side
                // but we keep a flag so components know we're authenticated
                setToken('httponly');
            }
        } catch (err) {
            console.warn('Failed to restore session', err);
            clearAuthCookie();
        } finally {
            setIsLoading(false);
        }
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
                return { success: false, error: data.message || 'Invalid email or password' };
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
            console.error('Login failed', err);
            setIsLoading(false);
            return { success: false, error: 'Login failed. Please try again.' };
        }
    }, []);

    const setSession = useCallback((newUser: User, newToken: string) => {
        setUser(newUser);
        setToken(newToken);
        // Store user metadata cookie
        const existing = getAuthCookie();
        syncAuthCookie({
            ...(existing ?? {}),
            ...(newUser as unknown as Record<string, unknown>),
        });
        // Store token in HttpOnly cookie (fire and forget)
        setTokenCookie(newToken);
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
