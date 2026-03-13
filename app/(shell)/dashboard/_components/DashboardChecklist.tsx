'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';

function ChecklistItem({ label, checked }: { label: string; checked: boolean }) {
	return (
		<div className="flex items-center gap-3">
			<div className={`w-5 h-5 rounded-full flex items-center justify-center border ${checked
				? 'bg-success border-success text-white'
				: 'bg-transparent border-(--border) text-transparent'
				}`}>
				<svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
					<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
				</svg>
			</div>
			<span className={`text-sm ${checked ? 'text-(--secondary) line-through' : 'text-(--primary)'}`}>
				{label}
			</span>
		</div>
	);
}

interface DashboardChecklistProps {
	className?: string;
	items: {
		profileComplete: boolean;
		emailVerified: boolean;
		fundingHistoryAdded: boolean;
	};
}

export function DashboardChecklist({ className = '', items }: DashboardChecklistProps) {
	const completionState = useMemo(() => {
		const entries = Object.values(items);
		const completed = entries.filter(Boolean).length;
		return {
			completed,
			total: entries.length,
			allComplete: completed === entries.length,
		};
	}, [items]);

	if (completionState.allComplete) return null;

	return (
		<Card className={`p-6 h-fit ${className}`}>
			<h3 className="text-lg font-semibold text-(--primary) mb-4">Your Checklist</h3>
			<p className="text-sm text-(--secondary) mb-4">
				{completionState.completed}/{completionState.total} completed
			</p>
			<div className="space-y-3">
				<ChecklistItem label="Complete Company Profile" checked={items.profileComplete} />
				<ChecklistItem label="Verify Email" checked={items.emailVerified} />
				<ChecklistItem label="Add Funding History" checked={items.fundingHistoryAdded} />
			</div>

			<div className="mt-6 pt-6 border-t border-(--border)">
				<h4 className="text-sm font-medium text-(--primary) mb-2">Need Help?</h4>
				<Link href="/help" className="text-sm text-accent hover:underline">
					Visit Founder Support Center &rarr;
				</Link>
			</div>
		</Card>
	);
}
