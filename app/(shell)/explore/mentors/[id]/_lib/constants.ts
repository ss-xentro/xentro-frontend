export interface MentorDetail {
	id: string;
	userId?: string | null;
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
	pricingPlans?: Array<{
		sessionType?: string;
		duration?: string;
		price?: string | number;
		perks?: string[];
	}>;
	availability?: Record<string, string[]> | null;
	documents?: Array<{ name?: string; url?: string; type?: string }>;
	institutionId?: string | null;
	institutionName?: string | null;
	institutionLogo?: string | null;
	about?: string | null;
	experience?: Array<{ title: string; company: string; startDate?: string; endDate?: string; description?: string; logo?: string }>;
	education?: Array<{ school: string; degree?: string; field?: string; startDate?: string; endDate?: string; logo?: string }>;
	certifications?: Array<{ name: string; organization?: string; issueDate?: string; url?: string }>;
	skills?: string[];
	honorsAwards?: Array<{ title: string; issuer?: string; date?: string; description?: string }>;
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

function escapeHtml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function sanitizeRichHtml(input: string): string {
	return input
		.replace(/<(script|style|iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
		.replace(/\son\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
		.replace(/\sstyle=("[^"]*"|'[^']*')/gi, '')
		.replace(/\sclass=("[^"]*"|'[^']*')/gi, '')
		.replace(/javascript:/gi, '')
		.replace(/&nbsp;/gi, ' ')
		.trim();
}

function toRichHtml(input: string): string {
	const trimmed = input.trim();
	if (!trimmed) return '';
	const sanitized = sanitizeRichHtml(trimmed);
	if (!sanitized) return '';
	if (/<[a-z][\s\S]*>/i.test(sanitized)) return sanitized;
	return `<p>${escapeHtml(sanitized)}</p>`;
}

function parseArr(v: unknown): string[] {
	const normalize = (input: string): string => toRichHtml(input);

	if (Array.isArray(v)) {
		return v.map((item) => normalize(String(item))).filter(Boolean);
	}

	if (typeof v === 'string') {
		const raw = v.trim();
		if (!raw) return [];

		try {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed.map((item) => normalize(String(item))).filter(Boolean);
			}
		} catch {
			// fall through to delimiter parsing
		}

		return raw
			.split(/\n{2,}|;+/)
			.map((s) => normalize(s))
			.filter(Boolean);
	}

	return [];
}

function parsePackageItems(v: unknown): string[] {
	const stripHtml = (s: string) =>
		s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/\s+/g, ' ').trim();

	const fromObject = (obj: Record<string, unknown>): string | null => {
		const title = typeof obj.title === 'string' ? stripHtml(obj.title) : '';
		const name = typeof obj.name === 'string' ? stripHtml(obj.name) : '';
		const sessionType = typeof obj.sessionType === 'string' ? stripHtml(obj.sessionType) : '';
		const duration = typeof obj.duration === 'string' ? stripHtml(obj.duration) : '';
		const price = typeof obj.price === 'string' || typeof obj.price === 'number' ? String(obj.price).trim() : '';
		const perks = Array.isArray(obj.perks)
			? obj.perks.map((item) => stripHtml(String(item))).filter(Boolean).join(', ')
			: '';

		const primary = title || name || sessionType;
		const meta = [duration, price].filter(Boolean).join(' · ');
		const summary = [primary, meta].filter(Boolean).join(' - ');

		if (summary) return toRichHtml(perks ? `${summary}: ${perks}` : summary);
		if (perks) return toRichHtml(perks);
		return null;
	};

	if (Array.isArray(v)) {
		return v
			.flatMap((item) => {
				if (typeof item === 'string') return [toRichHtml(item)];
				if (item && typeof item === 'object') {
					const parsed = fromObject(item as Record<string, unknown>);
					return parsed ? [parsed] : [];
				}
				return [];
			})
			.filter(Boolean);
	}

	if (typeof v === 'string') {
		const raw = v.trim();
		if (!raw) return [];

		try {
			const parsed = JSON.parse(raw);
			return parsePackageItems(parsed);
		} catch {
			// keep text parsing fallback
		}

		const primary = raw
			.split(/\n{1,}|;+/)
			.map((item) => toRichHtml(item))
			.filter(Boolean);

		if (primary.length <= 1 && raw.includes(',')) {
			return raw
				.split(',')
				.map((item) => toRichHtml(item))
				.filter(Boolean);
		}

		return primary;
	}

	if (v && typeof v === 'object') {
		const parsed = fromObject(v as Record<string, unknown>);
		return parsed ? [parsed] : [];
	}

	return [];
}

function parseAvailability(v: unknown): Record<string, string[]> | null {
	if (!v) return null;

	if (typeof v === 'string') {
		const raw = v.trim();
		if (!raw) return null;
		try {
			const parsed = JSON.parse(raw);
			return parseAvailability(parsed);
		} catch {
			return null;
		}
	}

	if (Array.isArray(v)) {
		const mapped: Record<string, string[]> = {};
		for (const item of v) {
			if (!item || typeof item !== 'object') continue;
			const record = item as Record<string, unknown>;
			const dayRaw = record.day || record.dayOfWeek || record.day_of_week;
			const day = typeof dayRaw === 'string' ? dayRaw.toLowerCase().trim() : '';
			const start = typeof record.startTime === 'string' ? record.startTime : typeof record.start_time === 'string' ? record.start_time : '';
			const end = typeof record.endTime === 'string' ? record.endTime : typeof record.end_time === 'string' ? record.end_time : '';
			if (!day || !start || !end) continue;
			if (!mapped[day]) mapped[day] = [];
			mapped[day].push(`${start}-${end}`);
		}
		return Object.keys(mapped).length > 0 ? mapped : null;
	}

	if (v && typeof v === 'object') {
		const source = v as Record<string, unknown>;
		const mapped: Record<string, string[]> = {};
		for (const [day, slots] of Object.entries(source)) {
			if (Array.isArray(slots)) {
				const clean = slots.map((slot) => String(slot).trim()).filter(Boolean);
				if (clean.length > 0) mapped[day.toLowerCase()] = clean;
			}
		}
		return Object.keys(mapped).length > 0 ? mapped : null;
	}

	return null;
}

function parsePricingPlans(v: unknown): MentorDetail['pricingPlans'] {
	if (!v) return [];

	if (typeof v === 'string') {
		const raw = v.trim();
		if (!raw) return [];
		try {
			const parsed = JSON.parse(raw);
			return parsePricingPlans(parsed);
		} catch {
			return [];
		}
	}

	if (!Array.isArray(v)) return [];

	return v
		.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
		.map((item) => ({
			sessionType: typeof item.sessionType === 'string' ? item.sessionType : undefined,
			duration: typeof item.duration === 'string' ? item.duration : undefined,
			price: typeof item.price === 'string' || typeof item.price === 'number' ? item.price : undefined,
			perks: Array.isArray(item.perks) ? item.perks.map((perk) => String(perk).trim()).filter(Boolean) : [],
		}))
		.filter((plan) => !!(plan.sessionType || plan.duration || plan.price || (plan.perks && plan.perks.length > 0)));
}

function parseExpertise(v: unknown): string[] {
	if (typeof v === 'string') return v.split(',').map((s: string) => s.trim()).filter(Boolean);
	if (Array.isArray(v)) return v as string[];
	return [];
}

export function parseMentorData(found: Record<string, unknown>): MentorDetail {
	const userField = found.user;
	const nestedUserId = userField && typeof userField === 'object' && 'id' in userField
		? String((userField as { id?: unknown }).id || '')
		: '';

	return {
		id: found.id as string,
		userId: nestedUserId || (found.user as string) || (found.user_id as string) || (found.userId as string) || null,
		name: (found.user_name || found.name || 'Mentor') as string,
		occupation: (found.occupation || found.role_title || '') as string,
		expertise: parseExpertise(found.expertise),
		avatar: (found.avatar as string) || null,
		verified: !!found.verified,
		status: (found.status as string) || 'approved',
		rate: found.rate ? Number(found.rate) : null,
		pricingPerHour: found.pricing_per_hour ? Number(found.pricing_per_hour) : null,
		achievements: parseArr(found.achievements),
		packages: parsePackageItems(found.packages),
		pricingPlans: parsePricingPlans(found.pricing_plans),
		availability: parseAvailability(found.availability),
		documents: Array.isArray(found.documents) ? found.documents as MentorDetail['documents'] : [],
		institutionId: (found.institutionId as string) || null,
		institutionName: (found.institutionName as string) || null,
		institutionLogo: (found.institutionLogo as string) || null,
		about: (found.about as string) || null,
		experience: Array.isArray(found.experience) ? found.experience as MentorDetail['experience'] : [],
		education: Array.isArray(found.education) ? found.education as MentorDetail['education'] : [],
		certifications: Array.isArray(found.certifications) ? found.certifications as MentorDetail['certifications'] : [],
		skills: Array.isArray(found.skills) ? (found.skills as string[]) : [],
		honorsAwards: Array.isArray(found.honors_awards) ? found.honors_awards as MentorDetail['honorsAwards'] : [],
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
			return { label: 'Book Session', disabled: false, className: 'bg-(--primary) text-(--background) hover:opacity-90 border-(--border-hover)' };
		case 'accepted':
			return { label: 'Book a Session', disabled: false, className: 'bg-(--primary) text-(--background) hover:opacity-90 border-(--border-hover)' };
		case 'rejected':
			return { label: 'Book Session', disabled: false, className: 'bg-(--primary) text-(--background) hover:opacity-90 border-(--border-hover)' };
		default:
			return { label: 'Book Session', disabled: false, className: 'bg-(--primary) text-(--background) hover:opacity-90' };
	}
}
