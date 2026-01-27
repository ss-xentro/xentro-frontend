'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin credentials
const MOCK_ADMIN = {
    email: 'admin@xentro.io',
    password: 'admin123',
};

const MOCK_USER: User = {
    id: '1',
    email: 'admin@xentro.io',
    name: 'Alex Chen',
    avatar: '',
    role: 'admin',
};

const SESSION_KEY = 'xentro_session';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Hydrate session from localStorage with 6h expiry
    useEffect(() => {
        try {
            const raw = typeof window !== 'undefined' ? localStorage.getItem(SESSION_KEY) : null;
            if (!raw) return;
            const parsed = JSON.parse(raw) as { user: User; expiresAt: number };
            if (parsed?.expiresAt && parsed.expiresAt > Date.now()) {
                setUser(parsed.user);
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

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
            setUser(MOCK_USER);
            const session = { user: MOCK_USER, expiresAt: Date.now() + SIX_HOURS_MS };
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
            setIsLoading(false);
            return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
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
