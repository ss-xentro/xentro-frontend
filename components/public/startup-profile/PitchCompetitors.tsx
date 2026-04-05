'use client';

import type { PitchCompetitor } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchCompetitorsProps {
	competitors: PitchCompetitor[];
}

function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchCompetitors({ competitors }: PitchCompetitorsProps) {
	if (competitors.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-8">Competitive Landscape</h2>
			<div className="divide-y divide-(--border)">
				{competitors.map((comp, idx) => (
					<div key={idx} className="py-8 first:pt-0 last:pb-0">
						{comp.logo && (
							<img src={comp.logo} alt={comp.name} className="w-full h-auto mb-6 rounded-lg" />
						)}
						<h4 className="text-2xl font-bold text-(--primary) mb-1">{comp.name}</h4>
						{comp.website && (
							<a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-sm text-(--secondary) hover:text-(--primary) transition-colors block mb-4">
								{comp.website.replace(/^https?:\/\//, '').split('/')[0]}
							</a>
						)}
						{comp.description && (
							isHtml(comp.description) ? (
								<RichTextDisplay html={comp.description} className="text-lg leading-8 text-(--secondary)" />
							) : (
								<p className="text-lg leading-8 text-(--secondary)">{comp.description}</p>
							)
						)}
					</div>
				))}
			</div>
		</section>
	);
}
