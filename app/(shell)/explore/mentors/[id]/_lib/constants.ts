export interface MentorDetail {
	id: string;
	name: string;
	occupation: string;
	expertise: string[];
	avatar?: string | null;
	verified: boolean;
	status: string;
	rate?: number | null;
	pricingPerHour?: number | null;
	achievements: string[];
	packages: string[];
	availability?: Record<string, string[]> | null;
	documents?: Array<{ name?: string; url?: string; type?: string }>;
	institutionId?: string | null;
	institutionName?: string | null;
	mentoredStartups: Array<{
		id: string;
		name: string;
		logo?: string | null;
		institutionId?: string | null;
		institutionName?: string | null;
		isExternalInstitution?: boolean;
	}>;
}

export interface MentorSlot {
	id: string;
	dayOfWeek: string;
	startTime: string;
	endTime: string;
	isActive: boolean;
}

function parseArr(v: unknown): string[] {
	const sanitize = (input: string): string =>
		input
			.replace(/<[^>]*>/g, ' ')
			.replace(/&nbsp;/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

	if (Array.isArray(v)) {
		return v.map((item) => sanitize(String(item))).filter(Boolean);
	}

	if (typeof v === 'string') {
		const raw = v.trim();
		if (!raw) return [];

		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.map((item) => sanitize(String(item))).filter(Boolean);
			}
		} catch {
			// fall through to delimiter parsing
		}

		return raw
			.split(/\n{2,}|;+/)
			.map((s) => sanitize(s))
			.filter(Boolean);
	}

	return [];
}

function parseExpertise(v: unknown): string[] {
	if (typeof v === 'string') return v.split(',').map((s: string) => s.trim()).filter(Boolean);
	if (Array.isArray(v)) return v as string[];
	return [];
}

export function parseMentorData(found: Record<string, unknown>): MentorDetail {
	return {
		id: found.id as string,
		name: (found.user_name || found.name || 'Mentor') as string,
		occupation: (found.occupation || found.role_title || '') as string,
		expertise: parseExpertise(found.expertise),
		avatar: (found.avatar as string) || null,
		verified: !!found.verified,
		status: (found.status as string) || 'approved',
		rate: found.rate ? Number(found.rate) : null,
		pricingPerHour: found.pricing_per_hour ? Number(found.pricing_per_hour) : null,
		achievements: parseArr(found.achievements),
		packages: parseArr(found.packages),
		availability: (found.availability as Record<string, string[]>) || null,
		documents: Array.isArray(found.documents) ? found.documents as MentorDetail['documents'] : [],
		institutionId: (found.institutionId as string) || null,
		institutionName: (found.institutionName as string) || null,
		mentoredStartups: Array.isArray(found.mentored_startups)
			? (found.mentored_startups as MentorDetail['mentoredStartups'])
			: [],
	};
}

export interface ConnectBtnConfig {
	label: string;
	disabled: boolean;
	className: string;
}

export function getConnectBtnConfig(status: string | null): ConnectBtnConfig {
	switch (status) {
		case 'pending':
			return { label: 'Book Session', disabled: false, className: 'bg-white text-[#0B0D10] hover:bg-white/90 border-white/20' };
		case 'accepted':
			return { label: 'Book a Session', disabled: false, className: 'bg-white text-[#0B0D10] hover:bg-white/90 border-white/20' };
		case 'rejected':
			return { label: 'Book Session', disabled: false, className: 'bg-white text-[#0B0D10] hover:bg-white/90 border-white/20' };
		default:
			return { label: 'Book Session', disabled: false, className: 'bg-white text-[#0B0D10] hover:bg-white/90' };
	}
}
