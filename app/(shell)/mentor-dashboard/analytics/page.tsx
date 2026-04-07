'use client';

import { useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { useApiQuery } from '@/lib/queries';
import { queryKeys } from '@/lib/queries/keys';

interface MentorAnalytics {
	profileViews: number;
	profileViews7d: number;
	profileViews30d: number;
	followersCount: number;
	activeMentees: number;
	totalSessions: number;
	rating: number | null;
}

function MetricCard({
	label,
	value,
	sub,
	accent,
}: {
	label: string;
	value: string | number;
	sub?: string;
	accent?: string;
}) {
	return (
		<Card className="p-6 bg-(--accent-subtle) border-(--border) border">
			<p className="text-sm text-(--secondary) mb-1">{label}</p>
			<p className="text-3xl font-bold" style={accent ? { color: accent } : undefined}>
				{typeof value === 'number' ? value.toLocaleString() : value}
			</p>
			{sub && <p className="text-xs text-(--secondary-light) mt-2">{sub}</p>}
		</Card>
	);
}

export default function MentorAnalyticsPage() {
	const { data: raw, isLoading } = useApiQuery<MentorAnalytics>(
		queryKeys.mentor.analytics(),
		'/api/auth/mentor-analytics/',
		{ requestOptions: { role: 'mentor' } },
	);

	const data = useMemo(
		(): MentorAnalytics => ({
			profileViews: raw?.profileViews ?? 0,
			profileViews7d: raw?.profileViews7d ?? 0,
			profileViews30d: raw?.profileViews30d ?? 0,
			followersCount: raw?.followersCount ?? 0,
			activeMentees: raw?.activeMentees ?? 0,
			totalSessions: raw?.totalSessions ?? 0,
			rating: raw?.rating ?? null,
		}),
		[raw],
	);

	if (isLoading) {
		return (
			<div className="p-8 space-y-6">
				<div className="animate-pulse space-y-4">
					<div className="h-8 bg-(--border) rounded w-1/4" />
					<div className="h-4 bg-(--border) rounded w-1/3" />
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="h-32 bg-(--border) rounded" />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="p-8 space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-(--primary)">Analytics</h1>
				<p className="text-(--secondary) mt-1">Your mentoring performance at a glance</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<MetricCard
					label="Total Profile Views"
					value={data.profileViews}
					sub="All-time unique visitors"
				/>
				<MetricCard
					label="Profile Views (7 days)"
					value={data.profileViews7d}
					sub="Unique views this week"
					accent="#0ea5e9"
				/>
				<MetricCard
					label="Profile Views (30 days)"
					value={data.profileViews30d}
					sub="Unique views this month"
					accent="#0ea5e9"
				/>
				<MetricCard
					label="Followers"
					value={data.followersCount}
					sub="People following you"
					accent="#8b5cf6"
				/>
				<MetricCard
					label="Active Mentees"
					value={data.activeMentees}
					sub="Accepted connections"
					accent="#10b981"
				/>
				<MetricCard
					label="Completed Sessions"
					value={data.totalSessions}
					sub="All-time sessions"
					accent="#f59e0b"
				/>
			</div>

			{data.rating !== null && (
				<Card className="p-6 bg-(--accent-subtle) border-(--border) border inline-flex flex-col gap-1">
					<p className="text-sm text-(--secondary)">Average Rating</p>
					<p className="text-3xl font-bold text-(--primary)">
						{data.rating.toFixed(1)}
						<span className="text-lg ml-1 text-(--secondary)">/ 5.0</span>
					</p>
					<p className="text-xs text-(--secondary-light)">Based on mentee reviews</p>
				</Card>
			)}
		</div>
	);
}
