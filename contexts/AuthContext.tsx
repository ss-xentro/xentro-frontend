'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
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

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const login = useCallback(async (email: string, password: string) => {
        setIsLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
            setUser(MOCK_USER);
            setIsLoading(false);
            return { success: true };
        }

        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
    }, []);

    const logout = useCallback(() => {
        setUser(null);
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
