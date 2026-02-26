'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';

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

const SESSION_KEY = 'xentro_session';
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate session from localStorage with 6h expiry
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
            if (!raw) return;
            const parsed = JSON.parse(raw) as { user: User; token: string; expiresAt: number };
            if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
                setUser(parsed.user);
                setToken(parsed.token || null);
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        } catch (err) {
            console.warn('Failed to restore session', err);
            localStorage.removeItem(SESSION_KEY);
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

            const loggedInUser: User = data.user;
            const jwt: string = data.token;

            setUser(loggedInUser);
            setToken(jwt);

            const session = { user: loggedInUser, token: jwt, expiresAt: Date.now() + FIVE_DAYS_MS };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));

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
        const session = { user: newUser, token: newToken, expiresAt: Date.now() + FIVE_DAYS_MS };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        setToken(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
        }
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
