'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { getRoleFromSession, getSessionToken, getUnlockedContexts } from '@/lib/auth-utils';

export default function InstitutionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const role = getRoleFromSession();
        const contexts = getUnlockedContexts();

        // Allow if role IS institution or if the user has institution in their unlocked contexts
        if (role === 'institution' || contexts.includes('institution')) {
            setAllowed(true);
            return;
        }

        // If there's a valid session but no institution access, redirect away
        if (role && role !== 'institution') {
            router.replace('/feed');
            return;
        }

        // role is null — check if there's an institution_token (magic-link flow)
        const token = getSessionToken('institution');
        if (token) {
            // Token exists (magic-link or fallback) — allow through;
            // the dashboard page will bootstrap xentro_session
            setAllowed(true);
            return;
        }

        // No session and no token — not authenticated for institution
        router.replace('/login');
    }, [router]);

    if (!allowed) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-white">
                {children}
            </div>
        </AuthGuard>
    );
}
