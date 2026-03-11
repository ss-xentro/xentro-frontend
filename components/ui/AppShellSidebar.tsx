'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { getSessionToken } from '@/lib/auth-utils';
import { type UserRole, getNavItems } from './sidebar-nav-config';

const ROLE_LABELS: Record<string, string> = {
	admin: 'Admin',
	startup: 'Startup Founder',
	founder: 'Startup Founder',
	mentor: 'Mentor',
	institution: 'Institution',
	investor: 'Investor',
};

function getDashboardUrl(role?: string): string {
	const roleMap: Record<string, string> = {
		admin: '/admin/dashboard',
		startup: '/dashboard',
		founder: '/dashboard',
		mentor: '/mentor-dashboard',
		institution: '/institution-dashboard',
		investor: '/investor-dashboard',
	};
	return role && roleMap[role] ? roleMap[role] : '/feed';
}

// SVG paths for child nav items (extracted from sidebar-icons)
const CHILD_ICON_PATHS: Record<string, string> = {
	overview: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
	edit: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
	document: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
	team: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
	clock: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
	groupPeople: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
	endorsement: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
	settings: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
	addPerson: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
	profile: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
	calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
	bolt: 'M13 10V3L4 14h7v7l9-11h-7z',
	mentors: 'M17 20h5V4H2v16h5m10 0v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4m10 0H7',
	analytics: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
	trash: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
	trendUp: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
	building: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
	search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
};

// Map sidebar-nav-config icon names to CHILD_ICON_PATHS keys
function getChildIconPath(navItemName: string): string {
	const nameToPath: Record<string, string> = {
		'Overview': CHILD_ICON_PATHS.overview,
		'Edit Profile': CHILD_ICON_PATHS.edit,
		'Pitch Deck': CHILD_ICON_PATHS.document,
		'Team': CHILD_ICON_PATHS.team,
		'Activity': CHILD_ICON_PATHS.clock,
		'My Mentors': CHILD_ICON_PATHS.groupPeople,
		'Endorsements': CHILD_ICON_PATHS.endorsement,
		'Settings': CHILD_ICON_PATHS.settings,
		'Mentees': CHILD_ICON_PATHS.team,
		'Requests': CHILD_ICON_PATHS.addPerson,
		'Profile': CHILD_ICON_PATHS.profile,
		'Sessions': CHILD_ICON_PATHS.calendar,
		'Calendar': CHILD_ICON_PATHS.calendar,
		'Deal Flow': CHILD_ICON_PATHS.trendUp,
		'Portfolio': CHILD_ICON_PATHS.building,
		'Startups': CHILD_ICON_PATHS.bolt,
		'Mentors': CHILD_ICON_PATHS.mentors,
		'Programs': CHILD_ICON_PATHS.bolt,
		'Projects': CHILD_ICON_PATHS.document,
		'Team Members': CHILD_ICON_PATHS.team,
		'Analytics': CHILD_ICON_PATHS.analytics,
		'Recycle Bin': CHILD_ICON_PATHS.trash,
		'Explore': CHILD_ICON_PATHS.search,
	};
	return nameToPath[navItemName] ?? CHILD_ICON_PATHS.overview;
}

