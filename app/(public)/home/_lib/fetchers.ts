import { StatCard, ActivityItem, DetectedRole, defaultCards } from './constants';

function timeAgo(dateStr: string): string {
	const diff = Date.now() - new Date(dateStr).getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return 'Just now';
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

export async function fetchAdminData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[] }> {
	try {
		const res = await fetch('/api/institutions');
		if (!res.ok) throw new Error();
		const data = await res.json();
		const institutions = data.institutions ?? data ?? [];
		const count = institutions.length;
		const startups = institutions.reduce((s: number, i: { startupsSupported?: number }) => s + (i.startupsSupported || 0), 0);
		const students = institutions.reduce((s: number, i: { studentsMentored?: number }) => s + (i.studentsMentored || 0), 0);
		const funding = institutions.reduce((s: number, i: { fundingFacilitated?: number }) => s + (i.fundingFacilitated || 0), 0);
		return {
			cards: [
				{ label: 'Total Institutions', value: count, icon: 'landmark', href: '/admin/dashboard' },
				{ label: 'Startups Supported', value: startups, icon: 'rocket' },
				{ label: 'Students Mentored', value: students, icon: 'graduation-cap' },
				{ label: 'Funding Facilitated', value: funding > 0 ? `$${(funding / 1e6).toFixed(1)}M` : '$0', icon: 'coins' },
			],
			activity: [],
		};
	} catch {
		return { cards: defaultCards('admin'), activity: [] };
	}
}

export async function fetchFounderData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[]; name?: string }> {
	try {
		const res = await fetch('/api/founder/my-startup', {
			headers: { Authorization: `Bearer ${token}` },
		});
		if (!res.ok) throw new Error();
		const data = await res.json();
		const startup = data.startup;
		const activity = (data.recentActivity ?? []).slice(0, 5).map((a: { id?: string; action?: string; createdAt?: string }, i: number) => ({
			id: a.id ?? String(i),
			text: a.action ?? 'Activity',
			time: a.createdAt ? timeAgo(a.createdAt) : '',
			icon: 'pen-square',
		}));
		return {
			cards: [
				{ label: 'Status', value: startup?.status ?? '—', icon: 'rocket', href: '/dashboard' },
				{ label: 'Stage', value: startup?.stage ?? '—', icon: 'trending-up' },
				{ label: 'Team Size', value: startup?.teamMembers?.length ?? 0, icon: 'users' },
				{ label: 'Funds Raised', value: startup?.fundsRaised ? `$${Number(startup.fundsRaised).toLocaleString()}` : '$0', icon: 'coins' },
			],
			activity,
			name: startup?.name,
		};
	} catch {
		return { cards: defaultCards('founder'), activity: [] };
	}
}

export async function fetchInstitutionData(token: string): Promise<{ cards: StatCard[]; activity: ActivityItem[]; name?: string }> {
	try {
		const [profileRes, startupsRes, teamRes, programsRes] = await Promise.all([
			fetch('/api/auth/me/', { headers: { Authorization: `Bearer ${token}` } }),
			fetch('/api/startups', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
			fetch('/api/institution-team', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
			fetch('/api/programs', { headers: { Authorization: `Bearer ${token}` } }).catch(() => null),
		]);

		const profile = profileRes.ok ? await profileRes.json() : null;
		const startups = startupsRes?.ok ? await startupsRes.json() : null;
		const team = teamRes?.ok ? await teamRes.json() : null;
		const programs = programsRes?.ok ? await programsRes.json() : null;

		const startupsCount = Array.isArray(startups) ? startups.length : (startups?.startups?.length ?? 0);
		const teamCount = Array.isArray(team) ? team.length : (team?.members?.length ?? 0);
		const programsCount = Array.isArray(programs) ? programs.length : (programs?.programs?.length ?? 0);

		return {
			cards: [
				{ label: 'Active Programs', value: programsCount, icon: 'clipboard-list', href: '/institution-dashboard' },
				{ label: 'Team Members', value: teamCount, icon: 'users', href: '/institution-dashboard/team' },
				{ label: 'Portfolio Startups', value: startupsCount, icon: 'rocket', href: '/institution-dashboard/startups' },
				{ label: 'Profile Views', value: profile?.profileViews ?? 0, icon: 'eye' },
			],
			activity: [],
			name: profile?.name ?? profile?.institution?.name,
		};
	} catch {
		return { cards: defaultCards('institution'), activity: [] };
	}
}
