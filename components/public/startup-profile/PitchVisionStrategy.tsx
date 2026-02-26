'use client';

import type { PitchVisionStrategyItem } from './types';

interface PitchVisionStrategyProps {
	items: PitchVisionStrategyItem[];
}

export function PitchVisionStrategy({ items }: PitchVisionStrategyProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Vision &amp; Strategy</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{items.map((item, idx) => (
					<div key={idx} className="p-4 rounded-xl border border-(--border) bg-(--surface) hover:border-(--primary)/20 transition-colors">
						<div className="w-8 h-8 rounded-md bg-(--surface-hover) flex items-center justify-center mb-3">
							{item.icon ? (
								<img src={item.icon} alt="" className="w-5 h-5 object-contain" />
							) : (
								<svg className="w-4 h-4 text-(--secondary)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							)}
						</div>
						<h4 className="text-sm font-medium text-(--primary) mb-1">{item.title}</h4>
						{item.description && (
							<p className="text-xs text-(--secondary) leading-relaxed">{item.description}</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
