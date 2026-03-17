'use client';

import { usePathname } from 'next/navigation';
import { PublicNavbar, Footer } from '@/components/public/Layout';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    // Pages that render their own navbar
    const hasOwnNavbar = pathname === '/login'
        || pathname === '/mentor-signup'
        || pathname === '/institution-onboarding'
        || pathname === '/investor-onboarding'
        || pathname.startsWith('/startups/')
        || pathname.startsWith('/mentors/');

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!hasOwnNavbar && <PublicNavbar />}
            <main className="flex-1">
                {children}
            </main>
            {!hasOwnNavbar && <Footer />}
        </div>
    );
}
