export interface SlotEntry {
	day: string;
	startTime: string;
	endTime: string;
}

export interface DocumentEntry {
	name: string;
	url: string;
	uploadedAt: string;
}

export interface ProfileData {
	achievements: string[] | string;
	packages?: string[] | string;
	pricing_per_hour: string;
	availability: string;
	documents: DocumentEntry[];
	profile_completed: boolean;
	user_name: string;
	user_email: string;
	expertise: string | string[];
	occupation: string;
	status: string;
	avatar?: string;
	cover_photo?: string;
	verified?: boolean;
}

export const DAYS_OF_WEEK = [
	'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday',
];

export const TIME_OPTIONS = [
	'06:00', '06:30', '07:00', '07:30', '08:00', '08:30',
	'09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
	'12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
	'15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
	'18:00', '18:30', '19:00', '19:30', '20:00', '20:30',
	'21:00', '21:30', '22:00',
];
