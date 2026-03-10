export const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const;

export const DAY_LABELS: Record<string, string> = {
	monday: 'Mon', tuesday: 'Tue', wednesday: 'Wed', thursday: 'Thu',
	friday: 'Fri', saturday: 'Sat', sunday: 'Sun',
};

export const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM - 8 PM

export interface Slot {
	id: string;
	day_of_week: string;
	start_time: string;
	end_time: string;
	is_active: boolean;
}

export interface Booking {
	id: string;
	scheduled_date: string;
	status: string;
	notes: string;
	mentee_user?: { id: string; name: string; email: string; avatar?: string };
	slot?: { id: string; day_of_week: string; start_time: string; end_time: string };
}

export const STATUS_COLORS: Record<string, string> = {
	pending: 'bg-amber-100 text-amber-800 border-amber-200',
	confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
	completed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
	cancelled: 'bg-red-100 text-red-800 border-red-200',
	no_show: 'bg-gray-100 text-gray-600 border-gray-200',
};

export function parseTime(t: string): number {
	const [h, m] = t.split(':').map(Number);
	return h + m / 60;
}

export function formatTime(t: string): string {
	const [h, m] = t.split(':');
	const hour = parseInt(h, 10);
	const ampm = hour >= 12 ? 'PM' : 'AM';
	const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
	return `${h12}:${m} ${ampm}`;
}

export function getWeekDates(baseDate: Date): Record<string, Date> {
	const day = baseDate.getDay();
	const monday = new Date(baseDate);
	monday.setDate(baseDate.getDate() - ((day + 6) % 7));
	const result: Record<string, Date> = {};
	DAYS.forEach((d, i) => {
		const date = new Date(monday);
		date.setDate(monday.getDate() + i);
		result[d] = date;
	});
	return result;
}
