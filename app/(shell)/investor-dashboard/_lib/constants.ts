export interface PortfolioCompany {
	id: string;
	name: string;
	url: string | null;
}

export interface NotableInvestment {
	id: string;
	name: string;
	url: string | null;
	amount: number | null;
}

export interface InvestorProfile {
	id: string;
	userName: string;
	userEmail: string;
	type: string;
	firmName: string | null;
	bio: string | null;
	checkSizeMin: number | null;
	checkSizeMax: number | null;
	currency: string;
	sectors: string[];
	investmentStages: string[];
	portfolioCompanies: PortfolioCompany[];
	notableInvestments: NotableInvestment[];
	dealFlowPreferences: string | null;
	linkedinUrl: string | null;
	status: string;
	createdAt: string;
}

export function formatCurrency(amount: number) {
	if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
	if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
	return `$${amount.toLocaleString()}`;
}

export const STAT_ICONS = {
	sectors: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
	portfolio: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4',
	invested: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
	notable: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
} as const;

export interface StatCardConfig {
	label: string;
	icon: string;
	bgColor: string;
	iconColor: string;
}

export const STAT_CARDS: StatCardConfig[] = [
	{ label: 'Sectors', icon: STAT_ICONS.sectors, bgColor: 'bg-blue-100 dark:bg-blue-500/20', iconColor: 'text-blue-600 dark:text-blue-300' },
	{ label: 'Portfolio Companies', icon: STAT_ICONS.portfolio, bgColor: 'bg-purple-100 dark:bg-purple-500/20', iconColor: 'text-purple-600 dark:text-purple-300' },
	{ label: 'Total Invested', icon: STAT_ICONS.invested, bgColor: 'bg-green-100 dark:bg-green-500/20', iconColor: 'text-green-600 dark:text-green-300' },
	{ label: 'Notable Investments', icon: STAT_ICONS.notable, bgColor: 'bg-amber-100 dark:bg-amber-500/20', iconColor: 'text-amber-600 dark:text-amber-300' },
];
