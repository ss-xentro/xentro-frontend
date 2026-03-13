'use client';

import { Card } from '@/components/ui/Card';
import type { ActivityLog, DashboardAnalytics, StartupData } from './types';

const WINDOW_OPTIONS: Array<7 | 30 | 90> = [7, 30, 90];

function buildPoints(values: number[], width: number, height: number) {
	if (!values.length) return '';
	const max = Math.max(...values, 1);
	const stepX = values.length > 1 ? width / (values.length - 1) : width;
	return values
		.map((value, index) => {
			const x = Number((index * stepX).toFixed(2));
			const y = Number((height - (value / max) * height).toFixed(2));
			return `${x},${y}`;
		})
		.join(' ');
}

function Sparkline({ values, stroke }: { values: number[]; stroke: string }) {
	const width = 120;
	const height = 36;
	const points = buildPoints(values, width, height);
	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="w-full h-9 mt-2" aria-hidden="true">
			<polyline fill="none" stroke={stroke} strokeWidth="2" points={points} strokeLinecap="round" />
		</svg>
	);
}

function TinyMultiLineGraph({
	profile,
	investor,
	search,
}: {
	profile: number[];
	investor: number[];
	search: number[];
}) {
	const width = 460;
	const height = 120;
	const gridLines = [20, 50, 80].map((pct) => (height * pct) / 100);

	return (
		<svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32 rounded-lg bg-(--surface)">
			{gridLines.map((y) => (
				<line key={y} x1="0" y1={y} x2={width} y2={y} stroke="var(--border)" strokeWidth="1" />
			))}
			<polyline
				fill="none"
				stroke="#06b6d4"
				strokeWidth="2"
				points={buildPoints(profile, width, height)}
				strokeLinecap="round"
			/>
			<polyline
				fill="none"
				stroke="#22c55e"
				strokeWidth="2"
				points={buildPoints(investor, width, height)}
				strokeLinecap="round"
			/>
			<polyline
				fill="none"
				stroke="#f59e0b"
				strokeWidth="2"
				points={buildPoints(search, width, height)}
				strokeLinecap="round"
			/>
		</svg>
	);
}

interface MetricCardProps {
	title: string;
	value: number | string;
	description: string;
	sparklineValues: number[];
	sparklineColor: string;
	className?: string;
}

