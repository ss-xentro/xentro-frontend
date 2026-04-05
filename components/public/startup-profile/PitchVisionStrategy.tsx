'use client';

import type { PitchVisionStrategyItem } from './types';
import { RichTextDisplay } from '@/components/ui/RichTextDisplay';

interface PitchVisionStrategyProps {
	items: PitchVisionStrategyItem[];
}

function isHtml(str: string | null | undefined): boolean {
	if (!str) return false;
	return /<[a-z][\s\S]*>/i.test(str);
}

export function PitchVisionStrategy({ items }: PitchVisionStrategyProps) {
	if (items.length === 0) return null;

	return (
		<section>
			<h2 className="text-xs font-semibold uppercase tracking-widest text-(--secondary) mb-8">Vision &amp; Strategy</h2>
			<div className="divide-y divide-(--border)">
				{items.map((item, idx) => (
					<div key={idx} className="py-8 first:pt-0 last:pb-0">
						{item.icon && (
							<img src={item.icon} alt="" className="w-full h-auto mb-6 rounded-lg" />
						)}
						<h4 className="text-2xl font-bold text-(--primary) mb-3">{item.title}</h4>
						{item.description && (
							isHtml(item.description) ? (
								<RichTextDisplay html={item.description} className="text-lg leading-8 text-(--secondary)" />
							) : (
								<p className="text-lg leading-8 text-(--secondary)">{item.description}</p>
							)
						)}
					</div>
				))}
			</div>
		</section>
	);
}
