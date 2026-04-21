'use client';

import { Card } from '@/components/ui';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { formatNumber } from '@/lib/utils';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface AdminStats {
	totalInstitutions: number;
	totalStartups: number;
	totalMentors: number;
	totalUsers: number;
	pendingApprovals: number;
}

export default function AnalyticsPage() {
	const { data: stats, isLoading: loading, error: queryError } = useApiQuery<AdminStats>(
		queryKeys.admin.analytics(),
		'/api/admin/dashboard/stats/',
		{ requestOptions: { role: 'admin' } },
	);
	const error = queryError?.message ?? null;

	const statCards = stats
		? [
			{ label: 'Total Institutions', value: formatNumber(stats.totalInstitutions), color: 'text-blue-600' },
			{ label: 'Total Startups', value: formatNumber(stats.totalStartups), color: 'text-green-600' },
			{ label: 'Total Mentors', value: formatNumber(stats.totalMentors), color: 'text-purple-600' },
			{ label: 'Total Users', value: formatNumber(stats.totalUsers), color: 'text-amber-600' },
			{ label: 'Pending Approvals', value: formatNumber(stats.pendingApprovals), color: 'text-red-600' },
		]
		: [];

	if (loading) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-(--primary)">Analytics</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
					{Array.from({ length: 5 }).map((_, i) => (
						<Card key={i} className="p-6 animate-pulse">
							<div className="h-4 bg-(--border) rounded w-1/2 mb-3" />
							<div className="h-8 bg-(--border) rounded w-3/4" />
						</Card>
					))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-(--primary)">Analytics</h1>
				<Card className="p-6 text-center"><FeedbackBanner type="error" message={error} /></Card>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-(--primary)">Analytics</h1>
				<p className="text-(--secondary-light) mt-1">Platform overview and key metrics</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
				{statCards.map((card) => (
					<Card key={card.label} className="p-6">
						<p className="text-sm text-(--secondary-light) mb-1">{card.label}</p>
						<p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
					</Card>
				))}
			</div>

			<Card className="p-6 text-center">
				<p className="text-lg font-semibold text-(--primary) mb-2">Full Analytics Coming Soon</p>
				<p className="text-sm text-(--secondary-light)">Detailed charts, trends, and breakdowns are in development.</p>
			</Card>
		</div>
	);
}

