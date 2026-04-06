'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { getRoleFromSession, getUnlockedContexts } from '@/lib/auth-utils';
import { useApiQuery, queryKeys } from '@/lib/queries';
import CompleteProfileModal from '@/components/ui/CompleteProfileModal';

interface MissingSections {
    packagesAndPricing: boolean;
    achievementsAndHighlights: boolean;
    profilePhoto: boolean;
}

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
            router.replace('/explore/institute');
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);
    }, [router]);

    // Profile completion check via TanStack Query (shared cache with profile page)
    const profilePromptDismissed = typeof window !== 'undefined' && sessionStorage.getItem('profile_prompt_dismissed');
    const { data: profileData } = useApiQuery<Record<string, unknown>>(
        queryKeys.mentor.profile(),
        '/api/auth/mentor-profile',
        { enabled: isAuthenticated && !profilePromptDismissed, requestOptions: { role: 'mentor' } },
    );

    const missingSections = useMemo<MissingSections>(() => {
        if (!profileData || profileData.profile_completed) {
            return { packagesAndPricing: false, achievementsAndHighlights: false, profilePhoto: false };
        }
        return {
            packagesAndPricing: !(profileData.pricing_plans as unknown[])?.length && !profileData.pricing_per_hour,
            achievementsAndHighlights: !(profileData.achievements as unknown[])?.length && !(profileData.packages as unknown[])?.length,
            profilePhoto: !profileData.avatar,
        };
    }, [profileData]);

    // Show profile completion modal when missing sections are detected
    useEffect(() => {
        if (Object.values(missingSections).some(Boolean)) {
            setShowProfileModal(true);
        }
    }, [missingSections]);

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
            <div className="p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {children}
                </div>
            </div>
            <CompleteProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
                missingSections={missingSections}
            />
        </>
    );
}
