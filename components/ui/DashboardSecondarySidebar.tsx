'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getRoleFromSession, getSessionToken, clearAllRoleTokens, clearAuthCookie, clearTokenCookie } from '@/lib/auth-utils';
import { useAuth } from '@/contexts/AuthContext';
import { icons } from './sidebar-icons';
import { type UserRole, type NavItem, getNavItems, roleLabels, logoutRedirects } from './sidebar-nav-config';

interface DashboardSecondarySidebarProps {
	userType?: UserRole;
}

export default function DashboardSecondarySidebar({ userType }: DashboardSecondarySidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const { logout } = useAuth();
	const [isCollapsed, setIsCollapsed] = useState(false);

	const resolvedRole: UserRole = userType ?? (getRoleFromSession() as UserRole) ?? 'startup';
	const navigation = getNavItems(resolvedRole);

	const handleLogout = async () => {
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
		logout();
		router.push(logoutRedirects[resolvedRole]);
	};

	const isActive = (href: string) => pathname === href;

	return (
		<aside
			className={cn(
				'sticky top-0 h-screen shrink-0 border-r border-white/10 hidden lg:flex flex-col transition-all duration-300 ease-in-out bg-[#0B0D10]',
				isCollapsed ? 'w-16' : 'w-56',
			)}
		>
			{/* Header with collapse toggle */}
			<div className="h-14 flex items-center justify-between px-3 border-b border-white/10 shrink-0">
				{!isCollapsed && (
					<span className="text-xs font-medium text-gray-500 uppercase tracking-widest whitespace-nowrap">
						{roleLabels[resolvedRole]}
					</span>
				)}
				<button
					onClick={() => setIsCollapsed(!isCollapsed)}
					className="p-1.5 rounded-lg hover:bg-white/10 transition-colors ml-auto"
					aria-label={isCollapsed ? 'Expand' : 'Collapse'}
				>
					<svg className={cn('w-4 h-4 text-gray-400 transition-transform duration-300', isCollapsed && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
					</svg>
				</button>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
				{navigation.map((item) => {
					const active = isActive(item.href);
					return (
						<Link
							key={item.name}
							href={item.href}
							className={cn(
								'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group relative',
								isCollapsed && 'justify-center',
								active
									? 'bg-white/10 text-white'
									: 'text-gray-400 hover:bg-white/5 hover:text-white',
							)}
							title={isCollapsed ? item.name : undefined}
						>
							<span className={cn('shrink-0', active ? 'text-white' : 'text-gray-400')}>
								{item.icon}
							</span>
							{!isCollapsed && (
								<span className="text-sm font-medium whitespace-nowrap">{item.name}</span>
							)}
							{isCollapsed && (
								<div className="absolute left-full ml-3 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
									{item.name}
								</div>
							)}
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-2 border-t border-white/10 space-y-0.5 shrink-0">
				<Link
					href="mailto:support@xentro.io"
					className={cn(
						'flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-colors',
						isCollapsed && 'justify-center',
					)}
					title={isCollapsed ? 'Support' : undefined}
				>
					{icons.support}
					{!isCollapsed && <span className="text-sm font-medium">Support</span>}
				</Link>
				<button
					onClick={handleLogout}
					className={cn(
						'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors',
						isCollapsed && 'justify-center',
					)}
					title={isCollapsed ? 'Logout' : undefined}
				>
					{icons.logout}
					{!isCollapsed && <span className="text-sm font-medium">Logout</span>}
				</button>
			</div>
		</aside>
	);
}