function MetricCard({
	title,
	value,
	description,
	sparklineValues,
	sparklineColor,
	className = '',
}: MetricCardProps) {
	return (
		<Card className={`p-5 ${className}`}>
			<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">{title}</p>
			<p className="mt-2 text-3xl font-semibold text-(--primary) tabular-nums">{value}</p>
			<p className="mt-2 text-sm text-(--secondary)">{description}</p>
			<Sparkline values={sparklineValues} stroke={sparklineColor} />
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

function getFallbackSeries(logs: ActivityLog[], matcher: (action: string) => boolean) {
	const groups = new Map<string, number>();
	for (const log of logs) {
		const date = log.createdAt?.slice(0, 10);
		if (!date) continue;
		if (!matcher((log.action || '').toLowerCase())) continue;
		groups.set(date, (groups.get(date) || 0) + 1);
	}
	return Array.from(groups.values()).slice(-30);
}

export function DashboardAnalyticsBento({
	startup,
	logs,
	analytics,
	windowDays,
	onWindowChange,
}: {
	startup: StartupData;
	logs: ActivityLog[];
	analytics?: DashboardAnalytics;
	windowDays: 7 | 30 | 90;
	onWindowChange: (days: 7 | 30 | 90) => void;
}) {
	const profileViews = analytics?.profileViews ?? countByAction(logs, (action) => action.includes('view'));
	const investorInterest = analytics?.investorInterestCount
		?? countByAction(logs, (action) => action.includes('investor') || action.includes('interest'));
	const searchAppearances = analytics?.searchAppearances ?? countByAction(logs, (action) => action.includes('search'));

	const profileSeries = analytics?.sparkline?.profileViews
		?? getFallbackSeries(logs, (action) => action.includes('view'));
	const investorSeries = analytics?.sparkline?.investorInterestCount
		?? getFallbackSeries(logs, (action) => action.includes('investor') || action.includes('interest'));
	const searchSeries = analytics?.sparkline?.searchAppearances
		?? getFallbackSeries(logs, (action) => action.includes('search'));

	const profileUpdates = countByAction(logs, (action) => action.includes('updated') || action.includes('edit'));
	const pitchUpdates = countByAction(logs, (action) => action.includes('pitch'));

	const teamSize = (startup.founders?.length || 0) + (startup.teamMembers?.length || 0);
	const profileCompleteness = calculateProfileCompleteness(startup);
	const engagementBars = getEngagementBars(profileViews, investorInterest, searchAppearances);
	const windowProfileViews = analytics?.windowTotals?.profileViews ?? profileSeries.reduce((acc, value) => acc + value, 0);
	const windowInvestorInterest = analytics?.windowTotals?.investorInterestCount ?? investorSeries.reduce((acc, value) => acc + value, 0);
	const windowSearchAppearances = analytics?.windowTotals?.searchAppearances ?? searchSeries.reduce((acc, value) => acc + value, 0);

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
			<Card className="p-5 md:col-span-2 xl:col-span-12">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">Analytics Window</p>
						<h3 className="mt-1 text-lg font-semibold text-(--primary)">Overview trend range</h3>
					</div>
					<div className="inline-flex rounded-lg border border-(--border) p-1 bg-(--surface)">
						{WINDOW_OPTIONS.map((option) => (
							<button
								key={option}
								type="button"
								onClick={() => onWindowChange(option)}
								className={`px-3 py-1.5 text-sm rounded-md transition-colors ${windowDays === option
										? 'bg-accent text-white'
										: 'text-(--secondary) hover:text-(--primary)'
									}`}
							>
								{option}d
							</button>
						))}
					</div>
				</div>
			</Card>

			<MetricCard
				title="Profile Views"
				value={profileViews}
				description={`${windowProfileViews} in selected window`}
				sparklineValues={profileSeries}
				sparklineColor="#06b6d4"
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Investors Interested"
				value={investorInterest}
				description={`${windowInvestorInterest} in selected window`}
				sparklineValues={investorSeries}
				sparklineColor="#22c55e"
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Search Appearances"
				value={searchAppearances}
				description={`${windowSearchAppearances} in selected window`}
				sparklineValues={searchSeries}
				sparklineColor="#f59e0b"
				className="xl:col-span-3"
			/>
			<MetricCard
				title="Profile Completeness"
				value={`${profileCompleteness}%`}
				description="Coverage across core startup profile fields."
				sparklineValues={profileSeries.length ? profileSeries : [profileCompleteness]}
				sparklineColor="#8b5cf6"
				className="xl:col-span-3"
			/>

			<Card className="p-6 md:col-span-2 xl:col-span-7">
				<p className="text-xs uppercase tracking-[0.14em] text-(--secondary)">Engagement Breakdown</p>
				<h3 className="mt-2 text-xl font-semibold text-(--primary)">How people discover and interact with you</h3>
				<div className="mt-4">
					<TinyMultiLineGraph profile={profileSeries} investor={investorSeries} search={searchSeries} />
					<div className="mt-2 flex flex-wrap gap-3 text-xs text-(--secondary)">
						<span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-cyan-500" />Profile Views</span>
						<span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-green-500" />Investor Interest</span>
						<span className="inline-flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-full bg-amber-500" />Search Appearances</span>
					</div>
				</div>
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
				{analytics?.weeklyTrend?.length ? (
					<div className="mt-4 rounded-lg border border-(--border) p-3 bg-(--surface)">
						<p className="text-xs uppercase tracking-wide text-(--secondary)">Weekly Trend</p>
						<div className="mt-2 space-y-2">
							{analytics.weeklyTrend.slice(-3).map((week) => (
								<div key={week.weekStart} className="text-xs text-(--secondary) flex items-center justify-between">
									<span>{new Date(week.weekStart).toLocaleDateString()}</span>
									<span className="tabular-nums text-(--primary)">{week.profileViews}/{week.investorInterestCount}/{week.searchAppearances}</span>
								</div>
							))}
						</div>
					</div>
				) : null}
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
