export const STAGE_OPTIONS = [
	{ value: 'ideation', label: 'Ideation', description: 'Validating the concept', icon: 'lightbulb' },
	{ value: 'pre_seed_prototype', label: 'Pre seed / Prototype', description: 'Building the first version', icon: 'wrench' },
	{ value: 'seed_mvp', label: 'Seed / MVP', description: 'Building the MVP', icon: 'code' },
	{ value: 'early_traction', label: 'Early Traction', description: 'First users / revenue', icon: 'trending-up' },
	{ value: 'growth', label: 'Growth', description: 'Scaling product & team', icon: 'rocket' },
	{ value: 'scaling', label: 'Scaling', description: 'Expanding markets', icon: 'globe' },
] as const;

export const WHY_XENTRO_OPTIONS = [
	{
		value: 'connect_verified_mentors',
		label: 'To connect with verified mentors who can guide our startup journey',
		title: 'Mentor access',
		description: 'Connect with verified mentors for focused startup guidance.',
		icon: 'handshake',
	},
	{
		value: 'access_investors',
		label: 'To gain access to investors actively looking for early-stage startups',
		title: 'Investor access',
		description: 'Reach investors actively looking at early-stage startups.',
		icon: 'coins',
	},
	{
		value: 'increase_visibility',
		label: 'To increase visibility for our startup within a trusted ecosystem',
		title: 'Startup visibility',
		description: 'Show up inside a more trusted startup ecosystem.',
		icon: 'eye',
	},
	{
		value: 'participate_programs',
		label: 'To participate in incubator and accelerator programs',
		title: 'Programs',
		description: 'Join incubator and accelerator opportunities.',
		icon: 'graduation-cap',
	},
	{
		value: 'validate_idea',
		label: 'To validate our idea through expert feedback',
		title: 'Idea validation',
		description: 'Pressure-test the idea with expert feedback.',
		icon: 'search',
	},
	{
		value: 'build_partnerships',
		label: 'To build strategic partnerships with institutions and industry leaders',
		title: 'Partnerships',
		description: 'Build strategic relationships with institutions and industry.',
		icon: 'briefcase',
	},
	{
		value: 'find_cofounders_team',
		label: 'To find co-founders or key team members',
		title: 'Team building',
		description: 'Find co-founders or key early hires.',
		icon: 'users',
	},
	{
		value: 'prepare_fundraising',
		label: 'To prepare for fundraising (pitch refinement, investor readiness)',
		title: 'Fundraising prep',
		description: 'Refine the pitch and get investor-ready.',
		icon: 'target',
	},
	{
		value: 'access_resources',
		label: 'To access curated resources, tools, and startup support',
		title: 'Resources',
		description: 'Access curated tools, playbooks, and support.',
		icon: 'folder',
	},
	{
		value: 'expand_network',
		label: 'To expand our professional network within the startup ecosystem',
		title: 'Network growth',
		description: 'Expand your network across the startup ecosystem.',
		icon: 'globe',
	},
	{
		value: 'stay_updated',
		label: 'To stay updated on startup opportunities, grants, and competitions',
		title: 'Opportunities',
		description: 'Track grants, competitions, and new opportunities.',
		icon: 'bell',
	},
	{
		value: 'build_credibility',
		label: 'To build credibility through association with Xentro',
		title: 'Credibility',
		description: 'Strengthen trust through the Xentro network.',
		icon: 'star',
	},
	{
		value: 'Other',
		label: 'Other',
		title: 'Other',
		description: 'Tell us what else you want from Xentro.',
		icon: 'pen-square',
	},
];

export const COMPLETION_STEPS = [
	{ id: 1, title: 'Identity', subtitle: 'Name · Tagline · Logo' },
	{ id: 2, title: 'Team', subtitle: 'Founder · Co-founders · Team' },
	{ id: 3, title: 'Industry', subtitle: 'Sector · Stage' },
	{ id: 4, title: 'Purpose', subtitle: 'Why Xentro?' },
];

export const WHY_XENTRO_LABEL_TO_VALUE = WHY_XENTRO_OPTIONS.reduce<Record<string, string>>((acc, option) => {
	acc[option.value] = option.value;
	acc[option.label] = option.value;
	return acc;
}, {});

export function getWhyXentroValues(reasons: string[] = []) {
	return reasons.map((reason) => WHY_XENTRO_LABEL_TO_VALUE[reason] ?? reason);
}

export function hasPartialMember(entry: { name?: string; email?: string; title?: string; avatar?: string | null; bio?: string }) {
	return Boolean(entry.name?.trim() || entry.email?.trim() || entry.title?.trim() || entry.avatar || entry.bio?.trim());
}

export function hasIncompleteMember(entry: { name?: string; email?: string; title?: string; avatar?: string | null; bio?: string }) {
	return hasPartialMember(entry) && !entry.name?.trim();
}

export function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}
