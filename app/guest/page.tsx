'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import GuestFeed from '@/components/public/GuestFeed';

export default function Home() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            router.replace('/feed');
        }
    }, [isAuthenticated, isLoading, router]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Authenticated users get redirected in useEffect
    if (isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
            </div>
        );
    }

    // Guest users see the guest feed
    return <GuestFeed />;
}
