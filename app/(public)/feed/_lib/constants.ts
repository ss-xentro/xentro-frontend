export interface Post {
	id: string;
	author: {
		name: string;
		username: string;
		avatar: string;
	};
	content: string;
	image?: string;
	timestamp: string;
	replies: number;
	reposts: number;
	likes: number;
	bookmarks: number;
}

export const mockPosts: Post[] = [
	{
		id: '1',
		author: {
			name: 'Sarah Chen',
			username: 'sarahchen',
			avatar: '/api/placeholder/48/48',
		},
		content: 'Just closed our Series A! Excited to scale our climate tech solution to 50+ cities by 2027. Building the future we want to see.',
		image: 'https://images.unsplash.com/photo-1497436072909-60f360e1d4b1?w=800',
		timestamp: '2h',
		replies: 24,
		reposts: 89,
		likes: 342,
		bookmarks: 56,
	},
	{
		id: '2',
		author: {
			name: 'Alex Kumar',
			username: 'alexkumar',
			avatar: '/api/placeholder/48/48',
		},
		content: 'New research paper on AI-driven drug discovery just published. We reduced screening time from 6 months to 2 weeks. Science is accelerating.',
		timestamp: '4h',
		replies: 67,
		reposts: 234,
		likes: 891,
		bookmarks: 145,
	},
	{
		id: '3',
		author: {
			name: 'Maya Rodriguez',
			username: 'mayarodriguez',
			avatar: '/api/placeholder/48/48',
		},
		content: 'Reflecting on 3 years building in stealth. Sometimes the best strategy is to ship quietly and let the product speak. Our beta waitlist hit 10k today.',
		image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800',
		timestamp: '6h',
		replies: 156,
		reposts: 423,
		likes: 1247,
		bookmarks: 289,
	},
];

export const trending = [
	{ tag: 'ClimaTech', posts: '2.4K' },
	{ tag: 'SeriesA', posts: '1.8K' },
	{ tag: 'AI Research', posts: '3.2K' },
	{ tag: 'Sustainability', posts: '892' },
];

export const suggestions = [
	{ name: 'TechVentures', username: 'techventures', avatar: '/api/placeholder/40/40' },
	{ name: 'Innovation Hub', username: 'innovationhub', avatar: '/api/placeholder/40/40' },
	{ name: 'Startup Insider', username: 'startupinsider', avatar: '/api/placeholder/40/40' },
];

export const ROLE_LABELS: Record<string, string> = {
	admin: 'Admin',
	startup: 'Startup Founder',
	founder: 'Startup Founder',
	mentor: 'Mentor',
	institution: 'Institution',
	investor: 'Investor',
};

export function getDashboardUrl(role?: string): string {
	const roleMap: Record<string, string> = {
		admin: '/admin/dashboard',
		startup: '/dashboard',
		founder: '/dashboard',
		mentor: '/mentor-dashboard',
		institution: '/institution-dashboard',
		investor: '/investor-dashboard',
	};
	return role && roleMap[role] ? roleMap[role] : '/home';
}

export const NAV_ICON_PATHS: Record<string, string> = {
	home: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
	explore: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z',
	bell: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
	user: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
	feed: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z',
	dashboard: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
};
