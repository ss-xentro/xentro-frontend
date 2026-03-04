'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts } from '@/lib/auth-utils';
import { DashboardSidebar } from '@/components/ui/DashboardSidebar';
import CompleteProfileModal from '@/components/ui/CompleteProfileModal';

export default function MentorDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const role = getRoleFromSession();
        const contexts = getUnlockedContexts();

        if (!role) {
            router.replace('/login');
            return;
        }

        if (role !== 'mentor' && !contexts.includes('mentor')) {
            router.replace('/feed');
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);

        // Show profile completion prompt if not dismissed
        const dismissed = sessionStorage.getItem('profile_prompt_dismissed');
        if (!dismissed) {
            setShowProfileModal(true);
        }
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
        <DashboardSidebar userType="mentor">
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
            <CompleteProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </DashboardSidebar>
    );
}
