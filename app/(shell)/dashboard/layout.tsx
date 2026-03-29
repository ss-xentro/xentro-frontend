'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts, getSessionToken } from '@/lib/auth-utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const checkAccess = async () => {
            const role = getRoleFromSession();
            const contexts = getUnlockedContexts();

            if (!role) {
                router.replace('/login');
                return;
            }

            // Quick client-side check first
            if (role !== 'startup' && role !== 'founder' && !contexts.includes('startup')) {
                router.replace('/explore/institute');
                return;
            }

            // Server-side ownership verification — only the startup owner can access
            try {
                const token = getSessionToken('founder');
                if (!token) {
                    router.replace('/login');
                    return;
                }
                const res = await fetch('/api/founder/my-startup', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) {
                    router.replace('/explore/institute');
                    return;
                }
            } catch {
                router.replace('/explore/institute');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAccess();
    }, [router]);

    if (isLoading) {
        return (
            <div className="animate-pulse p-6 space-y-6">
                <div className="h-7 w-48 bg-(--surface) border border-(--border) rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-24 bg-(--surface) border border-(--border) rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-(--surface) border border-(--border) rounded-xl" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {children}
            </div>
        </div>
    );
}
