'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui';
import { FeedbackBanner } from '@/components/ui/FeedbackBanner';
import { Institution } from '@/lib/types';
import { formatNumber, formatCurrency } from '@/lib/utils';

interface AnalyticsData {
	totalInstitutions: number;
	totalStartups: number;
	totalMentors: number;
	totalInvestors: number;
	pendingApprovals: number;
	startupsSupported: number;
	studentsMentored: number;
	fundingFacilitated: number;
}

export default function AnalyticsPage() {
	const [institutions, setInstitutions] = useState<Institution[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const controller = new AbortController();
		async function load() {
			try {
				setLoading(true);
				const [instRes, appsRes] = await Promise.all([
					fetch('/api/institutions', { signal: controller.signal }),
					fetch('/api/institution-applications', { signal: controller.signal }),
				]);
				const instData = await instRes.json();
				setInstitutions(instData.data ?? []);
				setError(null);
			} catch (err) {
				if ((err as Error).name !== 'AbortError') {
					setError((err as Error).message);
				}
			} finally {
				setLoading(false);
			}
		}
		load();
		return () => controller.abort();
	}, []);

	const stats: AnalyticsData = useMemo(() => {
		return institutions.reduce<AnalyticsData>(
			(acc, item) => {
				acc.totalInstitutions++;
				acc.startupsSupported += item.startupsSupported ?? 0;
				acc.studentsMentored += item.studentsMentored ?? 0;
				acc.fundingFacilitated += Number(item.fundingFacilitated ?? 0);
				return acc;
			},
			{
				totalInstitutions: 0,
				totalStartups: 0,
				totalMentors: 0,
				totalInvestors: 0,
				pendingApprovals: 0,
				startupsSupported: 0,
				studentsMentored: 0,
				fundingFacilitated: 0,
			}
		);
	}, [institutions]);

	if (loading) {
		return (
			<div className="space-y-6">
				<h1 className="text-2xl font-bold text-(--primary)">Analytics</h1>
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
					{Array.from({ length: 4 }).map((_, i) => (
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

	const cards = [
		{ label: 'Total Institutions', value: formatNumber(stats.totalInstitutions), color: 'text-blue-600' },
		{ label: 'Startups Supported', value: formatNumber(stats.startupsSupported), color: 'text-green-600' },
		{ label: 'Students Mentored', value: formatNumber(stats.studentsMentored), color: 'text-purple-600' },
		{ label: 'Funding Facilitated', value: formatCurrency(stats.fundingFacilitated), color: 'text-amber-600' },
	];

	return (
		<div className="space-y-8">
			<div>
				<h1 className="text-2xl font-bold text-(--primary)">Analytics</h1>
				<p className="text-(--secondary-light) mt-1">Platform overview and key metrics</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{cards.map((card) => (
					<Card key={card.label} className="p-6">
						<p className="text-sm text-(--secondary-light) mb-1">{card.label}</p>
						<p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
					</Card>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<Card className="p-6">
					<h2 className="text-lg font-semibold text-(--primary) mb-4">Institutions by Status</h2>
					<div className="space-y-3">
						{(['draft', 'pending', 'approved', 'active'] as const).map((status) => {
							const count = institutions.filter((i) => i.status === status).length;
							const pct = institutions.length ? Math.round((count / institutions.length) * 100) : 0;
							return (
								<div key={status} className="flex items-center gap-3">
									<span className="text-sm text-(--secondary-light) capitalize w-20">{status}</span>
									<div className="flex-1 bg-(--accent-light) rounded-full h-2.5">
										<div
											className="h-2.5 rounded-full bg-blue-600"
											style={{ width: `${pct}%` }}
										/>
									</div>
									<span className="text-sm font-medium text-(--primary) w-10 text-right">{count}</span>
								</div>
							);
						})}
					</div>
				</Card>

				<Card className="p-6">
					<h2 className="text-lg font-semibold text-(--primary) mb-4">Recent Institutions</h2>
					{institutions.length === 0 ? (
						<p className="text-(--secondary-light) text-sm">No institutions yet.</p>
					) : (
						<div className="space-y-3">
							{institutions.slice(0, 5).map((inst) => (
								<div key={inst.id} className="flex items-center justify-between py-2 border-b border-(--border-light) last:border-0">
									<div>
										<p className="text-sm font-medium text-(--primary)">{inst.name}</p>
										<p className="text-xs text-(--secondary-light)">{inst.type} · {inst.city ?? 'N/A'}</p>
									</div>
									<span className={`text-xs px-2 py-0.5 rounded-full capitalize ${inst.status === 'published' ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-200' :
										inst.status === 'pending' ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-200' :
											'bg-(--accent-light) text-(--secondary-light)'
										}`}>
										{inst.status}
									</span>
								</div>
							))}
						</div>
					)}
				</Card>
			</div>
		</div>
	);
}
