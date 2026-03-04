'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts } from '@/lib/auth-utils';
import { DashboardSidebar } from '@/components/ui/DashboardSidebar';

export default function InvestorDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const role = getRoleFromSession();
        const contexts = getUnlockedContexts();

        if (!role) {
            router.replace('/login');
            return;
        }

        if (role !== 'investor' && !contexts.includes('investor')) {
            router.replace('/feed');
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
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
        <DashboardSidebar userType="investor">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
        </DashboardSidebar>
    );
}
