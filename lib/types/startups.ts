// ========================================
// Startup Types
// ========================================

import type { SDGFocus, SectorFocus } from './common';

export type StartupStage = 'ideation' | 'pre_seed_prototype' | 'seed_mvp' | 'early_traction' | 'growth' | 'scaling';
export type StartupStatus = 'public' | 'private';
export type FundingRound = 'bootstrapped' | 'pre_seed' | 'seed' | 'series_a' | 'series_b_plus' | 'unicorn';
export type FounderRole = 'ceo' | 'cto' | 'coo' | 'cfo' | 'cpo' | 'founder' | 'co_founder';

export interface Startup {
	id: string;
	slug?: string | null;
	name: string;
	tagline?: string | null;
	logo?: string | null;
	coverImage?: string | null;
	pitch?: string | null;
	description?: string | null;
	foundedDate?: string | null;
	stage?: StartupStage | null;
	status: StartupStatus;
	fundingRound?: FundingRound | null;
	fundsRaised?: number | string | null;
	fundingGoal?: number | string | null;
	fundingCurrency?: string | null;
	investors?: string[] | null;
	primaryContactEmail?: string | null;
	location?: string | null;
	city?: string | null;
	country?: string | null;
	oneLiner?: string | null;
	website?: string | null;
	linkedin?: string | null;
	twitter?: string | null;
	instagram?: string | null;
	pitchDeckUrl?: string | null;
	demoVideoUrl?: string | null;
	industry?: string | null;
	sectors?: SectorFocus[] | null;
	sdgFocus?: SDGFocus[] | null;
	teamSize?: number | null;
	employeeCount?: string | null;
	highlights?: string[] | null;
	mediaFeatures?: { title: string; url: string; source: string }[] | null;
	institutionId?: string | null;
	ownerId?: string | null;
	programs?: { id: string; name: string; type: string; description?: string | null; isActive?: boolean }[] | null;
	profileViews?: number;
	investorInterestCount?: number;
	searchAppearances?: number;
	investorInterestRecorded?: boolean;
	createdAt?: string;
	updatedAt?: string;

	// Pitch sections (nested from API)
	pitchAbout?: PitchAbout | null;
	pitchCompetitors?: PitchCompetitor[];
	pitchCustomers?: PitchCustomer[];
	pitchBusinessModels?: PitchBusinessModelItem[];
	pitchMarketSizes?: PitchMarketSizeItem[];
	pitchVisionStrategies?: PitchVisionStrategyItem[];
	pitchImpacts?: PitchImpactItem[];
	pitchCertifications?: PitchCertificationItem[];
	pitchCustomSections?: PitchCustomSection[];
}

// ── Pitch Section Types ──────────────────────────────
export interface PitchAbout {
	id?: string;
	about?: string | null;
	problemStatement?: string | null;
	solutionProposed?: string | null;
}

export interface PitchCompetitor {
	id?: string;
	name: string;
	description?: string | null;
	logo?: string | null;
	website?: string | null;
	position?: number;
}

export interface PitchCustomer {
	id?: string;
	name: string;
	role?: string | null;
	company?: string | null;
	testimonial: string;
	avatar?: string | null;
	position?: number;
}

export interface PitchBusinessModelItem {
	id?: string;
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	position?: number;
}

export interface PitchMarketSizeItem {
	id?: string;
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	position?: number;
}

export interface PitchVisionStrategyItem {
	id?: string;
	title: string;
	description?: string | null;
	icon?: string | null;
	position?: number;
}

export interface PitchImpactItem {
	id?: string;
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	position?: number;
}

export interface PitchCertificationItem {
	id?: string;
	title: string;
	issuer?: string | null;
	dateAwarded?: string | null;
	imageUrl?: string | null;
	position?: number;
}

export interface PitchCustomSectionItem {
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	position?: number;
}

export interface PitchCustomSection {
	id?: string;
	title: string;
	shortDescription?: string | null;
	items: PitchCustomSectionItem[];
	position?: number;
}

export interface StartupPitchData {
	about?: PitchAbout | null;
	competitors?: PitchCompetitor[];
	customers?: PitchCustomer[];
	businessModels?: PitchBusinessModelItem[];
	marketSizes?: PitchMarketSizeItem[];
	visionStrategies?: PitchVisionStrategyItem[];
	impacts?: PitchImpactItem[];
	certifications?: PitchCertificationItem[];
	customSections?: PitchCustomSection[];
}

export interface StartupFounder {
	id: string;
	startupId: string;
	userId?: string;
	name: string;
	email?: string;
	role: FounderRole;
	title?: string;
	avatar?: string | null;
	bio?: string | null;
	isPrimary: boolean;
	user?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface StartupTeamMember {
	id: string;
	userId?: string;
	startupId: string;
	role: string;
	name?: string;
	email?: string;
	title?: string;
	avatar?: string | null;
	bio?: string | null;
	user?: {
		id: string;
		name: string;
		email: string;
	} | null;
}
