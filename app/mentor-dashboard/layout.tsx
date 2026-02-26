'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import CompleteProfileModal from '@/components/ui/CompleteProfileModal';
import { getRoleFromSession } from '@/lib/auth-utils';

export default function MentorDashboardLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('mentor_token');
        const role = getRoleFromSession();

        // Must have token or be mentor role
        if (!token && role !== 'mentor') {
            router.replace('/login');
            return;
        }

        // If logged in but wrong role, redirect to feed
        if (role && role !== 'mentor') {
            router.replace('/feed');
            return;
        }

        setIsAuthenticated(true);
        setIsLoading(false);

        // Show profile completion prompt if not dismissed
        const dismissed = sessionStorage.getItem('profile_prompt_dismissed');
        if (!dismissed) {
            setShowProfileModal(true);
        }
    }, [router]);

    const navItems = [
        {
            name: 'Overview', href: '/mentor-dashboard', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
            )
        },
        {
            name: 'Mentees', href: '/mentor-dashboard/mentees', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            )
        },
        {
            name: 'Profile', href: '/mentor-dashboard/profile', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            )
        },
        {
            name: 'Sessions', href: '/mentor-dashboard/sessions', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            )
        },
        {
            name: 'Explore', href: '/explore/institute', icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            )
        },
    ];

    const handleLogout = () => {
        localStorage.removeItem('mentor_token');
        router.push('/mentor-login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-(--background)">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-(--background) flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-64 bg-(--surface) border-r border-(--border) transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                    !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="h-full flex flex-col">
                    {/* Logo */}
                    <div className="h-16 flex items-center px-6 border-b border-(--border)">
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent to-accent-hover">
                            XENTRO
                        </span>
                        <span className="ml-2 text-xs font-medium text-(--secondary) border border-(--border) px-1.5 py-0.5 rounded">
                            Mentor
                        </span>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                                        isActive
                                            ? "bg-(--accent-subtle) text-accent"
                                            : "text-(--secondary) hover:bg-(--surface-hover) hover:text-(--primary)"
                                    )}
                                >
                                    {item.icon}
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-(--border)">
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-(--secondary) hover:text-error hover:bg-error/5 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
                {/* Mobile Header */}
                <header className="h-16 lg:hidden flex items-center justify-between px-4 bg-(--surface) border-b border-(--border)">
                    <span className="text-lg font-bold">XENTRO</span>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 -mr-2 text-(--secondary) hover:text-(--primary)"
                    >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </header>

                {/* Backdrop for mobile sidebar */}
                {isSidebarOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Profile completion prompt */}
            <CompleteProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
}
