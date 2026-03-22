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
	speakerLineupJson: '[]',
	agendaTimelineJson: '[]',
	ticketTypesJson: '[]',
	cancellationCutoffHours: '2',
};

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
		speakerLineupJson: JSON.stringify(event.speakerLineup || [], null, 2),
		agendaTimelineJson: JSON.stringify(event.agendaTimeline || [], null, 2),
		ticketTypesJson: JSON.stringify(event.ticketTypes || [], null, 2),
		cancellationCutoffHours: String(event.cancellationCutoffHours ?? 2),
	};
}
