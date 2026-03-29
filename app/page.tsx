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
                router.replace('/explore/institute');
            } else {
                router.replace('/login');
            }
        }
    }, [isAuthenticated, isLoading, router]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-(--border) border-t-accent rounded-full animate-spin" />
        </div>
    );
}
