'use client';

import { usePathname } from 'next/navigation';
import { PublicNavbar, Footer } from '@/components/public/Layout';
import { getAuthCookie } from '@/lib/auth-utils';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isExistingUser = !!getAuthCookie()?.role;
    // Pages that render their own navbar
    const hasOwnNavbar = pathname === '/login'
        || pathname === '/mentor-signup'
        || pathname === '/institution-onboarding'
        || pathname === '/investor-onboarding'
        || pathname.startsWith('/startups/')
        || pathname.startsWith('/mentors/');

    return (
        <div className="min-h-screen bg-(--surface) flex flex-col">
            {!hasOwnNavbar && !isExistingUser && <PublicNavbar />}
            <main className="flex-1">
                {children}
            </main>
            {!hasOwnNavbar && !isExistingUser && <Footer />}
        </div>
    );
}
