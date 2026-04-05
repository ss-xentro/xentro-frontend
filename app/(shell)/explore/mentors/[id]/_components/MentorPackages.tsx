'use client';

import RichTextDisplay from '@/components/ui/RichTextDisplay';
import { formatCurrency } from '@/lib/utils';

interface PricingPlan {
	sessionType?: string;
	duration?: string;
	price?: string | number;
	perks?: string[];
}

interface MentorPackagesProps {
	hourlyRate: number | null;
	packages: string[];
	pricingPlans?: PricingPlan[];
	connectionStatus: string | null;
	connectBtnDisabled: boolean;
	onConnectOrBook: () => void;
}

function formatPrice(price: string | number): string {
	const n = Number(price);
	if (!isNaN(n) && n === 0) return 'Free';
	if (!isNaN(n) && n > 0) return formatCurrency(n, 'INR');
	return String(price).trim();
}

const CheckIcon = () => (
	<svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
		<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
	</svg>
);

export default function MentorPackages({
	hourlyRate,
	packages,
	pricingPlans = [],
	connectionStatus,
	connectBtnDisabled,
	onConnectOrBook,
}: MentorPackagesProps) {
	const validPlans = pricingPlans.filter(
		(p) => !!(p.sessionType || p.duration || (p.price !== undefined && p.price !== null && String(p.price).trim() !== ''))
	);
	const hasPricingPlans = validPlans.length > 0;
	const hasPackages = packages.length > 0;

	if (!hasPricingPlans && !hasPackages && !hourlyRate) return null;

	return (
		<div className="space-y-4">
			{/* Structured pricing plans */}
			{hasPricingPlans && validPlans.map((plan, i) => (
				<div key={i} className="bg-(--accent-subtle) border border-(--border) rounded-xl p-6">
					<p className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-1.5">
						{plan.sessionType}{plan.duration ? ` · ${plan.duration}` : ''}
					</p>
					{plan.price !== undefined && plan.price !== null && String(plan.price).trim() !== '' && (
						<p className="text-2xl font-bold text-(--primary) mb-5">{formatPrice(plan.price)}</p>
					)}
					{plan.perks && plan.perks.length > 0 && (
						<ul className="space-y-2 mb-5">
							{plan.perks.map((perk, pi) => (
								<li key={pi} className="flex items-center gap-2 text-sm text-(--secondary)">
									<CheckIcon />
									{perk}
								</li>
							))}
						</ul>
					)}
					<button
						onClick={onConnectOrBook}
						disabled={connectBtnDisabled}
						className="w-full py-2.5 rounded-xl text-sm font-semibold bg-(--primary) text-(--background) hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-default"
					>
						Book Session
					</button>
				</div>
			))}

			{/* Fallback: show hourly rate card when no structured plans exist */}
			{!hasPricingPlans && hourlyRate !== null && hourlyRate !== undefined && (
				<div className="bg-(--accent-subtle) border border-(--border) rounded-xl p-6">
					<p className="text-sm font-semibold text-(--secondary) uppercase tracking-wide mb-1.5">Hourly Rate</p>
					<p className="text-2xl font-bold text-(--primary) mb-5">{Number(hourlyRate) === 0 ? 'Free' : formatCurrency(Number(hourlyRate), 'INR')}</p>
					<button
						onClick={onConnectOrBook}
						disabled={connectBtnDisabled}
						className="w-full py-2.5 rounded-xl text-sm font-semibold bg-(--primary) text-(--background) hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-default"
					>
						Book Session
					</button>
				</div>
			)}

			{/* Plain-text package list */}
			{hasPackages && (
				<div className="bg-(--accent-subtle) border border-(--border) rounded-xl p-6">
					<h3 className="text-base font-semibold text-(--primary) mb-4">Highlights</h3>
					<ul className="space-y-2.5">
						{packages.map((pkg, i) => (
							<li key={i} className="flex items-start gap-2.5 text-sm text-(--secondary)">
								<svg className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
									<path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
								</svg>
								<RichTextDisplay html={pkg} compact className="text-sm text-(--primary-light)" />
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
