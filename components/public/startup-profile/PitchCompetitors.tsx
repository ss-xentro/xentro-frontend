'use client';

import type { PitchCompetitor } from './types';

interface PitchCompetitorsProps {
	competitors: PitchCompetitor[];
}

export function PitchCompetitors({ competitors }: PitchCompetitorsProps) {
	if (competitors.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-4">Competitive Landscape</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{competitors.map((comp, idx) => (
					<div key={idx} className="p-4 rounded-xl border border-(--border) bg-(--surface) hover:border-(--primary)/20 transition-colors">
						<div className="flex items-center gap-3 mb-3">
							<div className="w-9 h-9 rounded-lg bg-(--surface-hover) flex items-center justify-center overflow-hidden shrink-0">
								{comp.logo ? (
									<img src={comp.logo} alt={comp.name} className="w-full h-full object-cover" />
								) : (
									<span className="text-sm font-semibold text-(--secondary)">{comp.name.charAt(0)}</span>
								)}
							</div>
							<div className="min-w-0">
								<h4 className="font-medium text-(--primary) text-sm truncate">{comp.name}</h4>
								{comp.website && (
									<a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-xs text-(--secondary) hover:text-(--primary) transition-colors truncate block">
										{comp.website.replace(/^https?:\/\//, '').split('/')[0]}
									</a>
								)}
							</div>
						</div>
						{comp.description && (
							<p className="text-xs text-(--secondary) leading-relaxed line-clamp-3">{comp.description}</p>
						)}
					</div>
				))}
			</div>
		</section>
	);
}
