export type Program = {
	id: string;
	name: string;
	description: string | null;
	type: string;
	duration: string | null;
};

export type Event = {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	startTime: Date | null;
};

export type Startup = {
	id: string;
	slug?: string | null;
	name: string;
	stage: string | null;
	location: string | null;
	oneLiner: string | null;
	tagline?: string | null;
	logo?: string | null;
};

export type TeamMember = {
	id: string;
	userId: string;
	role: 'owner' | 'admin' | 'manager' | 'viewer';
	invitedAt: string;
	user: {
		id: string;
		name: string | null;
		email: string;
	} | null;
};

export type Project = {
	id: string;
	name: string;
	status: string;
	description: string | null;
	startDate: string | null;
	endDate: string | null;
};

// events hidden — re-enable in v2
export type TabKey = 'programs' | 'startups' | 'projects' | 'team';

export const TAB_LABELS: { key: TabKey; label: string }[] = [
	{ key: 'programs', label: 'Programs' },
	// { key: 'events', label: 'Events' },
	{ key: 'startups', label: 'Startups' },
	{ key: 'projects', label: 'Projects' },
	{ key: 'team', label: 'Team' },
];

export const ROLE_LABELS: Record<string, { label: string; color: string }> = {
	owner: { label: 'Owner', color: 'bg-purple-500/20 text-purple-200' },
	admin: { label: 'Admin', color: 'bg-blue-500/20 text-blue-200' },
	manager: { label: 'Manager', color: 'bg-green-500/20 text-green-200' },
	viewer: { label: 'Member', color: 'bg-(--accent-light) text-(--primary)' },
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	planning: { label: 'Planning', color: 'bg-blue-500/20 text-blue-200' },
	active: { label: 'Active', color: 'bg-green-500/20 text-green-200' },
	completed: { label: 'Completed', color: 'bg-(--accent-light) text-(--primary)' },
	'on-hold': { label: 'On Hold', color: 'bg-yellow-500/20 text-yellow-200' },
};
