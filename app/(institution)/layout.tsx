'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/auth/AuthGuard';
import { getRoleFromSession } from '@/lib/auth-utils';

export default function InstitutionLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [allowed, setAllowed] = useState(false);

    useEffect(() => {
        const role = getRoleFromSession();
        if (role && role !== 'institution') {
            router.replace('/feed');
        } else {
            setAllowed(true);
        }
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
