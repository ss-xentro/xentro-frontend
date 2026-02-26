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
	isPrimary: boolean;
}

export interface TeamMemberData {
	id: string;
	role: string;
	title: string;
	user: { id: string; name: string } | null;
}

export interface StartupWithDetails extends Startup {
	teamMembers?: TeamMemberData[];
	founders?: Founder[];
	owner?: { id: string; name: string; email: string } | null;
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
