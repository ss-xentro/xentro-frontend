'use client';

import { usePathname } from 'next/navigation';
import { PublicNavbar, Footer } from '@/components/public/Layout';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAppShellPage = pathname === '/feed' || pathname === '/home' || pathname === '/notifications' || pathname.startsWith('/explore');

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!isAppShellPage && <PublicNavbar />}
            <main className="flex-1">
                {children}
            </main>
            {!isAppShellPage && <Footer />}
        </div>
    );
}
