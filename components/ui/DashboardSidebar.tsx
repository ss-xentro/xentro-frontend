'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';
import { getRoleFromSession, getSessionToken, getUnlockedContexts, clearAllRoleTokens, clearAuthCookie, clearTokenCookie } from '@/lib/auth-utils';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ───────────────────────────────────────────────────────────────────

export type UserRole = 'institution' | 'startup' | 'founder' | 'mentor' | 'investor';

interface NavItem {
	name: string;
	href: string;
	icon: ReactNode;
}

interface DashboardSidebarProps {
	children: ReactNode;
	/** Explicitly set the role; auto-detected from session if omitted */
	userType?: UserRole;
}

// ─── SVG Icon helpers (keeps the nav config readable) ────────────────────────

const icons = {
	home: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
		</svg>
	),
	overview: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
		</svg>
	),
	edit: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		</svg>
	),
	bolt: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
		</svg>
	),
	mentors: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7" />
		</svg>
	),
	document: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
		</svg>
	),
	team: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	),
	analytics: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
		</svg>
	),
	trash: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	),
	support: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
		</svg>
	),
	logout: (
		<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
		</svg>
	),
	building: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
		</svg>
	),
	clock: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	groupPeople: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
		</svg>
	),
	endorsement: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	),
	settings: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		</svg>
	),
	addPerson: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
		</svg>
	),
	profile: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
		</svg>
	),
	calendar: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
		</svg>
	),
	search: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
		</svg>
	),
	trendUp: (
		<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
		</svg>
	),
};

// ─── Per-role navigation configs ─────────────────────────────────────────────

function getNavItems(role: UserRole): NavItem[] {
	switch (role) {
		case 'institution':
			return [
				{ name: 'Home', href: '/feed', icon: icons.home },
				{ name: 'Overview', href: '/institution-dashboard', icon: icons.overview },
				{ name: 'Edit Profile', href: '/institution-edit', icon: icons.edit },
				{ name: 'Startups', href: '/institution-dashboard/startups', icon: icons.bolt },
				{ name: 'Mentors', href: '/institution-dashboard/mentors', icon: icons.mentors },
				{ name: 'Programs', href: '/institution-dashboard/programs', icon: icons.bolt },
				{ name: 'Projects', href: '/institution-dashboard/projects', icon: icons.document },
				{ name: 'Team Members', href: '/institution-dashboard/team', icon: icons.team },
				{ name: 'Analytics', href: '/institution-dashboard/analytics', icon: icons.analytics },
				{ name: 'Recycle Bin', href: '/institution-dashboard/recycle-bin', icon: icons.trash },
			];

		case 'startup':
		case 'founder':
			return [
				{ name: 'Overview', href: '/dashboard', icon: icons.overview },
				{ name: 'Edit Profile', href: '/dashboard/startup', icon: icons.edit },
				{ name: 'Pitch Deck', href: '/dashboard/startup/pitch', icon: icons.document },
				{ name: 'Team', href: '/dashboard/team', icon: icons.team },
				{ name: 'Activity', href: '/dashboard/activity', icon: icons.clock },
				{ name: 'My Mentors', href: '/dashboard/mentors', icon: icons.groupPeople },
				{ name: 'Endorsements', href: '/dashboard/endorsements', icon: icons.endorsement },
				{ name: 'Settings', href: '/dashboard/settings', icon: icons.settings },
				{ name: 'Feed', href: '/feed', icon: icons.home },
			];

		case 'mentor':
			return [
				{ name: 'Home', href: '/feed', icon: icons.home },
				{ name: 'Overview', href: '/mentor-dashboard', icon: icons.overview },
				{ name: 'Mentees', href: '/mentor-dashboard/mentees', icon: icons.team },
				{ name: 'Requests', href: '/mentor-dashboard/requests', icon: icons.addPerson },
				{ name: 'Profile', href: '/mentor-dashboard/profile', icon: icons.profile },
				{ name: 'Sessions', href: '/mentor-dashboard/sessions', icon: icons.calendar },
				{ name: 'Calendar', href: '/mentor-dashboard/calendar', icon: icons.calendar },
				{ name: 'Endorsements', href: '/mentor-dashboard/endorsements', icon: icons.endorsement },
				{ name: 'Explore', href: '/explore/institute', icon: icons.search },
				{ name: 'Settings', href: '/mentor-dashboard/settings', icon: icons.settings },
			];

		case 'investor':
			return [
				{ name: 'Home', href: '/feed', icon: icons.home },
				{ name: 'Overview', href: '/investor-dashboard', icon: icons.overview },
				{ name: 'Deal Flow', href: '/investor-dashboard/deals', icon: icons.trendUp },
				{ name: 'Portfolio', href: '/investor-dashboard/portfolio', icon: icons.building },
				{ name: 'Explore', href: '/explore/institute', icon: icons.search },
				{ name: 'Settings', href: '/investor-dashboard/settings', icon: icons.settings },
			];

		default:
			return [{ name: 'Home', href: '/feed', icon: icons.home }];
	}
}

