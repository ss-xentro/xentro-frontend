export interface ConnectionRequest {
	id: string;
	mentor: string;
	requester: string;
	requester_name: string;
	mentor_user_name: string;
	mentor_user_email: string;
	message: string;
	status: string;
	created_at: string;
	responded_at: string | null;
}

export interface Booking {
	id: string;
	mentor_user: string;
	mentorName: string | null;
	menteeName: string | null;
	scheduledDate: string;
	slotDay: string | null;
	slotStart: string | null;
	slotEnd: string | null;
	status: string;
	notes: string | null;
	created_at: string;
}

export const STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
	pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' },
	accepted: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Connected' },
	rejected: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Declined' },
};

export const BOOKING_STATUS_BADGE: Record<string, { bg: string; text: string; label: string }> = {
	pending: { bg: 'bg-amber-500/10', text: 'text-amber-400', label: 'Pending' },
	confirmed: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', label: 'Confirmed' },
	cancelled: { bg: 'bg-red-500/10', text: 'text-red-400', label: 'Cancelled' },
	completed: { bg: 'bg-blue-500/10', text: 'text-blue-400', label: 'Completed' },
};

export const CONNECTION_FILTERS = ['all', 'pending', 'accepted', 'rejected'] as const;
export type ConnectionFilter = (typeof CONNECTION_FILTERS)[number];
