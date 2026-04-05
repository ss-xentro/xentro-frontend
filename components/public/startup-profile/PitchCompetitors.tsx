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
			<h2 className="text-sm sm:text-base font-semibold uppercase tracking-wide text-(--secondary) mb-4">Competitive Landscape</h2>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{competitors.map((comp, idx) => (
					<div key={idx} className="rounded-xl border border-(--border) bg-(--surface) overflow-hidden flex flex-col hover:border-(--primary)/20 transition-colors">
						{comp.logo && (
							<img src={comp.logo} alt={comp.name} className="w-full h-auto" />
						)}
						<div className="flex-1 p-4">
							<h4 className="font-bold text-(--primary) text-base mb-0.5">{comp.name}</h4>
							{comp.website && (
								<a href={comp.website} target="_blank" rel="noopener noreferrer" className="text-xs text-(--secondary) hover:text-(--primary) transition-colors block mb-2">
									{comp.website.replace(/^https?:\/\//, '').split('/')[0]}
								</a>
							)}
							{comp.description && (
								isHtml(comp.description) ? (
									<RichTextDisplay html={comp.description} compact className="text-sm text-(--secondary)" />
								) : (
									<p className="text-sm text-(--secondary) leading-relaxed">{comp.description}</p>
								)
							)}
						</div>
					</div>
				))}
			</div>
		</section>
	);
}
