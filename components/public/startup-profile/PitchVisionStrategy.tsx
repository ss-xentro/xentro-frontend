'use client';

import type { PitchVisionStrategyItem } from './types';

interface PitchVisionStrategyProps {
	items: PitchVisionStrategyItem[];
}

export function PitchVisionStrategy({ items }: PitchVisionStrategyProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-xl font-bold text-(--primary) mb-6">Vision & Strategy</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{items.map((item, idx) => (
					<div key={idx} className="p-5 rounded-xl border border-(--border) bg-(--surface) hover:shadow-md hover:border-accent/30 transition-all group">
						<div className="w-10 h-10 rounded-xl bg-linear-to-br from-accent/10 to-purple-500/10 flex items-center justify-center mb-3">
							{item.icon ? (
								<img src={item.icon} alt="" className="w-6 h-6 object-contain" />
							) : (
								<svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
								</svg>
							)}
						</div>
						<h4 className="font-semibold text-(--primary) mb-1 text-sm">{item.title}</h4>
						{item.description && (
							<p className="text-xs text-(--secondary) leading-relaxed">{item.description}</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
