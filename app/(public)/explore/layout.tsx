'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const ROLE_LABELS: Record<string, string> = {
    admin: 'Admin',
    startup: 'Startup Founder',
    mentor: 'Mentor',
    institution: 'Institution',
    investor: 'Investor',
};

const navItems = [
    {
        icon: 'home',
        label: 'Home',
        href: '/feed',
        path: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    },
    {
        icon: 'explore',
        label: 'Explore',
        href: '/explore/institute',
        path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
    },
    {
        icon: 'bell',
        label: 'Notifications',
        href: '/notifications',
        path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
    },
];

const exploreTabs = [
    { label: 'Institutions', href: '/explore/institute' },
    { label: 'Startups', href: '/explore/startups' },
    { label: 'Mentors', href: '/explore/mentors' },
];

function NavIcon({ path, active }: { path: string; active?: boolean }) {
    return (
        <svg
            className={cn('w-6 h-6 transition-all duration-200', active ? 'text-white' : 'text-gray-400')}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={active ? 2.5 : 2}
        >
            <path strokeLinecap="round" strokeLinejoin="round" d={path} />
        </svg>
    );
}

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [profileOpen, setProfileOpen] = useState(false);
    const profileRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();

    // Derive username from email
    const username = user?.email ? user.email.split('@')[0] : 'guest';

    // Close popup on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
                setProfileOpen(false);
            }
        }
        if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [profileOpen]);

    const handleLogout = () => {
        logout();
        setProfileOpen(false);
        router.push('/feed');
    };

    return (
        <div className="min-h-screen bg-[#0B0D10] text-white font-sans">
            <div className="w-full flex">
                {/* Left Sidebar */}
                <aside
                    className={cn(
                        'relative sticky top-0 h-screen shrink-0 border-r border-white/10 hidden lg:flex flex-col transition-all duration-300 ease-in-out',
                        isCollapsed ? 'w-20' : 'w-72'
                    )}
                >
                    <div className="flex-1 flex flex-col items-center px-3 py-6 overflow-hidden">
                        {/* Logo + Collapse Toggle */}
                        <div className={cn('mb-6 w-full', !isCollapsed && 'px-2')}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 min-w-0">
                                    <Image
                                        src="/xentro-logo.png"
                                        alt="Xentro"
                                        width={36}
                                        height={36}
                                        className="rounded-lg shrink-0"
                                    />
                                    <span
                                        className={cn(
                                            'text-white font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300',
                                            isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                        )}
                                    >
                                        Xentro
                                    </span>
                                </div>
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className={cn(
                                        'shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200',
                                        isCollapsed && 'mx-auto mt-1'
                                    )}
                                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                >
                                    <svg
                                        className={cn('w-4 h-4 text-gray-400 transition-transform duration-300', isCollapsed && 'rotate-180')}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                    </svg>
                                </button>
                            </div>
                            <div
                                className={cn(
                                    'mt-4 overflow-hidden transition-all duration-300',
                                    isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto'
                                )}
                            >
                                <div className="h-px bg-white/10 mb-3" />
                                <span className="text-xs font-medium text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                    {user?.role ? (ROLE_LABELS[user.role] ?? user.role) : 'Guest'}
                                </span>
                            </div>
                        </div>

                        {/* Search Bar */}
                        {!isCollapsed && (
                            <div className="mb-4 w-full px-2">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200"
                                    />
                                    <svg
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <nav className="space-y-1 w-full">
                            {navItems.map((item) => {
                                const isActive = item.href === '/explore/institute'
                                    ? pathname.startsWith('/explore')
                                    : pathname === item.href;
                                return (
                                    <Link
                                        key={item.icon}
                                        href={item.href}
                                        className={cn(
                                            'relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group',
                                            isCollapsed ? 'justify-center' : '',
                                            isActive ? 'bg-white/10 animate-navHighlight' : 'hover:bg-white/5'
                                        )}
                                    >
                                        <NavIcon path={item.path} active={isActive} />
                                        <span
                                            className={cn(
                                                'text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden',
                                                isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
                                                isActive ? 'text-white' : 'text-gray-400'
                                            )}
                                        >
                                            {item.label}
                                        </span>
                                        {isCollapsed && (
                                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                                {item.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Profile Section */}
                    <div className="p-3 border-t border-white/10" ref={profileRef}>
                        {/* Profile Popup */}
                        {profileOpen && (
                            <div className="absolute bottom-20 left-3 right-3 bg-[#15181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                                {/* User info header */}
                                <div className="px-4 py-3 border-b border-white/10">
                                    <p className="text-sm font-semibold text-white truncate">{user?.name ?? 'Guest'}</p>
                                    <p className="text-xs text-gray-400 truncate">@{username}</p>
                                </div>
                                {/* Menu items */}
                                <div className="p-1.5 space-y-0.5">
                                    {/* Preferences */}
                                    <button
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Preferences
                                    </button>

                                    {/* Help */}
                                    <button
                                        onClick={() => setProfileOpen(false)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm"
                                    >
                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Help &amp; Support
                                    </button>

                                    <div className="my-1 h-px bg-white/10" />

                                    {/* Login / Logout */}
                                    {isAuthenticated ? (
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm"
                                        >
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            Log out @{username}
                                        </button>
                                    ) : (
                                        <Link
                                            href="/join"
                                            onClick={() => setProfileOpen(false)}
                                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors text-sm"
                                        >
                                            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            Log in
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}

                        <button
                            onClick={() => setProfileOpen((prev) => !prev)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group relative',
                                isCollapsed && 'justify-center',
                                profileOpen && 'bg-white/5'
                            )}
                        >
                            <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500/30 to-purple-500/30 border border-white/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-white">
                                    {user?.name ? user.name.charAt(0).toUpperCase() : '?'}
                                </span>
                            </div>
                            <div
                                className={cn(
                                    'flex-1 text-left overflow-hidden transition-all duration-300',
                                    isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
                                )}
                            >
                                <p className="text-sm font-medium text-white truncate">{user?.name ?? 'Guest'}</p>
                                <p className="text-xs text-gray-400 truncate">@{username}</p>
                            </div>
                            {/* More icon */}
                            {!isCollapsed && (
                                <svg className="w-4 h-4 text-gray-500 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                    <circle cx="5" cy="12" r="2" />
                                    <circle cx="12" cy="12" r="2" />
                                    <circle cx="19" cy="12" r="2" />
                                </svg>
                            )}
                            {isCollapsed && (
                                <div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                                    {user?.name ?? 'Guest'}
                                </div>
                            )}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 flex flex-col">
                    {/* Sticky Header + Tabs */}
                    <div className="sticky top-0 z-10 backdrop-blur-xl bg-[#0B0D10]/90 border-b border-white/10 hidden lg:block">
                        {/* Page title */}
                        <div className="px-6 pt-5 pb-3">
                            <h1 className="text-2xl font-bold text-white tracking-tight">Explore</h1>
                        </div>
                        {/* Tab Bar */}
                        <div className="flex px-6 gap-1">
                            {exploreTabs.map((tab) => {
                                const isActive = pathname === tab.href;
                                return (
                                    <Link
                                        key={tab.href}
                                        href={tab.href}
                                        className={cn(
                                            'relative px-4 py-2.5 text-sm font-medium transition-colors duration-200 rounded-t-lg',
                                            isActive ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                                        )}
                                    >
                                        {tab.label}
                                        {isActive && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full" />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Nav */}
            <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="flex items-center justify-around px-2 py-3">
                    {navItems.map((item) => {
                        const isActive = item.href === '/explore/institute'
                            ? pathname.startsWith('/explore')
                            : pathname === item.href;
                        return (
                            <Link
                                key={item.icon}
                                href={item.href}
                                className={cn(
                                    'flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200',
                                    isActive ? 'bg-white/10' : ''
                                )}
                            >
                                <NavIcon path={item.path} active={isActive} />
                                <span className={cn('text-[10px] font-medium', isActive ? 'text-white' : 'text-gray-500')}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </nav>
            {/* Mobile tab bar */}
            <div className="lg:hidden fixed top-0 inset-x-0 bg-[#0B0D10]/95 backdrop-blur-xl border-b border-white/10 z-40 flex gap-1 px-4 pt-3 pb-0">
                {exploreTabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={cn(
                                'relative px-4 py-2 text-sm font-medium transition-colors',
                                isActive ? 'text-white' : 'text-gray-500'
                            )}
                        >
                            {tab.label}
                            {isActive && <span className="absolute bottom-0 inset-x-0 h-0.5 bg-white rounded-full" />}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
