'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts } from '@/lib/auth-utils';
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
            <div className="animate-pulse p-6 space-y-6">
                <div className="h-7 w-48 bg-(--surface) rounded-lg" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-28 bg-(--surface) rounded-xl" />
                    ))}
                </div>
                <div className="h-64 bg-(--surface) rounded-xl" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <>
            <div className="theme-dark p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
            <CompleteProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </>
    );
}
