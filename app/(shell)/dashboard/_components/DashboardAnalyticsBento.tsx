'use client';

import { Card } from '@/components/ui/Card';
import type { ActivityLog, StartupData } from './types';

interface MetricCardProps {
	title: string;
	value: number | string;
	description: string;
	className?: string;
}

function MetricCard({ title, value, description, className = '' }: MetricCardProps) {
	return (
		<Card className={`p-5 ${className}`}>
			<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">{title}</p>
			<p className="mt-2 text-3xl font-semibold text-(--primary) tabular-nums">{value}</p>
			<p className="mt-2 text-sm text-(--secondary)">{description}</p>
		</Card>
	);
}

function countByAction(logs: ActivityLog[], matcher: (action: string) => boolean) {
	return logs.reduce((count, log) => {
		const action = (log.action || '').toLowerCase();
		return matcher(action) ? count + 1 : count;
	}, 0);
}

function calculateProfileCompleteness(startup: StartupData) {
	const checkpoints = [
		Boolean(startup.name?.trim()),
		Boolean(startup.tagline?.trim()),
		Boolean(startup.logo),
		Boolean(startup.stage),
		Boolean(startup.fundingRound),
		Boolean(startup.primaryContactEmail?.trim()),
	];
	const completed = checkpoints.filter(Boolean).length;
	return Math.round((completed / checkpoints.length) * 100);
}

function getEngagementBars(profileViews: number, investorInterest: number, searchAppearances: number) {
	const values = [
		{ key: 'Profile Views', value: profileViews },
		{ key: 'Investor Interest', value: investorInterest },
		{ key: 'Search Appearances', value: searchAppearances },
	];
	const max = Math.max(...values.map((item) => item.value), 1);
	return values.map((item) => ({ ...item, width: `${Math.max(10, Math.round((item.value / max) * 100))}%` }));
}

export function DashboardAnalyticsBento({ startup, logs }: { startup: StartupData; logs: ActivityLog[] }) {
	const profileViews = countByAction(logs, (action) => action.includes('view'));
	const investorInterest = countByAction(logs, (action) => action.includes('investor') || action.includes('interest'));
	const searchAppearances = countByAction(logs, (action) => action.includes('search'));
	const profileUpdates = countByAction(logs, (action) => action.includes('updated') || action.includes('edit'));
	const pitchUpdates = countByAction(logs, (action) => action.includes('pitch'));

	const teamSize = (startup.founders?.length || 0) + (startup.teamMembers?.length || 0);
	const profileCompleteness = calculateProfileCompleteness(startup);
	const engagementBars = getEngagementBars(profileViews, investorInterest, searchAppearances);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
			<MetricCard
				title="Profile Views"
				value={profileViews}
				description="Views captured from tracked dashboard activity events."
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Investors Interested"
				value={investorInterest}
				description="Signals from investor and interest-related interactions."
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Search Appearances"
				value={searchAppearances}
				description="How often your startup surfaced in search-related events."
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Profile Completeness"
				value={`${profileCompleteness}%`}
				description="Coverage across core startup profile fields."
				className="xl:col-span-3"
			/>

			<Card className="p-6 md:col-span-2 xl:col-span-7">
				<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">Engagement Breakdown</p>
				<h3 className="mt-2 text-xl font-semibold text-(--primary)">How people discover and interact with you</h3>
				<div className="mt-6 space-y-4">
					{engagementBars.map((bar) => (
						<div key={bar.key}>
							<div className="flex items-center justify-between mb-1.5">
								<p className="text-sm text-(--primary)">{bar.key}</p>
								<p className="text-sm tabular-nums text-(--secondary)">{bar.value}</p>
							</div>
							<div className="h-2.5 rounded-full bg-(--surface-hover)">
								<div className="h-2.5 rounded-full bg-accent transition-all duration-500" style={{ width: bar.width }} />
							</div>
						</div>
					))}
				</div>
			</Card>

			<Card className="p-6 xl:col-span-5">
				<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">Overview Insights</p>
				<h3 className="mt-2 text-xl font-semibold text-(--primary)">Operational pulse</h3>
				<div className="mt-5 space-y-3">
					<div className="rounded-lg border border-(--border) p-3 bg-(--surface)">
						<p className="text-xs uppercase tracking-wide text-(--secondary)">Team Size</p>
						<p className="mt-1 text-lg font-semibold text-(--primary) tabular-nums">{teamSize}</p>
					</div>
					<div className="rounded-lg border border-(--border) p-3 bg-(--surface)">
						<p className="text-xs uppercase tracking-wide text-(--secondary)">Profile Updates</p>
						<p className="mt-1 text-lg font-semibold text-(--primary) tabular-nums">{profileUpdates}</p>
					</div>
					<div className="rounded-lg border border-(--border) p-3 bg-(--surface)">
						<p className="text-xs uppercase tracking-wide text-(--secondary)">Pitch Iterations</p>
						<p className="mt-1 text-lg font-semibold text-(--primary) tabular-nums">{pitchUpdates}</p>
					</div>
				</div>
			</Card>
		</div>
	);
}
