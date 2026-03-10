// ========================================
// Institution Types
// ========================================

import type { OperatingMode, SDGFocus, SectorFocus } from './common';

export type InstitutionType = 'incubator' | 'accelerator' | 'university' | 'vc' | 'csr' | string;

export type InstitutionStatus = 'draft' | 'published' | 'archived' | 'pending';

export type InstitutionRole = 'admin' | 'manager' | 'ambassador' | 'viewer';

export type InstitutionApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface LegalDocument {
	url: string;
	name: string;
}

export interface Institution {
	id: string;
	slug: string;
	name: string;
	type: InstitutionType;
	tagline?: string | null;
	city?: string | null;
	country?: string | null;
	countryCode?: string | null;
	operatingMode?: OperatingMode | null;
	startupsSupported: number;
	studentsMentored: number;
	fundingFacilitated: number;
	fundingCurrency?: string | null;
	sdgFocus?: SDGFocus[];
	sectorFocus?: SectorFocus[];
	logo?: string | null;
	website?: string | null;
	linkedin?: string | null;
	email?: string | null;
	phone?: string | null;
	description?: string | null;
	legalDocuments?: LegalDocument[] | string[] | null;
	status: InstitutionStatus;
	verified: boolean;
	profileViews?: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface InstitutionMember {
	id: string;
	institutionId: string;
	userId: string;
	role: InstitutionRole;
	invitedAt: string;
	acceptedAt?: string | null;
	managerApproved: boolean;
	adminApproved: boolean;
	isActive: boolean;
	user?: {
		id: string;
		name: string;
		email: string;
	};
}

export interface InstitutionApplication {
	id: string;
	name: string;
	email: string;
	type: InstitutionType;
	tagline?: string | null;
	city?: string | null;
	country?: string | null;
	countryCode?: string | null;
	operatingMode?: OperatingMode | null;
	startupsSupported?: number | null;
	studentsMentored?: number | null;
	fundingFacilitated?: number | string | null;
	fundingCurrency?: string | null;
	sdgFocus?: SDGFocus[] | null;
	sectorFocus?: SectorFocus[] | null;
	website?: string | null;
	linkedin?: string | null;
	phone?: string | null;
	description?: string | null;
	logo?: string | null;
	legalDocuments?: LegalDocument[] | string[] | null;
	status: InstitutionApplicationStatus;
	remark?: string | null;
	verified: boolean;
	verificationToken?: string | null;
	institutionId?: string | null;
	applicantUserId?: string | null;
	createdAt?: string;
	updatedAt?: string;
}

export interface Program {
	id: string;
	institutionId: string;
	name: string;
	description?: string | null;
	duration?: string | null;
	type: string;
	isActive: boolean;
	startDate?: string | null;
	endDate?: string | null;
}

export interface Event {
	id: string;
	institutionId?: string;
	name: string;
	description?: string | null;
	date?: string;
	startTime?: string | null;
	location?: string | null;
	type?: string;
	price?: number | null;
	approved?: boolean;
}

export interface OnboardingFormData {
	type: InstitutionType | null;
	name: string;
	tagline: string;
	city: string;
	country: string;
	countryCode: string;
	operatingMode: OperatingMode | null;
	startupsSupported: number;
	studentsMentored: number;
	fundingFacilitated: number;
	fundingCurrency: string;
	sdgFocus: SDGFocus[];
	sectorFocus: SectorFocus[];
	logo: string | null;
	website: string;
	linkedin: string;
	email: string;
	phone: string;
	description: string;
	legalDocuments: LegalDocument[];
}
