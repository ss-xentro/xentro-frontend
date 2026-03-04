'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts, getSessionToken } from '@/lib/auth-utils';
import { DashboardSidebar } from '@/components/ui/DashboardSidebar';

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
                router.replace('/feed');
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
                    router.replace('/feed');
                    return;
                }
            } catch {
                router.replace('/feed');
                return;
            }

            setIsAuthenticated(true);
            setIsLoading(false);
        };

        checkAccess();
    }, [router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--background)">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <DashboardSidebar userType="startup">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </DashboardSidebar>
    );
}
