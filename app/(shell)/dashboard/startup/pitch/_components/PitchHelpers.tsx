import React from 'react';

/* ─── Section config ─── */
export const SECTIONS = [
	{
		key: 'videoPitch',
		label: 'Video Pitch',
		subtitle: 'Elevator pitch video',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		),
	},
	{
		key: 'about',
		label: 'Story',
		subtitle: 'About, Problem & Solution',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
		),
	},
	{
		key: 'competitors',
		label: 'Competitors',
		subtitle: 'Competitive landscape',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
		),
	},
	{
		key: 'customers',
		label: 'Customers',
		subtitle: 'Testimonials & proof',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
		),
	},
	{
		key: 'businessModels',
		label: 'Business Model',
		subtitle: 'Revenue & monetization',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		),
	},
	{
		key: 'marketSizes',
		label: 'Market Size',
		subtitle: 'TAM, SAM & SOM',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
		),
	},
	{
		key: 'visionStrategies',
		label: 'Vision',
		subtitle: 'Vision & strategy',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
		),
	},
	{
		key: 'impacts',
		label: 'Impact',
		subtitle: 'Social & environmental',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
		),
	},
	{
		key: 'certifications',
		label: 'Certifications',
		subtitle: 'Awards & credentials',
		icon: (
			<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
		),
	},
] as const;

export type SectionKey = (typeof SECTIONS)[number]['key'];

export const WRITE_ROLES = new Set(['founder', 'co_founder', 'ceo', 'cto', 'coo', 'cfo', 'cpo']);

/* ─── Icons ─── */
export function CheckIcon({ className }: { className?: string }) {
	return (
		<svg className={className || 'w-3.5 h-3.5'} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
		</svg>
	);
}

export function PlusIcon() {
	return (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
		</svg>
	);
}

export function TrashIcon() {
	return (
		<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
			<path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		</svg>
	);
}

/* ─── Empty state ─── */
export function EmptyState({ icon, title, description, action }: {
	icon: React.ReactNode;
	title: string;
	description: string;
	action?: React.ReactNode;
}) {
	return (
		<div className="flex flex-col items-center justify-center py-16 px-6 text-center">
			<div className="w-16 h-16 rounded-2xl bg-(--surface-hover) border border-(--border) flex items-center justify-center text-(--secondary) mb-5">
				{icon}
			</div>
			<h4 className="text-base font-semibold text-(--primary) mb-1.5">{title}</h4>
			<p className="text-sm text-(--secondary) max-w-xs mb-6">{description}</p>
			{action}
		</div>
	);
}

/* ─── Item card wrapper ─── */
export function ItemCard({ index, onRemove, canEdit, children }: {
	index: number;
	onRemove: () => void;
	canEdit: boolean;
	children: React.ReactNode;
}) {
	return (
		<div className="group relative bg-(--surface) rounded-xl border border-(--border) p-5 transition-all duration-200 hover:shadow-(--shadow-sm) animate-fadeInUp">
			<div className="flex items-center justify-between mb-4">
				<span className="inline-flex items-center gap-1.5 text-xs font-medium text-(--secondary) bg-(--surface-hover) px-2.5 py-1 rounded-full">
					<span className="w-1.5 h-1.5 rounded-full bg-(--secondary-light)" />
					Item {index + 1}
				</span>
				{canEdit && (
					<button
						type="button"
						onClick={onRemove}
						className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1.5 text-xs font-medium text-(--secondary) hover:text-error px-2 py-1 rounded-lg hover:bg-error/5 transition-all duration-200"
					>
						<TrashIcon /> Remove
					</button>
				)}
			</div>
			{children}
		</div>
	);
}
