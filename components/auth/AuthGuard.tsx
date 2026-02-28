'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';

/**
 * Wraps children and redirects unauthenticated users to the home page (guest feed).
 * Public routes (/join, /login, /onboarding, etc.) should NOT use this guard.
 *
 * Also checks for role-specific tokens (e.g. institution_token from magic-link)
 * so users aren't kicked before xentro_session is bootstrapped.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const [hasRoleToken, setHasRoleToken] = useState(false);

    useEffect(() => {
        // Check if any role-specific token exists (covers magic-link flow
        // where xentro_session hasn't been set yet)
        const token = getSessionToken();
        setHasRoleToken(!!token);
    }, []);

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !hasRoleToken) {
            router.replace('/');
        }
    }, [isAuthenticated, isLoading, hasRoleToken, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    if (!isAuthenticated && !hasRoleToken) {
        return (
            <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    return <>{children}</>;
}
