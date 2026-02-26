'use client';

import { usePathname } from 'next/navigation';
import { PublicNavbar, Footer } from '@/components/public/Layout';
import AuthGuard from '@/components/auth/AuthGuard';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/feed', '/home', '/notifications', '/explore'];

function isProtectedRoute(pathname: string): boolean {
    return PROTECTED_PREFIXES.some(
        (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
    );
}

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isAppShellPage = pathname === '/feed' || pathname === '/home' || pathname === '/notifications' || pathname.startsWith('/explore');
    const needsAuth = isProtectedRoute(pathname);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!isAppShellPage && <PublicNavbar />}
            <main className="flex-1">
                {needsAuth ? (
                    <AuthGuard>{children}</AuthGuard>
                ) : (
                    children
                )}
            </main>
            {!isAppShellPage && <Footer />}
        </div>
    );
}

