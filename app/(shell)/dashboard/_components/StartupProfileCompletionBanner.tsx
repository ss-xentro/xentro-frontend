'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AppIcon } from '@/components/ui/AppIcon';
import type { StartupData } from './types';

interface StartupProfileCompletionBannerProps {
	startup: StartupData;
	canEdit: boolean;
}

interface StartupProfileField {
	key: string;
	label: string;
	check: (startup: StartupData) => boolean;
}

const PROFILE_FIELDS: StartupProfileField[] = [
	{
		key: 'basics',
		label: 'Basics',
		check: (startup) => Boolean(startup.name?.trim() && startup.tagline?.trim()),
	},
	{
		key: 'logo',
		label: 'Logo',
		check: (startup) => Boolean(startup.logo),
	},
	{
		key: 'stage',
		label: 'Stage',
		check: (startup) => Boolean(startup.stage?.trim()),
	},
	{
		key: 'team',
		label: 'Team',
		check: (startup) => Boolean(((startup.founders?.length ?? 0) + (startup.teamMembers?.length ?? 0)) > 0),
	},
	{
		key: 'contact',
		label: 'Contact Email',
		check: (startup) => Boolean(startup.primaryContactEmail?.trim()),
	},
	{
		key: 'funding',
		label: 'Funding',
		check: (startup) => Boolean(Number(startup.fundsRaised || 0) > 0),
	},
];

export function StartupProfileCompletionBanner({ startup, canEdit }: StartupProfileCompletionBannerProps) {
	const [dismissed, setDismissed] = useState(false);

	const { completedKeys, completedCount } = useMemo(() => {
		const keys = PROFILE_FIELDS.filter((field) => field.check(startup)).map((field) => field.key);
		return {
			completedKeys: keys,
			completedCount: keys.length,
		};
	}, [startup]);

	const total = PROFILE_FIELDS.length;
	const missingCount = total - completedCount;
	const pct = Math.round((completedCount / total) * 100);

	if (!canEdit || dismissed || missingCount <= 0) return null;

	return (
		<div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
			<div className="h-0.5 bg-linear-to-r from-amber-400 via-orange-400 to-amber-400" />

			<div className="p-4 sm:p-5">
				<div className="flex items-start justify-between gap-3 mb-4">
					<div className="flex items-center gap-3 min-w-0">
						<div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
							<AppIcon name="zap" className="w-5 h-5 text-amber-400" />
						</div>
						<div className="min-w-0">
							<h3 className="text-[13px] sm:text-sm font-semibold text-(--primary) leading-tight">
								Finish your profile
							</h3>
							<p className="text-[11px] sm:text-xs text-(--secondary-light) mt-0.5 leading-snug">
								{missingCount} section{missingCount !== 1 ? 's' : ''} left
							</p>
						</div>
					</div>
					<button
						onClick={() => setDismissed(true)}
						className="p-1.5 -m-1 rounded-lg text-(--secondary-light) hover:text-(--secondary-light) hover:bg-(--accent-light) transition-colors shrink-0"
						aria-label="Dismiss"
					>
						<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				<div className="w-full bg-(--accent-light) rounded-full h-1.5 mb-4">
					<div
						className="h-full rounded-full bg-linear-to-r from-amber-400 to-orange-400 transition-all duration-700 ease-out"
						style={{ width: `${Math.max(pct, 4)}%` }}
					/>
				</div>

				<div className="hidden sm:flex items-center gap-2 flex-wrap mb-4">
					{PROFILE_FIELDS.map((field) => {
						const isDone = completedKeys.includes(field.key);
						return (
							<div
								key={field.key}
								className={`
                                    inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border transition-colors
                                    ${isDone
										? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
										: 'bg-(--accent-subtle) border-(--border) text-(--secondary-light)'
									}
                                `}
							>
								{isDone ? (
									<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
									</svg>
								) : (
									<span className="w-3 h-3 rounded-full border border-(--border-hover)" />
								)}
								{field.label}
							</div>
						);
					})}
				</div>

				<div className="sm:hidden flex flex-wrap gap-1.5 mb-4">
					{PROFILE_FIELDS.map((field) => {
						const isDone = completedKeys.includes(field.key);
						return (
							<span
								key={field.key}
								className={`
                                    inline-flex items-center gap-1 text-[11px] px-2 py-1 rounded-md border
                                    ${isDone
										? 'bg-(--success-light) border-(--success)/20 text-(--success)'
										: 'bg-(--accent-subtle) border-(--border) text-(--secondary-light)'
									}
                                `}
							>
								{isDone ? <AppIcon name="check" className="w-3 h-3 inline" /> : 'o'} {field.label}
							</span>
						);
					})}
				</div>

				<Link
					href="/dashboard/startup"
					className="inline-flex items-center gap-2 text-xs sm:text-[13px] font-medium px-4 py-2 rounded-xl bg-(--warning) hover:opacity-90 text-amber-950 shadow-sm hover:shadow transition-all duration-200"
				>
					Complete Profile
					<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
					</svg>
				</Link>
			</div>
		</div>
	);
}
