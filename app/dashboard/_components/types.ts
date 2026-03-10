// Dashboard page types

export interface ActivityLog {
	id: string;
	action: string;
	details: unknown;
	createdAt: string;
}

export interface StartupData {
	id: string;
	slug?: string | null;
	name: string;
	tagline: string;
	logo: string | null;
	stage: string;
	status: string;
	fundingRound: string;
	foundedDate: string;
	fundsRaised: string;
	primaryContactEmail: string;
}

export interface DashboardData {
	startup: StartupData;
	founderRole: string;
	recentActivity: ActivityLog[];
}
