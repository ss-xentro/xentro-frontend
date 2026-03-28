export const ROLE_LABELS: Record<string, string> = {
	admin: 'Admin',
	startup: 'Startup Founder',
	founder: 'Startup Founder',
	mentor: 'Mentor',
	institution: 'Institution',
	// investor hidden for v1
};

export function getDashboardUrl(role?: string): string {
	const roleMap: Record<string, string> = {
		admin: '/admin/dashboard',
		startup: '/dashboard',
		founder: '/dashboard',
		mentor: '/mentor-dashboard',
		institution: '/institution-dashboard',
		// investor hidden for v1
	};
	return role && roleMap[role] ? roleMap[role] : '/explore/institute';
}

export interface NavItem {
	icon: string;
	label: string;
	href: string;
	path: string;
}

export const BASE_NAV_ITEMS: NavItem[] = [
	// feed hidden for v1 — re-enable in v2
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

export const DASHBOARD_NAV_PATH =
	'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z';

export const EXPLORE_TABS = [
	{ label: 'Institutions', href: '/explore/institute' },
	{ label: 'Startups', href: '/explore/startups' },
	{ label: 'Mentors', href: '/explore/mentors' },
];
