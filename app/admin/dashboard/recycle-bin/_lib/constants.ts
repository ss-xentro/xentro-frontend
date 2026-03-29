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
	founder: 'bg-blue-100 text-blue-700',
	institution_admin: 'bg-purple-100 text-purple-700',
	mentor: 'bg-green-100 text-green-700',
	investor: 'bg-amber-100 text-amber-700',
	explorer: 'bg-(--accent-light) text-(--primary-light)',
	admin: 'bg-red-100 text-red-700',
	approver: 'bg-indigo-100 text-indigo-700',
};
