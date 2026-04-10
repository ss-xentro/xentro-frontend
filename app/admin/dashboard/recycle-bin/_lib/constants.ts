export interface RecycleBinUser {
	id: string;
	name: string;
	email: string;
	avatar: string | null;
	accountType: string;
	deletedAt: string;
	daysRemaining: number;
}

export const accountTypeLabels: Record<string, string> = {
	founder: 'Founder',
	institution_admin: 'Institution Admin',
	mentor: 'Mentor',
	investor: 'Investor',
	explorer: 'Explorer',
	admin: 'Admin',
	approver: 'Approver',
};

export const accountTypeColors: Record<string, string> = {
	founder: 'bg-blue-500/20 text-blue-600 dark:text-blue-200',
	institution_admin: 'bg-purple-500/20 text-purple-600 dark:text-purple-200',
	mentor: 'bg-green-500/20 text-green-600 dark:text-green-200',
	investor: 'bg-amber-500/20 text-amber-600 dark:text-amber-200',
	explorer: 'bg-(--accent-light) text-(--primary-light)',
	admin: 'bg-red-500/20 text-red-600 dark:text-red-200',
	approver: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-200',
};
