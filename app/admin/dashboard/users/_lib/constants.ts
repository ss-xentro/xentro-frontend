export interface UserRecord {
	id: string;
	name: string;
	email: string;
	phone: string | null;
	avatar: string | null;
	accountType: string;
	activeContext: string | null;
	unlockedContexts: string[];
	emailVerified: boolean;
	isActive: boolean;
	isDeleted: boolean;
	deletedAt: string | null;
	lastLoginAt: string | null;
	createdAt: string | null;
}

export const ACCOUNT_TYPES = ['explorer', 'startup', 'mentor', 'investor', 'institution', 'admin', 'approver'];

export const TYPE_COLORS: Record<string, string> = {
	explorer: 'bg-(--accent-light) text-(--primary-light)',
	startup: 'bg-blue-100 text-blue-700',
	mentor: 'bg-green-100 text-green-700',
	investor: 'bg-amber-100 text-amber-700',
	institution: 'bg-purple-100 text-purple-700',
	admin: 'bg-red-100 text-red-700',
	approver: 'bg-teal-100 text-teal-700',
};

export const TABLE_HEADERS = ['User', 'Type', 'Context', 'Verified', 'Status', 'Last Login', 'Joined', 'Actions'] as const;