/** Human-readable label for the role badge */
const roleLabels: Record<UserRole, string> = {
	institution: 'Institution',
	startup: 'Founder',
	founder: 'Founder',
	mentor: 'Mentor',
	investor: 'Investor',
};

/** Where each role should land after logout */
const logoutRedirects: Record<UserRole, string> = {
	institution: '/institution-login',
	startup: '/login',
	founder: '/login',
	mentor: '/login',
	investor: '/login',
};

// ─── Component ───────────────────────────────────────────────────────────────

export function DashboardSidebar({ children, userType }: DashboardSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [isMobileOpen, setIsMobileOpen] = useState(false);

	// Resolve the active role
	const resolvedRole: UserRole = userType ?? (getRoleFromSession() as UserRole) ?? 'startup';
	const navigation = getNavItems(resolvedRole);

	const handleLogout = async () => {
		// For institution, try server-side logout with token
		if (resolvedRole === 'institution') {
			try {
				const token = getSessionToken('institution');
				if (token) {
					await fetch('/api/auth/logout/', {
						method: 'POST',
						headers: { 'Authorization': `Bearer ${token}` },
					});
				}
			} catch (error) {
				console.error('Logout error:', error);
			} finally {
				clearAllRoleTokens();
				clearAuthCookie();
				clearTokenCookie();
				window.location.href = logoutRedirects[resolvedRole];
			}
			return;
		}

		// All other roles use unified AuthContext logout
		logout();
		router.push(logoutRedirects[resolvedRole]);
	};

	const isActive = (href: string) => pathname === href;

	// ─── Shared sidebar content (used on desktop & mobile) ───
	const sidebarContent = (
		<>
			{/* Logo & Collapse Toggle */}
			<div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
				{!isCollapsed && (
					<Link href="/" className="flex items-center gap-2">
						<img src="/xentro-logo.png" alt="XENTRO" className="h-7 w-auto" />
						<span className="ml-1 text-xs font-medium text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded">
							{roleLabels[resolvedRole]}
						</span>
					</Link>
				)}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto hidden lg:inline-flex"
					aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
				>
					<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{isCollapsed ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
						)}
					</svg>
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-3 space-y-1 overflow-y-auto">
				{navigation.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.name}
							href={item.href}
							onClick={() => setIsMobileOpen(false)}
							className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg transition-colors ${active
								? 'bg-gray-900 text-white'
								: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
								}`}
							title={isCollapsed ? item.name : undefined}
						>
							{item.icon}
							{!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
						</Link>
					);
				})}
			</nav>

			{/* Footer Actions */}
			<div className="p-3 border-t border-gray-200 space-y-1 shrink-0">
				<Link
					href="mailto:support@xentro.io"
					className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-600 hover:bg-blue-50 hover:text-blue-600 transition-colors`}
					title={isCollapsed ? 'Support' : undefined}
				>
					{icons.support}
					{!isCollapsed && <span className="font-medium text-sm">Support</span>}
				</Link>
				<button
					onClick={handleLogout}
					className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors`}
					title={isCollapsed ? 'Logout' : undefined}
				>
					{icons.logout}
					{!isCollapsed && <span className="font-medium text-sm">Logout</span>}
				</button>
			</div>
		</>
	);

	return (
		<div className="h-screen bg-background flex overflow-hidden">
			{/* Desktop Sidebar */}
			<aside
				className={`${isCollapsed ? 'w-20' : 'w-64'
					} bg-white border-r border-gray-200 shrink-0 transition-all duration-300 flex-col h-screen hidden lg:flex`}
			>
				{sidebarContent}
			</aside>

			{/* Mobile Header */}
			<header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-40 lg:hidden">
				<Link href="/" className="flex items-center gap-2">
					<img src="/xentro-logo.png" alt="XENTRO" className="h-6 w-auto" />
					<span className="text-xs font-medium text-gray-500 border border-gray-300 px-1.5 py-0.5 rounded">
						{roleLabels[resolvedRole]}
					</span>
				</Link>
				<button
					onClick={() => setIsMobileOpen(!isMobileOpen)}
					className="p-2 -mr-2 text-gray-600 hover:text-gray-900"
				>
					<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						{isMobileOpen ? (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						) : (
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
						)}
					</svg>
				</button>
			</header>

			{/* Mobile Sidebar Overlay */}
			{isMobileOpen && (
				<>
					<div
						className="fixed inset-0 bg-black/50 z-40 lg:hidden"
						onClick={() => setIsMobileOpen(false)}
					/>
					<aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 flex flex-col lg:hidden">
						{sidebarContent}
					</aside>
				</>
			)}

			{/* Main Content */}
			<main className="flex-1 overflow-auto h-screen pt-14 lg:pt-0">
				{children}
			</main>
		</div>
	);
}
