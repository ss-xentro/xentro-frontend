'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function RootRedirect() {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (isAuthenticated) {
                router.replace('/feed');
            } else {
                router.replace('/guest');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
    );
}
