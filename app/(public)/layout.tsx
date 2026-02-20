'use client';

import { usePathname } from 'next/navigation';
import { PublicNavbar, Footer } from '@/components/public/Layout';

export default function PublicLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isFeedPage = pathname === '/feed';

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {!isFeedPage && <PublicNavbar />}
            <main className="flex-1">
                {children}
            </main>
            {!isFeedPage && <Footer />}
        </div>
    );
}
