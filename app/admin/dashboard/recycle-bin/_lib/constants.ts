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
	founder: 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-200',
	institution_admin: 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200',
	mentor: 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200',
	investor: 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-200',
	explorer: 'bg-(--accent-light) text-(--primary-light)',
	admin: 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-200',
	approver: 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-200',
};
