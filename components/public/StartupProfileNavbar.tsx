'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function StartupProfileNavbar() {
    const router = useRouter();

    return (
        <nav className="h-16 border-b border-(--border) bg-(--surface)/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-full flex items-center justify-between">
                <Link href="/feed" className="flex items-center gap-2">
                    <img src="/xentro-logo.png" alt="Xentro" className="h-8 w-auto" />
                </Link>

                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-(--primary) hover:bg-(--surface-hover) transition-colors border border-(--border)"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back
                </button>
            </div>
        </nav>
    );
}