const NAV_ITEMS = [
	{ icon: 'feed', label: 'Feed', href: '/feed', path: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
	{ icon: 'explore', label: 'Explore', href: '/explore/institute', path: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
	{ icon: 'bell', label: 'Notifications', href: '/notifications', path: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
];

const DASHBOARD_PATH = 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';

function NavIcon({ svgPath, active, size = 'w-6 h-6' }: { svgPath: string; active?: boolean; size?: string }) {
	return (
		<svg
			className={cn(size, 'transition-all duration-200', active ? 'text-white' : 'text-gray-400')}
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			strokeWidth={active ? 2.5 : 2}
		>
			<path strokeLinecap="round" strokeLinejoin="round" d={svgPath} />
		</svg>
	);
}

export { NavIcon, NAV_ITEMS, DASHBOARD_PATH, getDashboardUrl, ROLE_LABELS };

export default function AppShellSidebar({ isCollapsed, onToggleCollapse }: { isCollapsed: boolean; onToggleCollapse: () => void }) {
	const [searchQuery, setSearchQuery] = useState('');
	const [profileOpen, setProfileOpen] = useState(false);
	const [dashExpanded, setDashExpanded] = useState(false);
	const [startupInfo, setStartupInfo] = useState<{ name: string; slug: string; logo: string | null } | null>(null);
	const profileRef = useRef<HTMLDivElement>(null);
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated, logout } = useAuth();

	const isStartupRole = user?.role === 'startup' || user?.role === 'founder';

	// Fetch startup info for startup/founder roles
	useEffect(() => {
		if (!isAuthenticated || !isStartupRole) return;
		const token = getSessionToken('founder');
		if (!token) return;
		fetch('/api/founder/my-startup', { headers: { Authorization: `Bearer ${token}` } })
			.then(r => r.ok ? r.json() : null)
			.then(json => {
				if (json?.data?.startup) {
					const s = json.data.startup;
					setStartupInfo({ name: s.name, slug: s.slug, logo: s.logo || null });
				}
			})
			.catch(() => { });
	}, [isAuthenticated, isStartupRole]);

	const dashboardHref = getDashboardUrl(user?.role);
	const resolvedRole = (user?.role ?? 'startup') as UserRole;
	const dashboardChildren = isAuthenticated ? getNavItems(resolvedRole) : [];

	// Settings URL per role (shown in profile popup)
	const settingsHrefMap: Record<string, string> = {
		startup: '/dashboard/settings',
		founder: '/dashboard/settings',
		mentor: '/mentor-dashboard/settings',
		investor: '/investor-dashboard/settings',
	};
	const settingsHref = user?.role ? settingsHrefMap[user.role] ?? null : null;

	// Auto-expand dashboard if on a dashboard route
	const isDashboardRoute = pathname === dashboardHref || pathname.startsWith(dashboardHref + '/');
	useEffect(() => {
		if (isDashboardRoute) setDashExpanded(true);
	}, [isDashboardRoute]);

	const username = isStartupRole && startupInfo?.slug ? startupInfo.slug : (user?.email ? user.email.split('@')[0] : 'guest');
	const displayName = isStartupRole && startupInfo?.name ? startupInfo.name : (user?.name ?? 'Guest');
	const displayAvatar = isStartupRole && startupInfo?.logo ? startupInfo.logo : (user?.avatar || null);

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
		router.push('/guest');
	};

	function isNavActive(href: string, label: string) {
		if (href === '/explore/institute') return pathname.startsWith('/explore');
		if (label === 'Dashboard') return isDashboardRoute;
		return pathname === href;
	}

	return (
		<aside
			className={cn(
				'sticky top-0 h-screen shrink-0 border-r border-white/10 hidden md:flex flex-col transition-all duration-300 ease-in-out',
				isCollapsed ? 'w-20' : 'w-72',
			)}
		>
			<div className="flex-1 flex flex-col items-center px-3 py-6 overflow-hidden">
				<div className={cn('mb-6 w-full', !isCollapsed && 'px-2')}>
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3 min-w-0">
							<Image src="/xentro-logo.png" alt="Xentro" width={36} height={36} className="rounded-lg shrink-0" />
							<span className={cn('text-white font-bold text-xl tracking-tight whitespace-nowrap overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
								Xentro
							</span>
						</div>
						<button
							onClick={onToggleCollapse}
							className={cn('shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all duration-200', isCollapsed && 'mx-auto mt-1')}
							title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
						>
							<svg className={cn('w-4 h-4 text-gray-400 transition-transform duration-300', isCollapsed && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
							</svg>
						</button>
					</div>
					<div className={cn('mt-4 overflow-hidden transition-all duration-300', isCollapsed ? 'opacity-0 h-0' : 'opacity-100 h-auto')}>
						<div className="h-px bg-white/10 mb-3" />
						<span className="text-xs font-medium text-white/40 uppercase tracking-widest whitespace-nowrap">
							{user?.role ? (ROLE_LABELS[user.role] ?? user.role) : 'Guest'}
						</span>
					</div>
				</div>

				{!isCollapsed && (
					<div className="mb-4 w-full px-2">
						<div className="relative">
							<input
								type="text"
								placeholder="Search..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="w-full px-4 py-2.5 pl-10 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all duration-200"
							/>
							<svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
					</div>
				)}

				<nav className="space-y-1 w-full overflow-y-auto">
					{/* Dashboard with expandable children */}
					{isAuthenticated && (
						<>
							<button
								onClick={() => {
									if (isCollapsed) {
										router.push(dashboardHref);
									} else {
										setDashExpanded((prev) => !prev);
									}
								}}
								className={cn(
									'relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group',
									isCollapsed ? 'justify-center' : '',
									isDashboardRoute ? 'bg-white/10' : 'hover:bg-white/5',
								)}
							>
								<NavIcon svgPath={DASHBOARD_PATH} active={isDashboardRoute} />
								<span className={cn('text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden flex-1 text-left', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100', isDashboardRoute ? 'text-white' : 'text-gray-400')}>
									Dashboard
								</span>
								{!isCollapsed && (
									<svg className={cn('w-4 h-4 text-white/40 transition-transform duration-200 shrink-0', dashExpanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
									</svg>
								)}
								{isCollapsed && (
									<div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
										Dashboard
									</div>
								)}
							</button>
							{dashExpanded && !isCollapsed && (
								<div className="ml-4 pl-3 border-l border-white/10 space-y-0.5">
									{dashboardChildren.map((child) => {
										const childActive = pathname === child.href;
										return (
											<Link
												key={child.href}
												href={child.href}
												className={cn(
													'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors duration-200',
													childActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
												)}
											>
												<NavIcon svgPath={getChildIconPath(child.name)} active={childActive} size="w-4 h-4" />
												<span className="text-[13px] font-medium">{child.name}</span>
											</Link>
										);
									})}
								</div>
							)}
						</>
					)}

					{/* Other nav items */}
					{NAV_ITEMS.map((item) => {
						const active = isNavActive(item.href, item.label);
						return (
							<Link
								key={item.icon}
								href={item.href}
								className={cn(
									'relative w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-colors duration-200 group',
									isCollapsed ? 'justify-center' : '',
									active ? 'bg-white/10' : 'hover:bg-white/5',
								)}
							>
								<NavIcon svgPath={item.path} active={active} />
								<span className={cn('text-[15px] font-medium transition-all duration-300 whitespace-nowrap overflow-hidden', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100', active ? 'text-white' : 'text-gray-400')}>
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

			<div className="p-3 border-t border-white/10" ref={profileRef}>
				{profileOpen && (
					<div className="absolute bottom-20 left-3 right-3 bg-[#15181C] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
						<div className="px-4 py-3 border-b border-white/10">
							<p className="text-sm font-semibold text-white truncate">{displayName}</p>
							<p className="text-xs text-gray-400 truncate">@{username}</p>
						</div>
						<div className="p-1.5 space-y-0.5">
							{isAuthenticated && settingsHref && (
								<Link href={settingsHref} onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm">
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
									</svg>
									Settings
								</Link>
							)}
							<button onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-300 hover:bg-white/5 hover:text-white transition-colors text-sm">
								<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
								Help &amp; Support
							</button>
							<div className="my-1 h-px bg-white/10" />
							{isAuthenticated ? (
								<button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors text-sm">
									<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
									</svg>
									Log out @{username}
								</button>
							) : (
								<Link href="/join" onClick={() => setProfileOpen(false)} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors text-sm">
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
					className={cn('w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group relative', isCollapsed && 'justify-center', profileOpen && 'bg-white/5')}
				>
					<div className="shrink-0 w-9 h-9 rounded-full border border-white/10 flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500/30 to-purple-500/30">
						{displayAvatar ? (
							<img src={displayAvatar} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
						) : (
							<span className="text-sm font-semibold text-white">{displayName.charAt(0).toUpperCase()}</span>
						)}
					</div>
					<div className={cn('flex-1 text-left overflow-hidden transition-all duration-300', isCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100')}>
						<p className="text-sm font-medium text-white truncate">{displayName}</p>
						<p className="text-xs text-gray-400 truncate">@{username}</p>
					</div>
					{!isCollapsed && (
						<svg className="w-4 h-4 text-white/40 shrink-0" fill="currentColor" viewBox="0 0 24 24">
							<circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
						</svg>
					)}
					{isCollapsed && (
						<div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
							{displayName}
						</div>
					)}
				</button>
			</div>
		</aside>
	);
}
