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

export type TabKey = 'programs' | 'events' | 'startups' | 'projects' | 'team';

export const TAB_LABELS: { key: TabKey; label: string }[] = [
	{ key: 'programs', label: 'Programs' },
	{ key: 'events', label: 'Events' },
	{ key: 'startups', label: 'Startups' },
	{ key: 'projects', label: 'Projects' },
	{ key: 'team', label: 'Team' },
];

export const ROLE_LABELS: Record<string, { label: string; color: string }> = {
	owner: { label: 'Owner', color: 'bg-purple-100 text-purple-800' },
	admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800' },
	manager: { label: 'Manager', color: 'bg-green-100 text-green-800' },
	viewer: { label: 'Member', color: 'bg-gray-100 text-gray-800' },
};

export const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	planning: { label: 'Planning', color: 'bg-blue-100 text-blue-800' },
	active: { label: 'Active', color: 'bg-green-100 text-green-800' },
	completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
	'on-hold': { label: 'On Hold', color: 'bg-yellow-100 text-yellow-800' },
};
