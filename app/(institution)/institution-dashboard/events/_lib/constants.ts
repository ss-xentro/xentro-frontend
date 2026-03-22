export interface EventItem {
	id: string;
	name: string;
	description: string | null;
	location: string | null;
	type: string | null;
	audienceTypes?: string[];
	startupStages?: string[];
	domain?: string | null;
	mode?: string | null;
	city?: string | null;
	state?: string | null;
	country?: string | null;
	pricingType?: string | null;
	organizerType?: string | null;
	benefits?: string[];
	difficultyLevel?: string | null;
	applicationRequirement?: string | null;
	availabilityStatus?: string | null;
	averageRating?: number | null;
	startTime: string | null;
	endTime: string | null;
	price: number | null;
	isVirtual: boolean;
	maxAttendees: number | null;
	status?: 'draft' | 'published' | 'cancelled';
	coverImage?: string | null;
	gallery?: string[];
	speakerLineup?: unknown[];
	agendaTimeline?: unknown[];
	recurrenceRule?: Record<string, unknown> | null;
	ticketTypes?: unknown[];
	cancellationCutoffHours?: number;
	attendeeCount: number;
	approved: boolean;
	createdAt: string;
}

export type ModalMode = 'create' | 'edit' | null;

export interface EventFormData {
	name: string;
	description: string;
	location: string;
	type: string;
	audienceTypes: string;
	startupStages: string;
	domain: string;
	mode: string;
	city: string;
	state: string;
	country: string;
	pricingType: string;
	organizerType: string;
	benefits: string;
	difficultyLevel: string;
	applicationRequirement: string;
	availabilityStatus: string;
	averageRating: string;
	startTime: string;
	endTime: string;
	price: string;
	isVirtual: boolean;
	maxAttendees: string;
	status: 'draft' | 'published' | 'cancelled';
	coverImage: string;
	coverImageFile?: File | null;
	speakerLineupJson: string;
	agendaTimelineJson: string;
	ticketTypesJson: string;
	cancellationCutoffHours: string;
}

export const EMPTY_FORM: EventFormData = {
	name: '',
	description: '',
	location: '',
	type: 'workshop',
	audienceTypes: '',
	startupStages: '',
	domain: '',
	mode: 'offline',
	city: '',
	state: '',
	country: '',
	pricingType: 'free',
	organizerType: 'institution',
	benefits: '',
	difficultyLevel: 'beginner',
	applicationRequirement: 'open_entry',
	availabilityStatus: 'open',
	averageRating: '',
	startTime: '',
	endTime: '',
	price: '',
	isVirtual: false,
	maxAttendees: '',
	status: 'published',
	coverImage: '',
	coverImageFile: null,
	speakerLineupJson: '',
	agendaTimelineJson: '',
	ticketTypesJson: '',
	cancellationCutoffHours: '2',
};

function normalizeEntryList(value: unknown, keyPreference: Array<'name' | 'activity' | 'title' | 'label' | 'type'> = ['name', 'activity', 'title', 'label', 'type']): string[] {
	if (!Array.isArray(value)) return [];

	return value
		.map((item) => {
			if (typeof item === 'string') return item.trim();
			if (item && typeof item === 'object') {
				for (const key of keyPreference) {
					const maybe = (item as Record<string, unknown>)[key];
					if (typeof maybe === 'string' && maybe.trim()) {
						return maybe.trim();
					}
				}
			}
			return '';
		})
		.filter(Boolean);
}

export function formatDate(dateStr: string | null) {
	if (!dateStr) return '—';
	return new Date(dateStr).toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	});
}

export function eventToForm(event: EventItem): EventFormData {
	return {
		name: event.name,
		description: event.description || '',
		location: event.location || '',
		type: event.type || '',
		audienceTypes: (event.audienceTypes || []).join('\n'),
		startupStages: (event.startupStages || []).join('\n'),
		domain: event.domain || '',
		mode: event.mode || '',
		city: event.city || '',
		state: event.state || '',
		country: event.country || '',
		pricingType: event.pricingType || 'free',
		organizerType: event.organizerType || 'institution',
		benefits: (event.benefits || []).join('\n'),
		difficultyLevel: event.difficultyLevel || 'beginner',
		applicationRequirement: event.applicationRequirement || 'open_entry',
		availabilityStatus: event.availabilityStatus || 'open',
		averageRating: event.averageRating != null ? String(event.averageRating) : '',
		startTime: event.startTime ? event.startTime.slice(0, 16) : '',
		endTime: event.endTime ? event.endTime.slice(0, 16) : '',
		price: event.price != null ? String(event.price) : '',
		isVirtual: event.isVirtual,
		maxAttendees: event.maxAttendees != null ? String(event.maxAttendees) : '',
		status: event.status || 'published',
		coverImage: event.coverImage || '',
		coverImageFile: null,
		speakerLineupJson: normalizeEntryList(event.speakerLineup, ['name', 'label', 'title']).join('\n'),
		agendaTimelineJson: normalizeEntryList(event.agendaTimeline, ['activity', 'title', 'label', 'name']).join('\n'),
		ticketTypesJson: normalizeEntryList(event.ticketTypes, ['name', 'type', 'label', 'title']).join('\n'),
		cancellationCutoffHours: String(event.cancellationCutoffHours ?? 2),
	};
}

export function parseLines(value: string): string[] {
	if (!value) return [];

	const trimmed = value.trim();
	if (!trimmed) return [];

	if (trimmed.startsWith('[')) {
		try {
			const parsed = JSON.parse(trimmed);
			return normalizeEntryList(parsed);
		} catch {
			// Fall through to line parsing for non-JSON input.
		}
	}

	return value
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => Boolean(line) && line !== '[]' && line !== '{}');
}

export function buildEventPayload(form: EventFormData): Record<string, unknown> {
	const speakerLineup = parseLines(form.speakerLineupJson).map((name) => ({ name }));
	const agendaTimeline = parseLines(form.agendaTimelineJson).map((activity) => ({ activity }));
	const ticketTypes = parseLines(form.ticketTypesJson).map((name) => ({ name }));
	const normalizedMode = (form.mode || '').toLowerCase();
	const isVirtualFromMode = normalizedMode === 'online' || normalizedMode === 'hybrid';

	return {
		name: form.name,
		description: form.description || null,
		location: form.location || null,
		type: form.type || null,
		audience_types: parseLines(form.audienceTypes),
		startup_stages: parseLines(form.startupStages),
		domain: form.domain || null,
		mode: form.mode || null,
		city: form.city || null,
		state: form.state || null,
		country: form.country || null,
		pricing_type: form.pricingType || null,
		organizer_type: form.organizerType || null,
		benefits: parseLines(form.benefits),
		difficulty_level: form.difficultyLevel || null,
		application_requirement: form.applicationRequirement || null,
		availability_status: form.availabilityStatus || null,
		average_rating: form.averageRating ? Number(form.averageRating) : null,
		start_time: form.startTime || null,
		end_time: form.endTime || null,
		price: form.price ? Number(form.price) : null,
		is_virtual: isVirtualFromMode,
		max_attendees: form.maxAttendees ? Number(form.maxAttendees) : null,
		status: form.status,
		cover_image: form.coverImage || null,
		cancellation_cutoff_hours: form.cancellationCutoffHours ? Number(form.cancellationCutoffHours) : 2,
		speaker_lineup: speakerLineup,
		agenda_timeline: agendaTimeline,
		ticket_types: ticketTypes,
	};
}
