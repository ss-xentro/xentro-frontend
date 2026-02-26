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
    // Pages that render their own navbar (app shell pages = dark feed layout, standalone = own minimal navbar)
    const hasOwnNavbar = pathname === '/feed' || pathname === '/home' || pathname === '/notifications' || pathname.startsWith('/explore') || pathname === '/login' || pathname === '/mentor-signup' || pathname === '/institution-onboarding' || pathname === '/investor-onboarding' || pathname.startsWith('/startups/');
    const needsAuth = isProtectedRoute(pathname);

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!hasOwnNavbar && <PublicNavbar />}
            <main className="flex-1">
                {needsAuth ? (
                    <AuthGuard>{children}</AuthGuard>
                ) : (
                    children
                )}
            </main>
            {!hasOwnNavbar && <Footer />}
        </div>
    );
}

