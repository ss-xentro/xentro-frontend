import { getSessionToken, getRoleFromSession } from '@/lib/auth-utils';

export type DetectedRole = 'admin' | 'founder' | 'mentor' | 'investor' | 'institution' | 'guest';

export interface StatCard {
	label: string;
	value: string | number;
	icon: string;
	href?: string;
}

export interface QuickAction {
	label: string;
	href: string;
	icon: string;
}

export interface ActivityItem {
	id: string;
	text: string;
	time: string;
	icon: string;
}

export function detectRole(): { role: DetectedRole; token: string | null } {
	if (typeof window === 'undefined') return { role: 'guest', token: null };

	const token = getSessionToken();
	if (!token) return { role: 'guest', token: null };

	const sessionRole = getRoleFromSession();
	const roleMap: Record<string, DetectedRole> = {
		admin: 'admin',
		mentor: 'mentor',
		institution: 'institution',
		investor: 'investor',
		startup: 'founder',
		founder: 'founder',
		explorer: 'guest',
	};
	const role = roleMap[sessionRole ?? ''] || 'guest';
	return { role, token };
}

export const ROLE_META: Record<DetectedRole, {
	greeting: string;
	subtitle: string;
	dashboardHref: string;
	loginHref: string;
	quickActions: QuickAction[];
}> = {
	admin: {
		greeting: 'Welcome back, Admin',
		subtitle: 'Platform Overview',
		dashboardHref: '/admin/dashboard',
		loginHref: '/admin/login',
		quickActions: [
			{ label: 'Review Approvals', href: '/admin/dashboard/institutions/verification-requests', icon: 'clipboard-list' },
			{ label: 'Manage Institutions', href: '/admin/dashboard', icon: 'landmark' },
			{ label: 'Browse Feed', href: '/feed', icon: 'newspaper' },
			{ label: 'Explore', href: '/explore/institute', icon: 'search' },
		],
	},
	founder: {
		greeting: 'Welcome back, Founder',
		subtitle: 'Startup Dashboard',
		dashboardHref: '/dashboard',
		loginHref: '/login',
		quickActions: [
			{ label: 'Edit Startup', href: '/dashboard', icon: 'pencil' },
			{ label: 'Find Mentors', href: '/explore/mentors', icon: 'graduation-cap' },
			{ label: 'Browse Programs', href: '/explore/institute', icon: 'landmark' },
			{ label: 'View Feed', href: '/feed', icon: 'newspaper' },
		],
	},
	mentor: {
		greeting: 'Welcome back, Mentor',
		subtitle: 'Mentorship Dashboard',
		dashboardHref: '/mentor-dashboard',
		loginHref: '/mentor-login',
		quickActions: [
			{ label: 'Manage Slots', href: '/mentor-dashboard', icon: 'calendar' },
			{ label: 'View Requests', href: '/mentor-dashboard/requests', icon: 'clipboard-list' },
			{ label: 'Explore Startups', href: '/explore/startups', icon: 'rocket' },
			{ label: 'View Feed', href: '/feed', icon: 'newspaper' },
		],
	},
	investor: {
		greeting: 'Welcome back, Investor',
		subtitle: 'Investment Dashboard',
		dashboardHref: '/investor-dashboard',
		loginHref: '/investor-login',
		quickActions: [
			{ label: 'Browse Startups', href: '/explore/startups', icon: 'rocket' },
			{ label: 'Deal Flow', href: '/investor-dashboard', icon: 'trending-up' },
			{ label: 'Explore Institutions', href: '/explore/institute', icon: 'landmark' },
			{ label: 'View Feed', href: '/feed', icon: 'newspaper' },
		],
	},
	institution: {
		greeting: 'Welcome back',
		subtitle: 'Institution Dashboard',
		dashboardHref: '/institution-dashboard',
		loginHref: '/institution-login',
		quickActions: [
			{ label: 'Manage Programs', href: '/institution-dashboard', icon: 'clipboard-list' },
			{ label: 'View Team', href: '/institution-dashboard/team', icon: 'users' },
			{ label: 'Edit Profile', href: '/institution-edit', icon: 'pencil' },
			{ label: 'View Feed', href: '/feed', icon: 'newspaper' },
		],
	},
	guest: {
		greeting: 'Welcome to Xentro',
		subtitle: 'Get started by joining the ecosystem',
		dashboardHref: '/feed',
		loginHref: '/join',
		quickActions: [
			{ label: 'Sign Up', href: '/join', icon: 'rocket' },
			{ label: 'Explore Institutions', href: '/explore/institute', icon: 'landmark' },
			{ label: 'Browse Startups', href: '/explore/startups', icon: 'lightbulb' },
			{ label: 'View Feed', href: '/feed', icon: 'newspaper' },
		],
	},
};

export function defaultCards(role: DetectedRole): StatCard[] {
	const configs: Record<string, StatCard[]> = {
		admin: [
			{ label: 'Institutions', value: 0, icon: 'landmark' },
			{ label: 'Startups', value: 0, icon: 'rocket' },
			{ label: 'Mentors', value: 0, icon: 'graduation-cap' },
			{ label: 'Investors', value: 0, icon: 'briefcase' },
		],
		founder: [
			{ label: 'Status', value: '—', icon: 'rocket', href: '/dashboard' },
			{ label: 'Stage', value: '—', icon: 'trending-up' },
			{ label: 'Team', value: 0, icon: 'users' },
			{ label: 'Funds Raised', value: '$0', icon: 'coins' },
		],
		mentor: [
			{ label: 'Active Mentees', value: 0, icon: 'graduation-cap' },
			{ label: 'Sessions This Month', value: 0, icon: 'calendar' },
			{ label: 'Rating', value: '—', icon: 'star' },
			{ label: 'Earnings', value: '$0', icon: 'coins' },
		],
		investor: [
			{ label: 'Active Deals', value: 0, icon: 'trending-up' },
			{ label: 'Portfolio Companies', value: 0, icon: 'briefcase' },
			{ label: 'Total Invested', value: '$0', icon: 'coins' },
			{ label: 'Pipeline', value: 0, icon: 'bar-chart' },
		],
		institution: [
			{ label: 'Programs', value: 0, icon: 'clipboard-list', href: '/institution-dashboard' },
			{ label: 'Team', value: 0, icon: 'users' },
			{ label: 'Startups', value: 0, icon: 'rocket' },
			{ label: 'Views', value: 0, icon: 'eye' },
		],
		guest: [],
	};
	return configs[role] ?? [];
}
