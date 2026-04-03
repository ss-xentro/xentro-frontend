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
	startup: 'bg-blue-500/20 text-blue-200',
	mentor: 'bg-green-500/20 text-green-200',
	investor: 'bg-amber-500/20 text-amber-200',
	institution: 'bg-purple-500/20 text-purple-200',
	admin: 'bg-red-500/20 text-red-200',
	approver: 'bg-teal-500/20 text-teal-200',
};

export const TABLE_HEADERS = ['User', 'Type', 'Context', 'Verified', 'Status', 'Last Login', 'Joined', 'Actions'] as const;
