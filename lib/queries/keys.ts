/**
 * Centralized query-key factory.
 *
 * Every key is a plain array so TanStack Query can do
 * partial matching when we invalidate (e.g. invalidating
 * ['startup'] wipes ['startup', 'my'] too).
 */
export const queryKeys = {
	// ── Startup ──
	startup: {
		all: ['startup'] as const,
		mine: () => ['startup', 'my'] as const,
		detail: (id: string) => ['startup', id] as const,
	},

	// ── Notifications ──
	notifications: {
		all: ['notifications'] as const,
		list: (params: Record<string, string | number>) => ['notifications', params] as const,
	},

	// ── Institution ──
	institution: {
		all: ['institution'] as const,
		applications: () => ['institution', 'applications'] as const,
		dashboard: () => ['institution', 'dashboard'] as const,
		detail: (id: string) => ['institution', id] as const,
		programs: () => ['institution', 'programs'] as const,
		programDetail: (id: string) => ['institution', 'program', id] as const,
		team: () => ['institution', 'team'] as const,
		teamDetail: (id: string) => ['institution', 'teamMember', id] as const,
		startups: () => ['institution', 'startups'] as const,
		startupDetail: (id: string) => ['institution', 'startup', id] as const,
		projects: () => ['institution', 'projects'] as const,
		projectDetail: (id: string) => ['institution', 'project', id] as const,
		mentors: () => ['institution', 'mentors'] as const,
		mentorDetail: (id: string) => ['institution', 'mentor', id] as const,
		analytics: () => ['institution', 'analytics'] as const,
		recycleBin: () => ['institution', 'recycleBin'] as const,
		endorsements: (params?: Record<string, string>) => ['institution', 'endorsements', params] as const,
		profile: () => ['institution', 'profile'] as const,
	},

	// ── Mentor ──
	mentor: {
		all: ['mentor'] as const,
		profile: () => ['mentor', 'profile'] as const,
		calendar: () => ['mentor', 'calendar'] as const,
		slots: () => ['mentor', 'slots'] as const,
		bookings: () => ['mentor', 'bookings'] as const,
		detail: (id: string) => ['mentor', id] as const,
		analytics: () => ['mentor', 'analytics'] as const,
	},

	// ── Admin ──
	admin: {
		all: ['admin'] as const,
		dashboard: () => ['admin', 'dashboard'] as const,
		institutions: () => ['admin', 'institutions'] as const,
		institutionDetail: (id: string) => ['admin', 'institution', id] as const,
		users: (params?: Record<string, string>) => ['admin', 'users', params] as const,
		startups: () => ['admin', 'startups'] as const,
		analytics: () => ['admin', 'analytics'] as const,
		applications: () => ['admin', 'applications'] as const,
		applicationDetail: (id: string) => ['admin', 'application', id] as const,
		recycleBin: () => ['admin', 'recycleBin'] as const,
		auditLog: (params?: Record<string, string>) => ['admin', 'auditLog', params] as const,
		forms: (params?: Record<string, string>) => ['admin', 'forms', params] as const,
		investors: () => ['admin', 'investors'] as const,
		mentors: () => ['admin', 'mentors'] as const,
		verificationRequests: () => ['admin', 'verificationRequests'] as const,
	},

	// ── Auth ──
	auth: {
		me: () => ['auth', 'me'] as const,
	},

	// ── Activity / Feed ──
	activity: {
		all: ['activity'] as const,
	},

	// ── Dashboard (founder home) ──
	dashboard: {
		all: ['dashboard'] as const,
		stats: (days: number) => ['dashboard', 'stats', days] as const,
	},

	// ── Team ──
	team: {
		all: ['team'] as const,
		list: () => ['team', 'list'] as const,
	},

	// ── Endorsements ──
	endorsements: {
		all: ['endorsements'] as const,
		list: () => ['endorsements', 'list'] as const,
	},

	// ── Connections (startup → mentor) ──
	connections: {
		all: ['connections'] as const,
		list: () => ['connections', 'list'] as const,
	},

	// ── Bookings ──
	bookings: {
		all: ['bookings'] as const,
		list: () => ['bookings', 'list'] as const,
	},

	// ── Pitch ──
	pitch: {
		all: ['pitch'] as const,
		detail: (startupId: string) => ['pitch', startupId] as const,
	},

	// ── Investor ──
	investor: {
		all: ['investor'] as const,
		dashboard: () => ['investor', 'dashboard'] as const,
	},

	// ── Explore ──
	explore: {
		all: ['explore'] as const,
		mentors: (params?: Record<string, string>) => ['explore', 'mentors', params] as const,
		mentorDetail: (id: string) => ['explore', 'mentor', id] as const,
		mentorSlots: (userId: string) => ['explore', 'mentor-slots', userId] as const,
		startups: (params?: Record<string, string>) => ['explore', 'startups', params] as const,
		institutes: (params?: Record<string, string>) => ['explore', 'institutes', params] as const,
	},

	// ── Search ──
	search: {
		all: ['search'] as const,
		results: (query: string) => ['search', query] as const,
	},

	// ── Chat ──
	chat: {
		all: ['chat'] as const,
		conversations: () => ['chat', 'conversations'] as const,
	},

	// ── Public ──
	public: {
		institution: (id: string) => ['public', 'institution', id] as const,
		startup: (id: string) => ['public', 'startup', id] as const,
		startupList: (params?: Record<string, string>) => ['public', 'startups', params] as const,
	},

	// ── Onboarding / Mentor ──
	onboarding: {
		mentorProfile: () => ['onboarding', 'mentorProfile'] as const,
		myStartup: () => ['onboarding', 'myStartup'] as const,
	},
} as const;
