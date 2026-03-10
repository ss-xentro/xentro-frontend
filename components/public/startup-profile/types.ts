import type {
	Startup,
	PitchAbout,
	PitchCompetitor,
	PitchCustomer,
	PitchBusinessModelItem,
	PitchMarketSizeItem,
	PitchVisionStrategyItem,
	PitchImpactItem,
	PitchCertificationItem,
} from '@/lib/types';

export interface Founder {
	id: string;
	name: string;
	email: string;
	role: string;
	title?: string;
	avatar?: string | null;
	isPrimary: boolean;
}

export interface TeamMemberData {
	id: string;
	role: string;
	title: string;
	name?: string;
	email?: string;
	avatar?: string | null;
	user: { id: string; name: string } | null;
}

export interface StartupWithDetails extends Startup {
	teamMembers?: TeamMemberData[];
	founders?: Founder[];
	owner?: { id: string; name: string; email: string } | null;
	isRestricted?: boolean;
}

export type {
	PitchAbout,
	PitchCompetitor,
	PitchCustomer,
	PitchBusinessModelItem,
	PitchMarketSizeItem,
	PitchVisionStrategyItem,
	PitchImpactItem,
	PitchCertificationItem,
};
